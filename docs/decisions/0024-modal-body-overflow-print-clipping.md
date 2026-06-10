---
status: accepted
date: 2026-06-10
epic: FIX_PRINT_TICKET_PDF
---

# 0024 — Modal Scroll-Lock Body Overflow Clipping in Print/PDF Mode

## Context

After FIX_PRINT_TICKET_VISIBILITY restored `visibility: visible` to the `.print-ticket` portal, the ticket still rendered as a blank page when printing to PDF.

The `Modal` component in `src/components/ui/Modal.tsx` sets an inline style on `document.body` when the modal is open:

```javascript
document.body.style.overflow = 'hidden'
```

This is the standard browser scroll-lock technique. In normal screen rendering this is correct and intentional — it prevents the page from scrolling behind the modal.

**The problem in print/PDF mode:** the browser's PDF engine respects CSS `overflow` on the `body` element. The PDF renderer treats `overflow: hidden` on body as a clipping constraint, analogous to a bounded viewport. `index.css` sets `body { min-height: 100vh }`, which in print mode resolves to approximately one page height. With `overflow: hidden` active and `min-height: 100vh` establishing a height boundary, body acts as a fixed-height clipping container.

The `.print-ticket` portal div is appended at the end of `document.body` via `ReactDOM.createPortal`. The siblings before it in the DOM (the `#root` div and the modal overlay div) are set to `display: none !important` by the print CSS rule `body > *:not(.print-ticket)`. With those siblings hidden, `.print-ticket` flows to the start of body's content — but because the PDF engine clips body at `overflow: hidden`, the content region is evaluated differently than in screen rendering, resulting in the ticket being invisible in the PDF output.

## Decision

Override both constraints in `@media print` inside `src/styles/print.css`:

```css
@media print {
  html, body {
    height: auto !important;
    overflow: visible !important;
  }
  /* … rest of print rules */
}
```

**Why `!important` works against an inline style:** CSS specificity rules treat `!important` declarations in stylesheets as overriding inline styles that lack `!important`. The Modal sets `document.body.style.overflow = 'hidden'` without `!important`, so a stylesheet rule with `!important` wins.

**Why `height: auto`:** `min-height: 100vh` in `index.css` applies in all media contexts unless overridden. In print mode, resetting to `height: auto` allows body to size to its content (just the `.print-ticket` div) rather than locking to one page height.

This fix does not change the screen behaviour of the Modal scroll-lock — `@media print` rules have no effect outside print mode.

## Alternatives Considered

**`position: fixed; top: 0; left: 0;` on `.print-ticket`** — same pattern as `.qr-label`. Would also work (fixed positioning bypasses the body clip), but introduces a font/layout change risk and deviates from the expected static-flow print layout. The overflow reset is more surgical.

**Removing the scroll-lock from Modal** — not acceptable; scroll bleed-through behind modals is a regression for all screen UX paths.

## Consequences

- PDF and physical print both correctly capture the full ticket content regardless of whether the Modal is still open (e.g., the IssueLoanModal "Done + Print" step).
- Zero impact on screen rendering — `@media print` rules do not apply.
- No new Firestore fields, no Cloud Function changes, no schema changes.

---

*The Pawn Shop · docs/decisions/0024-modal-body-overflow-print-clipping.md · 2026-06-10*
