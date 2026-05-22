# E41 · Mobile Staff Inventory — Implementation Plan

**Spec:** `docs/projects/E41_Mobile_Staff_Inventory.md`
**Date:** 2026-05-22
**Planner:** Claude (Senior Staff Engineer)
**Status:** Awaiting approval — do not execute until `/approve` is run.

---

## Pre-Flight Checklist

- [x] Project spec confirmed at `docs/projects/E41_Mobile_Staff_Inventory.md`
- [x] All files to be modified read in current session:
  - `src/pages/admin/InventoryPage.tsx` — 194 lines, HTML table only, no mobile layout
  - `src/components/admin/IntakeForm.tsx` — 399 lines, 4-section form, photos gated behind "Start Item"
  - `src/components/admin/ImageUploadZone.tsx` — 146 lines, no `capture` attribute, drag-drop only
  - `src/components/layout/AdminLayout.tsx` — 36 lines, mobile branch renders `<Outlet />` with no admin nav
  - `src/components/layout/AdminSidebar.tsx` — 178 lines, desktop icon sidebar (≥ 1024px only)
  - `src/main.tsx` — route registry (confirmed admin route group exists)
  - `docs/EPICS.md` — E41 entry added

---

## Phase 1 — Persona & Compliance Gate

### 1.1 Persona Identification

**Primary persona:** Staff (inventory_staff / manager / admin) — shop floor staff who need to view stock and add new items from a mobile device without returning to a desktop.

**Secondary personas:**
- **Makoonsii** — always run. Touch targets ≥48px, plain language, navigable in ≤3 taps.
- **Marcus** — camera intake flow. Photo is Step 1 and must reinforce the dark luxury photography standard (macro, dark background, well-lit).
- **Dale** — benefits from accurate, up-to-date inventory (quick status visibility on mobile helps confirm item availability).
- **Kevin** — existing `publishItem` CF alert SLA (60s) must not be broken by mobile intake path.

**Tests applied:**

| Test | Applies? | Outcome |
|---|---|---|
| Makoonsii Trust Test | YES — admin navigation + mobile form | 48px targets on all nav tabs, card actions, form fields; plain language CTA copy |
| Marie Discretion Test | NO — admin-only, no CRM/notifications | N/A |
| Marcus Photography Test | YES — camera intake captures item photos | Camera is Step 1; guidance copy reinforces dark luxury standard |
| Kevin Speed Test | YES — intake leads to `publishItem` CF | Existing CF unchanged; SLA unaffected |
| Kanien'kéha Rule | NO — no editorial content | N/A |

### 1.2 Compliance Gate

| Check | Status | Notes |
|---|---|---|
| Age gate required? | NO | Admin-only route; `ProtectedRoute` + MFA enforces access |
| `auditLogs` event defined? | EXISTING ONLY | `item_published` fires via existing `publishItem` CF — no new event types |
| PII excluded from logs? | YES | No change to existing behaviour |
| `policeHold` respected? | YES | Staff-only query; no public read path changes |
| `aiDescription` draft-only? | YES | No change to existing `AiAssistantPanel` or subcollection |
| All AI calls through Cloud Functions? | YES | No new AI calls in this epic |
| CASL compliance? | YES | `publishItem` CF CASL check unchanged |
| Scarcity integrity? | YES | No algorithmic merchandising tags |

**Compliance gate: CLEAR — all items pass.**

---

## Phase 2 — Schema Audit

```
Collections impacted:

- items/{id}
  Fields read:  status, title, category, viewTag, price, condition, images, policeHold, createdAt
  Fields written: NONE (existing IntakeForm + publishItem CF write path is unchanged)

- auditLogs/{id}
  Fields written: NONE (existing item_published event; no new event types)

New fields required: NONE

All fields verified against docs/firestore-schema.md. No schema changes needed.
```

---

## Phase 3 — Three-Strategy Proposal

---

### Strategy A — Minimal: CSS Responsive Table + Camera Input Patch

**Summary:** Two targeted file edits — make the inventory table horizontally scrollable on mobile via CSS, and add `capture="environment"` to the existing file input in `ImageUploadZone` — with no new routes, no new components, and no navigation changes.

**Architecture:**
- `InventoryPage.tsx`: Wrap the `<table>` in `overflow-x: auto` and hide the `Condition` and `Actions` columns on `< 768px` via CSS class + media query. Existing table layout preserved on desktop. No rendering logic change.
- `ImageUploadZone.tsx`: Add `capture="environment"` to `<input type="file">`. The browser natively presents a camera/file-picker sheet on mobile. Update the dropzone label copy from "Add photos" to "Take or upload photos". This is a one-line HTML attribute change.
- `AdminLayout.tsx`: No change. Staff navigate to `/admin/intake` via the GlobalHeader hamburger drawer (existing link in `NavigationDrawer.tsx` — the "Admin Dashboard" link already exists, staff can tap their way to Intake from there).
- No new Cloud Functions, routes, or components.

**Persona Lens:**
- Staff: Can now take a photo on mobile (camera picker opens natively); the inventory table is horizontally scrollable rather than clipped. Improvement over current state, but not a purpose-built mobile experience.
- Makoonsii: Touch target improvement is minimal — the dropzone becomes tappable to open camera, but the intake form is still a long 4-section form ill-suited to portrait mobile. 3-tap navigation to Intake still requires: hamburger → Admin Dashboard → sidebar Intake link (4 taps, sidebar is hidden on mobile — the link does not exist in the hamburger drawer for Intake specifically).
- Marcus: Camera is accessible but there is no guidance reinforcing photography standard at capture time.

**Compliance:** Unchanged. No new compliance surface.

**Trade-offs:**
- Gains: Minimal code change (2 files, ~10 lines), no regression risk, zero new routes or components to maintain.
- Sacrifices: Not a mobile-first experience. The inventory table is scroll-to-browse, not card-browsable. Navigation to Add Item from mobile admin is still 4+ taps. The intake form is still a lengthy desktop-oriented multi-section form. Staff on the shop floor will find this tolerable but not efficient.

**Estimated scope:** Small — 2 files modified, ~10–20 lines changed.

---

### Strategy B — Recommended: Mobile Bottom Nav + Responsive Card Inventory + Camera-First Intake Page

**Summary:** Deliver a purpose-built mobile admin experience: a persistent 3-tab bottom navigation bar on admin routes, a card-based inventory view with client-side search and status filters, and a new streamlined 3-step intake page at `/admin/mobile-intake` with camera capture as the hero action — all reusing existing Cloud Functions and schema.

**Architecture:**

**New component — `src/components/layout/AdminMobileNav.tsx`:**
- Renders only on mobile (`< 1024px`) and only on `/admin/*` routes (uses `useLocation().pathname.startsWith('/admin')`)
- Three fixed-position bottom tabs: **Inventory** (`/admin/inventory`), **Add Item** (`/admin/mobile-intake`), **Dashboard** (`/admin/dashboard`)
- Active tab highlight: `var(--color-primary)` icon + label; inactive: `--color-text-muted`
- Background: `var(--color-surface)` with `1px solid var(--color-border)` top edge
- Each tab: `minHeight: 56px`, icon (24px) + label (`--text-xs`), `width: 33.333%`
- `aria-label` on each link; `aria-current="page"` on active tab

**Modified — `src/components/layout/AdminLayout.tsx`:**
- Mobile branch (`isDesktop === false`): render `<Outlet />` + `<AdminMobileNav />` + `padding-bottom: 64px` on main content to clear the nav bar
- Desktop branch: unchanged

**Modified — `src/pages/admin/InventoryPage.tsx`:**
- Responsive dual layout — a single `isDesktop` state (same media query as `AdminLayout`) controls which view renders:
  - **Mobile (`< 768px`):** Card grid — one card per item. Each card: thumbnail (if `images[0]` exists, 80×80px), title, status `Badge`, viewTag chip, formatted price. Full-card tap target (≥ 48px height). "Add Item" FAB in bottom-right (`position: fixed`, `bottom: 72px` to sit above mobile nav).
  - **Desktop:** Existing table + `AiAssistantPanel` sidebar — zero changes.
- Client-side search bar (mobile only): `<input>` filters visible items by `item.title.toLowerCase().includes(query)` — no new Firestore queries.
- Status filter chips (mobile only): All · Active · Draft · Reserved · Sold — client-side filter on `item.status`.
- Data source unchanged: existing `onSnapshot` query (`limit(50)`, `orderBy('createdAt', 'desc')`).

**Modified — `src/components/admin/ImageUploadZone.tsx`:**
- Add `capture="environment"` to the file `<input>` — native camera access on mobile.
- Conditionally render two distinct CTAs based on a `isMobile` check (same `matchMedia` pattern):
  - Mobile: Large "Take Photo" button as primary CTA (full-width, ≥ 48px height); "Choose from Library" as text link below.
  - Desktop: Existing dropzone UI preserved exactly.
- No logic change to upload path, progress tracking, or CF handoff.

**New page — `src/pages/admin/MobileIntakePage.tsx`** (route: `/admin/mobile-intake`):
- 3-step wizard, one screen per step, `Back` / `Next` navigation:
  - **Step 1 — Photo:** Full-width camera capture CTA (calls `ImageUploadZone` in camera-first mobile mode); thumbnail preview; "Retake" link. Step cannot advance until at least one image is captured. This enforces Marcus's standard — photo is the entry gate.
  - **Step 2 — Details:** Title (required, large input, `font-size: --text-body`), View select (pawn/cannabis/fireworks, large select), Category (text input), Price CAD$ (`inputMode="decimal"`), Condition (5 large radio buttons). All required fields. "Save Draft" is available to checkpoint without completing Step 3.
  - **Step 3 — Review:** Thumbnail + all details summarised; "Publish" button calls `publishItemFn` CF; success screen shows item title + "Add Another Item" CTA.
- Reuses existing Cloud Function callables: `createDraftItemFn`, `publishItemFn`.
- Reuses existing validation logic: `validateForSave`, `validateForPublish` from `IntakeForm`.
- `ProtectedRoute staffOnly` wraps the page.
- No cannabis-specific intake fields (THC/CBD etc.) — those remain in the full desktop `IntakeForm`. Mobile intake is for standard pawn/fireworks/cannabis core fields only.

**Modified — `src/main.tsx`:**
- Add `{ path: 'mobile-intake', lazy: () => import('./pages/admin/MobileIntakePage') }` within the admin route group.

**Persona Lens:**
- Staff: Dedicated bottom nav eliminates the hamburger-and-hunt friction. Inventory is browsable as a card grid with search and status filters. Adding an item is 1 tap from any admin screen. Camera-first flow means staff can photograph an item and publish it in under 2 minutes on the shop floor.
- Makoonsii: All touch targets ≥ 48px on tabs, cards, form fields. Plain-language labels ("Take Photo", "Save Draft", "Publish"). Navigation to Add Item: 1 tap from bottom nav.
- Marcus: Photo is Step 1 — cannot advance without taking one. Guidance copy at the capture step reinforces the standard: "Clear, well-lit photo — item front-facing, dark background."
- Dale: Mobile inventory view exposes status badges prominently — staff can instantly confirm active/reserved/sold status from the card grid.
- Kevin: `publishItem` CF is called unchanged; existing 60s alert SLA is unaffected.

**Compliance:** Unchanged. `ProtectedRoute staffOnly` wraps `MobileIntakePage`. No new compliance surface. Existing `item_published` auditLog fires via CF.

**Trade-offs:**
- Gains: Purpose-built mobile-first admin experience. Camera-first flow directly solves the ask. Card inventory is genuinely browsable on mobile. 1-tap navigation to all key staff actions.
- Sacrifices: Medium implementation scope. Separating mobile intake from full intake creates two intake paths — staff must understand which to use for cannabis-specific fields (THC/CBD panel is desktop-only). This is acceptable: most intake is standard pawn; cannabis-specific fields are filled in after initial capture on desktop.

**Estimated scope:** Medium — 5 files created/modified, 1 new route, ~400–500 lines total.

---

### Strategy C — Robust: PWA Camera Viewfinder + Offline-Capable Intake Queue

**Summary:** Strategy B plus a real-time camera viewfinder (live stream via `navigator.mediaDevices.getUserMedia()`), client-side image compression, and an offline-first intake queue (IndexedDB via `idb`) that syncs when the network reconnects — enabling fully offline item capture on the shop floor.

**Architecture:**

All components from Strategy B, plus:

**New component — `src/components/admin/CameraCapture.tsx`:**
- Renders a `<video>` element streaming from `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`.
- "Capture" button calls `canvas.toBlob()` to extract a still frame as a `Blob`.
- Live viewfinder with tap-to-focus (if device supports `focusMode`).
- Graceful fallback to `<input capture="environment">` if `getUserMedia` is unavailable (older devices, HTTP non-secure contexts).
- Handles permission denied state with a plain-language prompt.

**New hook — `src/hooks/useOfflineQueue.ts`:**
- Wraps `idb` (IndexedDB library) to persist intake drafts locally.
- Stores: `{ localId, title, category, viewTag, priceInput, condition, imageBlob, capturedAt }`.
- Exposes `enqueue(draft)`, `dequeue(localId)`, `listQueued()` operations.
- When `navigator.onLine` transitions to `true`, triggers auto-sync: calls `createDraftItemFn` + uploads image + calls `publishItemFn` for each queued item.

**New utility — `src/lib/compressImage.ts`:**
- Canvas-based image compression before upload: resizes to max 1200px wide, JPEG at 85% quality.
- Reduces upload size from typical 3–8 MB (phone JPEG) to ~300–600 KB — critical for shop floor mobile network conditions.

**Modified — `MobileIntakePage.tsx`:**
- Step 1 uses `CameraCapture` instead of `ImageUploadZone`.
- Step 3 has "Capture Now, Sync Later" toggle — queues to IndexedDB if offline.
- Sync status indicator in `AdminMobileNav`: badge count of pending offline items.

**New Service Worker configuration:**
- Add `vite-plugin-pwa` to `vite.config.ts` for Workbox-based SW registration.
- Cache strategy: network-first for Firestore/CF requests; cache-first for static assets.
- Offline fallback page for non-admin routes.

**Persona Lens:**
- Staff: Shop floor coverage at Cornwall Island may be intermittent. Offline queue means staff can capture 10 items in a walk-through and sync all when they return to the desk. Real viewfinder is a smoother UX than file-picker camera mode.
- Makoonsii: Fallback to file picker if `getUserMedia` is unavailable means no staff is left without camera access.
- Marcus: Live viewfinder allows framing the shot before capture — better adherence to the dark luxury photography standard.

**Compliance:** Same as B. Offline queue stores only non-PII draft data locally. No `auditLogs` until sync completes server-side (correct — CF writes the log).

**Trade-offs:**
- Gains: Truly native-app equivalent experience. Offline resilience is genuinely valuable for shop floor use. Real viewfinder improves photo quality. Image compression reduces upload failures on poor connections.
- Sacrifices: Large scope. New dependencies (`idb`, `vite-plugin-pwa`). Service Worker adds complexity to the build and deployment pipeline. `getUserMedia` API requires HTTPS (already satisfied by Firebase Hosting, but must be verified in the emulator). IndexedDB offline queue introduces a new sync failure mode that needs error handling. Each of these is manageable individually; together they represent a meaningful increase in maintenance surface.

**Estimated scope:** Large — 10+ files created/modified, 2 new npm dependencies, SW configuration, IndexedDB integration, ~1000+ lines total.

---

## Recommendation: Strategy B

**Strategy B — Mobile Bottom Nav + Responsive Card Inventory + Camera-First Intake Page** is the recommendation.

**Rationale:**

The hard constraint driving this epic is operational: shop floor staff need to view inventory and photograph new items without a desktop. Strategy B directly fulfils both requirements without the complexity overhead of Strategy C's offline queue, Service Worker, and `getUserMedia` API surface.

Strategy A's camera fix is insufficient — it opens camera access but leaves staff navigating a desktop-oriented table and a 4-section form from a phone. It does not serve the primary persona's actual need.

Strategy C's offline capability is valuable but premature. The right sequence is: first validate that staff actually use the mobile intake flow (Strategy B), then add offline resilience in a follow-up cycle once usage patterns are confirmed. Adding IndexedDB queue and Service Worker before the basic workflow is validated risks over-engineering a path that may need UX iteration.

Strategy B's scope is correctly matched to the ask: 5 files, 1 new route, no new dependencies. The 3-tab bottom nav is the single highest-leverage UX improvement — it makes every admin action 1 tap away on mobile. The camera-first 3-step intake is purpose-built for the shop floor workflow. Both can be delivered in a single cycle.

The one acknowledged trade-off — mobile intake skips cannabis-specific fields (THC/CBD panel) — is acceptable because: (1) cannabis-specific intake is a secondary workflow; (2) staff can complete the cannabis profile on desktop after initial capture; (3) the mobile intake was never intended to be the full `IntakeForm` equivalent, only the shop floor capture flow.

---

## Phase 4 — Anti-Regression Protocol

### 1. Hardcoded Hex Trap

**Flagged:** The existing `AdminSidebar.tsx` uses hardcoded hex values (`#161000`, `#7a5e0a`, `#5a4508`, `#2e2200`). This is a pre-existing violation outside E41 scope.

**For E41:** `AdminMobileNav.tsx` must use only `var(--color-primary)`, `var(--color-surface)`, `var(--color-border)`, `var(--color-text)`, `var(--color-text-muted)` — zero hardcoded hex. The inventory card layout and `MobileIntakePage` must follow the same rule. **PASS — no hardcoded hex in new components.**

### 2. Firestore Field Invention Trap

No new fields. All fields referenced (`status`, `title`, `category`, `viewTag`, `price`, `condition`, `images`, `policeHold`, `createdAt`) exist in `docs/firestore-schema.md`. **PASS.**

### 3. Client-Side AI Key Trap

No new AI calls in E41. Existing `AiAssistantPanel` on desktop `InventoryPage` is unchanged. **PASS.**

### 4. Scarcity Manufacture Trap

No algorithmic merchandising tag application. `MerchandisingTagSelector` is not included in the streamlined mobile intake form (deliberate — scarcity tags are staff-considered, not impulse-captured on mobile). **PASS.**

### 5. PII Log Trap

No new `auditLogs` entries. The existing `item_published` event in `publishItem` CF already excludes PII (only `{ itemId, publishedBy UID, viewTag }`). **PASS.**

### 6. Age Gate Bypass Trap

`/admin/mobile-intake` is wrapped in `ProtectedRoute staffOnly`. No age gate applies — this is a staff-only route. Cannabis/fireworks items can be created via this route; no customer-facing page bypasses any age gate. **PASS.**

### 7. Motion Trap

`AdminMobileNav` active state transition: `transition: color var(--motion-speed-fast) var(--motion-easing)` — approved "smooth hover" pattern. No slide-in, bounce, or particle effects in any proposed component. Step transitions in `MobileIntakePage` are instant view swaps (no animation) or use `opacity` fade at `var(--motion-speed-fast)` — approved "slow fade" pattern. **PASS.**

### 8. Typography Scale Trap

All font sizes in new components use `--text-*` tokens: `--text-xs` for nav labels, `--text-small` for card metadata, `--text-body` for form inputs, `--text-subheading` for step headings. No hardcoded `px` or `rem` font sizes. **PASS.**

### 9. Brand Voice Trap

Copy in new components: "Take Photo", "Choose from Library", "Add Item", "Save Draft", "Publish", "Inventory", "Dashboard", "Add Another Item". All clean — no prohibited vocabulary, no clinical cannabis language, no CRM category disclosure. **PASS.**

---

## Files Created/Modified Summary (Strategy B)

| Action | File | Change |
|---|---|---|
| Create | `src/components/layout/AdminMobileNav.tsx` | New — 3-tab bottom nav for mobile admin |
| Modify | `src/components/layout/AdminLayout.tsx` | Add `<AdminMobileNav />` in mobile branch + `padding-bottom` |
| Modify | `src/pages/admin/InventoryPage.tsx` | Responsive: card grid on mobile, table on desktop; search + filters |
| Modify | `src/components/admin/ImageUploadZone.tsx` | `capture="environment"` + mobile-first camera CTA |
| Create | `src/pages/admin/MobileIntakePage.tsx` | New — 3-step camera-first intake page |
| Modify | `src/main.tsx` | Register `/admin/mobile-intake` route in admin group |

**No changes to:** `firestore.rules`, `firestore-schema.md`, `functions/`, any customer-facing pages, existing full `IntakeForm.tsx` (desktop intake unchanged).

---

*The Pawn Shop · docs/plans/E41_Mobile_Staff_Inventory_PLAN.md · v1.0*
