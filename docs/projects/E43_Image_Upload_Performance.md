# Project E43: Image Upload Performance

**Status:** Done — 2026-05-22
**Epic:** E43 — Image Upload Performance
**Phase:** Phase 11 — Quality & Performance
**Primary Persona:** Marcus (photography standard requires images to upload and display reliably)
**Secondary Personas:** Makoonsii (mobile-first, poor-connection environment), Jordan (brand quality depends on staff completing intake without friction)
**AI Involvement:** Claude (dev)

**Objective:** Reduce perceived image upload time from selection to visible thumbnail to under two seconds on a 500 KB/s connection, and eliminate silent failures when the connection drops during intake.

---

## 1. User Story

> As **staff on the shop floor**, I want my item photos to appear immediately when I select them and upload reliably even when the connection drops, so that I can complete intake quickly and not lose work mid-flow.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Marcus Photography Test

> *"Every product page Marcus might encounter must pass the Marcus Photography Test before it is published: well-lit, dark luxury standard, macro detail where relevant. One bad image disqualifies the entire page."*

The photography test is about image quality at the point of customer display — not upload mechanics. However: **if the upload flow is broken or slow, staff abandon intake mid-session, leaving items unpublished or published with missing photos.** E43 directly protects the photography standard by removing the friction that causes incomplete uploads.

Test: Verify that a 12 MB camera JPEG is visible as a thumbnail in the intake form within 2 seconds of selection (optimistic preview), and that the final watermarked WebP appears in the `images[]` array without any manual retry from staff.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px) — no regression to existing buttons
- [ ] All copy uses plain language — "Photo saved" not "Upload committed to storage"
- [ ] No Kanien'kéha — not applicable to this feature
- [ ] Feature is navigable by a low-tech mobile user in under 3 taps — no regression to existing camera flow

### Marcus Photography Test (run for any customer-facing item display)

- [ ] E43 changes do not alter the watermark, WebP quality, or final Storage path — CF pipeline untouched
- [ ] Compressed client image retains sufficient quality for watermarking at 1920px max dimension

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — staff-only admin feature
- [ ] **`auditLogs` events required?** No — upload mechanics are not a compliance event
- [ ] **PII exclusion** — No names, emails, or phone numbers involved in upload flow
- [ ] **`policeHold` respected** — Not applicable (upload flow, not item display)
- [ ] **`aiDescription` draft-only** — Not applicable
- [ ] **AI API security** — Not applicable (no AI API calls)
- [ ] **CASL compliance** — Not applicable
- [ ] **Scarcity integrity** — Not applicable

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read:  images (array<string>) — realtime listener for processed URL arrival
Fields written: NONE from client — images[] written exclusively by processImageUpload CF (unchanged)
```

**No new Firestore fields required.** The optimistic preview is purely local state (blob URL from `URL.createObjectURL()`). It is never written to Firestore.

### New Fields Required

None.

### TypeScript Interfaces

```typescript
// UploadEntry (local to ImageUploadZone.tsx) — extend with optimisticUrl and retryCount
// No changes to Item or any shared type in src/lib/types.ts
```

### Security Rules Required

None. Storage rules and Firestore rules are unchanged.

---

## 5. AI Involvement Detail

### Claude (development):
- Applies: `docs/prompts/PLANNING.md`, `docs/prompts/TESTING.md`, `docs/prompts/TICKET_CLOSE.md`
- No Gemini involvement. No runtime AI.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules

- [x] No schema changes required
- [x] No security rule changes required

### Phase 2 — Dependency

- [ ] Add `browser-image-compression` to `package.json` (client-side only)

### Phase 3 — UI Components

- [ ] Modify `src/components/admin/ImageUploadZone.tsx`:
  - Add client-side compression (max 1920px, WebP 80%) before `uploadBytesResumable`
  - Add optimistic preview via `URL.createObjectURL(compressedBlob)` — shown immediately with "processing" overlay
  - Add auto-retry with exponential backoff (3 attempts: 1 s / 2 s / 4 s)
  - Replace blob URL with Firestore-written URL when CF completes (existing realtime listener handles this)
  - Show clear "failed" state after all retries exhausted
- [ ] No changes required to `MobileIntakePage.tsx` or `IntakeForm.tsx` — they consume `ImageUploadZone` as-is

### Phase 4 — QA

- Primary persona smoke tests: Marcus Photography Test (watermark + WebP quality unaffected), Makoonsii Trust Test (touch targets, plain language)
- Compliance verification: No PII, no age gate regression
- Accessibility: progress bars retain `role="progressbar"` and `aria-valuenow`
- Build gate: `npm run build` zero errors before close

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all applicable items passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `docs/EPICS.md` E43 task(s) ticked
- [ ] No new Firestore fields — schema doc unchanged
- [ ] `docs/DECISIONS.md` updated: `browser-image-compression` dependency decision logged
- [ ] PR opened with description generated from close workflow

---

*The Pawn Shop · docs/projects/E43_Image_Upload_Performance.md · Cornwall Island, Akwesasne*
