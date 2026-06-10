# Decision 0016 — TanStack Query `enabled` Guard Pattern for Staff-Only Queries (Hotfix)

**Date:** 2026-06-10
**Epic:** FIX_LOANS_PERMISSIONS · Admin Loans Page — Missing or Insufficient Permissions
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

`useAllLoanTickets` in `src/lib/useLoanTickets.ts` performed an unbounded Firestore collection read on `loanTickets` with no `enabled` guard. TanStack Query fires `queryFn` immediately on component mount. If the Firebase ID token has not yet been fetched or does not carry the expected staff custom claims (`admin`, `manager`, `inventory_staff`, `marketing_staff`), Firestore evaluates `isStaff()` as false and rejects the collection read with `PERMISSION_DENIED`.

The sister hook `useCustomerLoanTickets` already had `enabled: !!user?.uid` — the staff variant was inconsistently left ungated.

Three remediation options were considered:

- **A: `enabled: !!user?.isStaff`** — gate the query on the auth context confirming staff claims are present before the Firestore request is issued.
- **B: Wrap `LoanTicketsAdminPage` in `ProtectedRoute staffOnly`** — block rendering entirely until auth resolves, so the hook never mounts for non-staff or pre-auth states.
- **C: Catch the error in `queryFn` and return `[]`** — swallow the permission error silently.

---

## Decision

**Option A: `enabled: !!user?.isStaff`** on `useAllLoanTickets`.

---

## Rationale

1. **Fixes the race, not the symptom.** The root cause is that the Firestore request races ahead of auth. Gating with `enabled` ensures the request is not issued until `AuthContext` has resolved the user and confirmed staff claims are present in the ID token.

2. **Consistent with the existing pattern.** `useCustomerLoanTickets` already uses `enabled: !!user?.uid`. Matching the pattern keeps the hook pair symmetrical.

3. **Minimal blast radius.** One line change, no component restructuring, no ProtectedRoute refactor needed across the admin layout.

4. **Option B is broader than needed.** `AdminLayout` guards rendering through `AcknowledgmentWall` but a full `ProtectedRoute staffOnly` refactor of every admin page is a separate concern tracked in the backlog.

5. **Option C is wrong.** Silently returning `[]` masks the error and hides any legitimate permission failures. The table would appear empty with no indication that data couldn't be loaded.

---

## Applied Pattern

Any TanStack Query hook that performs a Firestore collection read restricted to `isStaff()` in security rules **must** include `enabled: !!user?.isStaff`. Any hook restricted to `isOwner()` **must** include `enabled: !!user?.uid` and a matching `where('uid', '==', user.uid)` filter clause.

---

## Files Changed

- `src/lib/useLoanTickets.ts` — added `const { user } = useAuth()` and `enabled: !!user?.isStaff` to `useAllLoanTickets`

---

*The Pawn Shop · docs/decisions/0016-tanstack-query-enabled-staff-guard.md · 2026-06-10*
