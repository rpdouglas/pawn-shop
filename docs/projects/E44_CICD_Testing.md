# Project Spec: E44 CI/CD Testing Pipeline

## 1. Goal
Enforce a fail-fast CI/CD pipeline by integrating the complete testing suite (Vitest, Playwright, Lighthouse) into the existing GitHub Actions deployment workflows.

## 2. Background
Currently, `deploy-dev.yml` and `deploy-prod.yml` run `npm ci` followed by `npm run build` and then deploy to Firebase. The robust testing tools we have configured (ESLint, Vitest, Playwright axe-core, Lighthouse CI) are not acting as deployment gates. A breaking change that compiles but fails an age-gate test will successfully deploy.

## 3. Requirements
- **Lint & Unit Tests:** Must run *before* the application builds to fail fast.
- **E2E & A11y Tests:** Must run *after* the application builds to act as the final deployment gate.
- **Lighthouse CI:** Must run *after* deployment on the dev branch to audit performance and SEO.
- **Compliance:** Must ensure that Playwright tests block a deployment if critical features (e.g. Marie Discretion Test via AgeGate) fail.

## 4. Persona Impact
- **Developer (Staff):** Fast failure on lint or unit tests saves CI minutes and provides immediate feedback.
- **Makoonsii:** `axe-core` violations will halt deployment, ensuring the accessibility floor never drops.
- **Marie:** Age-gate regressions tested via Playwright will halt deployment, maintaining legal compliance.
