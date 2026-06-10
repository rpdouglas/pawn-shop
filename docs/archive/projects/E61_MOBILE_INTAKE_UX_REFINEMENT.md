# Project E61: Mobile Intake UX Refinement

**Status:** Done — 2026-06-04
**Epic:** E61 — Mobile Intake UX Refinement
**Phase:** Phase 14
**Primary Persona:** Staff
**Secondary Personas:** None
**AI Involvement:** Gemini E18 (runtime - existing)

**Objective:** Refine the mobile inventory intake flow so that Step 1 is strictly "Photo & View Selection" with an AI loading state, and Step 2 ("Details") surfaces all AI-extracted attributes—including the title—for staff review and editing.

---

## 1. User Story

> As **Staff**, I want to **upload a photo and wait for the AI to extract details, then review all generated fields (including the title) on a single screen** so that I can **avoid re-typing titles and easily edit the AI's suggestions before publishing.**

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

> *"Staff must be able to view all inventory as mobile cards and add a new item — including taking a photo — from a 375px viewport in under 3 taps."*

Test for it: Start the mobile intake flow. The title field should be absent from Step 1. After photo upload, the UI should indicate AI processing, auto-advance to Step 2, and present the AI-suggested Title as an editable field alongside Description and Price.

### Makoonsii Trust Test (always run)

- [x] All touch targets ≥48px on mobile viewport (375px)
- [x] All copy uses plain language — no jargon, no retail buzzwords
- [x] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [x] Feature is navigable by a low-tech mobile user in under 3 taps

---

## 3. Compliance Gate

- [ ] **Age gate required?** — N/A
- [ ] **`auditLogs` events required?** — N/A
- [ ] **PII exclusion** — Confirmed
- [ ] **`policeHold` respected** — N/A
- [ ] **`aiDescription` draft-only** — N/A
- [ ] **AI API security** — N/A
- [ ] **CASL compliance** — N/A
- [ ] **Scarcity integrity** — N/A

---

## 4. Schema & Architecture

### Firestore Collections Impacted

None. This is purely a UI refactor for existing Cloud Functions and Schema.

### New Fields Required

NONE

### TypeScript Interfaces

NONE

### Security Rules Required

NONE

---

## 5. AI Involvement Detail

### If Claude (development):
- `PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md`

### If Gemini E18 (runtime):
- Existing `extractIntakeData` Cloud Function is utilized.

---

## 6. Implementation Phases

### Phase 1 — UI Refactor (MobileIntakePage.tsx)

- [ ] Remove the `title` input field from the `capture` step (Step 1).
- [ ] Remove the `!form.title.trim()` requirement from the `Next` button on the `capture` step.
- [ ] Add the `title` input field to the top of the `details` step (Step 2).
- [ ] Introduce a visual loading state (spinner or message) on the `capture` step that triggers while waiting for the `internal/ai` Firestore document to populate, letting the user know the AI is actively extracting the image data.

### Phase 2 — QA

Run `docs/prompts/TESTING.md` with:
- Primary persona smoke tests: Staff mobile flow (375px viewport).
- Verify the auto-advance logic successfully brings the user to Step 2 with the hydrated title.

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: passed
- [ ] Compliance gate: verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] Relevant `docs/EPICS.md` task(s) ticked
- [ ] `TICKET_CLOSE.md` drift check: clean

---

*The Pawn Shop · docs/projects/E61_MOBILE_INTAKE_UX_REFINEMENT.md · v1.0*
