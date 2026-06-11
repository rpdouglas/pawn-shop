# E116 — Pawn Intake & Ticket UX Improvements
**Status:** ✅ CLOSED — 2026-06-11
**Priority:** MEDIUM
**Effort:** TBD
**Cycle:** 36

---

## Problem

Three related UX gaps in the walk-in pawn and ticket flow:

1. **Duplicate ID collection.** `WalkInPawnModal` already captures `idType` and `idVerified`. Because these are not threaded through to `IssueLoanCtx`, `IssueLoanModal` asks for them again. Staff enters the same ID information twice in a single walk-in transaction.

2. **No pre-commitment loan cost preview.** The loan cost summary (interest dollar amount, total redemption, due date) only appears in step 2 of `IssueLoanModal` *after* the loan is already committed to Firestore. Staff cannot advise the customer on cost before the transaction is locked in.

3. **Ticket terms are present but not actionable.** The printed ticket already mentions extensions and default on page 2, but:
   - No contact info or specific action for requesting an extension
   - The "what happens if you can't pay" language does not tell the customer what the process or timeline looks like
   - No clear call-to-action for the customer holding the ticket

## Goal

1. Pre-fill ID fields in `IssueLoanModal` from walk-in intake — no duplicate entry.
2. Add a live cost preview panel in `IssueLoanModal` step 1 so staff can advise the customer before committing.
3. Enhance printed ticket terms to give customers clear, plain-language guidance on extensions and default.

---

## Personas

- **Primary: Staff** — the POS operator who uses both modals in sequence; the one holding the tablet when a customer is present
- **Secondary: Makoonsii** — the walk-in customer receiving the loan and keeping the printed ticket; plain language, large touch targets, clear terms are her core needs

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/WalkInPawnModal.tsx` | Thread `idType` + `idVerified` through `onSuccess` callback |
| `src/components/admin/PawnInbox.tsx` | Add `idType?` + `idVerified?` to `IssueLoanCtx`; update `handleWalkInSuccess` |
| `src/components/admin/IssueLoanModal.tsx` | Accept `initialIdType?` + `initialIdVerified?` props; add live cost preview panel |
| `src/components/admin/PrintableTicket.tsx` | Enhance extension + default paragraphs; add actionable footer contact line |

---

---

## Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. Built in 4.78s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |
| Hardcoded hex/px/ms audit | ✅ PASS | All new code uses `var(--color-*)`, `var(--text-*)`, `var(--space-*)` tokens. |
| Schema changes | ✅ PASS — None | No Firestore field changes. No decision entry required. |
| PII in logs audit | ✅ PASS — N/A | No new Cloud Function or audit log changes. |

---

*The Pawn Shop · docs/projects/E116_PAWN_INTAKE_UX_IMPROVEMENTS.md · 2026-06-11*
