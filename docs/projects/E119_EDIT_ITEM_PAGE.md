# E119 — Edit Item Page (Single-Page Edit Flow)
**Status:** ✅ CLOSED — 2026-06-12
**Priority:** HIGH
**Effort:** Medium (~5 files)
**Cycle:** 33

---

## Problem

When staff edit an existing inventory item on mobile, they are taken through the 3-step intake wizard
(`capture → details → review → published`). The edit flow currently:

1. Lands on Step 1 (photo capture) — confusing when the item already has photos
2. Shows photos only on Step 1, then hides them on Step 2 (details)
3. Requires navigating through 3 pages just to change a price or description
4. Uses the `ConditionSelector` card-button grid — wasteful on small screens for a simple field update
5. The "Publish Item" CTA at the end of the wizard is misleading — for edits, staff want "Save Changes"

The desktop intake form (`IntakeForm.tsx`) is a single-page UI, but it also uses the wizard-style
`createDraftItem → editing → published` phase model when an `initialItemId` is passed — it just
doesn't paginate steps visually. Switching between desktop and mobile produces an inconsistent experience.

## Solution Delivered

Created a dedicated route `/admin/item/:id/edit` with a new `EditItemPage.tsx` component — a single
scrollable form with no step state machine. All item attributes and photo management controls are
on one page. Both mobile and desktop use the same route.

**Sections (top-to-bottom):**
1. **Photos** — thumbnail grid with Cover badge, ★ set-cover, × delete, + Add Photo
2. **Item Details** — title, view tag, category, description
3. **Pricing & Stock** — sale price, cost (internal), quantity
4. **Condition & Details** — condition `<select>` (5 grades), serial number, provenance notes
5. **Cannabis Profile** — conditional; uses existing `CannabisFields` component
6. **Fireworks Profile** — conditional; uses existing `FireworksFields` component
7. **Actions** — Save Changes + Back to Inventory

Photo uploads in edit mode always use `extractData: false` — the item already has staff-written data;
AI must not overwrite it.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/EditItemPage.tsx` | Created — single-page edit form (~380 lines) |
| `src/main.tsx` | Added `/admin/item/:id/edit` lazy route |
| `src/components/admin/InventoryCard.tsx` | "Full Edit" link updated to `/admin/item/${item.id}/edit` |

## Docs Updated

| File | Change |
|------|--------|
| `docs/decisions/0036-e119-edit-item-page.md` | Decision log |
| `docs/reports/E119_QA_REPORT.md` | QA sign-off |
| `docs/EPICS.md` | E119 epic entry added and closed |
| `docs/ACTIVE_CYCLE.md` | E119 completed row added |
| `user-guide/admin/inventory.md` | "Full Edit" description updated |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — Zero TypeScript errors |
| `npm run lint` | ✅ PASS — Zero ESLint errors/warnings |
| `npm run test` | ✅ PASS — 29/29 tests pass |
| `npx tsc -b` (functions/) | ✅ PASS — Zero errors |
| Hardcoded hex audit | ✅ PASS — Design tokens only |
| PII in logs audit | ✅ PASS — No PII in any log output |

---

*The Pawn Shop · docs/projects/E119_EDIT_ITEM_PAGE.md · 2026-06-12*
