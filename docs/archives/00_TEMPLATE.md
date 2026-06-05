# Project [ID]: [Name]

**Status:** Planned | Active | Done
**Epic:** E[##] — [Epic name from EPICS.md]
**Phase:** Phase [N] from EPICS.md
**Primary Persona:** [Makoonsii | Dale | Tanya | Marie | Kevin | Sandra | Jordan | Marcus]
**Secondary Personas:** [list or NONE]
**AI Involvement:** Claude (dev) | Gemini E18 (runtime) | Both | Neither

**Objective:** One precise sentence defining the outcome — what will be true when this project is complete.

---

## 1. User Story

> As **[persona name]**, I want to **[action]** so that I can **[outcome/relief]**.

---

## 2. Persona Acceptance Criteria

These are **pass/fail requirements**, not guidelines. The feature must satisfy every applicable item before it ships.

### Primary Persona Gate

Quote the relevant UX constraint rule(s) from `docs/PERSONAS.md` for the primary persona:

> *"[Exact rule quoted from PERSONAS.md]"*

Test for it: [Describe the specific test that confirms the rule is met]

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px)
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Feature is navigable by a low-tech mobile user in under 3 taps

### Marie Discretion Test (run for any CRM, notification, or cannabis/fireworks feature)

- [ ] All CRM comms use "The Pawn Shop Update" — no category disclosure
- [ ] No cannabis/fireworks words in subject lines, SMS previews, or push notification copy

### Marcus Photography Test (run for any customer-facing item display)

- [ ] Primary item images meet dark luxury standard (macro, dark background, well-lit)
- [ ] No placeholder or poorly lit images in the feature's view

### Kevin Speed Test (run for any alert, notification, or new-listing flow)

- [ ] Alert dispatches within 60 seconds of `status: 'active'`
- [ ] CASL `alertOptIn: true` verified before every send

---

## 3. Compliance Gate

Complete before any code is written. If any item applies, define how it will be handled.

- [ ] **Age gate required?** (cannabis 19+, fireworks 18+) — Enforced at router level, not component level
  - If yes, state which route and how the gate is implemented:
- [ ] **`auditLogs` events required?** — List each `eventType` this feature will write:
- [ ] **PII exclusion** — Confirm no names, emails, phone numbers enter `auditLogs.details`, analytics, or console
- [ ] **`policeHold` respected** — Any inventory query includes `policeHold != true` in public reads
- [ ] **`aiDescription` draft-only** — No code path exposes `aiDescription` to customer-facing views
- [ ] **AI API security** — Any Gemini calls go through Cloud Functions (staff auth check enforced)
- [ ] **CASL compliance** — Any alert or notification checks `alertOptIn: true` before sending
- [ ] **Scarcity integrity** — No algorithmic application of `rare-find`, `limited-edition`, or countdown urgency

---

## 4. Schema & Architecture

### Firestore Collections Impacted

For each collection, list the fields this feature reads or writes. Verify every field exists in `docs/firestore-schema.md` before listing it here.

```
Collection: items/{id}
Fields read: status, title, price, condition, viewTag, policeHold, searchTokens
Fields written: [list or NONE]

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: [list]
```

### New Fields Required

If this project requires a new Firestore field:
1. Update `docs/firestore-schema.md` first
2. Log the addition in `docs/DECISIONS.md`
3. Then list the new fields here

```
NEW FIELDS (update schema doc first):
- Collection / fieldName — type — purpose
```

### TypeScript Interfaces

List the interfaces from `src/lib/types.ts` this feature uses or extends:

```typescript
// Reference the interface, don't redefine it here
// e.g., Item, PawnRequest, Reservation, User, AuditLog
```

### Security Rules Required

List any new or modified Firestore security rules this feature needs:

```javascript
// e.g.:
// Allow public read on items where status == 'active' && policeHold != true
// Block customer write on items.policeHold
```

---

## 5. AI Involvement Detail

### If Claude (development):
- Which `docs/prompts/` files apply to this project? (PLANNING, TESTING, TICKET_CLOSE)
- Any specific Claude guardrails for this feature?

### If Gemini E18 (runtime):
- Which Cloud Function(s) call Gemini?
- Which prompt from `docs/prompts/GEMINI_INITIALIZATION.md` applies?
- Model: Pro | Flash | Cascade
- Staff review gate: confirmed (Gemini output → `aiDescription` only, staff promotes)

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules

- [ ] `docs/firestore-schema.md` updated with any new fields
- [ ] `docs/DECISIONS.md` updated with relevant decisions
- [ ] `firestore.rules` updated
- [ ] `firestore.indexes.json` updated if composite indexes needed

### Phase 2 — Cloud Functions (if applicable)

- [ ] Function name: [name]
- [ ] Trigger: callable | Firestore trigger | scheduled
- [ ] Staff auth check: included
- [ ] `auditLogs` write: included
- [ ] Error handling: defined

### Phase 3 — UI Components

- [ ] Components to create: [list]
- [ ] Components to modify: [list]
- [ ] ViewContext / `.view-*` class: confirmed (no inline JS for theming)
- [ ] CSS tokens only: confirmed (no hardcoded hex)
- [ ] Mobile-first: confirmed (375px viewport tested)

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Primary persona smoke tests: [list which tests apply]
- Compliance verification: [list which items apply]
- Accessibility: axe-core + WCAG AA

---

## 7. Definition of Done

A feature is done when all of these are true:

- [ ] Persona acceptance criteria: all applicable items passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] Relevant `docs/EPICS.md` task(s) ticked
- [ ] `docs/firestore-schema.md` updated (if fields changed)
- [ ] `docs/DECISIONS.md` updated (if decisions made)
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/00_TEMPLATE.md · v1.0*
