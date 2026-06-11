# Decision 0033 — E114 Pawn Receipt Email: Best-Effort CF Integration Pattern

**Date:** 2026-06-11
**Epic:** E114
**Cycle:** 34
**Status:** Implemented & Closed

---

## Context

E114 extends `signPawnAgreement` to dispatch an HTML receipt email after a pawn loan is signed. Three integration approaches were available:

- **Inline, blocking:** email dispatch awaited and any failure re-thrown — signs *and* sends or throws
- **Best-effort, inline:** email block wrapped in try/catch — loan signing always succeeds; email failure is caught and logged
- **Separate callable CF:** new `emailLoanReceipt` callable that staff trigger manually after signing (Strategy B from the plan)

---

## Decision

**Best-effort try/catch inside `signPawnAgreement`.** Email dispatch is attempted after the signing Firestore update and auditLog write. Any exception from the email path is caught and logged via `console.error` — it is never re-thrown. The function always returns `{ signatureUrl }` regardless of email outcome.

**Email address resolution chain:**

1. If `loanTickets.uid` is a non-empty string → read `users/{uid}.email`
2. Else → read `pawnRequests/{pawnRequestId}.email`
3. If neither resolves → skip silently (no email sent, no error)

---

## Rationale

1. **Staff trust.** A signed loan agreement is the primary transaction. Email delivery failure (no address on file, SendGrid down, misconfigured DNS) must never cause the signing CF to return an error to the client. The paper ticket is always printed; the email is a convenience layer.

2. **Idempotency guard.** `receiptEmailSentAt` field acts as a guard — the email block is skipped if it's already set. This protects against re-runs in future Strategy B (staff-triggered resend) without additional logic.

3. **Resolution chain mirrors existing pattern.** `pawnRequests/{id}.email` is optional (walk-in requests may not have it); `users/{uid}.email` is always present for registered customers. The same two-source fallback is used in `sendLoanReminders` and `sendSeasonalReminders`.

4. **No new secrets.** Existing `SENDGRID_API_KEY` + `SENDGRID_FROM_EMAIL` are surfaced to the CF via the `secrets` array in `onCall` options. The `dispatchEmail` helper already handles `dummy`/missing credentials gracefully in dev.

5. **CASL compliance.** Transactional receipts tied to a signed agreement are exempt from marketing opt-in — no `alertOptIn` check is required. The email footer explicitly states "This is a transactional receipt — not marketing."

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Blocking inline (await + re-throw) | Email failure would roll back the signed state in the client, forcing staff to re-sign. Unacceptable — paper ticket already printed at this point. |
| Separate callable CF (Strategy B) | Adds a mandatory extra step that staff will inconsistently follow in a busy counter environment. Also requires 5× more files changed. |

---

## Compliance Notes

- `receiptEmailAddress` stored only on `loanTickets/{id}` — never in `auditLogs.details` (PII rule).
- `auditLogs` entry `pawn_receipt_emailed` contains `{ loanTicketId, ticketNumber, sent: true }` only.
- `staffNotes` excluded from email content by construction.
- `serialNumber` excluded from email content (item identification data stays at the counter).
- HTML email uses inline CSS with hardcoded brand values — approved exception per plan anti-regression check (email clients cannot parse external stylesheets or CSS variables).

---

## Files Changed

| File | Change |
|------|--------|
| `functions/core/src/pawnAgreement.ts` | Added `buildReceiptHtml` helper + best-effort email dispatch block |
| `docs/firestore-schema.md` | Added `receiptEmailSentAt` + `receiptEmailAddress` to `loanTickets/{id}` (via Decision 0032, pre-E114) |

---

*The Pawn Shop · docs/decisions/0033-e114-receipt-email-best-effort-cf-pattern.md · 2026-06-11*
