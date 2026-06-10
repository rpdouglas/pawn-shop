# E106 — Pawn Loan Lifecycle Gap Remediation
**Status:** ✅ CLOSED — 2026-06-09
**Priority:** HIGH
**Effort:** Medium (8 files modified, 1 file created)
**Cycle:** 32

---

## Problem

A lifecycle audit of the pawn loan system (2026-06-09) identified six gaps between the
E31 spec requirements, the Firestore schema, and the current implementation:

| # | Gap | Severity | Source |
|---|-----|----------|--------|
| 1 | No admin UI to issue a loan from a pawn request (`useIssueLoanTicket` unused) | **High** | `src/lib/useLoanTickets.ts:81` |
| 2 | PawnRequest status changes are unaudited (direct `updateDoc`, no CF, no auditLog) | **Medium** | `src/components/admin/PawnInbox.tsx:107` |
| 3 | Six loan `auditLogs.eventType` values are not listed in `firestore-schema.md` | **Medium** | Schema vs. `functions/core/src/loanTickets.ts` |
| 4 | `redemptionAmount` field never written on loan redemption | **Low** | `redeemLoanTicket` CF |
| 5 | Auto-forfeit scheduler (`checkLoanDueDates`) does not transition linked item to `active` | **Medium** | `functions/core/src/loanTickets.ts:270` |
| 6 | Extension decline has no distinct status record — silently returns to `active` | **Low** | `processExtension` CF |

E31 explicitly required: "Audit log entry required on every loan status change. All status
changes via Cloud Function Admin SDK — no client writes to `loanTickets`." Gaps 1 and 2
violate the E31 compliance requirement directly.

## Personas Served

- **Makoonsii** `[Mak]` — Touch targets ≥48px, plain language on any new loan issuance UI.
- **Staff** `[Staff]` — Gap 1 is the primary staff blocker: there is no way to create a loan ticket from the admin UI.
- **Compliance** `[Comp]` — Gaps 2 and 3 are compliance violations against E31's audit trail requirement.

## Files Changed

| File | Change |
|------|--------|
| `functions/core/src/loanTickets.ts` | Updated `createLoanTicket` (server-side derivation + duplicate guard), `redeemLoanTicket` (persists `redemptionAmount`), `checkLoanDueDates` (item transition on auto-forfeit) |
| `functions/core/src/pawnRequests.ts` | Added `updatePawnRequestStatus` callable CF |
| `src/components/admin/PawnInbox.tsx` | Routed status saves through CF; added "Issue Loan" button + `IssueLoanModal` integration |
| `src/components/admin/IssueLoanModal.tsx` | **Created** — modal for issuing loans from pawn requests |
| `src/pages/admin/LoanTicketsAdminPage.tsx` | Passes computed `redemptionAmount` on redeem |
| `src/lib/useLoanTickets.ts` | Updated `useIssueLoanTicket` and `useRedeemLoan` signatures |
| `src/lib/types.ts` | Added `pawnLoanId?: string` to `PawnRequest` interface |
| `docs/firestore-schema.md` | Added 7 `auditLogs.eventType` values |

## Docs Updated

| Document | Change |
|----------|--------|
| `docs/firestore-schema.md` | 7 `auditLogs.eventType` values added |
| `docs/decisions/0014-pawn-loan-lifecycle-gap-remediation.md` | Created |
| `docs/reports/E106_QA_REPORT.md` | Created |
| `user-guide/admin/pawn-inbox.md` | Updated with Issue Loan workflow |
| `user-guide/admin/loans.md` | Corrected loan issuance flow |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — built in 1.77s |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` | ✅ PASS — zero errors, zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests |
| Compliance audit | ✅ PASS — all E31 requirements met |
| Schema sync | ✅ PASS — all fields and event types documented |

---

*The Pawn Shop · docs/projects/E106_PAWN_LOAN_LIFECYCLE_GAPS.md · 2026-06-09*
