# E115 — APR Override Warning
**Status:** ✅ CLOSED — 2026-06-11
**Priority:** MEDIUM
**Effort:** TBD
**Cycle:** 35

---

## Problem

`IssueLoanModal` currently hard-blocks loan issuance when the staff-entered interest rate
exceeds the legal APR cap (48% for loans < $1,000 CAD; 35% for loans ≥ $1,000 CAD).

There are legitimate edge cases — such as manager-approved exceptions or in-province regulatory
nuances — where a trusted staff member needs to intentionally issue a loan above the calculated cap.
The hard block prevents this without any override path, forcing staff to change the rate even when
the intent is deliberate.

## Goal

Replace the hard-block with a confirmation step: display a clear warning and require the employee
to explicitly acknowledge the override before proceeding.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/IssueLoanModal.tsx` | Replace hard-block error with warning state + confirmation checkbox |
| `docs/firestore-schema.md` | Add `aprOverrideConfirmed` field to `loanTickets/{id}` (Strategy C only) |
| `functions/core/src/loanTickets.ts` | Accept + persist `aprOverrideConfirmed` flag (Strategy C only) |
| `docs/ACTIVE_CYCLE.md` | Update on close |
| `docs/EPICS.md` | Add epic entry |
| `docs/decisions/` | Decision entry on close |

---

## Persona Gate

- **Primary:** Staff (admin / manager / inventory_staff) — the employee using the modal
- **Secondary:** Makoonsii — the customer whose loan terms are affected; transparency of disclosed APR is the concern
- **Comp** — Any relaxation of a compliance control requires a clear audit trail

---

## Acceptance Criteria

1. When the entered rate is within or at the legal cap → no change from today; form submits normally.
2. When the entered rate exceeds the legal cap → a visible warning banner replaces the hard-block error, and a mandatory confirmation checkbox appears.
3. The warning clearly states: the entered rate, the applicable APR cap, and the annualised APR the entered rate implies.
4. The submit button remains disabled until the checkbox is checked.
5. Once checked and submitted, the loan is issued at the entered (over-cap) rate.
6. An audit trail is created for the override (eventType: `loan_rate_override` in `auditLogs`).

---

## Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. Built in 3.69s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |
| Hardcoded hex audit | ✅ PASS | Uses `var(--color-warning)`, `var(--color-text-muted)`, `var(--color-text)`. |
| PII in logs audit | ✅ PASS | `loan_rate_override` auditLog details: `{ loanTicketId, interestRate, impliedApr, capApr }` — no PII. |
| New Firestore fields in schema | ✅ PASS | `aprOverrideConfirmed` added to `loanTickets/{id}` before coding. |

---

*The Pawn Shop · docs/projects/E115_APR_OVERRIDE_WARNING.md · 2026-06-11*
