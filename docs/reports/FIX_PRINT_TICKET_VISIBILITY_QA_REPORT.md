# QA Report — FIX_PRINT_TICKET_VISIBILITY · Printed Pawn Ticket Content Invisible
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

`index.css` contains an `@media print` block written for the QR label print flow:

```css
@media print {
  body * { visibility: hidden; }
  .qr-label, .qr-label * { visibility: visible; }
}
```

`print.css` (written for the pawn ticket) hides non-ticket DOM via `display: none !important` and makes `.print-ticket { display: block !important }`, but never restores `visibility: visible`. The ticket was laid out (occupying space) but fully invisible to the browser print engine. The browser's native URL header and page-number footer — rendered by the browser itself outside CSS control — were the only visible output.

**Fix** (`src/styles/print.css`):

```css
.print-ticket,
.print-ticket * { visibility: visible; }
```

Added at the top of the `@media print` block, before other ticket rules. Class selector specificity (0,0,1,0 and 0,0,1,1) beats `body *` (0,0,0,2), ensuring the ticket and all its children are explicitly visible.

---

## Part 3 — Persona Smoke Tests

### Staff / POS Operator (Primary)

- [x] Complete loan issuance flow (amount → term → rate → Issue Loan → sign → Submit Signature → Print Ticket)
- [x] Browser print dialog opens → ticket fully rendered: shop name, address, divider, title, ticket number, date
- [x] Item description section renders
- [x] Terms grid renders: Loan Amount, Interest Rate, Term, Due Date, Redemption Amount
- [x] Agreement text renders (3 paragraphs)
- [x] Customer signature image renders
- [x] Customer name renders beneath signature
- [x] Footer renders: "Authorized by The Pawn Shop" + "Keep this ticket"
- [x] Reprint from Loans dashboard: same full render

### Makoonsii (Secondary)

- [x] Printed ticket includes all required fields: item description, loan amount, due date, ticket number, customer name, signature — complete legal receipt

---

## Part 4 — Regression Check

- [x] QR label printing unaffected — `body * { visibility: hidden }` + `.qr-label, .qr-label * { visibility: visible }` still works; new rule targets `.print-ticket` (different class, no conflict)
- [x] Screen display unaffected — `@media screen { .print-ticket { display: none !important } }` still hides ticket during normal use
- [x] All 29 frontend tests pass — zero regressions

---

## Part 5 — Design System / Compliance

| Item | Status |
|------|--------|
| No new Firestore fields | ✅ N/A |
| No hardcoded hex in new CSS | ✅ N/A — visibility rule has no colour values |
| No PII changes | ✅ N/A |
| Age gates not touched | ✅ N/A |
| No AI API calls | ✅ N/A |

---

## Sign-Off

**QA PASSED.** Fix: FIX_PRINT_TICKET_VISIBILITY — Printed Pawn Ticket Content Invisible. File changed: `src/styles/print.css` (1 rule added). Build: clean. All gates: pass. Zero regressions.

Ready for PR.

---

*The Pawn Shop · docs/reports/FIX_PRINT_TICKET_VISIBILITY_QA_REPORT.md · 2026-06-10*
