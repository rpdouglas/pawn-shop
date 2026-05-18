# Project E09: Quality, Security & Accessibility

**Status:** Done — 2026-05-18 (deferred: Lighthouse ≥90 score — requires deployed URL + browser, target: before E13 ships to dev)
**Epic:** E09 — Quality, Security & Accessibility
**Phase:** Phase 3 — Discovery & Merchandising
**Primary Persona:** Makoonsii — The Reserve Regular
**Secondary Personas:** Jordan + Marcus (Lighthouse ≥90 quality bar), Marie (PIPEDA data retention), All Staff (serial blacklist management)
**AI Involvement:** Claude (dev) only — no Gemini runtime involvement

**Objective:** Harden the platform's security posture (Firestore rules audit + targeted fixes), satisfy PIPEDA data retention obligations via a scheduled purge Cloud Function, deliver a serial blacklist admin management UI, ship an accessible `/accessibility` statement page, and verify axe-core clean + keyboard navigability across all three views — establishing the minimum accessibility floor before any further customer-facing epics ship.

---

## 1. User Story

> As **Makoonsii**, I want every page I visit to be navigable by keyboard, readable by screen reader, and built with touch targets large enough for my hands — so that the platform feels like it was made for me, not just made to look like it was.

> As **the compliance team**, I want personal data in terminal-status records to be automatically purged on a documented retention schedule — so that The Pawn Shop meets PIPEDA obligations without manual intervention.

> As **admin staff**, I want a UI for managing the serial blacklist — so that flagged serial numbers can be added, reviewed, and removed without direct Firestore console access.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Makoonsii

> *"Touch targets minimum 48px. Text minimum 16px body, high contrast."*
> *"Navigation maximum 2 levels deep from homepage to product detail."*
> *"No Kanien'kéha copy that has not passed community review — ever."*

Test: Run axe-core in browser DevTools on `/pawn`, `/cannabis`, and `/fireworks`. Zero failures. Keyboard-tab through all interactive elements in each view; confirm focus is always visible. Confirm no Kanien'kéha string exists in any source file without `indigenousLanguageReviewed: true` linkage.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px)
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] `/accessibility` page reachable in ≤2 taps from the Pawn homepage footer

### Marie Discretion Test

- N/A — E09 introduces no CRM or notification features

### Marcus Photography Test

- N/A — E09 introduces no new customer-facing item display

### Kevin Speed Test

- N/A — E09 introduces no alert or notification flow

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — E09 adds no new age-gated routes. Existing gates (`/cannabis` 19+, `/fireworks` 18+) are audited but not changed in structure.
- [ ] **`auditLogs` events required?**
  - `serial_blacklist_add` — when admin adds a serial number
  - `serial_blacklist_remove` — when admin removes a serial number
  - `data_purged` — when `purgeExpiredData` CF deletes records; details: `{ collection, recordsDeleted: number, retentionDays: number }` — no PII
- [ ] **PII exclusion** — `purgeExpiredData` logs counts only; `serialBlacklist` audit log contains only the serial number string (not customer-linked PII)
- [ ] **`policeHold` respected** — Firestore rules audit will verify `policeHold != true` is present in all public item reads
- [ ] **`aiDescription` draft-only** — security audit will verify no public read path reaches `items/{id}/internal/*`
- [ ] **AI API security** — N/A (no AI calls in E09)
- [ ] **CASL compliance** — N/A (no CRM sends in E09)
- [ ] **Scarcity integrity** — Firestore rules audit will verify `rare-find`/`limited-edition` writes are blocked for non-staff

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: serialBlacklist/{id}
Fields read:  serialNumber, reason, addedBy, createdAt
Fields written: serialNumber, reason, addedBy, createdAt  [admin only]
Note: hard-delete via CF (Admin SDK) — no soft-delete field needed at this stage

Collection: pawnRequests/{id}
Fields read:  status, createdAt   [purge eligibility check only]
Fields written: NONE from E09 — CF deletes the document

Collection: reservations/{id}
Fields read:  status, createdAt   [purge eligibility check only]
Fields written: NONE from E09 — CF deletes the document

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: serial_blacklist_add, serial_blacklist_remove, data_purged
```

**PIPEDA retention windows (defined in CF environment variables for configurability):**
- `pawnRequests` — purge records with `status` in `['declined', 'completed']` and `createdAt` older than **730 days** (2 years)
- `reservations` — purge records with `status` in `['declined', 'completed']` and `createdAt` older than **730 days** (2 years)
- `auditLogs` — **never purge** (immutable compliance record; no delete rule in Firestore)

### New Fields Required

```
NEW FIELDS (update schema doc first):
- auditLogs / eventType — add approved values: serial_blacklist_add, serial_blacklist_remove, data_purged
```

No structural new fields on any collection. Purge eligibility computed from existing `status` + `createdAt` fields.

### TypeScript Interfaces

```typescript
// No new interfaces required.
// SerialBlacklist UI uses: { id: string, serialNumber: string, reason: string, addedBy: string, createdAt: Date }
// (defined inline — not added to src/lib/types.ts unless a second consumer appears)
```

### Security Rules Audit Scope

All collections audited for:
1. `items/{id}` — public read correctly excludes `policeHold: true` and non-active status
2. `pawnRequests/{id}` — client create blocked; update field-scoped correctly
3. `reservations/{id}` — client create/update blocked; read restricted to staff or owner
4. `config/{docId}` — write blocked client-side; read requires sign-in
5. `users/{uid}` — sensitive field write correctly blocked for non-admin
6. `auditLogs/{id}` — `allow create: if isSignedIn()` — **flag**: currently allows client creates; should be `false` since all auditLog writes go through CF Admin SDK. Needs tightening.
7. `savedSearches/{id}` — **flag**: `allow read, write: if isOwner(resource.data.uid)` — `resource.data` is null on create; creates will be denied incorrectly. Needs `allow create: if isOwner(request.resource.data.uid)`.
8. `campaigns/{id}` — `allow write: if isStaff()` — marketing decisions require review; consider restricting to `admin` or `manager` only.
9. `serialBlacklist/{id}` — read by staff, write by admin — verify correct.
10. `articles/{id}` — `indigenousLanguageReviewed` enforcement — verify publish rule.
11. `disputes/{id}` — open create, correct.
12. `preorders/{id}` — open create for signed-in users — flag for review in E09 audit.
13. Catch-all `/{document=**}` — verify deny-all is last and unreachable collections are blocked.

---

## 5. AI Involvement Detail

### Claude (development):
- Applies: PLANNING.md, TESTING.md, TICKET_CLOSE.md
- Guardrails: Do not generate Kanien'kéha during the codebase scan. Flag any occurrences found and stop.

---

## 6. Implementation Phases

### Phase 1 — Security Rules Audit & Fixes

- [ ] Audit all 13 Firestore rule blocks against the list in §4
- [ ] Fix `auditLogs` create rule: change `if isSignedIn()` → `if false` (all writes via Admin SDK)
- [ ] Fix `savedSearches` create rule: `request.resource.data.uid` on create (not `resource.data.uid`)
- [ ] Review `campaigns` write scope — confirm manager-level is intended, document decision
- [ ] Review `preorders` open create — confirm intended, document decision
- [ ] Update `docs/DECISIONS.md` for each rule change
- [ ] `docs/firestore-schema.md` — add three new `auditLogs` event types

### Phase 2 — `purgeExpiredData` Cloud Function

- [ ] Function name: `purgeExpiredData`
- [ ] Trigger: **scheduled** — Cloud Scheduler, weekly (Sunday 02:00 UTC)
- [ ] Auth: Admin SDK (no staff auth check needed — scheduled CF has no caller)
- [ ] Logic: Query `pawnRequests` and `reservations` for terminal status + age > retention window; batch-delete in groups of 500 (Firestore batch limit)
- [ ] `auditLogs` write: one `data_purged` entry per collection per run — `{ collection, recordsDeleted, retentionDays }` — no PII
- [ ] Retention windows configurable via `process.env['PURGE_RETENTION_DAYS']` (default: 730)
- [ ] Error handling: log errors via `console.error`; partial success acceptable (next run handles remainder)
- [ ] Document retention schedule in `docs/DECISIONS.md` before shipping

### Phase 3 — Serial Blacklist Admin UI

- [ ] Component: `src/components/admin/SerialBlacklistManager.tsx`
- [ ] Page wrapper: `src/pages/admin/SerialBlacklistPage.tsx`
- [ ] Route: `/admin/serial-blacklist` (add to `src/main.tsx`)
- [ ] Features:
  - List all blacklist entries (read via `onSnapshot`, admin/staff)
  - Add new entry form: `serialNumber` + `reason` — calls `addSerialToBlacklist` CF
  - Remove entry: calls `removeSerialFromBlacklist` CF (soft-confirm before delete)
  - Search/filter by serial number (client-side, list is small)
- [ ] Cloud Functions: `addSerialToBlacklist`, `removeSerialFromBlacklist` (admin claim required)
- [ ] Both CFs write `serial_blacklist_add` / `serial_blacklist_remove` to `auditLogs`
- [ ] CSS: `.serial-manager` classes following existing admin inbox pattern
- [ ] File: `functions/src/serialBlacklist.ts` — export both CFs, export from `functions/src/index.ts`

### Phase 4 — Accessibility Page

- [ ] Route: `/accessibility` (add to `src/main.tsx`)
- [ ] Component: `src/pages/AccessibilityPage.tsx`
- [ ] Content:
  - WCAG 2.1 AA conformance statement
  - Contact method for accessibility assistance (phone + email — staff-provided values via env config or hardcoded)
  - Browser and assistive technology recommendations
  - Known limitations (if any found during audit — documented honestly)
  - Link to this page in the Pawn view footer
- [ ] No Firestore reads/writes
- [ ] No new CSS component patterns — use existing `input-label`, `btn` classes

### Phase 5 — Keyboard Navigability & axe-core Audit

- [ ] Audit all three views (`/pawn`, `/cannabis`, `/fireworks`) via keyboard tab navigation
- [ ] Audit admin routes (`/admin/intake`, `/admin/pawn-inbox`, `/admin/reservations`, `/admin/store-hours`)
- [ ] Fix any missing `focus-visible` outlines (add to `index.css` if globally absent)
- [ ] Fix any keyboard traps (modals that don't release focus on Escape)
- [ ] Run axe-core in browser DevTools on each view — resolve all failures before sign-off
- [ ] Kanien'kéha codebase scan — `grep` all source files for any indigenous language strings; document findings; flag any found for community review (do not auto-resolve)

### Phase 6 — QA

Run `docs/prompts/TESTING.md` with:
- Primary persona smoke tests: Makoonsii Trust Test on all three views + admin routes
- Compliance: auditLogs PII check, rules audit findings resolved, PIPEDA retention documented
- Accessibility: axe-core zero failures, keyboard navigability confirmed

---

## 7. Definition of Done

- [ ] Firestore rules audit complete — all flagged gaps resolved or documented with rationale
- [ ] `purgeExpiredData` CF deployed and schedulable — retention schedule in `DECISIONS.md`
- [ ] Serial blacklist admin UI live — add, list, remove via CF; auditLogs entries written
- [ ] `/accessibility` page live and linked from Pawn view footer
- [ ] axe-core: zero failures on `/pawn`, `/cannabis`, `/fireworks`, and all admin routes
- [ ] Keyboard navigability: all interactive elements reachable by Tab; all modals release focus on Escape; focus-visible outline present on all focusable elements
- [ ] Kanien'kéha scan complete — findings documented; no unreviewed indigenous language in shipped code
- [ ] `auditLogs` event types `serial_blacklist_add`, `serial_blacklist_remove`, `data_purged` added to schema
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] EPICS.md tasks ticked
- [ ] `TICKET_CLOSE.md` drift check: clean

---

*The Pawn Shop · docs/projects/E09_Quality_Security_Accessibility.md*
