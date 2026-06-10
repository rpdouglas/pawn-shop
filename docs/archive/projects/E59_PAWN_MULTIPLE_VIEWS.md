# Project E59: Pawn Page Multiple Views

**Status:** Planned
**Epic:** E59 — Pawn Page Experience Enhancement
**Phase:** Phase 1
**Primary Persona:** Sandra
**Secondary Personas:** Dale
**AI Involvement:** Neither

**Objective:** Add multiple view layouts (grid, list, magazine) to the Pawn page's item display similar to the Cannabis page, giving users more control over how they browse inventory.

---

## 1. User Story

> As **Sandra**, I want to **toggle between different visual layouts for pawn items** so that I can **browse the inventory in a way that suits my preference (detailed list vs dense grid)**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

> *"Browsing experience must feel premium and highly discoverable."*

Test for it: User can switch between grid and list modes effortlessly, with the layout updating instantly without losing their search or filter context.

### Makoonsii Trust Test (always run)

- [x] All touch targets ≥48px on mobile viewport (375px)
- [x] All copy uses plain language — no jargon, no retail buzzwords
- [x] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [x] Feature is navigable by a low-tech mobile user in under 3 taps

### Marie Discretion Test

- [ ] N/A

### Marcus Photography Test

- [x] Primary item images meet dark luxury standard
- [x] No placeholder or poorly lit images

### Kevin Speed Test

- [ ] N/A

---

## 3. Compliance Gate

- [ ] **Age gate required?** — No
- [ ] **`auditLogs` events required?** — NONE
- [ ] **PII exclusion** — Yes
- [ ] **`policeHold` respected** — Yes, relying on existing queries
- [ ] **`aiDescription` draft-only** — Yes
- [ ] **AI API security** — N/A
- [ ] **CASL compliance** — N/A
- [ ] **Scarcity integrity** — Yes

---

## 4. Schema & Architecture

### Firestore Collections Impacted

None.

### New Fields Required

NONE

### TypeScript Interfaces

Will utilize existing `Item` interface. May reuse `LayoutMode` type.

### Security Rules Required

NONE

---

## 5. AI Involvement Detail

Neither

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules
- N/A

### Phase 2 — Cloud Functions
- N/A

### Phase 3 — UI Components
- [ ] Components to create: Abstract LayoutToggle or create Pawn version
- [ ] Components to modify: PawnPage.tsx
- [ ] ViewContext / `.view-*` class: confirmed
- [ ] CSS tokens only: confirmed
- [ ] Mobile-first: confirmed

### Phase 4 — QA
- Verify mobile touch targets.
- Verify transition performance.

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all applicable items passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] PR opened with description generated
