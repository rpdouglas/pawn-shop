# Project E41: Mobile Staff Inventory

**Status:** Done — 2026-05-22
**Epic:** E41 — Mobile Staff Inventory
**Phase:** Phase 9 — Production Readiness
**Primary Persona:** Staff (inventory_staff / manager / admin on shop floor)
**Secondary Personas:** Makoonsii (48px touch targets, plain language), Marcus (photo quality at intake), Dale (inventory accuracy)
**AI Involvement:** Claude (dev) | Gemini E18 (runtime — existing, unchanged)

**Objective:** Deliver a mobile-first admin inventory view and a camera-first item intake flow so that shop floor staff can browse all inventory and add new items — including taking photos — from any mobile device without a desktop.

---

## 1. User Story

> As **inventory staff on the shop floor**, I want to view all inventory and add new items using my phone's camera so that I can process intake and check stock without leaving the shop floor or returning to a desktop.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Staff

> *"Staff can take a photo of an item and add it to inventory."*

Test: On a 375px viewport, navigate to `/admin/inventory`, view the item list as cards (not a table), tap "Add Item", take a photo using the device camera, complete a minimal intake form, and publish the item — all within a single mobile session with no desktop required.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px) — nav, cards, camera button, form fields
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Feature is navigable by a low-tech mobile user in under 3 taps from the admin home

### Marie Discretion Test

- [ ] N/A — admin-only feature, no CRM or notification copy in this epic

### Marcus Photography Test (run — camera intake flow captures photos)

- [ ] Camera-first flow clearly positions the item capture as the first step, reinforcing the dark luxury photography standard
- [ ] No placeholder images allowed to reach `status: 'active'` — publish gate unchanged

### Kevin Speed Test

- [ ] Alert dispatches within 60s of `status: 'active'` — existing `publishItem` CF unchanged, SLA unaffected
- [ ] CASL `alertOptIn: true` verified before every send — existing behaviour preserved

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — admin-only route, staff authenticated via `ProtectedRoute` + MFA
- [ ] **`auditLogs` events required?** No new event types — existing `item_published` fires via `publishItem` CF unchanged
- [ ] **PII exclusion** — no PII enters logs, analytics, or console; no change from current behaviour
- [ ] **`policeHold` respected** — inventory list query is staff-only (no public read rule change needed)
- [ ] **`aiDescription` draft-only** — no change to existing AI subcollection handling
- [ ] **AI API security** — no new AI API calls in this epic
- [ ] **CASL compliance** — no new notifications; existing `publishItem` CF CASL check unchanged
- [ ] **Scarcity integrity** — no algorithmic merchandising tags; staff-set only via existing form

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read: status, title, category, viewTag, price, condition, images, policeHold, createdAt
Fields written: (unchanged — existing IntakeForm + publishItem CF write path)

Collection: auditLogs/{id}
Fields written: (unchanged — existing item_published event only)
```

### New Fields Required

None. No new Firestore fields are introduced in this epic. All fields used exist in `docs/firestore-schema.md`.

### TypeScript Interfaces

```typescript
// Uses: Item, ItemStatus, ConditionGrade, MerchandisingTag, ViewType (src/lib/types.ts)
// No new interfaces required — MobileIntakeForm shares FormState from IntakeForm
```

### Security Rules Required

No changes to `firestore.rules`. Staff read/write on `items` is already permitted for authenticated staff roles.

---

## 5. AI Involvement Detail

### Claude (development):
- `docs/prompts/PLANNING.md` — this document
- `docs/prompts/TESTING.md` — QA phase
- `docs/prompts/TICKET_CLOSE.md` — close phase

### Gemini E18 (runtime):
- Not involved. Existing `AiAssistantPanel` on `InventoryPage` is unchanged.

---

## 6. Implementation Phases

### Phase 1 — Mobile Admin Navigation

- [ ] Add mobile bottom navigation bar for admin routes (`< 1024px`) — `AdminMobileNav.tsx`
  - Tabs: Inventory, Add Item, Dashboard (3 core staff actions)
  - 48px minimum touch targets, token-only styling
  - `NavLink` active state using `var(--color-primary)`
  - Renders only when current route is under `/admin`
- [ ] Update `AdminLayout.tsx` to render `<AdminMobileNav />` on mobile below `<Outlet />`
- [ ] No change to desktop shell (≥ 1024px)

### Phase 2 — Mobile Inventory View

- [ ] Refactor `InventoryPage.tsx` — responsive layout:
  - **Mobile (`< 768px`):** Card grid — one card per item (title, status badge, viewTag, price, condition, thumbnail if available)
  - **Desktop (`≥ 768px`):** Existing table view preserved
  - Cards use only `--space-*`, `--text-*`, `--color-*` tokens
  - Touch target for each card: full card tappable, ≥ 48px height
  - "Add Item" FAB (floating action button) in bottom-right corner on mobile
- [ ] Search/filter bar (mobile): single text input to filter visible items by title (client-side, no new Firestore queries)
- [ ] Status filter chips (mobile): All / Active / Draft / Reserved / Sold — client-side

### Phase 3 — Camera-First Intake

- [ ] Update `ImageUploadZone.tsx`:
  - Add `capture="environment"` attribute to the hidden file input for native camera access
  - On mobile: show "Take Photo" as primary CTA (large button, camera icon); "Choose File" as secondary
  - On desktop: existing drag-and-drop / file picker behaviour preserved
- [ ] Create `MobileIntakePage.tsx` (`/admin/mobile-intake`) — streamlined 3-step flow optimised for one-handed mobile use:
  - **Step 1 — Photo**: Camera capture button as hero action; shows thumbnail preview; "Retake" option
  - **Step 2 — Details**: Title (required), View (pawn/cannabis/fireworks), Category, Price, Condition — all on one scrollable screen with large inputs
  - **Step 3 — Confirm**: Review thumbnail + details; "Save Draft" or "Publish" buttons
  - Reuses existing `createDraftItemFn` and `publishItemFn` Cloud Functions
  - Reuses existing `FormState`, `validateForSave`, `validateForPublish` logic from `IntakeForm.tsx`
- [ ] Register route `/admin/mobile-intake` in `main.tsx`
- [ ] `AdminMobileNav` "Add Item" tab links to `/admin/mobile-intake`
- [ ] Existing `/admin/intake` (full `IntakeForm`) remains unchanged — accessible from desktop sidebar

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Staff mobile smoke test: complete full intake flow on 375px viewport using camera capture
- Makoonsii: 48px touch targets, axe-core clean, keyboard nav on desktop unbroken
- Marcus: confirm photo uploads correctly, watermark applied, published item has image
- Kevin: confirm `item_published` auditLog fires, saved-search alert dispatches within 60s
- Desktop regression: confirm existing table, AI panel, and full IntakeForm unaffected

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: Staff mobile gate, Makoonsii, Marcus, Kevin — all passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] E41 tasks in `docs/EPICS.md` all ticked
- [ ] `docs/firestore-schema.md` unchanged (no new fields)
- [ ] `docs/DECISIONS.md` updated with mobile-intake route decision
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/E41_Mobile_Staff_Inventory.md · v1.0*
