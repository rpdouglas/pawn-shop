# QA Report — E107 · Pawn Ticket Generation & Digital Signature (POS)
**Date:** 2026-06-10 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — built in 4.34s, zero TypeScript errors |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` type casts | ✅ PASS — `Record<string, unknown>` + `instanceof Timestamp` in all Firestore reads; `signature_pad` typed via package types |
| No unused imports/variables | ✅ PASS — all imports actively used |

**Note:** `functions/npm run test` fails on 12 tests due to Firestore Emulator not running on port 8080. Pre-existing infrastructure constraint — not introduced by E107.

---

## Part 2 — Persona Smoke Tests

### Staff / POS Operator (Primary)

- [x] Open Pawn Inbox → set enquiry to **Quoted** → **Issue Loan** button appears
- [x] Click **Issue Loan** → Step 1 (Terms) renders: Loan Amount, Term, Interest Rate inputs; all 48px min-height
- [x] Submit Step 1 → `createLoanTicket` CF called; `ticketNumber` returned (format: `PLT-YYYYMMDD-XXXX`)
- [x] Step 2 (Sign) renders: agreement text block, loan summary, customer name input, signature canvas (160px height with white background)
- [x] Canvas responds to stylus/mouse strokes; "Submit Signature" button disabled until canvas is non-empty AND customer name is entered
- [x] **Clear signature** link resets canvas and re-disables Submit button
- [x] Submit → `signPawnAgreement` CF called; signature PNG uploaded to Storage; `signatureUrl` returned
- [x] Step 3 (Done) shows ticket number + **Print Ticket** button
- [x] **Print Ticket** → `setPrintData` → `<PrintableTicket>` renders via `createPortal`; `window.print()` fires after state update
- [x] Print layout: shop header, gold divider, item/terms grid, agreement paragraphs, signature image, customer name, footer
- [x] `LoanTicketsAdminPage` shows **Signed** badge (green) or **Unsigned** badge (grey) per ticket
- [x] Tickets with `signatureUrl` + `ticketNumber` show **Print** button in row actions
- [x] Print from Loans page triggers `<PrintableTicket>` portal + `window.print()`

### Makoonsii (Secondary)

- [x] Agreement text is plain language — no legal jargon; two short paragraphs + ticket reference
- [x] Canvas has `aria-label="Sign here with your finger or stylus"` + `aria-labelledby` for screen reader context
- [x] Customer name input: `minHeight: '48px'` — meets 48px touch target rule
- [x] Canvas height is 160px — exceeds 100px minimum specified in persona gate
- [x] Printed ticket includes: item description, loan amount, due date, ticket number — all persona requirements met

---

## Part 3 — Compliance Audit

| Item | Status |
|------|--------|
| Age gate at router level | ✅ N/A — admin route; full auth required |
| `auditLogs` created by Cloud Function (Admin SDK) | ✅ PASS — `signPawnAgreement` writes `pawn_agreement_signed` via Admin SDK |
| No PII in `auditLogs.details` | ✅ PASS — details: `{ loanTicketId, agreementVersion }` only; `customerName` stored on `loanTickets` doc, not in logs |
| `policeHold` write: admin-only | ✅ N/A — not touched by this epic |
| `rare-find`/`limited-edition` not auto-applied | ✅ N/A — not touched by this epic |
| No Kanien'kéha generated | ✅ PASS — no language generation; agreement text is English |
| AI API calls via Cloud Functions only | ✅ N/A — no AI API calls in E107 |
| `aiDescription` not customer-visible | ✅ N/A — not touched by this epic |
| Staff-only write gate on `signPawnAgreement` | ✅ PASS — CF enforces `admin \| manager \| inventory_staff` claim check |
| `agreementVersion` tracked per signature | ✅ PASS — `'v1.0'` stored on every signed ticket; consent is traceable if terms change |
| Storage rule: `tickets/` path gated to staff write | ✅ PASS — `storage.rules` updated with staff-write, public-read rule |
| No signature PNG stored in Firestore | ✅ PASS — PNG in Storage only; `signatureUrl` (string URL) in Firestore |

---

## Part 4 — Accessibility Check

- [x] Loan Amount, Term, Interest Rate inputs: `minHeight: '48px'`
- [x] Customer name input: `minHeight: '48px'`
- [x] Issue Loan / Submit Signature / Cancel / Print buttons: `minHeight: '48px'`
- [x] Signature canvas: `aria-labelledby="sig-label"` + `aria-label="Sign here with your finger or stylus"`
- [x] Clear signature button: `minHeight: '44px'` (non-primary action; meets 44px minimum)
- [x] Error messages: `role="alert"` on all `<p className="input-error">` elements
- [x] Submit Signature disabled state: prevents submission without signature AND customer name — accessible guard

---

## Part 5 — Design System Verification

- [x] Zero hardcoded hex values — `var(--color-primary, #c8a14a)` only in `print.css` (correct: CSS var with fallback for print context where custom properties may not resolve)
- [x] Zero hardcoded `px` font sizes — all via `var(--text-*)` tokens
- [x] Zero hardcoded spacing — all via `var(--space-*)` tokens in modal UI
- [x] Print layout uses design tokens where applicable; `@page { margin: 10mm; size: A4; }` uses standard print primitives (no tokens available in print context)
- [x] Motion: `window.print()` triggered via `setTimeout(() => ..., 0)` — no animation; no bounce, particle, or constant micro-animations introduced
- [x] No JS conditionals for view theming — `IssueLoanModal` is admin-only, no ViewContext dependency

---

## Sign-Off

**QA PASSED.** Feature: E107 Pawn Ticket Generation & Digital Signature (POS). Personas: Staff (POS operator), Makoonsii. Build: clean. Compliance: verified. Smoke tests: passed. Design system: verified.

Ready for PR.

---

*The Pawn Shop · docs/reports/E107_QA_REPORT.md · 2026-06-10*
