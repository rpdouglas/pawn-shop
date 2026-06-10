# E107 — Pawn Ticket Generation & Digital Signature (POS)

**Status:** ✅ CLOSED — 2026-06-10
**Priority:** HIGH
**Effort:** Medium (~12 files)
**Cycle:** 32

---

## Problem

Staff can issue pawn loan tickets from the admin dashboard, but there is no formal agreement
signing step. The customer currently does not sign anything — there is no:

- Digital or physical signature capture
- Printable pawn ticket / loan agreement document
- Human-readable ticket number for verbal reference at the counter

For a brick-and-mortar pawn shop operating in Ontario/Quebec, having the customer sign the
agreement is both a legal requirement and an operational necessity. Staff need to hand the
customer a physical ticket so they can reclaim their item.

---

## Personas

**Primary:** Staff (inventory_staff / manager / admin) — the POS operator  
**Secondary:** Makoonsii — the community member pawning an item in person

---

## Scope

1. Customer signs the loan agreement on an Android tablet at the POS using a stylus/finger
2. Signature is stored in Firebase Storage; URL linked to the loan ticket in Firestore
3. A printable ticket is generated and displayed for `window.print()` dispatch to any connected printer
4. Both pawn loans and outright pawn transactions are covered
5. The full workflow integrates with the existing PawnInbox → IssueLoanModal → loanTickets flow

---

## Schema Changes (Pre-approved — Decision 0020)

New fields on `loanTickets/{id}`:
- `ticketNumber` — string — human-readable reference (e.g. `'PLT-20260610-A3F2'`)
- `signatureUrl` — string | null — Firebase Storage PNG URL
- `signedAt` — timestamp | null — server timestamp at signing
- `agreementVersion` — string | null — agreement template version slug
- `customerName` — string — customer name at time of signing

New `auditLogs.eventType`: `pawn_agreement_signed`

---

## Gate Results

| Gate | Result |
|---|---|
| `npm run build` | ✅ PASS — built in 4.34s, zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero errors, zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests, 8 test files |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| No `any` types | ✅ PASS — `Record<string, unknown>` + `instanceof Timestamp` pattern used |
| No hardcoded hex / px / spacing | ✅ PASS — `var(--color-*)`, `var(--text-*)`, `var(--space-*)` throughout |
| No PII in auditLogs | ✅ PASS — `pawn_agreement_signed` stores only `{ loanTicketId, agreementVersion }` |
| AI keys server-side only | ✅ N/A — no AI API calls in this epic |
| auditLogs via CF Admin SDK | ✅ PASS — `signPawnAgreement` writes via Admin SDK |

---

*The Pawn Shop · docs/projects/E107_PAWN_TICKET_DIGITAL_SIGNATURE.md · 2026-06-10*
