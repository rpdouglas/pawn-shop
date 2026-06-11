# QA Report — E115 · APR Override Warning

**Date:** 2026-06-11
**Cycle:** 35
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. Built in 3.69s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |

---

## Schema Audit

| Field | Type | Status |
|-------|------|--------|
| `loanTickets/{id}.aprOverrideConfirmed` | boolean | ✅ Added to schema before coding — Decision 0034 |
| `auditLogs/{id}.eventType: 'loan_rate_override'` | string enum value | ✅ Added to eventType list in schema |

No other collections changed.

**Schema sync: complete.**

---

## Feature Smoke Tests

### Normal Path (Rate Within Cap) — Unchanged

| Test | Result |
|------|--------|
| Under-cap rate: no warning banner shown | ✅ |
| Under-cap rate: no checkbox rendered | ✅ |
| Under-cap rate: submit proceeds immediately | ✅ |
| `aprOverrideChecked` state does not affect submission | ✅ |
| `aprOverrideConfirmed` not sent to CF on under-cap loan | ✅ |

### Override Path (Rate Exceeds Cap)

| Test | Result |
|------|--------|
| Over-cap rate: yellow warning banner appears inline below rate field | ✅ |
| Warning shows entered rate, implied APR, cap APR, and loan size label | ✅ |
| Checkbox is unchecked by default | ✅ |
| Submit click with unchecked box: error message shown, form does not submit | ✅ |
| Submit click with checked box: form submits normally | ✅ |
| Changing amount resets `aprOverrideChecked` to false | ✅ |
| Changing term resets `aprOverrideChecked` to false | ✅ |
| Changing rate resets `aprOverrideChecked` to false | ✅ |

### Server-Side Cap Enforcement

| Test | Result |
|------|--------|
| CF rejects over-cap rate without `aprOverrideConfirmed: true` | ✅ |
| CF accepts over-cap rate when `aprOverrideConfirmed: true` | ✅ |
| CF accepts under-cap rate with or without `aprOverrideConfirmed` | ✅ |
| `aprOverrideConfirmed: true` written to `loanTickets` doc on override | ✅ |
| `aprOverrideConfirmed` field absent on under-cap loans | ✅ |

### Audit Log

| Test | Result |
|------|--------|
| `loan_rate_override` auditLog written on override issuance | ✅ |
| `details` contains `{ loanTicketId, interestRate, impliedApr, capApr }` — no PII | ✅ |
| `uid` is the issuing staff member's UID | ✅ |
| `targetId` is the loan ticket ID | ✅ |
| Standard `loan_ticket_created` auditLog still fires for all loans | ✅ |
| No second `loan_rate_override` log on under-cap loans | ✅ |

### APR Cap Logic — Threshold Boundary

| Loan amount | Expected cap APR | Expected per-period cap (30d) | Result |
|---|---|---|---|
| $999.99 | 48% | 3.95% | ✅ |
| $1,000.00 | 35% | 2.88% | ✅ |
| $1,500.00 | 35% | 2.88% | ✅ |

---

## Persona Compliance Tests

### Staff (primary)
- Normal path (under-cap rate): no change in UX — form submits identically to before. ✅
- Over-cap path: warning is clear, immediately readable, non-blocking until checkbox is checked. ✅
- Checkbox label: "I confirm this rate exceeds the legal maximum APR and I am intentionally overriding the cap." — unambiguous. ✅
- Checkbox re-gates on every field edit — prevents stale acknowledgement after changing the rate. ✅
- 48px minimum hit target on checkbox label. ✅

### Makoonsii (secondary)
- Printed ticket is unchanged — rate and APR display unaffected by the override path. ✅
- Signing flow is unchanged — three-step sequence (Terms → Sign → Done) is identical. ✅

### Compliance
- Server-side enforcement closes pre-existing bypass gap (custom client could previously submit any rate). ✅
- `loan_rate_override` is an immutable `auditLogs` event — create-only via CF Admin SDK. ✅
- No PII in audit log details. ✅
- `aprOverrideConfirmed` on the ticket provides direct traceability for regulators. ✅

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No hardcoded hex in `src/` — uses `var(--color-warning)`, design tokens throughout | ✅ |
| No `any` types | ✅ |
| No `console.log` | ✅ |
| No unused imports or variables | ✅ |
| `auditLogs` written via CF Admin SDK only | ✅ |
| PII excluded from `auditLogs.details` | ✅ |
| Server-side APR cap validation added to `createLoanTicket` CF | ✅ |
| New `aprOverrideConfirmed` field in schema before coding | ✅ |
| `loan_rate_override` eventType in schema before coding | ✅ |
| 48px hit targets on all interactive elements | ✅ |
| No age gate changes | ✅ — not applicable |
| No AI key routing changes | ✅ — not applicable |
| No new packages | ✅ |
| No new Cloud Functions | ✅ — existing `createLoanTicket` CF extended |

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/IssueLoanModal.tsx` | Added `aprOverrideChecked` state; replaced hard-block with warning banner + checkbox; reset logic on field changes; `aprOverrideConfirmed` passed to mutation |
| `src/lib/useLoanTickets.ts` | Added `aprOverrideConfirmed?` to `IssueLoanArgs` |
| `functions/core/src/loanTickets.ts` | Added APR cap constants + `calcMaxRate`; server-side validation; `aprOverrideConfirmed` doc field; `loan_rate_override` audit log |
| `docs/firestore-schema.md` | `aprOverrideConfirmed` added to `loanTickets/{id}`; `loan_rate_override` added to `auditLogs.eventType` |
| `docs/decisions/0034-e115-apr-override-warning.md` | New decision log |
| `docs/plans/E115_APR_OVERRIDE_WARNING_PLAN.md` | Created during Phase A |
| `docs/projects/E115_APR_OVERRIDE_WARNING.md` | Status → CLOSED; Gate Results added |
| `user-guide/admin/loans.md` | Interest rate cap section updated to reflect soft-warning path |

---

## Sign-Off

All compiler gates pass. All persona smoke tests pass. All compliance requirements met. Server-side bypass gap closed. No new dependencies, no new secrets.

**QA PASSED. E115 ready to merge.**

---

*The Pawn Shop · docs/reports/E115_QA_REPORT.md · 2026-06-11*
