# QA Report — E116 · Pawn Intake & Ticket UX Improvements

**Date:** 2026-06-11
**Cycle:** 36
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. Built in 4.78s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |

---

## Schema Audit

No Firestore field changes. All changes are UI state, callback type, and JSX copy only.

**Schema sync: complete — no changes needed.**

---

## Feature Smoke Tests

### ID Duplication Fix — Walk-in Path

| Test | Result |
|------|--------|
| Complete walk-in intake with Driver's Licence selected and ID verified checked | ✅ |
| `IssueLoanModal` opens with ID Type pre-selected (not blank) | ✅ |
| `IssueLoanModal` ID Verified checkbox pre-checked | ✅ |
| Staff does not need to re-select ID type in Step 1 | ✅ |
| Closing and reopening the modal resets ID fields to blank (no stale state) | ✅ |
| Non-walk-in path (existing pawn request from table): ID fields start blank as before | ✅ |
| `key` prop remount on new `pawnRequestId` — no stale state from previous session | ✅ |

### Quote for Customer Panel — Step 1

| Test | Result |
|------|--------|
| Panel hidden when amount/term/rate are not yet entered | ✅ |
| Panel appears once all three fields are valid numbers | ✅ |
| "You borrow" shows loan amount in CAD dollars | ✅ |
| "Interest" row shows interest $ and the rate%/term label | ✅ |
| "You owe back" is bold, `var(--color-primary)` gold, larger than body text | ✅ |
| "Due date" shows the projected due date from today | ✅ |
| "APR" shows the implied APR prefixed with "~" | ✅ |
| Panel updates live as staff changes amount, term, or rate | ✅ |
| Panel disappears when amount is cleared | ✅ |
| Redemption total matches the sign step Loan Summary (same formula) | ✅ |

### Printed Ticket — Page 2 Term Enhancements

| Test | Result |
|------|--------|
| Plain-language default summary renders before sole-recourse clause | ✅ |
| Sole-recourse legal clause still present and unchanged | ✅ |
| Extension paragraph: specifies "visit in person", "bring this ticket and valid photo ID" | ✅ |
| Extension paragraph: mentions partial interest payment possibility | ✅ |
| Footer action line present: "To redeem or extend: visit The Pawn Shop · Cornwall Island · Akwesasne before [due date]." | ✅ |
| Footer action line shows dynamic due date (from `formatDate(data.dueDate)`) | ✅ |
| Police hold clause still present and unchanged | ✅ |
| APR disclosure still present and unchanged | ✅ |

---

## Persona Compliance Tests

### Staff (primary)
- Walk-in flow: ID entered once, pre-filled at loan issuance — no duplicate entry. ✅
- Quote panel: visible before submitting the loan — staff can turn tablet toward customer. ✅
- Quote panel: dollar amounts and due date, not just percentages — actionable for verbal quoting. ✅
- Panel only appears with valid data — no UI noise when form is incomplete. ✅
- ID pre-fill via `key`-prop remount: idiomatic React, no ESLint violations. ✅

### Makoonsii (secondary)
- Printed ticket: plain-language "your item becomes the property of The Pawn Shop" — no legal jargon for the default outcome. ✅
- Printed ticket: "visit The Pawn Shop in person or contact staff before the due date" — specific action. ✅
- Printed ticket: "Bring this ticket and valid photo ID" — exact action items. ✅
- Footer action line: repeats the most critical action (come in before due date) and the specific date. ✅
- All interactive elements ≥48px hit targets — unchanged from prior implementation. ✅

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No hardcoded hex in new code — uses `var(--color-surface)`, `var(--color-primary)`, `var(--color-text-muted)` etc. | ✅ |
| No `any` types | ✅ |
| No `console.log` | ✅ |
| No unused imports or variables | ✅ |
| No Firestore field changes | ✅ |
| No new Cloud Functions | ✅ |
| No new packages | ✅ |
| No AI key routing changes | ✅ |
| No age gate changes | ✅ |
| No PII in new code paths | ✅ |
| `react-hooks/set-state-in-effect` resolved via `key` prop remount pattern | ✅ |
| `react-hooks/purity` resolved via `useState(Date.now)` lazy initializer | ✅ |
| Sole-recourse legal text preserved exactly — not modified | ✅ |
| Police hold clause preserved exactly — not modified | ✅ |

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/WalkInPawnModal.tsx` | Extended `onSuccess` callback type with `idType?`/`idVerified?`; pass current values in the call |
| `src/components/admin/PawnInbox.tsx` | Added `idType?`/`initialIdVerified?` to `IssueLoanCtx`; updated `handleWalkInSuccess` signature; `key` prop on `<IssueLoanModal>` |
| `src/components/admin/IssueLoanModal.tsx` | Added `initialIdType?`/`initialIdVerified?` to props; `useState` init from props; `todayMs` state; `quotePreview` useMemo; Quote for Customer panel JSX |
| `src/components/admin/PrintableTicket.tsx` | Enhanced extension paragraph; plain-language default paragraph; footer action line |
| `docs/projects/E116_PAWN_INTAKE_UX_IMPROVEMENTS.md` | Status → CLOSED; Gate Results added |
| `docs/EPICS.md` | E116 entry added and closed |
| `docs/ACTIVE_CYCLE.md` | E116 added to Completed This Cycle; footer updated to Cycle 36 |
| `user-guide/admin/pawn-inbox.md` | Walk-in section and Step 1 updated for ID pre-fill and quote panel |
| `user-guide/admin/loans.md` | Ticket content table updated for enhanced page 2 terms |

---

## Sign-Off

All compiler gates pass. All persona smoke tests pass. All compliance requirements met. No schema changes. No Cloud Functions modified. No new dependencies.

**QA PASSED. E116 ready to merge.**

---

*The Pawn Shop · docs/reports/E116_QA_REPORT.md · 2026-06-11*
