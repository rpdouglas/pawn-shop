# Project E21: Vitest Unit Testing Framework

**Status:** Done
**Epic:** E21 — Vitest Unit Testing Framework
**Phase:** Phase 1 (Foundation)
**Primary Persona:** Staff (Developer)
**Secondary Personas:** Marie
**AI Involvement:** Claude (dev)

**Objective:** Implement a robust unit testing framework using Vitest, jsdom, and React Testing Library to ensure code correctness and prevent regressions in critical compliance logic.

---

## 1. User Story

> As a **Developer (Staff)**, I want **a fast and integrated way to verify my code** so that I can **ship features with confidence and ensure that compliance logic remains intact**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate (Developer)

> *"Fast, reliable verification of code correctness."*

Test for it: Run `npm run test` and verify that unit tests for `src/lib/format.ts` and `src/components/ui/Button.tsx` pass under 2 seconds.

### Marie Discretion Test (run for any CRM, notification, or cannabis/fireworks feature)

- [x] Testing suite includes a regression test for `AgeGate.tsx` logic to ensure bypasses are impossible.
- [x] Testing suite verifies that PII filtering utilities correctly redact sensitive data.

### Makoonsii Trust Test (always run)

- [N/A] This is a developer-facing infrastructure project.

---

## 3. Compliance Gate

- [x] **Age gate required?** No (infrastructure).
- [x] **`auditLogs` events required?** No.
- [x] **PII exclusion** — Confirmed. Testing utilities will be used to verify PII exclusion in other modules.
- [x] **`policeHold` respected** — N/A.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

NONE.

### New Fields Required

None.

### TypeScript Interfaces

None.

### Security Rules Required

None.

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.
- Guardrail: Claude should assist in generating meaningful test cases for complex hooks and components.

---

## 6. Implementation Phases

### Phase 1 — Installation & Configuration
- [x] Install `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@vitejs/plugin-react` (if not present).
- [x] Update `vite.config.ts` with the `test` configuration.
- [x] Create `src/setupTests.ts` to include global DOM matchers.
- [x] Add `test` and `test:watch` scripts to `package.json`.

### Phase 2 — Utility Testing
- [x] Create `src/lib/format.test.ts`.
- [x] Implement unit tests for currency, date, and string formatting utilities.

### Phase 3 — Component Testing
- [x] Create `src/components/ui/Button.test.tsx`.
- [x] Implement tests for Button variants, states, and hit areas (Makoonsii 48px check).
- [x] Create `src/components/age-gate/AgeGate.test.tsx` to verify compliance logic.

### Phase 4 — QA
- [x] Verify `npm run test` passes cleanly in the CI environment.
- [x] Verify test coverage report can be generated (if using Strategy C elements).

---

## 7. Definition of Done

- [x] Vitest is configured and running.
- [x] Unit tests for core utilities and at least one UI component are passing.
- [x] `npm run build` — zero errors.
- [x] `npm run lint` — zero warnings.
- [x] `docs/EPICS.md` task for E21 ticked.
- [x] PR opened with test results included.

---

*The Pawn Shop · docs/projects/E21_Vitest_Unit_Testing.md · v1.0*
