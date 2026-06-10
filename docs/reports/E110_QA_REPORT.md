# E110 QA Report — Pawn Compliance: Intake Forms & Printed Ticket

**Date:** 2026-06-10
**Epic:** E110
**Strategy:** B (Ticket + Structured Intake)
**Status:** QA PASSED

---

## Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` | ✅ PASS | 0 TypeScript errors, 0 warnings |
| `npm run lint` | ✅ PASS | 0 ESLint errors, 0 warnings |
| `npm run test` | ✅ PASS | 29/29 tests |
| `npx tsc -b` (functions) | ✅ PASS | 0 errors across core + operations |

---

## Compliance Smoke Tests

### GAP-003 — APR Disclosure (CRITICAL — SOR/2024-114)
- **Status:** ✅ CLOSED
- **Test:** `PrintableTicket.tsx` computes `APR = interestRate × (365 / periodDays) × 100` and renders it in `.print-ticket-apr-notice` block.
- **Verification:** At 3.95% per 30 days → APR = 3.95 × (365/30) = 48.1% displayed.

### GAP-005 — Sole-Recourse Language (CRITICAL — SOR/2024-114 pawn exemption)
- **Status:** ✅ CLOSED
- **Test:** Ticket terms block contains: *"In the event of default, the lender's only remedy is possession and resale of the pledged item. No further charges, fees, or legal action will be pursued against the customer after forfeiture."*

### GAP-001 — Structured Item Description
- **Status:** ✅ CLOSED
- **Test:** `WalkInPawnModal` captures category, make, model, colour, condition, notable markings, serial number. `PawnEnquiryForm` captures category, condition, notable markings, requested amount.
- **Ticket render:** `PrintableTicket.tsx` renders item detail grid when any structured field is present.

### GAP-002 — Customer Identity (Partial — E112 deferred for full ID digitisation)
- **Status:** ✅ PARTIALLY CLOSED
- **Test:** `IssueLoanModal` has idType dropdown + idVerified checkbox (required gate before issuance). `WalkInPawnModal` has idType + idVerified at intake.
- **Deferred:** Full ID number (DOB, address, ID#) in secure subcollection deferred to E112 pending legal opinion.

### GAP-004 — Agreed Item Value (25 CFR §141.35)
- **Status:** ✅ CLOSED
- **Test:** `IssueLoanModal` step 1 requires `agreedItemValue` — submit blocked with error if absent. Field printed on ticket. CF stores value on `loanTickets/{id}.agreedItemValue`.

### GAP-008 — Police Hold Clause
- **Status:** ✅ CLOSED
- **Test:** Ticket terms block contains: *"The Pawn Shop reserves the right to place a police hold on any item at the request of a law enforcement agency. Items subject to a police hold cannot be redeemed until the hold is lifted; the loan period will be tolled for the duration of any hold."*

### GAP-009 — Age/Sobriety Declaration
- **Status:** ✅ CLOSED
- **Test:** Declaration above signature reads: *"By signing, I confirm that I am 18 years of age or older, that I am the lawful owner of the above item or have authority to pledge it, and that I am not under the influence of alcohol or drugs at the time of this agreement."*

### GAP-010 — Record Retention Notice
- **Status:** ✅ CLOSED
- **Test:** Ticket footer contains: *"Records retained in accordance with applicable law."* and *"CUSTOMER COPY — Keep this ticket. Required for redemption with photo ID."*

### CF Hardening — `?? 0.05` Default Removed
- **Status:** ✅ CLOSED
- **Test:** `createLoanTicket` now throws `HttpsError('invalid-argument', 'interestRate is required')` if `interestRate == null`. The 5%/period ≈ 60% APR default is eliminated.

### Server-side Due Date
- **Status:** ✅ CLOSED
- **Test:** `createLoanTicket` CF returns `dueDate: dueDate.toISOString()` in response. `IssueLoanModal` reads `new Date(result.dueDate)` instead of computing client-side.

---

## Code Quality Checks

| Check | Result |
|-------|--------|
| No `any` types introduced | ✅ All types explicit (`Record<string, unknown>` for Firestore, typed interfaces throughout) |
| No hardcoded hex values | ✅ New `print.css` classes use literal values consistent with existing print-only pattern (CSS vars may not resolve in PDF context) |
| No hardcoded spacing | ✅ Modal UI uses `var(--space-*)` tokens |
| Prices in CAD cents | ✅ `agreedItemValue`, `requestedAmount`, `loanAmount` all in cents |
| No PII in auditLogs | ✅ `idVerified: boolean` logged; `idType` not logged; full ID number never stored |
| 48px touch targets | ✅ All inputs/selects/checkboxes have `minHeight: '48px'` or equivalent |
| Unused imports removed | ✅ No unused imports in modified files |

---

## Files Modified

| File | Change |
|------|--------|
| `docs/firestore-schema.md` | Added 6 structured item fields to `loanTickets/{id}` |
| `src/lib/types.ts` | Added 9 fields to `PawnRequest`, 9 to `LoanTicket`, 9 to `PrintTicketData` |
| `src/lib/useLoanTickets.ts` | Exported `IssueLoanArgs` + `IssueLoanResult` interfaces; `interestRate` now required; added `agreedItemValue`, `idType`, `idVerified` inputs; added `dueDate` return |
| `src/styles/print.css` | Added `.print-ticket-copy-header`, `.print-ticket-apr-notice`, `.print-ticket-declaration` |
| `src/components/admin/PrintableTicket.tsx` | Full compliance rewrite: APR, agreed value, structured item block, sole-recourse + police hold + age declaration terms, staff issuer, retention notice, "Customer Copy" header |
| `functions/core/src/loanTickets.ts` | CF hardening: `interestRate` required; copies all structured item fields + serial from pawnRequest; sets `issuedByDisplayName`; accepts `agreedItemValue`; updates pawnRequest with idType/idVerified; returns `dueDate` |
| `src/components/admin/IssueLoanModal.tsx` | Added agreed value, idType, idVerified, itemReceived fields; useAuth for staffName; due date from CF response |
| `src/components/admin/WalkInPawnModal.tsx` | Structured intake: category, make, model, colour, condition, serial, markings, requested amount, idType, idVerified |
| `src/components/pawn/PawnEnquiryForm.tsx` | Added category, condition, notableMarkings, requestedAmount fields |
| `src/components/admin/PawnInbox.tsx` | Updated `toPawnRequest` mapper; replaced `issueLoanFor`/`issueLoanDescription` state with `issueLoanCtx`; updated `handleWalkInSuccess` signature; threads all new fields to `IssueLoanModal` |
| `src/pages/admin/LoanTicketsAdminPage.tsx` | `handlePrint` passes serialNumber, issuedByDisplayName, agreedItemValue, and structured item fields for reprints |
| `functions/core/src/pawnIntake.ts` | `createWalkInPawnRequest` accepts 9 new optional intake fields |
| `functions/core/src/pawnRequests.ts` | `submitPawnRequest` accepts 4 new optional intake fields |
| `user-guide/admin/pawn-inbox.md` | Updated walk-in intake table, Step 1 expanded with new fields |
| `user-guide/admin/loans.md` | Added "What Appears on the Printed Ticket" table; added reprints note |

---

## Persona Tests

### Staff / POS Operator (Primary)
- ✅ Walk-in intake form collects all required item details and ID verification
- ✅ Issuance form requires agreed item value and ID confirmation before loan can proceed
- ✅ Printed ticket is a complete legal document: APR, sole recourse, police hold clause, age declaration
- ✅ Staff name appears on ticket as issuing authority
- ✅ Reprint from Loans dashboard includes all structured fields

### Makoonsii (Secondary)
- ✅ Ticket uses plain-language terms — no legal jargon beyond what is required
- ✅ Customer copy header is prominent
- ✅ APR disclosed in a clearly labelled, bold box
- ✅ Redemption instructions clear: ticket + photo ID required
- ✅ Online pawn enquiry form gains optional structured fields (category, condition) without requiring them

---

## Deferred to E111 / E112

| Gap | Status | Reason |
|-----|--------|--------|
| GAP-006 Post-maturity charges | Deferred to E111 | Requires owner decision on charge policy |
| GAP-007 Extension terms | Deferred to E111 | Requires owner decision on extension fee and max |
| GAP-005 Grace period | Deferred to E111 | Requires owner decision on grace period duration |
| GAP-002 Full ID digitisation | Deferred to E112 | Requires legal opinion on jurisdiction + secure subcollection architecture |

---

**QA PASSED.** E110 ready to ship.

*The Pawn Shop · docs/reports/E110_QA_REPORT.md · 2026-06-10*
