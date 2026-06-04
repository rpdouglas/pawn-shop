# Comprehensive Testing & Quality Assurance Gap Analysis

**Role:** Principal Architect / QA Lead
**Date:** June 4, 2026

This report provides a deep-dive analysis of the current testing infrastructure of the application, identifying critical gaps in coverage, misaligned environments, and areas for improvement. It concludes with an actionable Project Plan to close these gaps.

---

## 1. Current State Assessment

Currently, the project utilizes two primary testing frameworks:
1. **Vitest + React Testing Library** for unit/component testing.
2. **Playwright** for End-to-End (E2E), Accessibility (a11y), and Lighthouse CI (LHCI).

**Observations:**
- The foundation is modern and structurally sound.
- CI/CD commands (`npm run test:e2e`, `test:a11y`) are properly wired into `package.json`.
- There is a robust Firebase Emulator Suite available via `npm run emulate`.

## 2. Critical Gap Analysis

### Gap A: Missing Cloud Functions Coverage
There are exactly zero unit tests for Firebase Cloud Functions (`functions/core` and `functions/operations`). 
*   **Risk Level: HIGH.** Cloud Functions manage age gating (`logAgeGate`), staff role assignments (`assignRole`), AI data extraction (`extractIntakeData`), and inventory holds (`setHold`). A regression in these functions leads directly to compliance failures or lost revenue.

### Gap B: Playwright Environment Misalignment
The `playwright.config.ts` file boots the frontend (`npm run dev`) but does **not** boot the Firebase Emulators. 
*   **Risk Level: HIGH.** This means any E2E test that interacts with auth, reads from Firestore, or writes to Storage is either failing locally or improperly interacting with the live cloud dev project.

### Gap C: Shallow Component Coverage
A scan of the `src/` directory reveals only three test files (`format.test.ts`, `AgeGate.test.tsx`, `Button.test.tsx`).
*   **Risk Level: MEDIUM.** Massive, critical components—most notably the 1,000+ line `IntakeForm.tsx`—have zero unit test coverage. This makes refactoring highly dangerous.

### Gap D: Missing Core User Flow E2E Paths
The current E2E suite (`roles.spec.ts`) only checks that the Manager dashboard renders and that the `inventory_staff` cannot see the "Edit Role" button. 
*   **Risk Level: MEDIUM.** There are no tests tracing the primary user personas:
    *   *Makoonsii* browsing the Pawn inventory.
    *   *Marie* securely accessing the Cannabis portal.
    *   *Tanya* executing a Fireworks pre-order.

---

## 3. Recommended Project Plan

To resolve these gaps without halting feature delivery, I recommend we adopt the following phased approach:

### Phase 1: Infrastructure & Emulators (Immediate)
**Goal:** Ensure all tests run safely in a local, ephemeral environment.
1.  **Update Playwright Config:** Modify `playwright.config.ts` to use `npm run dev:full` (or a dedicated `test:e2e` script that runs the Firebase Emulator in the background).
2.  **Add Vitest Coverage:** Update `vite.config.ts` to include `@vitest/coverage-v8` to establish a baseline coverage metric.

### Phase 2: Cloud Functions Security & Unit Testing (Next Sprint)
**Goal:** Secure the backend boundary.
1.  **Install Functions Test SDK:** Add `firebase-functions-test` to the `functions` package.
2.  **Unit Test Core Functions:** Write tests for `assignRole`, `logAgeGate`, and `setHold`.
3.  **Mock External APIs:** Implement mocks for the Gemini AI calls in `extractIntakeData` to ensure predictable testing without exhausting API quotas.

### Phase 3: Critical Component Coverage
**Goal:** Stabilize the complex React layer.
1.  **Refactor & Test IntakeForm:** Before adding any new business verticals, break `IntakeForm.tsx` into smaller components and write isolated RTL tests for each sub-section (e.g., Image Upload, AI Hydration, Field Validation).
2.  **Test Hooks:** Write tests for the TanStack Query data-fetching hooks (`useItems`, `useStaffMembers`).

### Phase 4: Persona-Driven E2E Suites
**Goal:** Automate the manual Persona Gates defined in `docs/EPICS.md`.
1.  **Create `pawn.spec.ts`**: Test the full browse → view details → click-and-collect flow.
2.  **Create `cannabis.spec.ts`**: Test the age gate → product view flow.
3.  **Create `admin.spec.ts`**: Test the staff login → item intake → item publish flow.
