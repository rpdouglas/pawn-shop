# Project E03: Auth & Staff Roles

**Status:** Active
**Epic:** E03 — Auth & Staff Roles
**Phase:** Phase 1 — Foundation
**Primary Persona:** Marie (compliance anchor — MFA), Makoonsii (customer UX anchor)
**Secondary Personas:** Kevin (role system unblocks VIP tier), all Staff
**AI Involvement:** Claude (dev only)

**Objective:** Deliver Firebase Auth (email/password + Google SSO), five custom claims with a Cloud Function to assign/revoke them, `AuthContext`, `ProtectedRoute`, mandatory TOTP MFA for all staff, and `auditLogs` events for `login`, `logout`, `role_change`, and `mfa_enrolled` — so that staff routes are role-gated and a staff account without MFA cannot reach customer data.

---

## 1. User Story

> As **staff**, I want to sign in with enforced MFA and have my role (admin / manager / inventory_staff / marketing_staff) determine what I can access, so that customer cannabis and pawn data is protected behind verified identity.

> As **Makoonsii**, I want to browse the Pawn view without creating an account, and if I do sign up, the process is simple, large-target, and plain-language, so that authentication never blocks my access to the store.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Marie (Compliance Anchor)

> *"MFA for staff is non-negotiable. A staff account without MFA that can access customer cannabis purchase data is a compliance failure."*

Test: Sign in as a user with `inventory_staff: true` custom claim but no enrolled MFA factor. Confirm they are redirected to the MFA enrollment page and cannot access any staff route until enrollment is complete.

### Makoonsii Trust Test

- [ ] All touch targets ≥48px on mobile viewport (375px) — applies to login / signup forms
- [ ] All copy uses plain language — "Sign in", "Create account", not jargon
- [ ] No Kanien'kéha in auth UI (not applicable to this epic)
- [ ] Guest browse of `/pawn`, `/cannabis`, `/fireworks` remains possible without account creation

### Marie Discretion Test (staff auth notifications)

- [ ] Any auth-triggered email (Firebase password reset) uses generic sender — no category disclosure
- [ ] No category words in any auth-related notification

### Marcus Photography Test

- Not applicable — no item imagery in auth flows

### Kevin Speed Test

- Not applicable — no inventory alerts in this epic

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — auth itself is not age-gated. Age gates on `/cannabis` and `/fireworks` are E05.
- [ ] **`auditLogs` events required?** YES — four event types:
  - `login` — written on every successful sign-in (uid = actor)
  - `logout` — written on sign-out (uid = actor)
  - `role_change` — written by `assignRole` Cloud Function (uid = admin, targetId = target user)
  - `mfa_enrolled` — written when staff completes TOTP enrollment (uid = actor)
- [ ] **PII exclusion** — `auditLogs.details` may only contain `{ method: 'email'|'google', view: string }` for `login`. No names, emails, phone numbers.
- [ ] **`policeHold` respected** — not directly relevant; auth flows do not query inventory
- [ ] **`aiDescription` draft-only** — not applicable to auth
- [ ] **AI API security** — no AI calls in E03
- [ ] **CASL compliance** — not applicable (no alert sends)
- [ ] **Scarcity integrity** — not applicable

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: users/{uid}
Fields written on first login:
  email, displayName, role, mfaEnrolled, lastLoginAt, lastLoginIp, createdAt
Fields updated on role change:
  role
Fields updated on MFA enrollment:
  mfaEnrolled

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: login, logout, role_change, mfa_enrolled
```

### New Fields Required

NONE — all fields exist in `docs/firestore-schema.md`.

Note: `lastLoginIp` is "Hashed — not plain text" per schema. The hash must be applied server-side (Cloud Function) before writing. Plain-text IP must never reach Firestore.

### TypeScript Interfaces

```typescript
// New interfaces to add to src/lib/types.ts:
// StaffRole, AuthUser, AuditLogEvent
// Uses existing: ViewType
```

### Security Rules Required

Existing rules in `firestore.rules` are already sufficient for E03:
- `auditLogs` — `create` allowed for any signed-in user; `update/delete` blocked → unchanged
- `users/{uid}` — owner can read/create; admin can update role → unchanged
- `isStaff()` / `isAdmin()` helpers already defined
- No new rules required

---

## 5. AI Involvement Detail

### Claude (development):
- `docs/prompts/PLANNING.md`, `docs/prompts/TESTING.md`, `docs/prompts/TICKET_CLOSE.md`
- Guardrail: No Kanien'kéha generation. No PII in any auditLog write.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules

- [x] `docs/firestore-schema.md` — all required fields already present
- [ ] `docs/DECISIONS.md` — log MFA strategy decision (client-gate vs Identity Platform)
- [ ] Firestore rules — existing rules sufficient; verify `auditLogs` create path is callable from Cloud Function service account

### Phase 2 — Cloud Functions

- [ ] `assignRole` — callable. Admin-only. Sets custom claims via Admin SDK. Writes `role_change` to `auditLogs`.
- [ ] `onUserLogin` — callable. Called by client after successful auth. Writes `login` to `auditLogs`. Hashes and writes `lastLoginIp`.
- [ ] `onUserLogout` — callable. Called by client before `signOut()`. Writes `logout` to `auditLogs`.
- [ ] `onMfaEnrolled` — callable. Called by client after TOTP enrollment. Writes `mfa_enrolled` to `auditLogs`. Updates `users/{uid}.mfaEnrolled = true`.

### Phase 3 — UI Components

- [ ] `src/context/AuthContext.tsx` — Firebase Auth state, decoded custom claims, MFA status
- [ ] `src/components/auth/ProtectedRoute.tsx` — role-based route guard + MFA gate
- [ ] `src/pages/auth/LoginPage.tsx` — email/password + Google SSO
- [ ] `src/pages/auth/SignUpPage.tsx` — customer account creation
- [ ] `src/pages/auth/MfaEnrollPage.tsx` — TOTP enrollment for staff (redirect from `ProtectedRoute` if staff + no MFA)
- [ ] Router update in `main.tsx` — add `/login`, `/signup`, `/auth/mfa-enroll` routes
- [ ] All CSS tokens only — no hardcoded hex. Auth pages use base CSS variables (pawn palette as default).
- [ ] Mobile-first — 375px viewport, 48px minimum touch targets on all interactive elements

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Marie compliance smoke test: staff login → MFA gate → cannot bypass → MFA enrollment → access granted
- Makoonsii UX smoke test: guest browse, sign up, plain language, touch targets
- Kevin role smoke test: staff can set `vipFlag` on `users/{uid}` after role assignment
- Compliance: all four `auditLogs` event types verified writing correctly with no PII
- Accessibility: axe-core on login + signup pages

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all applicable items passed
- [ ] Compliance gate: all four auditLog events verified in emulator
- [ ] MFA bypass test: confirmed impossible for staff claims holders without TOTP
- [ ] Guest browse: confirmed — unauthenticated users can access `/pawn`, `/cannabis`, `/fireworks`
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] E03 tasks in `docs/EPICS.md` all ticked
- [ ] `docs/DECISIONS.md` updated with MFA strategy decision
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened

---

*The Pawn Shop · docs/projects/E03_Auth_Staff_Roles.md · v1.0*
