# Project E07: Pawn Form & Inbox

**Status:** Active
**Epic:** E07 — Pawn Form & Inbox
**Phase:** Phase 2 — Core Product
**Primary Persona:** Makoonsii (The Reserve Regular)
**Secondary Personas:** Dale (deal integrity), Staff (admin inbox)
**AI Involvement:** Claude (dev only) — no Gemini runtime component

**Objective:** Deliver a one-handed mobile-friendly pawn enquiry form on the Pawn view, a server-side serial blacklist check via Cloud Function (blocking before document write), and a staff admin inbox for reviewing, quoting, and tracking pawn requests.

---

## 1. User Story

> As **Makoonsii**, I want to submit a pawn enquiry with photos and a description of my item so that I can get a quote from The Pawn Shop without having to walk in first.

> As **staff**, I want to see all incoming pawn requests in a single inbox, with blacklist-flagged requests clearly marked, so that I can review and respond without switching between tools.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Makoonsii

> *"Touch targets minimum 48px. Navigation maximum 2 levels deep from homepage to product detail."*

Test for it: The pawn form must be reachable from the Pawn homepage in ≤2 taps, all interactive form elements (inputs, buttons, file upload zone) must have a minimum touch target of 48px, and the form must be completable one-handed in portrait mode at 375px viewport.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px)
- [ ] All copy uses plain language — no jargon ("serialNumber" becomes "Item Serial / Model Number (if known)")
- [ ] No Kanien'kéha in this feature
- [ ] Form is reachable in ≤2 taps from Pawn homepage, submittable in ≤5 form fields visible at once

### Marie Discretion Test

Not applicable — pawn view, no cannabis/fireworks CRM.

### Marcus Photography Test

Not applicable — this form surfaces customer-provided images, not store inventory photography. Customer upload images are stored but not displayed publicly.

### Kevin Speed Test

Not applicable — no inventory alert dispatched by this feature.

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — Pawn view has no age gate.
- [ ] **`auditLogs` events required?** Yes — `pawn_request_submit` on every form submission; `serial_blacklist_hit` when a serial number matches.
- [ ] **PII exclusion** — `auditLogs.details` must never include name, email, or phone. Details contain only `{requestId, viewTag}` for submit and `{requestId, serialNumber}` for blacklist hit (serialNumber is item data, not PII).
- [ ] **`policeHold` respected** — not applicable to this form; policeHold is an inventory concept. pawnRequests is a separate collection.
- [ ] **`aiDescription` draft-only** — not applicable to this feature.
- [ ] **AI API security** — no AI API calls in this feature.
- [ ] **CASL compliance** — no outbound alerts to customers in this feature. Admin alert is internal staff notification only.
- [ ] **Scarcity integrity** — not applicable.
- [ ] **Serial blacklist check is non-optional** — every pawn request submission MUST trigger the blacklist check. The `serialBlacklistHit` field must be set before the document is readable by staff. A submission without a serial number sets `serialBlacklistHit: false` (no match possible — log accordingly).

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: pawnRequests/{id}
Fields written: uid, name, email, phone, itemDescription, serialNumber,
                images, status, serialBlacklistHit, createdAt
Fields read (admin inbox): all fields except staffNotes (read separately)
Fields updated (staff): status, staffNotes

Collection: serialBlacklist/{id}
Fields read: serialNumber (query match only)

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: pawn_request_submit, serial_blacklist_hit
```

### New Fields Required

None — `pawnRequests/{id}` is fully defined in `docs/firestore-schema.md`.
New event types `pawn_request_submit` and `serial_blacklist_hit` added to `auditLogs.eventType` notes — schema updated 2026-05-17.

### TypeScript Interfaces

```typescript
// New interfaces to add to src/lib/types.ts:
// PawnRequest, PawnRequestStatus
// Existing: AuthUser, AuditLog
```

### Security Rules Required

```javascript
// pawnRequests/{id}:
//   Allow create: always false on client (callable CF writes via Admin SDK)
//   Allow read: if isStaff() (admin, manager, inventory_staff)
//   Allow update: if isStaff() — status and staffNotes fields only
//   Allow delete: never

// Firebase Storage pawnRequests/{requestId}/images/*:
//   Allow write: if request.auth != null (authenticated customers only)
//                OR if request.auth == null (guest upload — evaluate per strategy)
//   Allow read: if isStaff()
```

---

## 5. AI Involvement Detail

### Claude (development):
- PLANNING.md, TESTING.md, TICKET_CLOSE.md apply.
- No Gemini runtime calls — this feature is pure form + Cloud Function + admin UI.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules

- [x] `docs/firestore-schema.md` — new auditLogs event types added
- [x] `docs/DECISIONS.md` — event type decision logged
- [ ] `firestore.rules` — add pawnRequests read/write rules
- [ ] `src/lib/types.ts` — add PawnRequest and PawnRequestStatus types

### Phase 2 — Cloud Functions

- [ ] `submitPawnRequest` callable CF
  - Trigger: callable (HTTPS)
  - Auth: any authenticated user or guest (uid may be null)
  - Logic: validate → check serialBlacklist → write pawnRequest → write auditLogs → alert if hit
  - `auditLogs` write: pawn_request_submit + conditional serial_blacklist_hit
  - Admin alert on blacklist hit: email via SendGrid (or console.error fallback for MVP)

### Phase 3 — UI Components

- [ ] `PawnEnquiryForm` — customer-facing form component
  - Fields: name, email, phone (optional), itemDescription, serialNumber (optional), image upload
  - Mobile-first, 375px viewport, 48px touch targets, plain-language labels
  - Calls `submitPawnRequest` CF on submit
- [ ] Route at `/pawn/sell` — age-gate-free, pawn view themed
- [ ] `PawnInbox` admin component — staff list view at `/admin/pawn-inbox`
  - List all requests sorted by createdAt desc, status badge, blacklist flag indicator
  - Click to expand: view all fields, update status, add staffNotes
- [ ] Admin route at `/admin/pawn-inbox` — behind ProtectedRoute (staff only)

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Makoonsii smoke tests: mobile form completion at 375px, touch target audit
- Compliance: auditLogs written correctly (no PII in details), serialBlacklistHit set on all submissions
- Staff inbox: status updates persist, blacklist-flagged requests are clearly marked

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all applicable items passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] E07 tasks ticked in `docs/EPICS.md`
- [ ] `docs/firestore-schema.md` confirmed current (already updated)
- [ ] `docs/DECISIONS.md` confirmed current (already updated)
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/E07_Pawn_Form_Inbox.md · v1.0*
