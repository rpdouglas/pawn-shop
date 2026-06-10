# QA Report — FIX · Loans Permissions (Admin Loans Page PERMISSION_DENIED)
**Date:** 2026-06-10 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — `built in 2.76s` |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` type casts introduced | ✅ PASS — single `enabled` flag addition only |
| No unused imports/variables | ✅ PASS |
| No new dependencies added | ✅ PASS |

---

## Part 2 — Root Cause Verification

| Check | Result |
|-------|--------|
| Root cause identified: `useAllLoanTickets` fired before `isStaff()` was confirmed in auth token | ✅ CONFIRMED |
| Fix: `enabled: !!user?.isStaff` defers query until auth resolves | ✅ CONFIRMED |
| Sister hook `useCustomerLoanTickets` already had equivalent `enabled: !!user?.uid` guard | ✅ CONFIRMED — pattern is now consistent |
| Firestore rules for `loanTickets` are correct — no rule change required | ✅ CONFIRMED |

---

## Part 3 — Persona Smoke Tests

### Staff (Primary)
- [x] `/admin/loans/` loads without error when signed in as a staff user with confirmed claims
- [x] Loan table renders all active tickets
- [x] Extension Review modal opens and submits correctly
- [x] Redeem modal displays correct redemption amount and confirms
- [x] Forfeit modal warns and confirms, updates ticket status
- [x] Page shows loading state (TanStack Query `isLoading: true`) while auth resolves — no flash of error

### Non-staff / pre-auth state
- [x] Query remains disabled (`enabled: false`) until `user?.isStaff` is truthy — no premature Firestore request
- [x] No PERMISSION_DENIED error surfaced to the UI during auth resolution window

---

## Part 4 — Compliance Audit

| Item | Status |
|------|--------|
| No new Firestore collections introduced | ✅ PASS |
| No Firestore rule changes | ✅ PASS — existing `isStaff()` rule is correct and sufficient |
| No PII exposed by fix | ✅ PASS — fix is purely a timing guard |
| `auditLogs` unaffected | ✅ PASS |
| All loan status mutations still routed through Cloud Functions (Admin SDK) | ✅ PASS — unchanged |

---

## Part 5 — Design System Verification

- [x] No UI components modified — fix is entirely in the data hook
- [x] No hardcoded hex, px, or ms values introduced
- [x] No motion or animation changes

---

## Sign-Off

**QA PASSED.** Fix: FIX_LOANS_PERMISSIONS. Persona: Staff. Build: clean. Root cause: confirmed and resolved. Compliance: verified. Decision 0016 logged.

Ready for TICKET_CLOSE.

---

*The Pawn Shop · docs/reports/FIX_LOANS_PERMISSIONS_QA_REPORT.md · 2026-06-10*
