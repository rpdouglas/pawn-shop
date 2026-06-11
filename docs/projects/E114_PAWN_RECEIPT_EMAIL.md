# E114 — Pawn Loan Receipt Email
**Status:** ✅ CLOSED — 2026-06-11
**Priority:** MEDIUM
**Effort:** Small — 1 file modified
**Cycle:** 34

---

## Problem

After a pawn loan is issued and the customer signs the agreement, the only record the customer takes home is the printed paper ticket. If the ticket is lost, the customer has no documented proof of their loan terms, due date, or redemption amount. There is no digital copy.

The shop has email hosting through CanSpace.ca. A receipt email immediately after signing gives the customer:
- A permanent digital copy of their loan agreement summary
- Due date reminder-ready record in their inbox
- Trust signal consistent with the brand standard ("Dapper. Debonair.")

## Solution Scope

Send an HTML email receipt to the customer's email address after `signPawnAgreement` is called. The email contains the key loan summary (not the full legal agreement) plus a note that the signed copy is on file at the shop.

Email transport: three strategies under evaluation — see `docs/plans/E114_PAWN_RECEIPT_EMAIL_PLAN.md`.

## Personas Served

| Persona | Need |
|---------|------|
| Makoonsii | Plain-language documentation of the transaction. Trust that the shop keeps good records. |
| Staff | Seamless — no extra manual step in the loan issuance workflow. |
| Jordan | Branded HTML email consistent with the dark luxury aesthetic. |

## Collections Touched

| Collection | Operations |
|-----------|-----------|
| `loanTickets/{id}` | Read (ticket data), Write (`receiptEmailSentAt`) |
| `pawnRequests/{id}` | Read (customer `email`) |
| `users/{uid}` | Read (`email`) if `uid` present |
| `auditLogs` | Write (`pawn_receipt_emailed` event) |

## New Schema Fields

| Collection | Field | Type | Notes |
|-----------|-------|------|-------|
| `loanTickets/{id}` | `receiptEmailSentAt` | timestamp | Idempotency guard. Set by CF after successful send. Null until email fires. |
| `loanTickets/{id}` | `receiptEmailAddress` | string | Email address the receipt was sent to. Captured at send time. Never exposed in `auditLogs`. |

## Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc + vite) | ✅ PASS | Zero TypeScript errors. Built in 3.42s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |
| Schema sync | ✅ PASS | Both fields pre-added in Decision 0032. |
| PII audit | ✅ PASS | `receiptEmailAddress` on ticket only; auditLog details contain `{ loanTicketId, ticketNumber, sent: true }`. |
| CASL | ✅ PASS | Transactional receipt — opt-in check not required. |
| Silent-failure gate | ✅ PASS | try/catch ensures email failure never throws to caller. |
| No hardcoded tokens in src/ | ✅ PASS | Inline CSS hex in email template is an approved exception (email clients cannot use CSS variables). |

---

*The Pawn Shop · docs/projects/E114_PAWN_RECEIPT_EMAIL.md · 2026-06-11*
