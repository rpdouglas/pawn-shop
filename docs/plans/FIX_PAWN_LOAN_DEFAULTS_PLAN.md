# FIX — Pawn Loan Defaults · Strategy Plan

**Date:** 2026-06-10  
**Cycle:** 32  
**Spec:** `docs/projects/FIX_PAWN_LOAN_DEFAULTS.md`

---

## Root Cause Analysis

### Bug 1 — Interest Rate Default

`IssueLoanModal.tsx:43`:
```typescript
const [interestRatePct, setInterestRatePct] = useState('5')
```
- Applied as a **flat per-period rate**: `redemption = principal × (1 + rate/100)`
- For a 30-day loan at 5%: 60% annualised — exceeds the applicable legal caps below

**Confirmed applicable rate caps (Akwesasne, Ontario side):**
- Loans **under $1,000**: max **48% APR**
- Loans **$1,000 and over**: max **35% APR**

**APR → per-period conversion:**
```
max_rate_pct = APR_cap × (periodDays / 365)
```
Examples:
| Amount | APR cap | Term | Max flat rate |
|---|---|---|---|
| < $1,000 | 48% | 30 days | 3.95% |
| ≥ $1,000 | 35% | 30 days | 2.88% |
| < $1,000 | 48% | 90 days | 11.84% |
| ≥ $1,000 | 35% | 60 days | 5.75% |

The cap is **dynamic** — it depends on both the loan amount entered and the loan term. It cannot
be a single hardcoded default; it must be recalculated whenever amount or term changes.

### Bug 2 — Blank Print Page

**Affected files:** `PawnInbox.tsx:86`, `LoanTicketsAdminPage.tsx:35`

```javascript
setPrintTicket(data)           // React state update — async in concurrent mode
setTimeout(() => window.print(), 0)  // macrotask fires before React commits DOM
```

React 18 with `createRoot` batches and commits state updates asynchronously. `setTimeout(fn, 0)`
fires as a macrotask — before React guarantees DOM commit. `PrintableTicket` guards
`if (!data) return null`, so the portal renders nothing. `window.print()` opens on a blank DOM.

**Fix:** Move `window.print()` into a `useEffect` inside `PrintableTicket`. React `useEffect`
runs *after* every committed render — DOM is guaranteed ready.

---

## Persona Gate

| Persona | Test |
|---|---|
| **Staff (Primary)** | (1) Correct default rate pre-populated on loan issuance form. (2) Print ticket after signing → shows full ticket, not blank. |
| **Makoonsii (Secondary)** | Customer walks away with a legible printed receipt that shows item, amount, due date, and their signature. |

---

## Schema Audit

### Bug 1 — No new schema required for Strategy A
No Firestore reads or writes change. Default is only a UI initial value.

### Bug 1 — New schema required for Strategies B and C
| Collection | Field | Type | Notes |
|---|---|---|---|
| `config/loanDefaults` | `defaultInterestRate` | number | Decimal e.g. 0.03 for 3%. Admin-only write. |
| `config/loanDefaults` | `defaultPeriodDays` | number | Default loan term in days (e.g. 30) |

**If Strategies B or C are chosen:** `docs/firestore-schema.md` and a decision log must be updated before code ships.

### Bug 2 — No schema changes
Print fix is UI/React lifecycle only.

---

## Strategy A — Dynamic APR Cap + Print Fix (Recommended)

### Architecture

**Rate logic (all client-side, no Firestore changes):**

```typescript
// constants at top of IssueLoanModal.tsx
const APR_CAP_UNDER_1000 = 0.48
const APR_CAP_OVER_1000  = 0.35
const THRESHOLD_CENTS    = 100_000  // $1,000.00

function calcMaxRatePct(amountCents: number, days: number): number {
  if (amountCents <= 0 || days <= 0) return 0
  const aprCap = amountCents < THRESHOLD_CENTS ? APR_CAP_UNDER_1000 : APR_CAP_OVER_1000
  return parseFloat((aprCap * days / 365 * 100).toFixed(2))
}
```

1. **Auto-populate rate:** `useEffect` watches `loanAmountDollars` + `periodDays`. Whenever either
   changes and produces a valid amount + term, recalculate `maxRatePct` and call
   `setInterestRatePct(String(maxRatePct))`. Staff starts at the legal maximum and can only go lower.
2. **Show cap indicator:** A helper line beneath the rate input: *"Max for this loan: X.XX% (48% APR)"*
   Updates live as amount/term changes.
3. **Submit-time validation:** If `ratePct > maxRatePct`, block with error: *"Rate exceeds the
   legal maximum of X.XX% (48% APR for loans under $1,000)."*
4. **Print bug:** `useEffect` in `PrintableTicket` calls `window.print()` after DOM commit.
   Remove `setTimeout(window.print)` from `PawnInbox.tsx` and `LoanTicketsAdminPage.tsx`.

### Files Changed
| File | Change |
|---|---|
| `src/components/admin/IssueLoanModal.tsx` | APR cap constants, dynamic rate effect, cap indicator label, submit validation |
| `src/components/admin/PrintableTicket.tsx` | Add `useEffect` → `window.print()` |
| `src/components/admin/PawnInbox.tsx` | Remove `setTimeout(window.print)` |
| `src/pages/admin/LoanTicketsAdminPage.tsx` | Remove `setTimeout(window.print)` |

**Scope: Small — 4 files, ~25 lines net added.**

### Persona Lens
- **Staff:** Rate auto-populates to the legal max when amount + term are entered. Live feedback shows the cap. Cannot accidentally over-charge — submit is blocked if rate is too high.
- **Makoonsii:** Rate on ticket reflects the legal ceiling for her specific loan. Ticket prints correctly on first attempt.

### Compliance
- No new Firestore ops. No PII. No AI keys. No new schema fields.
- APR caps (48%/$1,000, 35%/$1,000+) enforced at the UI layer. A future E-series epic can add server-side enforcement in the CF.
- Per-period rate stored in `loanTickets.interestRate` — no schema change needed.

### Trade-offs
| Pro | Con |
|---|---|
| Legally correct cap, enforced dynamically at entry time | APR values hardcoded — code deploy required if cap changes |
| Staff cannot over-charge by accident | No server-side enforcement (UI-only guard for now) |
| Print fix is definitive — `useEffect` guarantees DOM commit | — |
| Zero new infra, lowest regression risk | — |

---

## Strategy B — Configurable APR Caps via Firestore Config Doc

### Architecture

1. **New schema:** Add `config/loanDefaults` with `aprCapUnder1000: number`, `aprCapOver1000: number`, `loanThresholdCents: number`, `defaultPeriodDays: number`. Decision log required.
2. **New hook `useLoanDefaults`:** Reads `config/loanDefaults` once via `getDoc`. Falls back to 0.48/0.35/$1,000/30 if doc absent.
3. **`IssueLoanModal`:** Same dynamic rate logic as Strategy A but reads APR caps from config. Admin can update caps without a code deploy.
4. **Print fix:** Same as Strategy A.
5. **Firestore rules:** `allow read: if isStaff(); allow write: if isAdmin();` for `config/loanDefaults`.

### Files Changed
`docs/firestore-schema.md`, new decision log, `firestore.rules`, `src/lib/useLoanDefaults.ts` (new), `IssueLoanModal.tsx`, `PrintableTicket.tsx`, `PawnInbox.tsx`, `LoanTicketsAdminPage.tsx`.

**Scope: Medium — 7–8 files.**

### Trade-offs
| Pro | Con |
|---|---|
| Admin can update APR caps without code deploy if law changes | Firestore read + loading state on modal open |
| APR caps become part of documented operational config | Requires creating + seeding `config/loanDefaults` doc in both dev + prod |
| Scalable for multi-tier or multi-jurisdiction future | More moving parts; more regression surface |

---

## Strategy C — Admin Config UI for Loan Policy

### Architecture

Full admin settings panel at `/admin/loan-settings`:
- Configures `defaultInterestRate`, `defaultPeriodDays`, `maxLoanAmountCents`, `minLoanAmountCents`
- All stored in `config/loanDefaults`
- `IssueLoanModal` reads defaults; validates against min/max
- Print fix included

**Scope: Large — ~10 files.**

### Trade-offs
| Pro | Con |
|---|---|
| Complete admin control over loan policy | Significantly over-engineered for fixing a default value |
| Validation of min/max gives compliance guardrails | Introduces a new admin page and nav entry |
| Covers future E-series work for rate schedule | Wrong tool for an immediate bug fix |

---

## Anti-Regression Checklist (All Strategies)

- [x] No hardcoded hex values — `useEffect` in `PrintableTicket` adds no styling
- [x] No invented Firestore fields — Strategies B/C update schema first
- [x] No AI API keys on client — no AI calls in this fix
- [x] `rare-find`/`limited-edition` not touched
- [x] No PII in logs
- [x] Age gates not touched
- [x] No unapproved motion patterns
- [x] Print fix uses `useEffect` — not animation, not DOM manipulation

---

## Recommended Strategy: A

The print bug has one correct fix (useEffect) regardless of strategy. Strategy A enforces the
legally confirmed APR caps (48%/<$1,000, 35%/≥$1,000) dynamically — no hardcoded flat rate,
no single default that could be wrong. Staff are auto-guided to the legal maximum and cannot
exceed it. Zero new infrastructure. Strategy B becomes relevant if/when the APR caps themselves
are expected to change frequently without a code deploy.

---

*The Pawn Shop · docs/plans/FIX_PAWN_LOAN_DEFAULTS_PLAN.md · 2026-06-10*
