# E119 — Edit Item Page: Planning Document

**Generated:** 2026-06-12
**Phase A gate — awaiting strategy approval**

---

## Step 1 — Persona Gate

**Primary:** Marcus — The Dapper Connoisseur `[Marc]`
> Staff must be able to delete individual photos and promote a better shot to cover without
> a slow wizard. Every photo management action from E117 must remain accessible in the edit view.

**Primary:** Staff (Inventory) `[Staff]`
> Sub-60s edits. Changing a price, condition, or description should not require navigating 3 pages.
> The wizard is an intake pattern — not an editing pattern.

**Secondary:** Makoonsii `[Mak]`
> All touch targets ≥48px. All photo controls ≥48px. Condition input must be reachable
> in under 2 taps from the edit page without horizontal scrolling.

---

## Step 2 — Schema Audit

**Collections read/written:**

| Collection | Operation | Fields |
|---|---|---|
| `items/{id}` | read on mount | `title`, `description`, `category`, `viewTag`, `price`, `condition`, `images`, `status`, `quantity`, `cannabisProfile`, `fireworksProfile`, `serialNumber`, `merchandisingTags` |
| `items/{id}` | update on save | same fields |
| `items/{id}/internal/staff` | read + merge | `cost` |
| `items/{id}/internal/ai` | read-only | `aiPriceSuggestion`, `intakeExtraction.marketPricing` |

**All fields exist in `docs/firestore-schema.md`.** No new fields required. No schema changes needed.

**CFs used (existing, no changes):**
- `removeItemImage` — delete photo from Storage + `arrayRemove`
- `reorderItemImages` — promote cover photo via full array write
- `processUploadedImage` — process new uploads
- `publishItem` — transition `draft → active` (only relevant if item is still a draft when editing)

---

## Step 3 — Three Strategy Proposal

---

### Strategy A: New Dedicated `EditItemPage` (Recommended)

**Architecture:**
- New route: `/admin/item/:id/edit` in `main.tsx` (lazy-loaded)
- New component: `src/pages/admin/EditItemPage.tsx`
- Single scrollable page — no steps, no wizard state machine
- Page sections (top-to-bottom):
  1. **Photos** — thumbnail grid with Cover badge, ★ set-cover, × delete, + Add Photo button
  2. **Core fields** — title, viewTag (locked if published), category, description
  3. **Pricing** — sale price, cost (staff-only), quantity
  4. **Condition** — `<select>` dropdown (5 options: New / Like New / Good / Fair / Poor)
  5. **Cannabis or Fireworks profile** — conditional panel matching IntakeForm sub-components
  6. **Actions** — "Save Changes" (updateDoc) + "Back to Inventory" link
- `InventoryCard.tsx` edit link updated: `to="/admin/item/${item.id}/edit"`
- Both old edit routes (`/admin/intake/edit/:id` and `/admin/mobile-intake/edit/:id`) redirect to new route or are deprecated

**Persona Lens:**
- Marcus: photos section is above the fold on mobile — first thing visible, immediately actionable
- Makoonsii: all controls ≥48px; condition dropdown is a single tap; no pagination
- Staff: "Save Changes" is unambiguous; no "Publish" confusion for existing items

**Compliance:**
- No age gates involved (admin-only, `ProtectedRoute staffOnly`)
- No PII in logs — no changes to audit log patterns; existing `item_photo_removed` / `item_photos_reordered` events still fire via the CFs
- `policeHold` field remains admin-only write; the edit form does not expose a policeHold toggle (it's managed via the inventory table)
- No AI API keys on client — uploads still use existing `processUploadedImage` CF
- `aiDescription` in `internal/ai` subcollection is read-only in this view; never surfaced to customers

**Trade-offs:**
- ✅ Clean separation of concerns: intake = create, edit = edit
- ✅ Removes wizard complexity from an already 1,234-line component
- ✅ Works identically on mobile and desktop (responsive single-column)
- ✅ Condition dropdown reuse is straightforward — no `ConditionSelector` needed, just a `<select>`
- ⚠️ New file to maintain (~300–400 lines)
- ⚠️ Upload logic partially duplicated from `MobileIntakePage` (extractable into a small hook if desired, but not required for this epic)

**Estimated Scope:** Medium — ~5 files
- `src/pages/admin/EditItemPage.tsx` (new, ~350 lines)
- `src/main.tsx` (add 1 route)
- `src/components/admin/InventoryCard.tsx` (update edit link)
- `src/pages/admin/InventoryPage.tsx` (update any inline edit links)
- `docs/firestore-schema.md` (no changes) / `docs/EPICS.md` / `docs/ACTIVE_CYCLE.md`

---

### Strategy B: Mode Switch Inside `MobileIntakePage`

**Architecture:**
- No new files; no new routes
- Add `const isEditMode = !!initialItemId` inside `MobileIntakePage.tsx`
- When `isEditMode === true`, render a single-column flat layout instead of the `step === 'capture' | 'details' | 'review'` branches
- Photos section rendered at top of the flat layout (reusing existing `handleMobileDeleteImage` / `handleMobileSetCover` callbacks)
- All form fields from the `details` step rendered below the photos
- Condition field replaced with a `<select>` in edit mode (the existing `ConditionSelector` card grid is kept for new intake)
- "Save Changes" button calls `updateDoc` directly; no "Publish Item" in edit mode
- `InventoryCard.tsx` edit link stays as `to="/admin/mobile-intake/edit/${item.id}"`

**Persona Lens:**
- Makoonsii: still a single page in edit mode — touch targets unchanged
- Staff: "Save Changes" is clearer than "Publish Item"
- Marcus: photos visible at top in edit mode

**Compliance:**
- Same as Strategy A — no new compliance surface

**Trade-offs:**
- ✅ Zero new files; minimal route changes
- ✅ Reuses all existing upload, photo management, and real-time snapshot logic
- ✅ Fastest to ship (lowest risk)
- ⚠️ `MobileIntakePage.tsx` is already 1,234 lines — adding another render branch makes it harder to read
- ⚠️ Component name "MobileIntakePage" is semantically wrong for an edit flow used on both mobile and desktop
- ⚠️ The wizard step state machine must coexist in the file with the new flat-edit layout — future maintainers will be confused
- ⚠️ Desktop edit (`/admin/intake/edit/:id` → `IntakeForm.tsx`) remains a separate code path — inconsistency not resolved

**Estimated Scope:** Small — ~3 files
- `src/pages/admin/MobileIntakePage.tsx` (~+120 lines in an `isEditMode` branch)
- `src/components/admin/InventoryCard.tsx` (link stays the same; just label change)
- `docs/EPICS.md` / `docs/ACTIVE_CYCLE.md`

---

### Strategy C: Shared `ItemAttributesForm` Component + Unified Edit Route

**Architecture:**
- Extract a new shared component: `src/components/admin/ItemAttributesForm.tsx`
  - Accepts `itemId`, `initialData`, `onSave` callback
  - Renders: photos, all text fields, price, cost, condition (`<select>`), quantity, cannabis/fireworks panels
  - Self-contained — manages its own upload state via `processUploadedImage` CF
- New `EditItemPage.tsx` that imports `ItemAttributesForm` (thin wrapper, ~60 lines)
- Both `/admin/item/:id/edit` (desktop) and `/admin/mobile-intake/edit/:id` (mobile) point to the same `EditItemPage`
- `IntakeForm.tsx` can optionally import `ItemAttributesForm` for its editing phase in a future E73 refactor (this epic doesn't touch `IntakeForm.tsx`)

**Persona Lens:**
- Same as Strategy A for end users
- Additionally: developer experience — one shared component means one place to update photo management, cannabis fields, etc.

**Compliance:**
- Same as Strategy A

**Trade-offs:**
- ✅ Maximum reuse — shared component eliminates all duplication between mobile and desktop edit paths
- ✅ Shared component can be unit tested independently
- ✅ Lays groundwork for E73 IntakeForm refactor (Strategy C in `E73_ARCHITECTURE_MODERNIZATION_PLAN.md`)
- ⚠️ Largest scope — risk of introducing bugs during extraction
- ⚠️ `IntakeForm.tsx` is already on the E73 backlog for a separate refactor; extracting shared logic now may conflict with that work
- ⚠️ The shared component needs to handle both "new item" (upload triggers AI) and "edit item" (upload does not trigger AI) modes — adds props/complexity

**Estimated Scope:** Large — ~7–8 files
- `src/components/admin/ItemAttributesForm.tsx` (new, ~400 lines)
- `src/pages/admin/EditItemPage.tsx` (new, ~80 lines)
- `src/main.tsx` (route changes)
- `src/components/admin/InventoryCard.tsx` (link update)
- `src/pages/admin/InventoryPage.tsx` (link update)
- `src/components/admin/ItemAttributesForm.test.tsx` (unit tests)
- `docs/EPICS.md` / `docs/ACTIVE_CYCLE.md`

---

## Step 4 — Anti-Regression Check

All three strategies:

| Check | Strategy A | Strategy B | Strategy C |
|---|---|---|---|
| Hardcoded hex values | ✅ None — tokens only | ✅ None | ✅ None |
| Invented Firestore fields | ✅ None | ✅ None | ✅ None |
| AI API keys on client | ✅ None — CFs only | ✅ None | ✅ None |
| Auto-applying scarcity tags | ✅ Not applicable | ✅ Not applicable | ✅ Not applicable |
| PII in logs | ✅ None | ✅ None | ✅ None |
| Age gates at component level | ✅ Admin-only, router-level ProtectedRoute | ✅ Same | ✅ Same |
| Unapproved motion patterns | ✅ None planned | ✅ None | ✅ None |

---

## Recommendation

**Strategy A** — New Dedicated `EditItemPage`.

The edit pattern is fundamentally different from the intake pattern. Encoding that distinction in a
separate page eliminates wizard-state complexity from `MobileIntakePage`, gives the route a semantically
correct name, fixes both mobile and desktop edit paths in one shot, and requires medium scope work that
is low-risk and surgically targeted.

Strategy B is the fastest path but leaves a 1,400-line component and doesn't resolve the desktop edit
inconsistency. Strategy C over-engineers the extraction relative to the current ask — E73 already owns
the shared form component problem.

---

## Awaiting Approval

Post this summary in chat and wait for the developer to approve a strategy before writing any code.

---

*The Pawn Shop · docs/plans/E119_EDIT_ITEM_PAGE_PLAN.md · 2026-06-12*
