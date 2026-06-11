# E115 — APR Override Warning — Plan
**Date:** 2026-06-11
**Status:** Awaiting approval

---

## Context

`IssueLoanModal.tsx` calculates a per-period rate cap from the applicable APR ceiling
(48% for loans < $1,000 CAD; 35% for ≥ $1,000 CAD) and currently hard-blocks submission when
the entered rate exceeds the cap. The user wants a soft-warning path instead: show a warning and
a confirmation checkbox so a staff member can intentionally override the cap without being blocked.

---

## Persona Gate

| Persona | Role in this feature |
|---|---|
| **Staff** `[Staff]` | Primary. The modal is staff-only (role-gated). The UX must be fast, unambiguous, and not add friction to the normal path (under-cap loans). |
| **Makoonsii** `[Mak]` | Secondary. The loan terms she receives must still be clearly disclosed on the printed ticket; the annualised APR must appear regardless of whether it is over cap. |
| **Comp** `[Comp]` | Any relaxation of a hard compliance control requires an explicit audit trail. |

---

## Schema Audit

### Collections read/written

| Collection | Fields read | Fields written (new) |
|---|---|---|
| `loanTickets/{id}` | `interestRate`, `loanAmount`, `periodDays` (existing) | `aprOverrideConfirmed` (Strategy C only) |
| `auditLogs/{id}` | — | `eventType: 'loan_rate_override'` (Strategy C only) |

### Required schema changes (Strategy C only)

**`loanTickets/{id}`** — add one field:

| Field | Type | Notes |
|---|---|---|
| `aprOverrideConfirmed` | boolean | Optional. `true` when the issuing staff member explicitly confirmed the rate exceeded the legal APR cap at issuance time. Set by `createLoanTicket` CF when `aprOverrideConfirmed: true` is passed in the request. Null/absent on loans issued within cap. |

**`auditLogs/{id}.eventType`** — add one value:
- `loan_rate_override` — fired when a loan is issued above the calculated per-period cap with explicit staff confirmation.

---

## Anti-Regression Checklist (all strategies)

| Rule | Status |
|---|---|
| No hardcoded hex values | ✅ — uses `var(--color-warning)` and `var(--color-danger)` |
| No invented Firestore fields | ✅ Strategies A+B: no new fields. Strategy C: schema updated first |
| No AI API keys on client | ✅ — not applicable |
| No auto-applied scarcity tags | ✅ — not applicable |
| No PII in logs/console | ✅ — loan amount and rate are financial data, not PII |
| Age gates at router level | ✅ — not affected |
| No unapproved motion | ✅ — no animation added |

---

## Strategy A — Inline Warning Banner (Minimal)

### Architecture

All changes in `src/components/admin/IssueLoanModal.tsx`.

- Remove the `setError(...)` hard-block for over-cap rates.
- Add a derived boolean: `const isOverCap = maxRate > 0 && ratePct > maxRate`.
- When `isOverCap`, render a yellow warning band below the rate field (using `var(--color-warning)`) showing the entered APR, the cap APR, and the cap rate for the term.
- Render a confirmation checkbox: *"I confirm this rate exceeds the legal maximum and I am intentionally overriding the cap."*
- Add state: `const [aprOverrideChecked, setAprOverrideChecked] = useState(false)`.
- Reset `aprOverrideChecked` to `false` whenever the rate changes (so the checkbox re-gates on every edit).
- Block submit if `isOverCap && !aprOverrideChecked`.

No changes to Cloud Function, Firestore schema, or any other file.

### Persona Lens

- **Staff:** Minimal friction on the normal path. The warning only appears when the cap is actually exceeded. Checkbox is clear and labelled.
- **Makoonsii:** The printed ticket still shows the entered rate and APR unchanged — no regression.
- **Comp:** No audit trail beyond the existing `loan_ticket_created` auditLog (which records `loanAmount`). If the rate is later questioned, the record exists but there is no explicit override flag.

### Trade-offs

**Benefits:**
- Smallest possible change — 1 file, ~20 lines.
- Zero schema/CF risk.
- Zero deployment required (frontend-only).

**Costs:**
- No server-side record that an override was intentional. Regulators or auditors examining the loan later cannot distinguish a deliberate override from a data-entry error.
- The Cloud Function still has no APR cap validation (pre-existing gap) — a custom client could still bypass at any rate.

### Estimated Scope: **Small — 1 file, ~20 lines**

---

## Strategy B — Confirmation Dialog on Submit (Medium)

### Architecture

Changes to `src/components/admin/IssueLoanModal.tsx` only.

- Leave the rate field and cap hint unchanged (real-time cap display stays).
- On submit click: if `isOverCap`, instead of immediately calling `issueLoan`, set a new state `step` value: `'confirm-override'`.
- Render a dedicated confirmation panel (within the same modal, not a new component) when `step === 'confirm-override'`:
  - Shows: entered rate, implied APR, applicable cap, a warning statement.
  - Has a checkbox: *"I understand this rate exceeds the legal maximum and I am proceeding deliberately."*
  - Has "Go Back" (returns to `'terms'` step) and "Override & Issue" buttons.
  - "Override & Issue" fires `issueLoan` only when checkbox is checked.
- The normal under-cap path is unaffected — submit goes straight to the existing flow.

Step sequence becomes: `'terms'` → `'confirm-override'`? → `'sign'` → `'done'`.

### Persona Lens

- **Staff:** The extra step only appears when genuinely needed. The dialog is self-contained in the same modal — no pop-on-pop.
- **Makoonsii:** No change to the printed ticket or signed agreement content.
- **Comp:** Better than A — the employee had to navigate through an explicit confirmation screen. Still no Firestore record of the override. Audit quality depends on `loan_ticket_created` interestRate value being reviewed post-hoc.

### Trade-offs

**Benefits:**
- Higher intentionality signal than Strategy A (extra step required, not just a checkbox in-line).
- Still 1 file, no CF/schema changes.

**Costs:**
- Slightly more complexity in the modal's step state machine (~40 lines vs ~20).
- Same audit gap as Strategy A: no explicit override record in Firestore.

### Estimated Scope: **Small-Medium — 1 file, ~40 lines**

---

## Strategy C — Inline Warning + Full Audit Trail (Recommended)

### Architecture

**Frontend (`IssueLoanModal.tsx`):**
- Same real-time inline warning as Strategy A (yellow banner + checkbox).
- Passes `aprOverrideConfirmed: true` to the `issueLoan` mutation when the checkbox was checked.

**Cloud Function (`functions/core/src/loanTickets.ts` — `createLoanTicket`):**
- Accept optional `aprOverrideConfirmed?: boolean` in `CreateLoanTicketData`.
- Add server-side APR cap validation:
  - Same `calcMaxRatePct` logic mirrored from the frontend.
  - If rate exceeds cap AND `aprOverrideConfirmed !== true` → throw `invalid-argument` (closes the pre-existing bypass gap).
  - If rate exceeds cap AND `aprOverrideConfirmed === true` → allow, write `aprOverrideConfirmed: true` to the loanTickets doc.
- Write a second `auditLogs` entry with `eventType: 'loan_rate_override'` and `details: { loanTicketId, interestRate, impliedApr, capApr }` — no PII.

**Schema (`docs/firestore-schema.md`):**
- Add `aprOverrideConfirmed: boolean` to `loanTickets/{id}`.
- Add `loan_rate_override` to `auditLogs.eventType` list.

### Persona Lens

- **Staff:** Same UX as Strategy A — inline warning + checkbox — minimal friction on normal path.
- **Makoonsii:** No change to the printed ticket or APR disclosure.
- **Comp:** Full audit trail. Regulators can query `auditLogs` for `loan_rate_override` events. The `loanTickets` document itself records `aprOverrideConfirmed: true` for direct traceability. Server-side enforcement means a custom client or API call cannot silently issue an over-cap loan.

### Trade-offs

**Benefits:**
- Server-side enforcement closes the pre-existing bypass gap.
- Explicit Firestore field allows compliance reporting queries.
- `auditLogs` event provides immutable record of who issued an over-cap loan and at what rate.

**Costs:**
- Schema change requires `docs/firestore-schema.md` update and a `docs/decisions/` entry before coding.
- CF change requires functions rebuild and re-deploy.
- 4 files vs 1.

### Estimated Scope: **Medium — 4 files (~80 lines total)**

---

## Recommendation

**Strategy C** — the audit trail is worth the modest extra scope. The pre-existing server-side bypass gap is a compliance risk regardless of this feature; Strategy C closes it as a byproduct. Strategies A and B leave the CF unguarded.

If speed is the priority and the team accepts the audit gap, **Strategy B** is the cleanest minimal option (the extra confirmation step is a stronger intentionality signal than an inline checkbox alone).

---

## Files Affected by Strategy (Summary)

| File | A | B | C |
|---|---|---|---|
| `src/components/admin/IssueLoanModal.tsx` | ✅ | ✅ | ✅ |
| `functions/core/src/loanTickets.ts` | — | — | ✅ |
| `docs/firestore-schema.md` | — | — | ✅ |
| `docs/decisions/0034-*.md` | — | — | ✅ |

---

*The Pawn Shop · docs/plans/E115_APR_OVERRIDE_WARNING_PLAN.md · 2026-06-11*
