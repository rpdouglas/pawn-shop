# FIX — Print Ticket: PDF Renders Blank Page

**Status:** ✅ CLOSED — 2026-06-10
**Priority:** HIGH
**Effort:** Small (1 file)
**Cycle:** 32

---

## Problem

After applying FIX_PRINT_TICKET_VISIBILITY (which restored `visibility: visible` to the pawn ticket), printing the ticket to PDF via the browser's native "Save as PDF" option still produced a blank page.

**Root cause:** The Modal component sets `document.body.style.overflow = 'hidden'` as an inline style to implement scroll-lock while the modal is open. Inline styles have the highest CSS specificity. During PDF print, the browser's PDF engine respects `overflow: hidden` on the `body` element — combined with `body { min-height: 100vh }` from `index.css`, this creates a constrained viewport that clips or hides the `.print-ticket` portal content. The portal is rendered correctly in the DOM; it simply cannot be captured by the PDF engine through the overflow constraint.

---

## Personas

- **Staff / POS Operator (Primary):** Needs to print a legally valid pawn ticket after every loan issuance.
- **Makoonsii (Secondary):** The printed ticket is their legal receipt and collateral record.

---

## Fix

`src/styles/print.css` — add to the top of the `@media print` block:

```css
html, body {
  height: auto !important;
  overflow: visible !important;
}
```

`!important` in a stylesheet overrides an inline style without `!important`. This resets the Modal's scroll-lock before the PDF engine captures the page, and removes the `min-height: 100vh` constraint that could otherwise interact with the overflow clip.

---

## Gate Results

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS — zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero errors, zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests, 8 test files |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |

---

## Files Changed

| File | Change |
|------|--------|
| `src/styles/print.css` | Added `html, body { height: auto !important; overflow: visible !important; }` at top of `@media print` block |

---

## Decision

→ `docs/decisions/0024-modal-body-overflow-print-clipping.md`

---

*The Pawn Shop · docs/projects/FIX_PRINT_TICKET_PDF.md · Cornwall Island, Akwesasne*
