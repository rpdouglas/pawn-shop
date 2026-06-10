# E112 — Inventory UX: Grouping, Collapsible Sections & Grid Inline Edit
**Status:** ✅ CLOSED — 2026-06-10
**Priority:** MEDIUM
**Effort:** TBD
**Cycle:** 33

---

## Problem

The admin Inventory page has two view modes — Grid and Table — but neither supports grouping or collapsible sections. The Table mode has excellent inline editing but presents all items in a single flat sorted list. The Grid mode groups by vertical but sections cannot be collapsed and cards have no inline editing — staff must navigate away to the full edit form to change any field. On mobile, the card layout lacks proper ≥48px touch targets on action buttons and has no swipe affordances.

Best-practice inventory systems (Shopify admin, Airtable, Linnworks) all provide: (1) groupable/collapsible sections so staff can focus on one category at a time, (2) quick inline editing in both list and card views, and (3) persistent view state so staff don't reset their layout every session.

## Goal

Make the Inventory page the primary day-to-day inventory management surface. Staff should be able to:
- Group the flat table or card grid by any dimension (View Tag, Category, Status)
- Collapse/expand groups to reduce cognitive load
- Edit fields directly on grid cards without navigating to the full intake form
- Return to the same view state they left (localStorage persistence)

## Primary Personas

- **Staff** — inventory_staff, manager, admin (primary — entire feature is staff-only)
- **Dale** (indirect) — cleaner staff workflow = fresher, more accurate public listings
- **Kevin** (indirect) — faster status transitions = alerts fire on up-to-date inventory
- **Marcus** (indirect) — better image visibility in grid view supports photography review

## Files in Scope (planning estimate)

| File | Change |
|------|--------|
| `src/pages/admin/InventoryPage.tsx` | Group-by control, collapsed-section state, persistence |
| `src/components/admin/InventoryTable.tsx` | Grouping + collapse in table mode |
| `src/components/admin/InventoryTable/columns.tsx` | Group header row rendering |
| `src/components/admin/InventoryCard.tsx` | New: inline-editable grid card |

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ Zero errors |
| `npm run lint` | ✅ Zero errors / warnings |
| `npm run test` | ✅ 29/29 pass |
| `npx tsc -b` (functions/) | ✅ Zero errors |
| Schema sync | ✅ No new fields — all pre-existing |
| Compliance audit | ✅ All guardrails met |
| User guide | ✅ `user-guide/admin/inventory.md` updated |
| Decision log | ✅ `docs/decisions/0030-e112-inventory-grouping-manual-client-side.md` |

---

*The Pawn Shop · docs/projects/E112_INVENTORY_UX_GROUPING.md · 2026-06-10*
