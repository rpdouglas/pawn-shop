---
status: accepted
date: 2026-06-10
epic: FIX_PAWN_LOAN_DEFAULTS
---

# 0023 — APR Cap per-Period Rate Calculation & React onChange Auto-populate Pattern

## Context

Two bugs were fixed in the loan issuance flow:

**Bug 1 — Hardcoded 5% interest rate default.**
`IssueLoanModal` initialised `interestRatePct` with the string `'5'`. For a 30-day term, 5%/period annualises to ~60%, which equals the federal Criminal Code s. 347 ceiling. Staff operating on Akwesasne Mohawk Territory (Ontario side) must apply lower maximums:

| Loan amount | Applicable APR cap |
|---|---|
| Under $1,000 CAD | 48% APR |
| $1,000 CAD and over | 35% APR |

These values were confirmed by the business owner as the applicable legal maximums for the jurisdiction. A future code deploy is required if these values change. If/when caps need to be configurable without a deploy, Strategy B from `docs/plans/FIX_PAWN_LOAN_DEFAULTS_PLAN.md` (Firestore `config/loanDefaults`) provides the upgrade path.

**APR → per-period conversion:**
```
max_rate_pct = APR_cap × (periodDays / 365) × 100
```

Examples:
| Amount | APR cap | Term | Max flat rate |
|---|---|---|---|
| < $1,000 | 48% | 30 days | 3.95% |
| ≥ $1,000 | 35% | 30 days | 2.88% |
| < $1,000 | 48% | 90 days | 11.84% |

**Bug 2 — Blank print page.**
`PawnInbox` and `LoanTicketsAdminPage` called `setTimeout(() => window.print(), 0)` after `setPrintTicket(data)`. In React 18 concurrent mode, state commits are asynchronous; the macrotask fired before DOM commit, so the print dialog opened on a blank portal. Fix: move `window.print()` into `useEffect` inside `PrintableTicket` — guaranteed to run after commit.

## Decision

### Rate caps (hardcoded in `IssueLoanModal.tsx`)

```typescript
const APR_CAP_UNDER_1000   = 0.48   // 48% APR — loans under $1,000 CAD
const APR_CAP_OVER_1000    = 0.35   // 35% APR — loans $1,000 CAD and over
const LOAN_THRESHOLD_CENTS = 100_000 // $1,000.00

function calcMaxRatePct(amountCents: number, days: number): number {
  if (amountCents <= 0 || days <= 0) return 0
  const aprCap = amountCents < LOAN_THRESHOLD_CENTS ? APR_CAP_UNDER_1000 : APR_CAP_OVER_1000
  return parseFloat((aprCap * (days / 365) * 100).toFixed(2))
}
```

The rate auto-populates to the legal maximum when either the amount or term input changes, via inline `onChange` handlers (not a `useEffect` — see below). Staff can manually lower the rate; the submit-time validation blocks any rate above the computed cap.

### React pattern — onChange over useEffect for auto-populate

The original fix attempted `useEffect(() => { ... setInterestRatePct(...) }, [loanAmountDollars, periodDays])`. This violated the `react-hooks/set-state-in-effect` ESLint rule: calling `setState` directly inside `useEffect` without a parent derived state pattern triggers a potential cascade render warning.

**Chosen approach:** move the cap recalculation into the `onChange` handlers for the amount and term inputs. Whenever either changes, the new max is computed inline and `setInterestRatePct` is called in the same event handler — a single synchronous React dispatch, no effect needed. The rate resets to the new legal max whenever amount or term is modified, which is the desired UX (staff starts at the cap and can only go lower).

### Print fix

`window.print()` moved from `setTimeout(fn, 0)` callers into:

```typescript
// PrintableTicket.tsx
useEffect(() => {
  if (data) window.print()
}, [data])
```

`useEffect` runs after every committed render, guaranteeing the portal DOM is present before the print dialog opens.

## Consequences

- Staff cannot accidentally issue a loan above the legal APR maximum — the form blocks it at submit time with a human-readable error.
- The rate field pre-fills to the legal maximum so staff see the correct starting point for each loan.
- If the APR caps change by regulation, a code deploy is required. Acceptable for now; Strategy B (Firestore config) is documented in the plan if this becomes a pain point.
- No new Firestore fields, no new Cloud Functions, no schema changes.

---

*The Pawn Shop · docs/decisions/0023-apr-cap-per-period-rate-calculation.md · 2026-06-10*
