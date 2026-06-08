# E95 — CI Test Gating: Remove A11y/E2E from Push Pipeline
**Status:** ✅ CLOSED — 2026-06-08
**Priority:** HIGH (Developer Velocity)
**Effort:** Small (~1 developer-hour)
**Cycle:** 32

---

## Problem

Every push to `dev` and `main` triggers:
1. `npx playwright install --with-deps chromium` (~2–3 min)
2. Firebase Emulator boot via `npm run dev:full` (inside `test:e2e`)
3. Full Playwright E2E suite (~3–5 min)
4. Lighthouse CI audit (deploy-dev only)

Total overhead per push: **~8–12 minutes** of CI time that blocks the deploy.
This is slowing a rapid dev cycle where many small pushes are made per session.

Lint + Unit tests (vitest) are fast and provide adequate regression protection for routine pushes.

---

## Scope

Files to change:
- `.github/workflows/deploy-dev.yml`
- `.github/workflows/deploy-prod.yml`
- `.github/workflows/e2e.yml` (new — Strategy C only)
- `docs/TESTING.md` (new — local run guide)

No Firestore schema changes. No Cloud Function changes. No UI changes.

---

## Personas Served

Infrastructure epic — no customer personas directly served.
Developer / Staff velocity.

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero errors, zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| No Firestore schema changes | ✅ PASS — pure CI/workflow epic |
| No compliance impact | ✅ PASS — lint + unit tests remain in every push pipeline |
| Decision logged | ✅ `docs/decisions/0005-ci-test-gating-strategy-c.md` |
