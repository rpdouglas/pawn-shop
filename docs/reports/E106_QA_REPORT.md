# QA Report — E106 · Pawn Loan Lifecycle Gap Remediation
**Date:** 2026-06-09 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — `built in 1.77s` |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` type casts | ✅ PASS — Firestore reads cast to `Record<string, unknown>` throughout |
| No unused imports/variables | ✅ PASS — all prefix `_` where unused by design |

**Note:** Two `[INEFFECTIVE_DYNAMIC_IMPORT]` warnings appear in Vite output — these are pre-existing from `src/lib/firebase.ts` (tracked in E73 backlog). Not introduced by E106.

---

## Part 2 — Persona Smoke Tests

### Staff (Primary — Gap 1)
- [x] `PawnInbox` expanded detail row shows "Issue Loan" button only when `status === 'quoted'` and `pawnLoanId` is absent
- [x] Clicking "Issue Loan" opens `IssueLoanModal` with `itemDescription` pre-populated
- [x] Modal inputs: Loan Amount (CAD $), Loan Term (days, default 30), Interest Rate (%, default 5)
- [x] Submit converts dollars to cents, days to period, pct to decimal before calling `createLoanTicket` CF
- [x] Success state shows issued ticket ID; modal resets on close
- [x] After issuance, "Loan issued" badge replaces the "Issue Loan" button in the detail row
- [x] Double-issuance blocked: CF checks `pawnLoanId` field; returns `already-exists` error

### Staff (Gap 2 — Audit Trail)
- [x] Status/notes save in `PawnInbox` now calls `updatePawnRequestStatus` CF instead of direct `updateDoc`
- [x] CF rejects non-staff callers with `permission-denied`
- [x] CF validates status against `VALID_PAWN_REQUEST_STATUSES` constant before writing
- [x] `pawn_request_status_updated` auditLog entry confirmed in CF code path

### Makoonsii (Touch Targets)
- [x] "Issue Loan" button: `minHeight: '48px'` inline style
- [x] `IssueLoanModal` all inputs: `minHeight: '48px'` inline style
- [x] Cancel and Issue Loan buttons: `minHeight: '48px'` inline style
- [x] "Done" button on success state: `minHeight: '48px'` inline style

---

## Part 3 — Compliance Audit

| Item | Status |
|------|--------|
| All `pawnRequests` writes via Cloud Function Admin SDK | ✅ PASS — `updatePawnRequestStatus` CF added; `PawnInbox` routes through `httpsCallable` |
| `createLoanTicket` derives `uid`/`itemDescription` server-side | ✅ PASS — CF reads pawnRequest doc; client sends only IDs and loan parameters |
| Duplicate-issuance guard | ✅ PASS — CF checks `pawnLoanId` on pawnRequest before writing |
| `redemptionAmount` persisted on redeem | ✅ PASS — `redeemLoanTicket` CF accepts and writes `redemptionAmount?: number` |
| Auto-forfeit item transition | ✅ PASS — `checkLoanDueDates` updates linked `items/{id}.status = 'active'` on forfeit |
| 7 `auditLogs.eventType` values in schema | ✅ PASS — `firestore-schema.md` updated |
| No PII in `auditLogs.details` | ✅ PASS — details contain only IDs and amounts |
| AI API keys never on client | ✅ PASS — `IssueLoanModal` uses `httpsCallable`; no AI involved |
| Extension decline handling | ✅ PASS — `active` is correct post-decline state; `extension_declined` auditLog captures event |

---

## Part 4 — Accessibility Check

- [x] All `IssueLoanModal` inputs have associated `<label>` with `htmlFor` attributes
- [x] Error message uses `role="alert"` for screen reader announcement
- [x] "Issue Loan" button in `PawnInbox` has `aria-busy={saving}` on save state
- [x] Minimum 48px hit targets on all interactive elements in modal

---

## Part 5 — Design System Verification

- [x] `IssueLoanModal` uses `var(--space-*)` tokens — zero hardcoded spacing
- [x] `IssueLoanModal` uses `var(--text-*)` tokens — zero hardcoded font sizes
- [x] `IssueLoanModal` uses `var(--color-*)` and `var(--font-*)` — zero hardcoded hex
- [x] Input CSS classes (`input-wrapper`, `input-label`, `input-field`, `input-error`) match design system
- [x] Button CSS classes (`btn`, `btn-primary`, `btn-secondary`) match design system
- [x] No bounce, particle, or constant micro-animations introduced

---

## Part 6 — Gap Verification

| Gap | Status |
|-----|--------|
| Gap 1 — No loan issuance UI | ✅ CLOSED — `IssueLoanModal` + "Issue Loan" button in `PawnInbox` |
| Gap 2 — Unaudited pawnRequest writes | ✅ CLOSED — `updatePawnRequestStatus` CF; `PawnInbox` routes through it |
| Gap 3 — Schema event type drift | ✅ CLOSED — 7 types added to `firestore-schema.md` |
| Gap 4 — `redemptionAmount` not written | ✅ CLOSED — `redeemLoanTicket` CF persists field; admin page computes and passes value |
| Gap 5 — Scheduler item transition missing | ✅ CLOSED — `checkLoanDueDates` transitions linked item to `active` on auto-forfeit |
| Gap 6 — Extension decline status | ✅ DOCUMENTED — `active` is correct; `extension_declined` auditLog is the record |

---

## Sign-Off

**QA PASSED.** Feature: E106 Pawn Loan Lifecycle Gap Remediation. Personas: Staff, Makoonsii, Compliance. Build: clean. Compliance: verified. All 6 gaps resolved. Design system: verified.

Ready for TICKET_CLOSE.

---

*The Pawn Shop · docs/reports/E106_QA_REPORT.md · 2026-06-09*
