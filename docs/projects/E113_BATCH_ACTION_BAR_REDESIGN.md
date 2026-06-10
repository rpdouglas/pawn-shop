# E113 — Inventory Batch Action Bar Redesign
**Status:** ✅ CLOSED — 2026-06-10
**Priority:** MEDIUM
**Effort:** TBD
**Cycle:** 33

---

## Problem

The floating batch action bar in `InventoryTable.tsx` is a centred oval pill anchored to the bottom of the viewport. When rows are selected, it surfaces five items in a row — "N selected", ✨ Generate Descriptions, $ Suggest Prices, Restore/Delete, and Clear — with no visual grouping and no overflow strategy.

Staff feedback (and industry analysis) identifies three distinct problems:

1. **Wrong position:** The pill sits at the bottom of the screen; the table and toolbar are at the top. Staff must break eye contact with the rows they selected to find the actions.
2. **Overcrowded pill:** The oval shape gets extremely tight on 13" laptops. Long button labels ("Generate Descriptions") push the bar past viewport width on medium screens.
3. **No visual hierarchy:** AI actions (generate, price) are mixed in the same row as CRUD actions (delete, restore) with no grouping or priority signal.

---

## Goal

Replace the floating pill with a contextual selection bar that:
- Lives where the user is already looking (near the table controls, not at the bottom)
- Groups actions by type (AI enrichment vs. CRUD) with clear visual weight
- Does not overflow on standard admin viewports (1280px–1440px target)
- Maintains all existing functionality (batch AI, bulk delete, bulk restore, clear)
- Meets ≥44px touch targets and full keyboard navigability

---

## Primary Personas

- **Staff (admin / inventory_staff / manager)** — primary; entire feature is staff-only
- **Makoonsii** (indirect) — touch-target standard applies to admin tools too
- **Jordan** (indirect) — brand quality extends to admin; the "dapper" standard applies to staff UIs, not just customer-facing pages

---

## Files in Scope (planning estimate)

| File | Change |
|------|--------|
| `src/components/admin/InventoryTable.tsx` | Replace batch action bar JSX + styles |

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ Zero errors |
| `npm run lint` | ✅ Zero errors / warnings |
| `npm run test` | ✅ 29/29 pass |
| `npx tsc -b` (functions/) | ✅ Zero errors |
| Schema sync | ✅ No Firestore changes — purely presentational |
| Compliance audit | ✅ All guardrails met |
| User guide | ✅ `user-guide/admin/inventory.md` updated |
| Decision log | ✅ `docs/decisions/0031-e113-batch-action-bar-top-anchored-sticky.md` |

---

*The Pawn Shop · docs/projects/E113_BATCH_ACTION_BAR_REDESIGN.md · 2026-06-10*
