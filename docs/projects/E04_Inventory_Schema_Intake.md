# Project E04: Inventory Schema & Intake

**Status:** Done — 2026-05-17
**Epic:** E04 — Inventory Schema & Intake
**Phase:** Phase 2 — Core Product
**Primary Persona:** Dale (search accuracy determines his speed; searchTokens[] quality is the core E04 deliverable)
**Secondary Personas:** Kevin (alert matching via searchTokens), Marcus (provenanceNotes + merchandisingTags staff-writable), Comp (policeHold immediate hide)
**AI Involvement:** Claude (dev) | Gemini E18 (runtime — E18 only, not E04)

**Objective:** Deliver a complete admin intake flow — receive → condition grade → multi-image upload (server-side watermark) → pricing → publish — with guaranteed searchTokens generation, a hold system with scheduled expiry, and all Firestore security rules verified in the emulator.

---

## 1. User Story

> As **inventory staff**, I want to create and publish items through a structured intake form so that Dale can find them accurately via search, Kevin receives correct alerts, Marcus's photography standard is enforced at upload time, and policeHold hides items from the public immediately on write.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Dale

> *"Price visible without click-through. status: 'sold' removes immediately."*

Test: Item set to `status: 'sold'` in admin → verify it disappears from public item listings within the same Firestore write cycle (no delay, no cache). Price field visible on listing card without requiring a detail-page click.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px) — admin form tested on mobile
- [ ] All intake form labels use plain language — no jargon
- [ ] No Kanien'kéha introduced anywhere in this feature
- [ ] Feature navigable in under 3 taps for a low-tech mobile staff user

### Marie Discretion Test

- [ ] N/A — E04 is admin-only, no CRM or notification copy in this epic

### Marcus Photography Test (run — images are being uploaded)

- [ ] Upload UI enforces the dark luxury standard via guidance copy (staff briefed)
- [ ] No placeholder images allowed to reach `status: 'active'` — intake form requires at least 1 image before publish

### Kevin Speed Test

- [ ] Alert dispatches within 60s of `status: 'active'` (fires from `publishItem` Cloud Function)
- [ ] CASL `alertOptIn: true` verified before every send

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — admin-only route, staff authenticated via ProtectedRoute + MFA
- [ ] **`auditLogs` events required?** Yes:
  - `item_published` — fires on every call to `publishItem` callable function
  - `hold_set` — fires when `setHold` callable sets status='reserved'
  - `hold_expired` — fires when `resetExpiredHolds` scheduled function resets a hold
- [ ] **PII exclusion** — auditLogs.details contains only `{ itemId, fromStatus, toStatus }` — no staff name, email, or phone
- [ ] **`policeHold` respected** — public read rule `status == 'active' && policeHold != true` already enforced; verified in emulator before close
- [ ] **`aiDescription` draft-only** — E04 does not touch the `items/{id}/internal/ai` subcollection; Gemini integration is E18
- [ ] **AI API security** — E04 does not call any AI API
- [ ] **CASL compliance** — Kevin alert checks `alertOptIn: true` before send (in publishItem function)
- [ ] **Scarcity integrity** — `merchandisingTags[]` is staff-set only via admin form; no algorithmic application of `rare-find` or `limited-edition`

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read:  status, title, category, viewTag, policeHold, searchTokens, images
Fields written: title, description, category, viewTag, viewTags, status (draft→active),
                price, condition, images, searchTokens, serialNumber, holdExpiresAt,
                merchandisingTags, provenanceNotes, isSeasonalItem,
                createdAt, updatedAt, publishedBy

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: item_published, hold_set, hold_expired
```

### New Fields Required

Schema updated prior to this spec:

```
UPDATED FIELD:
- items/{id} / status — adds 'draft' value
  docs/firestore-schema.md updated 2026-05-17
  docs/DECISIONS.md logged 2026-05-17
```

No other new fields. All fields referenced above exist in `docs/firestore-schema.md`.

### TypeScript Interfaces

```typescript
// Uses and extends: Item (will be created in E04), AuthUser (src/lib/types.ts)
// ItemStatus will add 'draft': 'draft' | 'active' | 'reserved' | 'sold' | 'archived'
// ConditionGrade — exists: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
```

### Security Rules Required

```javascript
// Existing rule is sufficient for public read (draft items excluded):
// allow read: if resource.data.status == 'active' && resource.data.policeHold != true;

// Staff write rule — must allow creating draft items and updating all fields except:
// policeHold — admin-only write (existing rule, already in firestore.rules)
// serialBlacklistFlag — admin-only write (existing rule)
// publishedBy — set by Cloud Function only (add to rules)
```

---

## 5. AI Involvement Detail

### Claude (development):
- `docs/prompts/PLANNING.md` — this document
- `docs/prompts/TESTING.md` — QA phase
- `docs/prompts/TICKET_CLOSE.md` — close phase

### Gemini E18 (runtime):
- Not involved in E04. Gemini generates `aiDescription` — that is E18, not E04.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules

- [ ] `docs/firestore-schema.md` updated — `'draft'` added to `items/{id}.status`
- [ ] `docs/DECISIONS.md` updated — 'draft' status logged
- [ ] `src/lib/types.ts` — `ItemStatus` updated to add `'draft'`
- [ ] `firestore.rules` — staff can write draft items; `publishedBy` set only by Cloud Function

### Phase 2 — Cloud Functions

- [ ] `processImageUpload` — trigger: `onObjectFinalized` (Storage); watermarks image, writes final URL to `items/{id}.images[]`, deletes temp original
- [ ] `publishItem` — trigger: callable; validates required fields, generates `searchTokens[]`, sets status='active', sets `publishedBy`, writes `item_published` auditLog, fires Kevin alert if `savedSearches` match
- [ ] `setHold` — trigger: callable; sets status='reserved' + holdExpiresAt (+48h), writes `hold_set` auditLog
- [ ] `resetExpiredHolds` — trigger: scheduled every 30 min; queries `status=='reserved' && holdExpiresAt < now`, resets to 'active', writes `hold_expired` auditLog per item

### Phase 3 — UI Components

- [ ] Components to create: `IntakeForm`, `ImageUploadZone`, `ConditionSelector`, `MerchandisingTagSelector`, `QRLabel`
- [ ] Components to modify: NONE (E04 is new admin UI)
- [ ] ViewContext / `.view-*` class: admin view — will use `.view-pawn` as default admin theme
- [ ] CSS tokens only: confirmed
- [ ] Mobile-first: confirmed (375px — staff use mobile on shop floor)

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Persona smoke tests: Dale speed test, Kevin alert test, Marcus upload test
- Compliance verification: policeHold emulator test, auditLogs write verification, CASL check
- Accessibility: axe-core, 48px touch targets on form fields

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: Dale, Kevin, Marcus, Makoonsii gates all passed
- [ ] Compliance gate: all items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] E04 tasks in `docs/EPICS.md` all ticked
- [ ] `docs/firestore-schema.md` current (done — 'draft' added)
- [ ] `docs/DECISIONS.md` current (done — 'draft' logged)
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description from TICKET_CLOSE Phase 4

---

*The Pawn Shop · docs/projects/E04_Inventory_Schema_Intake.md · v1.0*
