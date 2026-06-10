# Decision 0014 — E106 Pawn Loan Lifecycle Gap Remediation: Strategy B

**Date:** 2026-06-09
**Epic:** E106 · Pawn Loan Lifecycle Gap Remediation
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

A lifecycle audit of the E31 pawn loan system on 2026-06-09 identified six gaps between
the spec, Firestore schema, and deployed code. E31 explicitly required all loan status
changes to go through Cloud Functions (Admin SDK) with full `auditLogs` coverage. Three
strategies were evaluated:

- **A:** Minimal patch — fix only the two compliance blockers (gaps 1 & 2); defer gaps 3–6
- **B:** Full remediation — address all six gaps in a single cycle; no new schema fields required
- **C:** Refactor + remediate — same as B but restructure `loanTickets.ts` into a state-machine module

---

## Decision

**Strategy B: Full six-gap remediation without architectural refactor.**

---

## Rationale

1. **All six gaps resolvable with zero new Firestore fields.** Schema sync was purely
   additive to `auditLogs.eventType` values in `docs/firestore-schema.md`; no collection
   or document-level changes were needed.

2. **CF-first pattern preserved.** `updatePawnRequestStatus` is a new callable CF (staff
   only) that routes all `pawnRequests` status writes through Admin SDK, eliminating the
   direct `updateDoc` from `PawnInbox.tsx`. Consistent with E31 and E07 compliance
   requirements.

3. **Duplicate-issuance guard at the CF level.** `createLoanTicket` now reads the
   `pawnRequest` document server-side to derive `uid` and `itemDescription`, and checks
   for an existing `pawnLoanId` before writing. Client cannot pass stale state.

4. **Auto-forfeit item-transition parity.** `checkLoanDueDates` scheduler now mirrors
   the manual `forfeitLoan` CF: when a loan forfeits automatically, its linked item is
   transitioned to `status: 'active'`. Closes the operational gap where auto-forfeited
   items remained in limbo.

5. **Strategy C rejected** — state-machine refactor adds scope with no immediate
   compliance or UX benefit. E31 is already delivering; a structural refactor belongs in
   a dedicated tech-debt cycle, not a gap-remediation epic.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|-----------------|
| Strategy A (minimal patch) | Leaves gaps 3–5 open; schema drift and scheduler gap persist; technical debt with compliance risk |
| Strategy C (state-machine refactor) | Correct long-term architecture but scope exceeds a single cycle. Deferred to E31-v2 / Phase 12 hardening |

---

## Architectural Choices Made

| Choice | Details |
|--------|---------|
| `updatePawnRequestStatus` CF | New callable; admin/manager/inventory_staff only; writes `pawn_request_status_updated` auditLog |
| `createLoanTicket` server-side derivation | CF now looks up `pawnRequest` to get `uid`/`itemDescription`; client sends only `pawnRequestId`, `loanAmount`, `periodDays`, `interestRate?`, `itemId?` |
| `redemptionAmount` on redeem CF | Optional CAD-cents field persisted to `loanTickets/{id}`; overwritten by Stripe payment intent in E79 |
| Item transition in scheduler | `checkLoanDueDates` now calls `items/{id}.update({ status: 'active', policeHold: false })` after auto-forfeit, mirroring manual `forfeitLoan` CF |
| Extension decline documented | Gap 6: `active` is the correct post-decline state; `extension_declined` auditLog captures the event; no additional status value needed |

---

## Compliance Notes

- All `pawnRequests` writes now via CF Admin SDK (E31 compliance restored)
- Seven new `auditLogs.eventType` values documented in `docs/firestore-schema.md`
- No PII in `auditLogs.details` maps — only IDs and amounts
- `IssueLoanModal` inputs meet 48px touch target requirement (Makoonsii)
- `IssueLoanModal` uses `httpsCallable`; no AI keys or Firestore tokens on client

---

## Files Introduced

- `src/components/admin/IssueLoanModal.tsx`

## Files Modified

- `functions/core/src/loanTickets.ts` — `createLoanTicket`, `redeemLoanTicket`, `checkLoanDueDates`
- `functions/core/src/pawnRequests.ts` — added `updatePawnRequestStatus` CF
- `src/components/admin/PawnInbox.tsx` — routed status saves through CF; added Issue Loan button
- `src/pages/admin/LoanTicketsAdminPage.tsx` — passes `redemptionAmount` on redeem
- `src/lib/useLoanTickets.ts` — updated `useIssueLoanTicket` and `useRedeemLoan` signatures
- `src/lib/types.ts` — added `pawnLoanId?: string` to `PawnRequest` interface
- `docs/firestore-schema.md` — added 7 `auditLogs.eventType` values

---

*The Pawn Shop · docs/decisions/0014-pawn-loan-lifecycle-gap-remediation.md · 2026-06-09*
