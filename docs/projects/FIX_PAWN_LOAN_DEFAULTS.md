# FIX — Pawn Loan Issuance: Interest Rate Default + Blank Print Page

**Status:** ✅ CLOSED — 2026-06-10
**Priority:** HIGH
**Effort:** Small (~3–5 files depending on strategy)
**Cycle:** 32

---

## Problem

Two bugs in the loan issuance flow introduced by E107 and E109:

### Bug 1 — Hardcoded 5% interest rate default
`IssueLoanModal.tsx` initialises `interestRatePct` with `'5'` (5%). For a 30-day loan this
annualises to 60% — the federal Criminal Code s. 347 maximum. The rate label gives no
indication of whether it is per-period, monthly, or annual, increasing risk of staff error.

The correct default depends on the applicable legal maximum on the Akwesasne Mohawk Territory
(Ontario side). The federal ceiling is 60%/year simple. Ontario's Pawnbrokers Act historically
set lower monthly maximums (~2–3%/month). Jurisdictional advice from legal counsel is required
before the exact ceiling can be hardcoded.

**Immediate risk:** Staff may unwittingly issue loans at the federal criminal ceiling when a
lower provincial rate may apply.

### Bug 2 — Blank page when printing ticket
`PawnInbox` and `LoanTicketsAdminPage` both use:
```javascript
setPrintTicket(data)
setTimeout(() => window.print(), 0)
```
In React 18 with `createRoot` (concurrent mode), state updates are committed asynchronously.
`setTimeout(fn, 0)` fires as a macrotask on the next event-loop tick — before React guarantees
the new state is committed to the DOM. `PrintableTicket` returns `null` when `data` is falsy,
so the portal renders nothing, and the print dialog opens on a blank page.

---

## Personas

**Primary:** Staff (inventory_staff / manager / admin) — POS counter operator  
**Secondary:** Makoonsii — customer receiving the printed ticket as their legal receipt

---

## Legal Note

The interest rate default is a compliance decision. This spec records the architectural options;
the final value must be confirmed by the business owner with qualified legal advice before the
fix is deployed to production. Suggested interim default: 3% per loan period (roughly 36%
annualised for 30-day loans — below the Ontario pawn industry norm of ~2–3%/month, and well
below the federal 60%/year ceiling).

---

## Gate Results

| Gate | Result |
|---|---|
| `npm run build` | ✅ PASS — built in 3.55s, zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero errors, zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests, 8 test files |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |

---

*The Pawn Shop · docs/projects/FIX_PAWN_LOAN_DEFAULTS.md · 2026-06-10*
