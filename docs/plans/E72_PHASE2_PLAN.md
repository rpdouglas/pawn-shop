# E72 Phase 2: Cloud Functions Security & Unit Testing

**Epic:** E72 — Comprehensive QA & Testing Gap Closure (Phase 2)  
**Persona Impact:** Compliance & Security (Secures the backend boundary, verifying that mutations like age gating and role assignments are immune to regression).

## Context & Requirements
- **Goal:** Install and configure the `firebase-functions-test` SDK.
- **Goal:** Unit test critical backend Cloud Functions: `assignRole`, `logAgeGate`, `setHold`, and `extractIntakeData`.
- **Decisions Made via /grill-me:**
  1. **Online Execution:** Run tests in "online mode" connected to the local Firebase Emulator to verify actual Firestore interactions.
  2. **Root Monorepo Setup:** Install the testing tools at the `functions/package.json` root level so they are shared across both the `core` and `operations` modules.
  3. **Module Mocking:** Use `vi.mock()` from Vitest to intercept the `@google/genai` module during the `extractIntakeData` test to ensure deterministic results without burning Gemini quotas.

---

## Strategy A: The Minimalist Path (Isolated Offline Execution)
- *Discarded based on /grill-me: User specifically requested Online Execution and Root Monorepo setup over offline stubbing.*

## Strategy B: The Recommended Path (Root Test Workspace + Online Emulators)
- **Infrastructure:**
  - Install `vitest` and `firebase-functions-test` in `functions/package.json`.
  - Create `functions/vitest.config.ts` configured for Node environments.
  - Create a root `functions/tests/` folder for all test suites (`core` and `operations`).
- **Test Implementation:**
  - `assignRole.test.ts`: Verify custom claims are set and Firestore user doc is updated.
  - `ageGate.test.ts`: Verify anonymous public invocation is allowed and audit logs are written.
  - `setHold.test.ts`: Verify hold logic.
  - `ai.test.ts`: Use `vi.mock('@google/genai')` to return a predefined intake structure.
- **Execution:** Run via `cd functions && npm run test` while the global `npm run emulate` process is active.
- **Pros:** Shared test dependencies, robust validation against a real emulated database, deterministic AI tests.

## Strategy C: The Robust Path (Automated Emulator Boot in Test Script)
- Same as Strategy B, but instead of relying on the global emulator, the `functions` test script uses `concurrently` and `wait-on` to boot an isolated instance of the Firebase Emulator just for the Cloud Function tests.
- **Pros:** Completely isolated test runs.
- **Cons:** High overhead. Booting the emulator twice (once globally for the frontend, once for the backend test script) takes extra memory and time in CI. We should rely on the global E2E emulator initialized in Phase 1.

---

### Schema & Compliance Audit
- **Schema:** No Firestore schema changes required.
- **Compliance:** Tests will verify that the Cloud Functions strictly adhere to their intended authorization contexts (e.g., `assignRole` requires Admin context, whereas `logAgeGate` permits public invocation).

Please reply with your approved strategy (B or C) so I can begin autonomous execution.
