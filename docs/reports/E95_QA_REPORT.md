# QA Report — E95 · CI Test Gating
**Date:** 2026-06-08 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — zero TypeScript errors |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` type casts introduced | ✅ PASS — no source code changes |
| No unused imports/variables | ✅ PASS — no source code changes |

---

## Part 2 — Workflow Verification

### deploy-dev.yml
- [x] Java 21 setup step removed
- [x] Playwright install step removed
- [x] Accessibility & E2E Tests step removed
- [x] Lighthouse CI Audit step removed
- [x] Comment added pointing to `e2e.yml` and `docs/TESTING.md`
- [x] All remaining steps intact: checkout, Node 20, npm ci, lint, unit tests, build, deploy

### deploy-prod.yml
- [x] Java 21 setup step removed
- [x] Playwright install step removed
- [x] Accessibility & E2E Tests step removed
- [x] Comment added pointing to `e2e.yml` and `docs/TESTING.md`
- [x] All remaining steps intact: checkout, Node 20, npm ci, lint, unit tests, build, deploy
- [x] Prod switchover comment block preserved intact

### e2e.yml (new)
- [x] `workflow_dispatch` trigger present
- [x] `schedule: cron: '0 3 * * 0'` (Sunday 03:00 UTC) present
- [x] Full pipeline: checkout → Node 20 → Java 21 → npm ci → build → Playwright install → E2E → LHCI
- [x] Correct `DEV_FIREBASE_*` secrets passed to build and E2E steps
- [x] No `if:` conditionals needed (workflow runs unconditionally when triggered)

### docs/TESTING.md (new)
- [x] Push pipeline vs. on-demand summary table
- [x] Local commands for E2E, A11y, LHCI
- [x] "When to run before committing" decision table
- [x] GitHub Actions UI trigger instructions

---

## Part 3 — Compliance Audit

| Item | Status |
|------|--------|
| Lint gate remains in every push | ✅ PASS — ESLint catches PII, hardcoded values, compliance violations |
| Unit test gate remains in every push | ✅ PASS — Vitest suite covers age gate logic, format utils, compliance components |
| A11y/E2E available on demand | ✅ PASS — `e2e.yml` workflow_dispatch + weekly schedule |
| No auditLogs impacted | ✅ PASS — pure CI epic, no Firestore changes |
| No age gate changes | ✅ PASS — router-level gates untouched |
| No AI key exposure | ✅ PASS — no source code changes |
| Decision logged | ✅ PASS — `docs/decisions/0005-ci-test-gating-strategy-c.md` |

---

## Part 4 — Accessibility Check

Not applicable — this epic contains no UI changes. Accessibility behaviour is unchanged. The `test:a11y` script and the `e2e/accessibility.spec.ts` suite are unmodified and remain fully runnable locally and via `e2e.yml`.

---

## Part 5 — Design System Verification

Not applicable — this epic contains no UI changes. No tokens, colours, motion, or typography were touched.

---

## Sign-Off

**QA PASSED.** Feature: E95 CI Test Gating. Persona: Staff (infrastructure). Build: clean. Compliance: verified — lint + unit tests remain in every push; A11y/E2E available on demand and weekly. Workflow drift: resolved.

Ready for TICKET_CLOSE.

---

*The Pawn Shop · docs/reports/E95_QA_REPORT.md · 2026-06-08*
