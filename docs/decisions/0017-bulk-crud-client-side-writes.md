# Decision 0017 — Bulk CRUD (Delete/Restore) via Client-Side Firestore Writes

**Date:** 2026-06-10
**Epic:** FIX_INVENTORY_BULK_CRUD · Inventory Table Batch Action Bar Missing CRUD
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

The inventory table view (`InventoryTable.tsx`) already had a floating batch action bar for AI operations (bulk description generation, bulk price suggestion). Row selection via TanStack Table was fully wired. However, no CRUD buttons appeared in the bar — staff could select multiple rows but had no way to bulk-delete or bulk-restore them.

The question was how to implement bulk writes: route through a Cloud Function, or write directly from the client.

Three approaches considered:

- **A: Client-side `Promise.all` over `updateDoc` calls** — matches the existing single-item pattern in `InventoryPage`. Confirmation prompt + error catch in `InventoryTable`; Firestore writes in `InventoryPage` handlers.
- **B: New `bulkUpdateItems` Cloud Function** — centralised server-side batch; could use Admin SDK `writeBatch`.
- **C: Re-use existing `clearRecycleBin` CF pattern** — extend the existing CF to accept a list of item IDs.

---

## Decision

**Option A: Client-side `Promise.all` over `updateDoc` calls.**

---

## Rationale

1. **Proportionate complexity.** The per-item write is a two-field status update (`status`, `deletedAt`). No server-side business logic is required. Firestore security rules already enforce staff-only writes to `items/{id}` — the same rules that gate the single-item delete/restore buttons.

2. **Consistent with the existing pattern.** `handleDelete`, `handleArchive`, and `handleRestore` in `InventoryPage` are all client-side `updateDoc` calls. Bulk variants that follow the same shape keep the codebase uniform.

3. **No new CF cold-start risk.** Routing simple field updates through a CF adds cold-start latency with no benefit for this operation size (typical batch ≤ 50 items on a single-location inventory).

4. **Option B over-engineers.** A `bulkUpdateItems` CF is warranted if we later need to enforce inventory business rules (e.g., items on police hold cannot be bulk-deleted), but that constraint doesn't exist today and belongs in the rule engine at that time.

5. **Option C repurposes semantics.** `clearRecycleBin` hard-deletes all deleted items permanently. Mixing bulk soft-delete into that CF would conflate two distinct operations.

---

## Applied Pattern

Bulk CRUD props (`onBulkDelete`, `onBulkRestore`, `showRestoreAction`) are passed from the owning page to `InventoryTable`. Confirmation prompt and error state live in the table component (via `handleBulkCrud`). Firestore writes live in the page handlers. Row selection is reset on success via `table.resetRowSelection()`.

---

## Files Changed

- `src/components/admin/InventoryTable.tsx` — added `onBulkDelete`, `onBulkRestore`, `showRestoreAction` props; `handleBulkCrud` callback; Delete/Restore buttons in batch action bar
- `src/pages/admin/InventoryPage.tsx` — added `handleBulkDelete` and `handleBulkRestore` handlers; wired into `<InventoryTable>`

---

*The Pawn Shop · docs/decisions/0017-bulk-crud-client-side-writes.md · 2026-06-10*
