# E72 Phase 1: Playwright Infrastructure & Emulators Plan

**Epic:** E72 — Comprehensive QA & Testing Gap Closure (Phase 1)  
**Persona Impact:** Compliance & Security (Ensures automated tests run against safe, ephemeral emulator data, protecting production).

## Context & Requirements
- **Goal:** Update `playwright.config.ts` to run both the Vite dev server and Firebase Emulator concurrently without race conditions.
- **Goal:** Add Vitest coverage reporting without blocking the CI build yet.
- **Decisions Made via /grill-me:** 
  1. Use `npm run dev:full` and `wait-on` logic to handle the Vite vs. Emulator race condition.
  2. Implement `@vitest/coverage-v8` in report-only mode (no strict thresholds yet).

---

## Strategy A: The Minimalist Path (Basic Concurrent Boot)
- **Playwright:** Modify `playwright.config.ts` `webServer.command` to `npm run dev:full`. Point the `url` config to `http://127.0.0.1:4000` (Emulator Hub), relying on the assumption that if the slow emulator boots, the fast Vite server is already ready.
- **Vitest:** Install `@vitest/coverage-v8`, add basic text reporting to `vite.config.ts`.
- **Pros:** Fast setup, minimal dependencies.
- **Cons:** Flaky. If Vite fails to boot but the emulator succeeds, tests will hang or fail cryptically.

## Strategy B: The Recommended Path (Explicit `wait-on` Synchronization)
- **Playwright:** Install `wait-on`. Create a new `package.json` script: `"test:e2e:ci": "concurrently \"npm run dev\" \"npm run emulate\""`. Then in `playwright.config.ts`, we don't change the `command`, but we wrap the CI pipeline to use `wait-on http://localhost:5173 http://127.0.0.1:4000` to guarantee *both* services are fully bound before tests begin.
- **Vitest:** Install `@vitest/coverage-v8`. Configure HTML and Text reporters. Add `"test:coverage": "vitest run --coverage"`.
- **Pros:** Completely eliminates race conditions. Solid baseline coverage reporting.

## Strategy C: The Robust Path (Wait-On + Coverage Gate Warning)
- **Playwright:** Same as Strategy B, but we also create a pre-test health check script that verifies the emulator has populated seed data before allowing Playwright to proceed.
- **Vitest:** Install `@vitest/coverage-v8`. Set a low threshold (e.g., 5%) but configure it to `watermarks` so we get color-coded terminal warnings, even if the build doesn't fail.
- **Pros:** Most robust CI setup.
- **Cons:** Over-engineered for Phase 1. Seed data verification belongs in Phase 4 when E2E suites are actually written.

---

### Schema & Compliance Audit
- **Schema:** No Firestore schema changes required.
- **Compliance:** Tests run strictly against local Emulators, guaranteeing no PII exposure or accidental production writes.
