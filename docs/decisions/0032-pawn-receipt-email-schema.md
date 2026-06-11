# Decision 0032 — Pawn Receipt Email: Schema Fields

**Date:** 2026-06-11
**Epic:** E114
**Status:** ACCEPTED

## Decision

Add two fields to `loanTickets/{id}`:

| Field | Type | Purpose |
|-------|------|---------|
| `receiptEmailSentAt` | timestamp | Idempotency guard — prevents duplicate sends on CF retry |
| `receiptEmailAddress` | string | Snapshot of the email used at send time — decoupled from `users/{uid}.email` which may change |

## Why

- `receiptEmailSentAt` mirrors the pattern used by `forfeitAlertSentAt` in the same collection — consistent with existing idempotency guards.
- `receiptEmailAddress` is captured at send time so the reprint path can surface what address was used, without making a second `users/{uid}` read. It is intentionally excluded from `auditLogs` (PII rule — no email addresses in audit events).

## Alternatives Considered

Store the email address only in `pawnRequests/{id}.email`. Rejected: walk-in requests may have no email; online requests use `users/{uid}.email` which is not copied to `pawnRequests`; neither source is reliable at reprint time.

---

*The Pawn Shop · docs/decisions/0032-pawn-receipt-email-schema.md · 2026-06-11*
