# Project E10: Analytics, Feature Flags & Admin Dashboard

**Status:** Done — 2026-05-18
**Epic:** E10 — Analytics, Feature Flags & Admin Dashboard
**Phase:** Phase 3 — Customer Features
**Primary Persona:** Staff (internal — admin, manager, inventory_staff)
**Secondary Personas:** Jordan (PWA quality), Dale (benefits from better-informed staff pricing), Kevin (policeHold hides items from public)
**AI Involvement:** Claude (dev) only

**Objective:** Instrument all three storefronts with PII-free GA4 custom events, expose three Firebase Remote Config feature flags, deliver an admin dashboard with live inventory counts by status and view, and provide admin-only `policeHold` flag management.

---

## 1. User Story

> As **a staff member**, I want to see real-time inventory counts and top items in the admin dashboard, toggle feature flags without a deploy, and set or clear policeHold on any item, so that I can make informed operational decisions and respond immediately to compliance situations.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Staff

> Staff must be able to set `policeHold: true` on any item and have it disappear from all public views within one Firestore write propagation cycle (typically < 2 seconds). Admin dashboard must load inventory counts without a page refresh.

- [ ] `setPoliceHold` callable CF enforces `admin` custom claim — no other role can call it
- [ ] Setting `policeHold: true` removes item from all public queries immediately
- [ ] Dashboard inventory counts are live (onSnapshot or short-interval polling)
- [ ] Remote Config flag changes reflect in the UI within 60 seconds (minimum fetch interval respected)

### Makoonsii Trust Test (always run)

- [x] No Makoonsii-facing UI changes in this epic — admin-only
- [x] No Kanien'kéha content introduced
- [x] policeHold hides items from Makoonsii's browse session immediately on next Firestore read

### Marie Discretion Test

- [x] No CRM or notification features in this epic
- [x] GA4 events exclude all cannabis category identifiers from user-scoped parameters

### Marcus Photography Test

- [x] No new item display surfaces introduced

### Kevin Speed Test

- [x] No alert or notification flows in this epic
- [x] `policeHold: true` prevents policeHold items from appearing in Kevin's saved-search alerts

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — admin panel is staff-only, behind `ProtectedRoute` with `admin`/`manager` claim. No age gate needed.
- [ ] **`auditLogs` events required?** Yes — `police_hold_set` (already defined in schema). GA4 events do NOT write to auditLogs.
- [ ] **PII exclusion** — All GA4 event parameters must exclude: names, emails, phone numbers, Firestore UIDs, device identifiers. Item IDs (Firestore document IDs) are pseudonymous and permitted.
- [ ] **`policeHold` respected** — `setPoliceHold` CF is the only write path; all public item queries already include `policeHold != true` (or will be verified during QA).
- [ ] **`aiDescription` draft-only** — not touched in this epic.
- [ ] **AI API security** — no AI API calls in this epic.
- [ ] **CASL compliance** — no notifications in this epic.
- [ ] **Scarcity integrity** — no merchandising tags in this epic.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read:  status, viewTag, policeHold, title, price, trendingScore
Fields written: policeHold (admin-only, via setPoliceHold CF)

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: police_hold_set

Collection: pawnRequests/{id}
Fields read: status, createdAt (dashboard volume count — count query only)
```

### New Fields Required

```
NEW FIELDS: NONE
All fields exist in docs/firestore-schema.md.
```

### TypeScript Interfaces

```typescript
// Item — existing interface; policeHold: boolean already defined
// AuditLog — existing interface; police_hold_set already in eventType union
```

### Security Rules Required

```javascript
// setPoliceHold callable CF enforces admin claim server-side
// No new Firestore security rule changes required
// items policeHold field is already write-blocked on the client
```

---

## 5. AI Involvement Detail

### Claude (development)

- Applies: PLANNING.md, TESTING.md, TICKET_CLOSE.md
- Guardrails: GA4 event parameters must be reviewed for PII before implementation. No UID, email, or phone number may enter any analytics event.

---

## 6. Implementation Phases

### Phase 1 — Firebase SDK Extensions

- [ ] `src/lib/firebase.ts` — add `analytics` export (`getAnalytics`, `setAnalyticsCollectionEnabled`)
- [ ] `src/lib/firebase.ts` — add `remoteConfig` export (`getRemoteConfig`)
- [ ] `.env.local` / Codespaces Secrets — `VITE_FIREBASE_MEASUREMENT_ID` added
- [ ] `src/lib/analytics.ts` — typed event helper (no PII; wraps `logEvent`)
- [ ] `src/lib/featureFlags.ts` — Remote Config hook with 60-second minimum fetch interval

### Phase 2 — Cloud Functions

- [ ] `setPoliceHold` callable CF in `functions/src/inventory.ts`
  - Trigger: callable
  - Auth check: `admin` custom claim required
  - Writes: `items/{id}.policeHold`, `auditLogs/{id}` with `eventType: 'police_hold_set'`
  - Export added to `functions/src/index.ts`

### Phase 3 — GA4 Event Instrumentation

- [ ] Page view per view: fires on route mount (`/pawn`, `/cannabis`, `/fireworks`)
- [ ] Item view: fires when `ItemQuickView` opens — `{ item_id, view, category }`
- [ ] Enquiry submit: fires on `createReservation` success — `{ view, category }`
- [ ] Age-gate events: fires on pass/fail — `{ view, result: 'pass' | 'fail' }`
- [ ] Pawn form submit: fires on `submitPawnRequest` success — `{ view: 'pawn' }`

### Phase 4 — Remote Config Feature Flags

- [ ] `featureFlags.ts` hook fetches and activates Remote Config on mount
- [ ] Three flags defined: `show_staff_picks` (boolean), `show_related_items` (boolean), `pawn_form_enabled` (boolean)
- [ ] Flags consumed in `PawnPage.tsx` / `StaffPicksSection.tsx` / `RelatedItems.tsx`

### Phase 5 — Admin Dashboard UI

- [ ] `DashboardPage.tsx` at `/admin/dashboard`
- [ ] Route added in `main.tsx` (ProtectedRoute, admin/manager only)
- [ ] Inventory count cards: Active, Sold, Pending — by view (Pawn / Cannabis / Fireworks)
- [ ] Pawn request volume: last 7 days count (count query on `pawnRequests`)
- [ ] Top items by `trendingScore` (top 5, ordered descending)
- [ ] `PoliceHoldManager` component — item search, toggle button, confirmation dialog

### Phase 6 — QA

Run `docs/prompts/TESTING.md`:
- Staff persona smoke tests: dashboard loads, policeHold toggle works, item disappears from public view
- Compliance verification: PII audit on all GA4 event params, auditLog written on policeHold set
- Accessibility: admin UI touch targets, keyboard navigation in PoliceHoldManager

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all applicable items passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] Relevant `docs/EPICS.md` task(s) ticked
- [ ] `docs/DECISIONS.md` updated with: GA4 PII exclusion rationale, Remote Config flag naming, policeHold CF design
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/E10_Analytics_Feature_Flags_Admin_Dashboard.md · created 2026-05-18*
