# Decision 0034 — E115: APR Override Warning (Soft Cap with Audit Trail)

**Date:** 2026-06-11
**Epic:** E115
**Status:** Accepted

## Decision

Replace the hard-block on over-cap interest rates in `IssueLoanModal` with a soft-warning path:
- A yellow warning banner appears inline when the entered rate exceeds the applicable APR cap.
- A mandatory confirmation checkbox must be checked before submission proceeds.
- The `createLoanTicket` Cloud Function gains server-side APR cap enforcement: over-cap rates are rejected unless `aprOverrideConfirmed: true` is included in the request.
- When an override is confirmed, `aprOverrideConfirmed: true` is written to `loanTickets/{id}` and a `loan_rate_override` audit log event is created (no PII; rate details only).

## Schema Changes

- `loanTickets/{id}.aprOverrideConfirmed` — new optional boolean field.
- `auditLogs/{id}.eventType` — `loan_rate_override` added to the enumerated values list.

## Rationale

The previous hard-block prevented any intentional over-cap loan issuance, which may be required for manager-approved exceptions. The soft-warning path preserves staff autonomy while introducing a stronger compliance signal: (1) the employee cannot proceed without an explicit acknowledgement, (2) the override is recorded immutably in `auditLogs`, and (3) server-side enforcement closes the pre-existing bypass gap where a custom client could silently issue any rate.

## APR Cap Constants (mirrored in CF and UI)

| Loan amount | APR cap | Per-period max formula |
|---|---|---|
| < $1,000 CAD | 48% | `0.48 × (periodDays / 365)` |
| ≥ $1,000 CAD | 35% | `0.35 × (periodDays / 365)` |
| Threshold | 100,000 cents | $1,000.00 |
