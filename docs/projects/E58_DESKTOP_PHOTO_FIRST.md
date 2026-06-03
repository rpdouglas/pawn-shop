# Project E58: Align Desktop Intake with Mobile (Photo-First)

**Status:** Done — 2026-06-03
**Epic:** E57 — AI Inventory Intake
**Phase:** Phase 4
**Primary Persona:** Staff / Admin
**Secondary Personas:** NONE
**AI Involvement:** Gemini E18 (runtime)

**Objective:** Align the desktop intake form (`IntakeForm.tsx`) with the photo-first mobile flow, allowing staff to drag-and-drop a photo as the *first* step to instantly trigger background draft creation and AI extraction, eliminating the manual entry bottleneck.

---

## 1. User Story

> As **Staff / Admin**, I want to **drag and drop a photo into the desktop intake form as the first step** so that I can **instantly trigger AI data extraction without manually typing a title or category to unlock the upload zone**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

> *"Staff workflows must prioritize speed and reduce redundant data entry."*

Test for it: A staff member can open the new item page, immediately select a view, drop an image, and have the AI populate the form without being forced to type a title first.

### Makoonsii Trust Test (always run)

- [x] All copy uses plain language — no jargon, no retail buzzwords
- [x] No Kanien'kéha without `indigenousLanguageReviewed: true`

---

## 3. Compliance Gate

- [x] **Age gate required?** No.
- [x] **`auditLogs` events required?** `item_draft_created`, `ai_description_generated` (handled by existing Cloud Functions)
- [x] **PII exclusion** — Confirmed.
- [x] **`policeHold` respected** — Handled by existing data model.
- [x] **`aiDescription` draft-only** — Confirmed.
- [x] **AI API security** — Goes through existing `processUploadedImage` Cloud Function.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read: status, title, price, condition, viewTag, policeHold, searchTokens
Fields written: images, title, category, description, condition (auto-populated by AI)
```

### New Fields Required

None required. Relying on existing schema.

### TypeScript Interfaces

```typescript
// Uses existing interfaces: Item, ViewType
```

### Security Rules Required

None required. Uses existing `items` rules.

---

## 5. AI Involvement Detail

### If Gemini E18 (runtime):
- Which Cloud Function(s) call Gemini? `processUploadedImage` -> `extractIntakeData`
- Model: Pro
- Staff review gate: confirmed (Populates the form state only. Staff must review and click "Publish Item").

---

## 6. Implementation Phases

### Phase 1 — Component Refactoring (`IntakeForm.tsx`)

- [x] Components to modify: `src/components/admin/IntakeForm.tsx`
- [x] Move the `ImageUploadZone` to the top of the form.
- [x] Remove the validation block that requires `title` and `category` before enabling upload.
- [x] Automatically call `createDraftItemFn` behind the scenes if `itemId` is missing when an image is dropped, then proceed with the upload.
- [x] Add a loading overlay or indicator ("✨ AI Extracting...") over the form fields while `images.length === 0` and upload is in progress.
- [x] Ensure the `onSnapshot` listener safely overwrites `title` and `category` if they were left blank by the user.

### Phase 2 — QA

Run `docs/prompts/TESTING.md` with:
- Primary persona smoke tests: Verify staff can drag and drop immediately. Verify AI populates fields. Verify publishing works.

---

## 7. Definition of Done

- [x] Persona acceptance criteria: all applicable items passed
- [x] Compliance gate: all applicable items verified
- [x] `npm run build` — zero errors
- [x] `npm run lint` — zero warnings
- [x] PR opened with description generated from `TICKET_CLOSE.md` Phase 4
