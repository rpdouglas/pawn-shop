# Decision 0015 — Admin Inventory Query: Raise Limit to 500 (Hotfix)

**Date:** 2026-06-10
**Epic:** FIX_SEED_ITEM_VISIBILITY · Admin Inventory Hidden Items Hotfix
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

The admin `InventoryPage` query was fetching items with `limit(50)` ordered by `createdAt desc`. Seed items added in a single batch on 2026-05-18 (60 items via `scripts/seed-inventory.mjs`) received the oldest timestamps in the database. As real items were added after that date, the seed items fell past position 50 and became invisible in the admin view.

Public storefronts (pawn, cannabis, fireworks) were unaffected because `useItems` and `useItemSearch` each query per `viewTag` with their own independent `limit(20)` bucket — seed items fell within the top-20 for their individual vertical even though they were outside the global top-50.

Two remediation strategies were considered:

- **A: Raise the limit** — increase `limit(50)` to a value large enough to cover realistic inventory (e.g. 500).
- **B: Add cursor-based pagination** — implement Firestore `startAfter()` with a "Load More" button.

---

## Decision

**Strategy A: Raise `limit(50)` to `limit(500)`.**

---

## Rationale

1. **Proportionate to scope.** The pawn shop is a single-location retail business. 500 active items across three verticals is a generous ceiling that will not be hit in normal operations.

2. **Simplicity.** Strategy B (cursor pagination) requires a new `lastVisible` cursor state, a "Load More" button, and pagination logic in all downstream filtering and group-by operations. The added complexity is not justified for the current scale.

3. **Admin UX.** The admin inventory view benefits from showing all items at once — search, status filter chips, and the group-by-viewTag layout are client-side operations that assume the full dataset is loaded.

4. **Revisable decision.** If inventory grows past 300 items, a follow-on epic (E107+) can add cursor pagination with a proper `endReached` state. The data model supports this without schema changes.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy B (cursor pagination) | Over-engineered for current inventory scale; breaks client-side group-by and filter-chip counts without additional state management |

---

## Compliance Notes

- No new Firestore fields introduced.
- No Firestore rule changes required — admin route is auth-gated to `isStaff`.
- `limit(500)` is still a bounded read. No unbounded `getDocs()` without a limit.

---

## Files Changed

- `src/pages/admin/InventoryPage.tsx` — `limit(50)` → `limit(500)`
- `scripts/find-seed-items.mjs` — new read-only identification script (not deployed)

---

*The Pawn Shop · docs/decisions/0015-admin-inventory-query-limit.md · 2026-06-10*
