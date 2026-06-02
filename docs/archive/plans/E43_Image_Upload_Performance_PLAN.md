# E43 · Image Upload Performance — Plan

**Status:** Executed — Awaiting QA
**Spec:** `docs/projects/E43_Image_Upload_Performance.md`
**Primary Persona:** Staff (intake), Marcus (photography standard), Makoonsii (mobile/accessibility)
**Schema Changes:** None
**CF Changes:** None — `processImageUpload` is intentionally untouched in all strategies

---

## Phase 1 — Persona & Compliance Gate

### Personas Served

| Persona | Concern | How E43 Addresses It |
|---|---|---|
| **Staff (primary)** | Upload takes too long; silent failures on poor connections cause repeated manual work | Compression cuts upload size 40×; auto-retry recovers dropped connections automatically |
| **Marcus** | Photography standard depends on items reaching published state — a broken upload flow leaves items unpublished | Optimistic preview + retry ensures intake completes; CF pipeline untouched so watermark quality is unchanged |
| **Makoonsii** | Mobile-first, Cornwall Island connection quality varies; touch targets and plain language must not regress | No regression to existing 48 px targets or camera flow; status copy reviewed for plain language |
| **Jordan** | Brand quality requires published inventory — unfinished drafts degrade editorial supply | Faster intake → more items published → Editorial CMS (E19) has material to work with |

### Compliance Gate

| Item | Status |
|---|---|
| Age gate required? | No — staff-only admin feature |
| `auditLogs` events required? | No — upload mechanics are not a compliance event |
| PII in logs/analytics? | None — no customer data involved |
| `policeHold` logic? | Not applicable |
| `aiDescription` exposure? | Not applicable |
| AI API security? | Not applicable |
| CASL compliance? | Not applicable |
| Scarcity integrity? | Not applicable |

**Gate: PASS. All applicable items confirmed clear.**

---

## Phase 2 — Schema Audit

### Collections Impacted

```
Collection: items/{id}
Fields read:  images (array<string>) — existing realtime listener in ImageUploadZone props; unchanged
Fields written: NONE from client

No new fields. No schema doc update required.
No DECISIONS.md entry required for schema.
DECISIONS.md entry required for: browser-image-compression dependency addition.
```

**Schema Gate: PASS. Zero new fields introduced.**

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimal: Client-Side Compression Only

**Architecture**

Single change to `ImageUploadZone.tsx`: add `browser-image-compression` and run every selected file through it (max 1920px long edge, WebP 80% quality) before calling `uploadBytesResumable`. The rest of the component — progress tracking, error display, CF trigger, realtime listener — is completely unchanged.

```
File selected → compress (200–400 KB) → uploadBytesResumable → CF pipeline (unchanged)
                ↑ was up to 20 MB raw
```

**Persona Lens**
- Staff: Upload time on a 500 KB/s link drops from ~40 s to ~0.8 s. Core pain point addressed.
- Marcus: CF receives a smaller file; watermark and WebP quality unaffected (Sharp operates on decoded pixels, not file size).
- Makoonsii: No change to UX flow or touch targets.

**Compliance:** No new compliance surface.

**Trade-offs**

| Benefits | Sacrifices |
|---|---|
| Smallest possible change — one file, one dependency | "Processing…" wait still exists (CF cold start + Sharp + Firestore write) |
| Zero risk of regression | No automatic retry — connection drop still shows "Upload failed — try again." |
| Fast to implement and review | No optimistic preview — thumbnail still delayed until CF completes |
| | Publish still blocked until CF finishes |

**Estimated Scope:** Small — 1 file modified, 1 dependency added.

---

### Strategy B — Recommended: Compression + Optimistic Preview + Auto-Retry ✓

**Architecture**

Extends Strategy A with two additional capabilities in `ImageUploadZone.tsx`:

1. **Optimistic preview** — immediately after compression, call `URL.createObjectURL(compressedBlob)` and store it in the `UploadEntry`. Render it as the thumbnail with a "pending" overlay. The existing Firestore realtime listener (which populates `images[]` from the CF) naturally replaces the blob URL with the final watermarked WebP when processing completes. The overlay disappears automatically.

2. **Auto-retry with exponential backoff** — the `uploadFile` function wraps `uploadBytesResumable` in a retry loop. On `error` callback, wait `2^attempt × 500ms` (attempt 0 → 500 ms, attempt 1 → 1 s, attempt 2 → 2 s), then restart the task. After 3 failed attempts, surface the manual "Upload failed — try again." error with a retry button. The component tracks `retryCount` per entry in the `UploadEntry` map.

```typescript
// UploadEntry extended:
interface UploadEntry {
  fileName: string
  progress: number
  optimisticUrl?: string   // blob URL for immediate preview
  retryCount: number       // 0-3; at 3 → permanent error shown
  error?: string
}
```

**Data flow:**

```
File selected
    → compress (browser-image-compression, max 1920px / WebP 80%)
    → URL.createObjectURL(blob)        → thumbnail shown immediately (<200 ms)
    → uploadBytesResumable
        success → entry removed; Firestore realtime listener replaces blob URL with final URL
        error   → retry (up to 3×, exp backoff) → if all fail: show manual retry CTA
```

**No change to `processImageUpload` CF, Storage rules, Firestore rules, `MobileIntakePage.tsx`, or `IntakeForm.tsx`.**

**Persona Lens**
- Staff: Image visible in under 200 ms of selection. Auto-retry means a brief connection hiccup requires zero manual intervention. 40× smaller upload means even a poor connection completes in under 2 seconds.
- Marcus: Photo quality at publication is unchanged — CF still watermarks and converts. The optimistic preview is local-only and never stored.
- Makoonsii: The "Take Photo" and "Choose from Library" touch targets are untouched. Status copy: "Saving photo…" (pending) / "Photo saved" (done) / "Save failed — tap to retry" (exhausted).
- Jordan: Items reach published state faster → Editorial inventory flows more freely.

**Compliance:** No new compliance surface. Blob URLs (`blob:`) are memory-local, never written to Firestore, analytics, or logs.

**Trade-offs**

| Benefits | Sacrifices |
|---|---|
| Thumbnail in <200 ms — staff sees immediate feedback | Optimistic blob URL is memory-local — if the tab is closed during upload, it is not recoverable (by design) |
| Auto-retry recovers dropped connections without staff action | Slightly more complex `UploadEntry` state (adds `optimisticUrl`, `retryCount`) |
| 40× smaller upload — 2 s on a 500 KB/s connection | Three retries × 7.5 s total backoff window — worst-case failure feedback is ~8 s after initial error |
| No CF changes, no schema changes, no rule changes | |
| One component modified — contained blast radius | |

**Estimated Scope:** Small-Medium — 1 file modified, 1 dependency added.

---

### Strategy C — Robust: Background Upload Queue with Service Worker

**Architecture**

Full PWA upload queue. On file selection, the compressed blob is written to IndexedDB. A Service Worker (registered via Workbox) drains the queue using `workbox-background-sync`. The upload uses Firebase Storage's REST API directly (the Firebase JS SDK cannot run inside a SW). Progress and completion events are relayed back to the React app via `postMessage`.

```
File selected → compress → write to IndexedDB → SW queue
                                                     ↓ (background, survives tab close)
                                              Storage REST API upload
                                                     ↓
                                              CF trigger → processImageUpload
                                                     ↓
                                              postMessage → React updates UI
```

**New infrastructure:**
- `src/sw.ts` — Service Worker with Workbox background sync
- `src/lib/uploadQueue.ts` — IndexedDB read/write helpers
- `vite.config.ts` — `vite-plugin-pwa` or manual SW registration
- `ImageUploadZone.tsx` — rewired to IndexedDB write instead of direct upload

**Persona Lens**
- Staff: Uploads survive complete network loss and tab close. Queue resumes on reconnect.
- Marcus: Same CF pipeline at the end — quality unchanged.
- Makoonsii: Truly offline-tolerant on poor connections. Intake form is fully non-blocking.

**Compliance:** No new compliance surface, but SW registration requires HTTPS (already satisfied by Firebase Hosting).

**Trade-offs**

| Benefits | Sacrifices |
|---|---|
| True offline support — queue persists across refreshes | High implementation complexity: SW lifecycle, IndexedDB schema, postMessage bridge, Workbox config |
| Upload survives tab close | Firebase Storage SDK does not run in SW — must use REST API with custom auth token refresh |
| Non-blocking by design | Testing complexity increases significantly (SW in test environment requires specific setup) |
| Best experience on severely intermittent connections | Over-engineered for on-site staff who have a connection, even if poor |
| | SW cache invalidation edge cases can cause hard-to-reproduce bugs |

**Estimated Scope:** Large — 4+ new files, 2 config changes, significant test surface.

---

## Recommendation: Strategy B

Strategy A is the minimum viable fix but leaves the experience feeling broken — the upload is fast but the form still stalls on "Processing…" and a single dropped packet requires a manual file reselect.

Strategy C is the right long-term architecture for a fully offline field crew but introduces significant infrastructure risk for a problem where the root cause is simply uncompressed uploads — not true offline requirements.

Strategy B solves all three complaints from the original issue report:
- **Slow processing**: 40× compression + optimistic preview → image visible in <200 ms
- **Poor connection resilience**: Auto-retry with backoff handles dropped packets transparently
- **"Doesn't work well"**: Permanent failure state with clear retry CTA instead of silent loss

It requires changes to exactly one production file, one dependency addition, and zero infrastructure changes. Contained, reviewable, reversible.

---

## Phase 4 — Anti-Regression Protocol

| Rule | Strategy B Status |
|---|---|
| No hardcoded hex values | Confirmed — no new styles introduced; existing CSS tokens untouched |
| No invented Firestore fields | Confirmed — zero new fields; `images[]` read path unchanged |
| No client-side AI keys | Confirmed — no AI API involved |
| No manufactured scarcity | Not applicable |
| No PII in logs | Confirmed — blob URLs are memory-local; no file names, UIDs, or metadata logged |
| Age gates at router level only | Not applicable — staff-only feature |
| No unapproved motion patterns | Confirmed — "pending" overlay is a static overlay, not an animation |
| Brand voice | Status strings reviewed: "Saving photo…", "Photo saved", "Save failed — tap to retry" — plain, not jargon |

**Anti-Regression Gate: PASS.**

---

## Files To Be Modified

| File | Change |
|---|---|
| `package.json` | Add `browser-image-compression` |
| `src/components/admin/ImageUploadZone.tsx` | Compression, optimistic preview, auto-retry |
| `docs/DECISIONS.md` | Log `browser-image-compression` dependency decision |

**Files NOT changed:** `functions/src/inventory.ts`, `storage.rules`, `firestore.rules`, `src/lib/types.ts`, `MobileIntakePage.tsx`, `IntakeForm.tsx`

---

## Definition of Done

- [ ] `browser-image-compression` installed; `npm run build` zero errors
- [ ] Compressed file uploaded: 12 MB test JPEG → ≤400 KB in Storage `uploads/` path
- [ ] Optimistic thumbnail visible <200 ms after file selection (measured in Chrome DevTools, Network throttled to "Slow 3G")
- [ ] Auto-retry: disable network mid-upload in DevTools → verify 3 retry attempts → verify "Save failed — tap to retry" shown
- [ ] Final watermarked WebP replaces blob URL in UI after CF completes
- [ ] Marcus Photography Test: no visual degradation in published watermarked image
- [ ] Makoonsii Trust Test: all touch targets ≥48px; status copy verified plain language
- [ ] `npm run build` — zero errors, zero warnings
- [ ] `docs/DECISIONS.md` updated
- [ ] `docs/EPICS.md` E43 tasks ticked
- [ ] PR opened

---

*The Pawn Shop · docs/plans/E43_Image_Upload_Performance_PLAN.md · Cornwall Island, Akwesasne*
