# Decision 0005 — E95 CI Test Gating: Remove A11y/E2E from Push Pipeline (Strategy C)

**Date:** 2026-06-08
**Epic:** E95 · CI Test Gating — Remove Accessibility & E2E from Push Pipeline
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

Every push to `dev` and `main` ran the full Playwright E2E + axe-core accessibility suite and Lighthouse CI audit. This added **8–12 minutes** of blocking CI time on every push — including minor fixes and config changes — slowing a rapid dev cycle where many small pushes are made per session.

Three strategies were evaluated:

- **A:** Remove E2E/A11y/LHCI entirely from both workflows. Simple, but creates a blind spot with no regression detection.
- **B:** Remove from `dev` only, keep on `main` (prod). Partial velocity win; no scheduled detection.
- **C:** Remove from both push workflows; create a dedicated on-demand + weekly scheduled `e2e.yml` workflow.

---

## Decision

**Strategy C: Remove from push pipelines; add dedicated `e2e.yml` with `workflow_dispatch` and weekly schedule.**

---

## Rationale

1. **Velocity without abandoning tests.** The push pipeline now runs only Lint + Unit Tests + Build + Deploy (~3 min). Tests remain fully available in CI via one click from the GitHub Actions UI.

2. **`workflow_dispatch` is the key gate.** Before any large feature merge or pre-release check, a single click in GitHub Actions → "E2E, Accessibility & Lighthouse" → "Run workflow" triggers the full suite without requiring a code push.

3. **Weekly scheduled run as passive safety net.** `cron: '0 3 * * 0'` (Sunday 03:00 UTC) catches regressions that accumulate over time without any developer action.

4. **Java 21 removed from push workflows.** Removing the Playwright/Emulator steps also eliminates the `setup-java` step — Firebase Emulators are only needed by E2E, so removing it further shortens push pipeline setup time.

5. **Local parity preserved.** All existing scripts (`npm run test:e2e`, `npm run test:a11y`, `npm run test:lhci`) continue to work identically for local use. `docs/TESTING.md` documents when to run each.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy A (full removal) | No automated regression detection — regressions can accumulate silently between releases |
| Strategy B (keep on prod) | Main branch currently deploys to `nats-rack` (temporary config) — prod gate is symbolic; no scheduled detection |

---

## Compliance Notes

- Lint + Unit tests (Vitest) remain in every push pipeline. Core regression protection for compliance logic (age gates, audit logs, PII exclusion) is maintained.
- `docs/TESTING.md` specifies that routing, age gate, or navigation changes require `npm run test:a11y` before commit.
- The weekly CI run ensures axe-core and Playwright persona suites are not silently broken for extended periods.

---

## New Files Introduced

| File | Purpose |
|------|---------|
| `.github/workflows/e2e.yml` | On-demand + weekly E2E/A11y/LHCI workflow |
| `docs/TESTING.md` | Local and CI testing guide |

---

## Files Modified

| File | Change |
|------|--------|
| `.github/workflows/deploy-dev.yml` | Removed: Java 21 setup, Playwright install, A11y/E2E step, LHCI step |
| `.github/workflows/deploy-prod.yml` | Removed: Java 21 setup, Playwright install, A11y/E2E step |

---

*The Pawn Shop · docs/decisions/0005-ci-test-gating-strategy-c.md · 2026-06-08*
