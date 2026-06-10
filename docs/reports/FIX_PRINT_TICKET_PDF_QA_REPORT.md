# QA Report — FIX_PRINT_TICKET_PDF · Printed Pawn Ticket PDF Renders Blank
**Date:** 2026-06-10 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — zero TypeScript errors |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |

---

## Part 2 — Root Cause

`Modal.tsx` sets `document.body.style.overflow = 'hidden'` as an **inline style** when open (standard scroll-lock technique). In the browser's PDF print engine, `overflow: hidden` on `body` acts as a clipping constraint. Combined with `body { min-height: 100vh }` from `index.css`, this constrained the body viewport so the `.print-ticket` portal — though visible and in the DOM — was clipped and never captured in the PDF output.

**Fix** (`src/styles/print.css` — top of `@media print` block):

```css
html, body {
  height: auto !important;
  overflow: visible !important;
}
```

`!important` in a stylesheet overrides an inline style that lacks `!important`. This un-clips body before the PDF engine captures the page and removes the `min-height: 100vh` height boundary that would otherwise interact with the overflow constraint.

---

## Part 3 — Persona Smoke Tests

### Staff / POS Operator (Primary)

- [x] Full loan issuance flow: walk-in pawn → Issue Loan → sign → Submit Signature → Print Ticket
- [x] Browser print dialog opens → print to PDF via "Save as PDF" → PDF renders full ticket content
- [x] Ticket content in PDF: shop name, address, divider, title, ticket number, date
- [x] Item description renders in PDF
- [x] Terms grid renders in PDF: Loan Amount, Interest Rate, Term, Due Date, Redemption Amount
- [x] Agreement text renders in PDF (3 paragraphs)
- [x] Customer signature image renders in PDF
- [x] Customer name renders beneath signature in PDF
- [x] Footer renders in PDF: "Authorized by The Pawn Shop" + "Keep this ticket"
- [x] Reprint from Loans dashboard also renders full PDF

### Makoonsii (Secondary)

- [x] Printed PDF includes all required fields: item description, loan amount, due date, ticket number, customer name, signature — complete and legally valid receipt

---

## Part 4 — Regression Check

- [x] QR label printing unaffected — `overflow: visible !important` on body does not conflict with `.qr-label { position: fixed; top: 0; left: 0 }` pattern; fixed positioning ignores body overflow anyway
- [x] Modal screen behaviour unaffected — `@media print` rules have no effect on screen rendering; scroll-lock still works normally
- [x] FIX_PRINT_TICKET_VISIBILITY rules intact — `.print-ticket, .print-ticket * { visibility: visible; }` still present and effective
- [x] All 29 frontend tests pass — zero regressions

---

## Part 5 — Design System / Compliance

| Item | Status |
|------|--------|
| No new Firestore fields | ✅ N/A |
| No hardcoded hex in new CSS | ✅ N/A — rule has no colour values |
| No PII changes | ✅ N/A |
| Age gates not touched | ✅ N/A |
| No AI API calls | ✅ N/A |

---

## Sign-Off

**QA PASSED.** Fix: FIX_PRINT_TICKET_PDF — Printed Pawn Ticket PDF Renders Blank. File changed: `src/styles/print.css` (3 lines added). Decision 0024 logged. Build: clean. All gates: pass. Zero regressions.

Ready for PR.

---

*The Pawn Shop · docs/reports/FIX_PRINT_TICKET_PDF_QA_REPORT.md · 2026-06-10*
