# FIX · Loans Permissions — Admin Loans Page PERMISSION_DENIED

**Status:** ✅ CLOSED — 2026-06-10
**Type:** Hotfix
**Cycle:** 32
**Personas served:** Staff (admin / manager / inventory_staff)

---

## Problem

Navigating to `/admin/loans/` produced a hard error displayed in the UI:

```
Error: Missing or insufficient permissions.
```

The page was unusable — no loan tickets were displayed and no actions could be taken.

---

## Root Cause

`useAllLoanTickets` in `src/lib/useLoanTickets.ts` had no `enabled` guard. TanStack Query fires `queryFn` immediately on component mount, before the Firebase auth token carrying staff custom claims has been confirmed by `AuthContext`. Firestore evaluated `isStaff()` as false for the race-condition request and rejected the unbounded collection read with `PERMISSION_DENIED`.

The sister hook `useCustomerLoanTickets` already had `enabled: !!user?.uid` — the staff variant was inconsistently ungated.

---

## Fix Applied

Added `const { user } = useAuth()` and `enabled: !!user?.isStaff` to `useAllLoanTickets`. The Firestore request is now deferred until `AuthContext` has resolved and confirmed the user holds at least one staff custom claim.

Decision logged at `docs/decisions/0016-tanstack-query-enabled-staff-guard.md`.

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (tsc + Vite) | ✅ PASS — `built in 2.76s` |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 |
| No new Firestore fields | ✅ PASS — schema unchanged |
| No new dependencies | ✅ PASS |
| No Firestore rules changes | ✅ PASS — existing `isStaff()` rule is correct |

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/useLoanTickets.ts` | Added `useAuth()` call and `enabled: !!user?.isStaff` to `useAllLoanTickets` |
| `docs/decisions/0016-tanstack-query-enabled-staff-guard.md` | New |

---

*The Pawn Shop · docs/projects/FIX_LOANS_PERMISSIONS.md · 2026-06-10*
