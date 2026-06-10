# Decision 0030 — E112 Inventory UX: Manual Client-Side Grouping (Strategy B)

**Date:** 2026-06-10
**Epic:** E112 · Inventory UX: Grouping, Collapsible Sections & Grid Inline Edit
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

E112 needed collapsible group sections in both Grid and Table views, inline editing on grid cards, and localStorage persistence of view state. Three strategies were considered:

- **A:** Table grouping only via TanStack `getGroupedRowModel()` — grid cards still navigate to full edit form.
- **B:** Manual client-side grouping in both modes + new `InventoryCard` component with inline editing (reusing CellEditors).
- **C:** Full Kanban view + advanced filter panel + virtual scrolling + saved views.

---

## Decision

**Strategy B: Manual client-side grouping + `InventoryCard.tsx` inline editing.**

---

## Rationale

### Manual grouping over `getGroupedRowModel()`

`@tanstack/react-table`'s `getGroupedRowModel()` introduces aggregate rows (one synthetic row per group) alongside item rows. This requires:
- Handling a different `row.subRows` path for every cell renderer and batch-selection check.
- New `GroupingState` in the table component, conflicting with the existing `SortingState` + `RowSelectionState` management.
- The existing `CellWrapper` click-to-edit pattern only works on real item rows — aggregate rows have no `row.original`.

Manual grouping (build a `Map<string, Row<Item>[]>` from `table.getRowModel().rows`) is 40 lines vs. the complexity above and keeps every existing cell editor, batch action, and AI trigger working without modification.

### `InventoryCard.tsx` inline editing

Grid cards previously navigated to `/admin/mobile-intake/edit/:id` for any field change. This is a multi-second round-trip for staff doing a pricing pass or status sweep. The new card reuses `TextCellEditor`, `SelectCellEditor`, and `PriceCellEditor` directly — zero new editor logic, same Firestore `updateDoc` write pattern as the table.

### localStorage persistence

Resetting to grid/groupByViewTag/statusAll on every page reload creates friction for staff doing repeated inventory passes. Four keys persisted: `inventory:viewMode`, `inventory:groupBy`, `inventory:statusFilter`, `inventory:collapsedGroups`. The set-based collapsed state (stored as JSON array) keeps group open/closed state across sessions.

### Default-expanded pattern

`collapsedGroups` is a `Set<string>` of collapsed keys rather than a `Set<string>` of expanded keys. An absent key means expanded (the natural default). This avoids having to enumerate all group keys on first render and matches how the table's `expandedGroups: Record<string, boolean>` works (undefined = expanded, false = collapsed).

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy A (table only) | Grid cards still require full-page navigation for any edit — primary gap not closed |
| `getGroupedRowModel()` | Aggregate row type breaks every existing cell renderer and batch-select check |
| Strategy C (Kanban + virtual scroll) | 3× the scope; `@dnd-kit/core` is a new dependency; virtual scroll adds layout complexity. Strategy B closes the priority gap cleanly. |

---

## Group Display Order

Status and viewTag groups use an explicit sort order rather than alphabetical, so staff see items in workflow sequence:

| Dimension | Order |
|-----------|-------|
| `status` | draft → active → reserved → sold → archived → deleted |
| `viewTag` | pawn → cannabis → fireworks → tobacco → other |
| `category` | alphabetical (no fixed domain) |

---

## Compliance Notes

- All `updateDoc` writes from `InventoryCard` use the same Firestore auth path as `InventoryTable` — no rule changes needed.
- `policeHold` write is not exposed in `InventoryCard` (no `PoliceHoldCell`); remains table-only where the full admin gate is visible.
- `rare-find` / `limited-edition` tags are not inline-editable from the card — no `TagCellEditor` in the card layout.
- localStorage keys store only UI state (mode strings, group keys) — no item data, no PII.
- `archived` status is now reachable via the card Archive button directly (was previously only via table). This matches the existing pattern in `InventoryTable`.

---

## New Files Introduced

| File | Type | Notes |
|------|------|-------|
| `src/components/admin/InventoryCard.tsx` | New | Inline-editable grid card, reuses CellEditors |

## Modified Files

| File | Change |
|------|--------|
| `src/components/admin/InventoryTable.tsx` | Added `GroupBy` export, manual group rendering, `expandedGroups` state |
| `src/pages/admin/InventoryPage.tsx` | Added `groupBy` dropdown, `collapsedGroups` state, localStorage persistence |

---

*The Pawn Shop · docs/decisions/0030-e112-inventory-grouping-manual-client-side.md · 2026-06-10*
