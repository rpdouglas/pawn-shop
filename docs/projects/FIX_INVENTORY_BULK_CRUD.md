# FIX · Inventory Table — Bulk Delete / Restore

**Status:** ✅ CLOSED — 2026-06-10
**Type:** Hotfix
**Cycle:** 32
**Personas served:** Staff (inventory_staff / manager / admin)

---

## Problem

The inventory table view had fully working row multi-selection (TanStack Table checkboxes) and a floating batch action bar. The bar surfaced only AI operations — ✨ Generate Descriptions and $ Suggest Prices. No CRUD actions were present. Staff could select 30 items but had no way to bulk-delete or bulk-restore them from the table view.

---

## Root Cause

`InventoryTable` was built with AI batch operations only; no `onBulkDelete` / `onBulkRestore` props were defined and no CRUD buttons were wired into the batch action bar. The single-item delete/archive/restore handlers exist in `InventoryPage` but were never extended to support multi-selection.

---

## Fix Applied

**`InventoryTable.tsx`:**
- Added `onBulkDelete?`, `onBulkRestore?`, `showRestoreAction?` to `InventoryTableProps`
- Added `handleBulkCrud` callback — confirms, collects selected IDs from `tableRef.current`, calls the passed handler, resets row selection on success; surfaces errors via `batchError`
- Added **Delete** button (error-coloured border) to batch action bar — shown when `!showRestoreAction && onBulkDelete`
- Added **Restore** button (primary-coloured border) to batch action bar — shown when `showRestoreAction && onBulkRestore`

**`InventoryPage.tsx`:**
- Added `handleBulkDelete` — `Promise.all` over `updateDoc(…, { status: 'deleted', deletedAt: serverTimestamp() })`
- Added `handleBulkRestore` — `Promise.all` over `updateDoc(…, { status: 'draft', deletedAt: deleteField() })`
- Passed both handlers and `showRestoreAction={statusFilter === 'deleted'}` to `<InventoryTable>`

Decision logged at `docs/decisions/0017-bulk-crud-client-side-writes.md`.

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (tsc + Vite) | ✅ PASS — `built in 3.02s` |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| No new Firestore fields | ✅ PASS — `status` and `deletedAt` already documented |
| No new dependencies | ✅ PASS |
| No Firestore rules changes | ✅ PASS — existing staff write rules cover `items/{id}` |

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/InventoryTable.tsx` | Added bulk CRUD props, `handleBulkCrud`, Delete/Restore buttons |
| `src/pages/admin/InventoryPage.tsx` | Added `handleBulkDelete`, `handleBulkRestore`; wired into `<InventoryTable>` |
| `docs/decisions/0017-bulk-crud-client-side-writes.md` | New |

---

*The Pawn Shop · docs/projects/FIX_INVENTORY_BULK_CRUD.md · 2026-06-10*
