# E55 Epic Plan: Edit Inventory Item

## Phase 1 — Persona & Compliance Gate
- **Primary Persona:** Staff (Sandra/Dale/Admin). Staff need an easy way to correct mistakes (e.g., typos in descriptions, wrong category) or adjust changing information (e.g., mark down prices, change status or condition) without having to delete and re-create the item.
- **Compliance Audit:** Updates to items will continue to route directly to Firestore `items/{id}` securely via the admin-authenticated client. The edit form must ensure `policeHold` or compliance-sensitive fields (like the cannabis profile) are not inadvertently cleared during an update. We will ensure the form loads existing data correctly.

## Phase 2 — Schema Audit
- **Impacted Collections:** `items/{id}`
- **Schema Changes:** None. We are only mutating existing documents within the defined `docs/firestore-schema.md` structures.

## Phase 3 — Three-Strategy Proposal

### Strategy A: Minimal Modal Edit
- **Architecture:** Add an `EditItemModal` component directly to `InventoryPage.tsx` that appears when "Edit" is clicked. It includes just a few simple inputs (Price, Description, Status) and updates Firestore in-place.
- **Persona Lens:** Very fast for quick adjustments on desktop. But terrible on mobile since modals are clunky for large forms.
- **Trade-offs:** Doesn't support editing complex item types (like Cannabis profiles) and isn't fully mobile-friendly.

### Strategy B: Refactor Intake into a Shared Edit Route (Recommended)
- **Architecture:** 
  1. Add a new route `/admin/inventory/edit/:id`.
  2. Refactor `IntakeForm` (desktop) and `MobileIntakePage` (mobile) to support an `editMode` by pre-filling state if an ID is passed.
  3. Add an "Edit" button to the item cards (mobile) and table rows (desktop) linking to the respective edit experience depending on viewport.
- **Persona Lens:** Provides a seamless, familiar interface for staff, leveraging the exact same UX they use for creating items, simply pre-populated with existing data.
- **Trade-offs:** Requires refactoring the existing `IntakeForm` and `MobileIntakePage` to load an existing document's data into its state on mount.

### Strategy C: Dedicated Admin Dashboard Editing Suite
- **Architecture:** Build a full-page, unified React editing suite `/admin/inventory/editor/:id` that renders identically on mobile and desktop, replacing `IntakeForm` and `MobileIntakePage` entirely.
- **Trade-offs:** Out of scope. `MobileIntakePage` exists because mobile needs a camera-first UX, while desktop uses drag-and-drop. Unifying them now introduces massive technical debt.

## Phase 4 — Anti-Regression Protocol
- [x] No hardcoded Hex Codes: Use CSS tokens.
- [x] Firestore field invention: Prohibited.
- [x] PII in logs: None involved.
- [x] Age gates: Ensure edit route is protected by `ProtectedRoute staffOnly`.

**Recommendation:** Strategy B is the clear choice. It reuses the exact same forms Staff are already trained on, ensuring consistent data structures and a seamless mobile/desktop split.
