# Decision 0031 — E113 Batch Action Bar: Top-Anchored Sticky Banner (Strategy A)

**Date:** 2026-06-10
**Epic:** E113 · Inventory Batch Action Bar Redesign
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

The inventory table's batch action bar was a centred `position: fixed` pill anchored to the bottom of the viewport. Three problems were identified:

1. **Wrong position** — staff eyes are at the top of the table; the bottom pill requires breaking eye contact with the selected rows.
2. **Overcrowded pill** — five items on one row with `whiteSpace: nowrap`; `borderRadius: var(--radius-lg)` created an oval that overflowed on 13" laptops.
3. **No visual hierarchy** — AI enrichment actions (Descriptions, Prices) had identical visual weight to destructive CRUD actions (Delete), with no grouping or divider.

Three strategies were evaluated against industry reference products (Shopify Admin, Airtable, Linear, GitHub Issues, Google Drive):

- **A:** Top-anchored sticky banner — `position: sticky; top: 0` placed between toolbar and table, two-zone layout with divider.
- **B:** Structured full-width fixed bottom bar — keep bottom position but replace pill with rectangular full-width bar.
- **C:** Inline header transformation — `<thead>` row replaces column headers with count + icon buttons when rows are selected.

---

## Decision

**Strategy A: Top-anchored sticky banner.**

---

## Rationale

1. **Eye-contact alignment.** Every leading inventory management tool (Shopify Admin, Airtable, Google Drive) places selection controls at the top of the data view, not the bottom. Users scan data from the top; the action bar must be where their eye already is.

2. **`position: sticky; top: 0` outside the overflow container.** The banner is placed in the document flow between the toolbar `<div>` and the `<div role="grid" style={{ overflowX: 'auto' }}>`. Because it is outside the horizontally-scrollable container, `position: sticky` works correctly relative to the page scroll — not the horizontal overflow container. The banner stays in view while the user scrolls the table vertically.

3. **Two-zone layout with divider.** Left zone: count badge + dismiss `×`. Right zone: AI group (✨ Descriptions | $ Prices) separated from CRUD group (Delete or Restore) by a `1px` vertical `var(--color-border)` divider. This separation reduces accidental destructive actions and makes the action semantics immediately legible.

4. **Error band separated.** The inline `batchError` string inside the pill (easy to miss against dark backgrounds) is replaced by a dismissible `role="alert"` band directly below the context banner. Full width, distinct background tint, explicit dismiss button.

5. **`color-mix()` tint.** The banner background uses `color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))` — the same CSS function already used in `renderItemRow` for selected row highlight. No new pattern introduced. Zero hardcoded hex.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy B (bottom full-width) | Full-width is an improvement over the pill, but bottom position perpetuates the primary problem: staff eyes are at the top |
| Strategy C (header transformation) | Cleanest long-term UI, but disables column-sort controls while selection is active — a real staff workflow regression. Also requires more complex TanStack Table conditional thead rendering |

---

## Compliance Notes

- No Firestore reads/writes changed — purely presentational.
- `batchError` moved from inline span (inside pill) to `role="alert"` element — improved accessibility.
- All banner buttons `minHeight: 44px` — admin touch target standard.
- Zero hardcoded hex values; all tokens from design system.
- `batchProcessItems` CF call path and all `confirm()` dialogs unchanged.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/InventoryTable.tsx` | Replaced fixed-bottom pill with top-anchored sticky banner; moved error to separate alert band |

---

*The Pawn Shop · docs/decisions/0031-e113-batch-action-bar-top-anchored-sticky.md · 2026-06-10*
