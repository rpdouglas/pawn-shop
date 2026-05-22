# Epic Plan: E44 CI/CD Testing Pipeline

## Problem Statement
The current GitHub Actions workflows deploy code upon a successful build without running any tests, bypassing our established linting, unit testing (Vitest), integration testing (Playwright), and auditing (Lighthouse CI) suites.

## Persona Impact Statement
- **Makoonsii:** Accessibility is a strict gate. Without automated CI checks, an accessibility regression could ship.
- **Marie:** Compliance features (age gates) must never regress in production.
- **Staff (Developer):** Requires rapid feedback from CI to fix issues quickly.

## Compliance Checklist
- [x] Age gate logic tested by Playwright CI gate.
- [x] No PII leakage via test logging.
- [x] Security rules and test files isolated from production builds.

## Schema Audit
- No Firestore schema changes required.

---

## Strategy A: Fail-Fast Core (Minimal)

Integrate only the fastest testing layers into the pipeline.

- **Implementation:** Add `npm run lint` and `npm run test` immediately after `npm ci`. 
- **Pros:** Extremely fast CI runs (minimal minutes used).
- **Cons:** Fails to protect against Accessibility or E2E routing regressions before deploying. Fails Makoonsii and Marie persona gates.

## Strategy B: Full Execution Pipeline (Recommended)

Implement a sequential, fail-fast pipeline executing tests from cheapest to most expensive.

- **Implementation:** 
  1. `npm run lint` & `npm run test` (Pre-build)
  2. `npm run build`
  3. `npx playwright install` & `npm run test:a11y` (Post-build)
  4. Deploy to Firebase
  5. `npm run test:lhci` (Post-deploy dev audit)
- **Pros:** Perfect balance of speed and safety. Protects all persona gates and ensures regressions never reach production.
- **Cons:** Adds ~2-3 minutes to deployment time for Playwright installations and headless browser tests.

## Strategy C: Matrix Execution with Preview Channels (Robust)

Deploy everything to Firebase Preview Channels first, then test against live URLs.

- **Implementation:**
  1. Unit tests and linting.
  2. Build & Deploy to a Firebase Preview Channel (via Firebase Action).
  3. Run Playwright E2E and Lighthouse CI against the live Preview URL.
  4. If passed, promote Preview Channel to Live.
- **Pros:** Tests run against actual deployed infrastructure, removing localhost environment variables as a failure point.
- **Cons:** Heavy implementation complexity. Requires redesigning the Firebase deployment action and passing URLs between action steps. Overkill for the current project scale.

---

**Recommendation:** Strategy B provides all the necessary safeguards required by the personas without the over-engineering of Strategy C.
