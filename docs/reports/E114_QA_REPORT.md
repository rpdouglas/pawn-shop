# QA Report — E114 · Pawn Loan Receipt Email

**Date:** 2026-06-11
**Cycle:** 34
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. Built in 3.42s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |

---

## Schema Audit

Two fields pre-registered on `loanTickets/{id}` via Decision 0032 (before plan was written):

| Field | Type | Status |
|-------|------|--------|
| `receiptEmailSentAt` | timestamp | ✅ In schema + used by CF |
| `receiptEmailAddress` | string | ✅ In schema + used by CF |

No other collections changed. `users/{uid}` and `pawnRequests/{id}` are read-only — existing fields `email` used.

**Schema sync: complete.**

---

## Feature Smoke Tests

### Receipt Triggers on Sign

| Test | Result |
|------|--------|
| Email dispatch block executes after `signedAt` update + auditLog write | ✅ |
| Email not dispatched if `receiptEmailSentAt` already set (idempotency) | ✅ |
| Function returns `{ signatureUrl }` even when email block executes | ✅ |

### Email Address Resolution

| Test | Result |
|------|--------|
| Registered customer (has `uid`): email read from `users/{uid}.email` | ✅ |
| Walk-in (no `uid`): email read from `pawnRequests/{pawnRequestId}.email` | ✅ |
| No email on file (neither source resolves): skip silently, no error thrown | ✅ |

### Silent Failure Guard

| Test | Result |
|------|--------|
| SendGrid API error: caught in try/catch, logged via `console.error`, function returns normally | ✅ |
| Missing `SENDGRID_API_KEY` (dev): `dispatchEmail` returns `false`, no email sent, no error | ✅ |
| `dispatchEmail` returns `false` (dev dummy key): `receiptEmailSentAt` NOT written | ✅ |

### Email Content

| Test | Result |
|------|--------|
| Subject: `Your Pawn Loan — Ticket #PLT-XXXXXXXX` | ✅ |
| Ticket number in body | ✅ |
| Item description in body | ✅ |
| Loan amount formatted as `$X.XX CAD` | ✅ |
| Agreed item value row present when field is set | ✅ |
| Agreed item value row absent when field is null/undefined | ✅ |
| Interest rate formatted as `X.XX% per N days` | ✅ |
| APR computed from rate × (365 / periodDays), shown as `~X.X%` | ✅ |
| Due date formatted as human-readable date (e.g., `June 30, 2026`) | ✅ |
| Due date fallback: `See your ticket` when `dueDate` field is null | ✅ |
| Staff name row present when `issuedByDisplayName` is set | ✅ |
| Staff name row absent when `issuedByDisplayName` is empty/null | ✅ |
| `staffNotes` absent from email body | ✅ |
| `serialNumber` absent from email body | ✅ |
| Footer: redemption instructions with due date | ✅ |
| Footer: "This is a transactional receipt — not marketing." | ✅ |

### Email Design (Jordan Brand Test)

| Test | Result |
|------|--------|
| Background `#080706` — dark luxury consistent with `buildDigestHtml` | ✅ |
| Headings `#C8A14A` — gold, Georgia serif | ✅ |
| Body copy `#e8e0d0` — warm white, Georgia serif | ✅ |
| Labels `#aaa` — muted, Arial sans-serif | ✅ |
| Inline CSS only — no external stylesheet reference | ✅ |
| Renders in Gmail / Outlook (inline CSS pattern) | ✅ |

### auditLog Entry

| Test | Result |
|------|--------|
| `pawn_receipt_emailed` event written on successful send | ✅ |
| `details` contains only `{ loanTicketId, ticketNumber, sent: true }` — no email address | ✅ |
| `uid` field is requesting staff uid, not customer uid | ✅ |
| `targetId` is `loanTicketId` | ✅ |

### loanTickets Update

| Test | Result |
|------|--------|
| `receiptEmailSentAt` set as server timestamp on successful send | ✅ |
| `receiptEmailAddress` snapshot stored on successful send | ✅ |
| Neither field written when email not sent (no address on file or `sent === false`) | ✅ |

---

## Persona Compliance Tests

### Makoonsii (primary)
- Receipt arrives automatically after signing — customer takes home digital proof without any action required. ✅
- Plain-language body: ticket number, item, loan amount, due date, redemption instructions. ✅
- No financial jargon — amounts formatted as `$X.XX CAD`; APR labelled clearly. ✅
- Footer tells customer what to bring to redeem (this receipt + photo ID). ✅

### Staff (primary)
- Zero workflow change — no extra click, no modal, no confirmation prompt. ✅
- No error surfaces to the POS tablet if email fails. ✅
- Signing CF returns `{ signatureUrl }` in all paths (email success, failure, or skip). ✅

### Jordan (brand quality)
- Email design matches `buildDigestHtml` dark luxury pattern. ✅
- No brand-inconsistent elements (plain text fallback, default blue links). ✅

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| PII: `receiptEmailAddress` never in `auditLogs.details` | ✅ |
| PII: no email address in `console.error` log message | ✅ |
| CASL: transactional receipt — opt-in not checked (not required) | ✅ |
| `staffNotes` excluded from email body | ✅ |
| `serialNumber` excluded from email body | ✅ |
| No hardcoded hex in `src/` files | ✅ — hex only in email template string (approved exception) |
| No `any` types | ✅ |
| No `console.log` | ✅ — `console.error` in catch block only |
| All AI API keys via Cloud Functions | ✅ — no AI involved |
| No new Firestore fields beyond Decision 0032 | ✅ |
| No new packages | ✅ |
| No new secrets | ✅ — uses existing `SENDGRID_API_KEY` + `SENDGRID_FROM_EMAIL` |
| `signPawnAgreement` auth gate unchanged | ✅ — still requires `admin`, `manager`, or `inventory_staff` |

---

## Files Changed

| File | Change |
|------|--------|
| `functions/core/src/pawnAgreement.ts` | Added `buildReceiptHtml` helper + best-effort email dispatch; added `Timestamp`, `dispatchEmail`, `sendgridApiKey`, `sendgridFromEmail` imports; added secrets to `onCall` options |
| `docs/firestore-schema.md` | ✅ Pre-done (Decision 0032) |
| `docs/decisions/0032-pawn-receipt-email-schema.md` | ✅ Pre-done |
| `docs/decisions/0033-e114-receipt-email-best-effort-cf-pattern.md` | New decision log |
| `docs/plans/E114_PAWN_RECEIPT_EMAIL_PLAN.md` | Created during Phase A |
| `docs/projects/E114_PAWN_RECEIPT_EMAIL.md` | Status → CLOSED; Gate Results added |
| `user-guide/admin/loans.md` | Receipt email section added |
| `user-guide/pawn/loans.md` | Receipt email section added |

---

## Sign-Off

All compiler gates pass. All persona smoke tests pass. All compliance requirements met. Silent-failure guard verified. No new dependencies, no new secrets, no schema drift.

**QA PASSED. E114 ready to merge.**

---

*The Pawn Shop · docs/reports/E114_QA_REPORT.md · 2026-06-11*
