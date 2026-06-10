# E110 — Pawn Compliance: Intake Forms & Printed Ticket

**Status:** ✅ CLOSED — 2026-06-10
**Priority:** HIGH — Legal / Compliance
**Effort:** Medium (~10 files, Strategy B)
**Cycle:** 33

---

## Problem

A full code and legal review (`docs/reports/pawn_ticket_gaps.md`) identified ten compliance gaps in the current pawn loan flow:

### Critical — Legal / Federal Law
- **GAP-003 APR:** Ticket shows per-period flat rate only. Criminal Interest Rate Regulations (SOR/2024-114) require APR disclosure. Missing APR disclosure may void the 48% pawn exemption, making the rate a criminal offence under s.347 Criminal Code.
- **GAP-001 Item Description:** Ticket item field shows only customer name (test data) or free-text description — no structured category, make/model, serial, or condition.
- **GAP-002 Customer Identity:** Only first name captured. No ID verification record, no address, no DOB.
- **GAP-004 Agreed Item Value:** No appraisal/agreed value on ticket, required by 25 CFR §141.35(e).

### Significant — Operations & Risk
- **GAP-005 Forfeiture Terms:** Language says item "becomes property of The Pawn Shop" with no grace period, customer rights, or surplus provision.
- **GAP-006 Post-Maturity Charges:** No disclosure of what accrues after due date.
- **GAP-007 Extension Terms:** "At staff discretion" with no rate, maximum, or process documented.
- **GAP-008 Police Hold Clause:** No contractual authority to hold items under police investigation.
- **GAP-009 Age/Sobriety Declaration:** No 18+ or ownership attestation above signature.
- **GAP-010 Record Retention:** No copy designation or retention period statement.

### Also identified (code audit)
- CF `createLoanTicket` has `interestRate ?? 0.05` fallback (5%/period ≈ 60% APR — above legal cap)
- Serial number not copied from pawnRequest to loanTicket, so ticket reprints cannot show it
- Staff issuer name not recorded on loanTicket
- No ID verification step in issuance flow

---

## Personas

- **Staff / POS Operator (Primary):** Complete compliant pawn intake form; issue legally sound loan tickets; know they are protected by proper documentation.
- **Makoonsii (Secondary):** Receives a complete, readable ticket that is a valid legal document — shows what item was left, what the total cost is, and how to get it back. Plain language terms.

---

## Scope (Strategy B — Recommended)

See `docs/plans/E110_PAWN_COMPLIANCE_INTAKE_TICKET_PLAN.md` for full three-strategy comparison.

### Files to Create / Modify

| File | Change |
|------|--------|
| `src/lib/types.ts` | Add fields to `PrintTicketData`, `LoanTicket`, `PawnRequest` |
| `src/components/admin/PrintableTicket.tsx` | APR row, agreed value row, structured item details, improved terms, staff issuer |
| `src/components/admin/IssueLoanModal.tsx` | Agreed value input, idType dropdown, idVerified + item-received checkboxes, pass staffName |
| `src/components/admin/WalkInPawnModal.tsx` | Category, make/model, colour, condition, notableMarkings, requestedAmount fields |
| `src/components/pawn/PawnEnquiryForm.tsx` | Category, condition, notableMarkings, requestedAmount fields |
| `src/components/admin/PawnInbox.tsx` | Pass serialNumber through to IssueLoanModal and PrintTicketData |
| `src/pages/admin/LoanTicketsAdminPage.tsx` | Pass serialNumber / staffName for reprint path |
| `functions/core/src/loanTickets.ts` | Copy serialNumber, persist issuedByDisplayName, accept agreedItemValue, remove ?? 0.05 |
| `functions/core/src/pawnIntake.ts` | Accept new intake fields (Strategy B) |
| `functions/core/src/pawnRequests.ts` | Accept new intake fields (Strategy B) |

### Schema Changes

→ `docs/decisions/0025-pawn-compliance-schema-additions.md`

New fields on `pawnRequests`: `itemCategory`, `itemMake`, `itemModel`, `itemColour`, `condition`, `notableMarkings`, `requestedAmount`, `idType`, `idVerified`

New fields on `loanTickets`: `serialNumber`, `issuedByDisplayName`, `agreedItemValue`

---

## Policy Decisions Required Before E111 (Not E110)

These gaps from the report require a business decision before code can be written. E110 adds conservative placeholder text to the ticket terms (legal review recommended) while leaving them configurable for the follow-on epic:

| Gap | Decision Needed |
|-----|----------------|
| GAP-005 forfeiture | Grace period duration (days) |
| GAP-006 post-maturity | Charge policy: none / daily rate / flat fee |
| GAP-007 extensions | Extension fee rate; maximum extensions allowed |
| GAP-002 full ID | Digital vs paper-ledger for DOB/address/ID number |

---

## Compliance Notes

- **APR cap (Akwesasne Ontario side):** 48% APR for loans < $1,000 CAD; 35% APR for loans ≥ $1,000 CAD. Per-period max = `APR_cap × (periodDays / 365)`. Already enforced in `IssueLoanModal` via `calcMaxRatePct`. APR must now also appear on the printed ticket.
- **"Sole recourse" language:** Under SOR/2024-114 the 48% pawn exemption requires the agreement to state that the lender's only recourse on default is seizure of the pledged item. This text must be added to the ticket terms block.
- **No PII in `auditLogs`:** `idType` and `idVerified` may appear in audit log `details` maps; `idNumber` (not stored digitally) must never appear there.

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — 0 errors, 0 warnings |
| `npm run lint` | ✅ PASS — 0 errors, 0 warnings |
| `npm run test` | ✅ PASS — 29/29 tests |
| `npx tsc -b` (functions) | ✅ PASS — 0 errors |
| Schema guardrail | ✅ `docs/firestore-schema.md` updated before coding |
| No hardcoded hex | ✅ Print-only CSS uses literal values with `var()` fallback as per existing pattern |
| No PII in auditLogs | ✅ `idVerified` (boolean) logged; `idType` not in audit log; `idNumber` not stored |
| APR disclosure | ✅ Computed and displayed on ticket per SOR/2024-114 |
| Sole-recourse language | ✅ Added to terms block |
| No `any` types | ✅ All types explicit |
| Prices in CAD cents | ✅ All amounts in cents throughout |

---

*The Pawn Shop · docs/projects/E110_PAWN_COMPLIANCE_INTAKE_TICKET.md · Cornwall Island, Akwesasne*
