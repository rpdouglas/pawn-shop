# Decision 0022 — Walk-in Pawn `source` Field and Direct Loan Issuance

**Date:** 2026-06-10  
**Epic:** E109 — Walk-in Pawn Intake  
**Status:** Accepted

## Context

The loan issuance flow (`PawnInbox` → `IssueLoanModal`) required an existing `pawnRequest`
document in `quoted` status, which was only created by the public online enquiry form.
Staff had no way to initiate a pawn loan for a walk-in customer who never used the website.

## Decision

1. **Add `source: 'online' | 'walk_in'` to `pawnRequests/{id}`.**  
   Existing records without this field are treated as `'online'` (backward-compatible).

2. **New `createWalkInPawnRequest` CF (staff-only)** creates a `pawnRequest` with
   `status: 'quoted'` and `source: 'walk_in'`. The serial blacklist check runs identically
   to the online path. Email is optional for walk-in customers.

3. **`PawnInbox` gets a "New Walk-in Pawn" button** that opens `WalkInPawnModal`,
   then on success immediately opens `IssueLoanModal` with the returned `pawnRequestId`.
   The full E107 sign + print flow is reused unchanged.

## Alternatives Considered

- Making `pawnRequestId` optional on `loanTickets` (Strategy B) — rejected because it
  removes the serial blacklist check for walk-ins, which is a compliance gap.
- Unified multi-step modal (Strategy C) — rejected as over-engineered for this scope;
  duplicates existing modal logic.

## Consequences

- A walk-in `pawnRequest` will appear in `PawnInbox` with a "Walk-in" source badge.
  Staff can distinguish online enquiries from counter intake at a glance.
- `auditLogs` event type `walk_in_pawn_created` added.
- `email` field on `pawnRequests` is now optional for walk-in records.
