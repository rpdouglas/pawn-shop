# Project E16: Post-Sale Operations

**Status:** Completed
**Epic:** E16 — Post-Sale Operations
**Phase:** Phase 5 from EPICS.md
**Primary Persona:** Makoonsii
**Secondary Personas:** Dale, Kevin, Staff
**AI Involvement:** Claude (dev)

**Objective:** Deliver a streamlined post-sale experience including a return/dispute ticketing system, eBay dispute integration for staff, and automated inventory restock workflows.

---

## 1. User Story

> As **Makoonsii**, I want to **easily report an issue with my purchase using a simple form** so that I can **get a resolution without technical friction or jargon**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

Quote the relevant UX constraint rule(s) from `docs/PERSONAS.md` for Makoonsii:

> *"Interactive elements ≥48px. Plain language. No jargon. Mobile-first (one-thumb usable)."*

Test for it: Open the return form on a mobile emulator (375px). Verify all inputs and buttons are easy to tap with one thumb and the language is clear and respectful.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px)
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Feature is navigable by a low-tech mobile user in under 3 taps

### Dale Trust Test (Secondary)

- [ ] eBay dispute status is visible to staff to ensure Dale's cross-border trust is maintained.

### Kevin Speed Test (Secondary)

- [ ] Restocked items transition to `status: 'active'` immediately so alerts fire for matching saved searches.

---

## 3. Compliance Gate

- [ ] **Age gate required?** No.
- [ ] **`auditLogs` events required?** Yes. `dispute_created`, `dispute_resolved`, `item_restocked`.
- [ ] **PII exclusion** — Confirm no names, emails, phone numbers enter `auditLogs.details`.
- [ ] **`policeHold` respected** — Restocked items check for any existing police hold before going active.
- [ ] **CASL compliance** — Resolution notifications check `alertOptIn: true`.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: disputes/{id}
Fields read: uid, itemId, type, status, description, refundAmount, refundMethod, staffNotes, ebayDisputeId, createdAt, resolvedAt
Fields written: [all of the above]

Collection: items/{id}
Fields read: status, title, price
Fields written: status, updatedAt

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: dispute_created, dispute_resolved, item_restocked
```

### New Fields Required

```
NEW FIELDS (update schema doc first):
- NONE (Fields already defined in docs/firestore-schema.md)
```

### TypeScript Interfaces

List the interfaces from `src/lib/types.ts` this feature uses or extends:
- `Dispute` (to be added if missing)
- `Item`
- `AuditLog`

### Security Rules Required

```javascript
// Allow user to create/read their own disputes
// Allow staff to read/update all disputes
```

---

## 5. AI Involvement Detail

### If Claude (development):
- Use `PLANNING.md`, `TESTING.md`, and `TICKET_CLOSE.md`.
- Ensure the return form is exceptionally simple for the Makoonsii persona.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules
- [ ] `docs/firestore-schema.md` verification
- [ ] `firestore.rules` updated for `disputes` collection

### Phase 2 — UI Components
- [ ] `ReturnRequestForm.tsx`: Customer-facing simple form
- [ ] `DisputeAdminPage.tsx`: Staff view for managing tickets
- [ ] `RestockAction.tsx`: UI trigger for staff to restock an item

### Phase 3 — Cloud Functions
- [ ] `resolveDispute`: Handles status change and optional restock logic
- [ ] `syncEbayDisputes`: (Optional/Stub) Mock or real integration for staff awareness

### Phase 4 — QA
- [ ] Makoonsii "One-Thumb" mobile test
- [ ] Kevin "Instant Restock Alert" test
- [ ] Compliance Audit (PII check)

---

## 7. Definition of Done

- [ ] Persona acceptance criteria passed
- [ ] Compliance gate verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] EPICS.md E16 tasks ticked
- [ ] TICKET_CLOSE.md drift check: clean
- [ ] PR opened

---

*The Pawn Shop · docs/projects/E16_Post_Sale_Operations.md · v1.0*
