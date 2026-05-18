# Project E20: Staff Management & Scheduling

**Status:** Done — 2026-05-18
**Epic:** E20 — Staff Management & Scheduling
**Phase:** Phase 4 — Conversion & Admin Intelligence
**Primary Persona:** Staff (specifically Managers & Admins)
**Secondary Personas:** All Staff (scheduling affects them)
**AI Involvement:** Claude (dev)

**Objective:** Provide a comprehensive internal dashboard to manage staff profiles, set granular permissions via custom claims, and coordinate store coverage through a unified scheduling system.

---

## 1. User Story

> As a **Manager**, I want to **list all employees, adjust their roles, and create shift schedules** so that I can **ensure the store is properly staffed and individuals have the access they need to perform their duties.**

> As a **Staff Member**, I want to **see my upcoming shifts** so that I can **plan my work week accordingly.**

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Managers & Admins

> *"Managers need to be able to see who is on staff, what their roles are, and when they are working. They should be able to update roles with immediate effect (Custom Claims propagation)."*

Test: Log in as a Manager. Navigate to `/admin/staff`. Confirm all staff members are listed. Change a staff member's role and confirm it reflects in the UI and writes to `auditLogs`. Create a shift and confirm it appears on the schedule.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px).
- [ ] All copy uses plain language — no corporate jargon.
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`.
- [ ] Internal-only feature: Customer (Makoonsii) must have NO access to these routes or data.

### Marie Discretion Test (run for any CRM, notification, or cannabis/fireworks feature)

- [ ] Any shift-related SMS or email notifications use generic "The Pawn Shop Update" branding.
- [ ] No disclosure of specific view assignments (e.g., "Cannabis Shift") in mobile push previews.

### Marcus Photography Test

- Not applicable.

### Kevin Speed Test

- Not applicable.

---

## 3. Compliance Gate

- [ ] **Age gate required?** No.
- [ ] **`auditLogs` events required?** — YES:
  - `role_change` (existing)
  - `shift_created`
  - `shift_updated`
  - `shift_deleted`
- [ ] **PII exclusion** — Names/emails in `users/{uid}` are necessary for staff lists, but `auditLogs` must only store `uid` and `targetId`. No PII in `auditLogs.details`.
- [ ] **`policeHold` respected** — N/A.
- [ ] **`aiDescription` draft-only** — N/A.
- [ ] **AI API security** — N/A.
- [ ] **CASL compliance** — Any shift notifications check `alertOptIn: true`.
- [ ] **Scarcity integrity** — N/A.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: users/{uid}
Fields read: email, displayName, role, mfaEnrolled
Fields written: role (via assignRole CF)

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: role_change, shift_created, shift_updated, shift_deleted

Collection: shifts/{id}
Fields: staffUid, startTime, endTime, viewTag, notes, createdAt, updatedAt, createdBy
```

### New Fields Required

```
NEW FIELDS (update schema doc first):
- Collection: shifts — startTime, endTime (timestamp), staffUid (string), viewTag (string), notes (string)
- Collection: users — phoneNumber (string) for shift alerts
```

### TypeScript Interfaces

List the interfaces from `src/lib/types.ts` this feature uses or extends:

```typescript
// AuthUser, User (extends to include phoneNumber), Shift (new)
```

### Security Rules Required

```javascript
// admin/manager only read/write on shifts/
// admin only update on users/{uid}.role (via CF)
```

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `docs/prompts/TESTING.md`, `docs/prompts/TICKET_CLOSE.md` apply.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules

- [ ] Update `docs/firestore-schema.md` with `shifts` collection and `users.phoneNumber`.
- [ ] Log additions in `docs/DECISIONS.md`.
- [ ] Update `firestore.rules` for `shifts`.

### Phase 2 — Cloud Functions

- [ ] Modify `assignRole` (if needed) to handle more granular roles if requested.
- [ ] New `createShift`, `updateShift`, `deleteShift` callables with Admin/Manager auth.

### Phase 3 — UI Components

- [ ] `/admin/staff` - Staff List & Role Management.
- [ ] `/admin/scheduling` - Shift Calendar/Table.
- [ ] `/staff/schedule` - Personal shift view for all staff.

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Staff persona smoke tests: Manager creates shift → Staff sees it.
- Role management: Admin changes role → User's permissions update immediately.

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all items passed.
- [ ] Compliance gate: all items verified.
- [ ] `npm run build` — zero errors.
- [ ] `npm run lint` — zero warnings.
- [ ] `docs/firestore-schema.md` and `docs/DECISIONS.md` updated.
- [ ] PR opened.

---

*The Pawn Shop · docs/projects/E20_Staff_Management_Scheduling.md · v1.0*
