# E95 — CI Test Gating Plan
**Date:** 2026-06-08 · **Cycle:** 32

---

## State Read Summary

### Current CI Pipeline (both workflows)
```
Push → Lint → Unit Tests → Build → Install Playwright Chromium
     → Accessibility & E2E Tests (npm run test:e2e)
     → Deploy
     → Lighthouse CI (deploy-dev only)
```

### Key Scripts
| Script | What it runs | Speed |
|---|---|---|
| `npm run lint` | ESLint | Fast (~20s) |
| `npm run test` | Vitest unit suite | Fast (~30s) |
| `npm run test:e2e` | Playwright + Firebase Emulators | Slow (~5–8min) |
| `npm run test:a11y` | Playwright axe-core spec only | Slow (~3–5min) |
| `npm run test:lhci` | Lighthouse CI | Slow (~3min) |

### Root Cause of Friction
- `test:e2e` requires: Playwright Chromium install + Java 21 + Emulator boot + full test suite
- This runs on **every push** — even one-line fixes
- `reuseExistingServer: !process.env['CI']` means CI always cold-boots the emulators

### Existing Admin Auth Skip
The ACTIVE_CYCLE deferred items note: "Admin axe-core tests require `PLAYWRIGHT_AUTH_EMAIL` + `PLAYWRIGHT_AUTH_PASSWORD` env vars — skipped in CI" — so some tests already skip in CI today.

---

## Persona Gate

Infrastructure epic. No customer personas served directly.
Developer / `[Staff]` efficiency — faster deploy cycles enable faster iteration on all persona features.

---

## Schema Audit

No Firestore reads or writes. No schema impact.

---

## Three Strategies

---

### Strategy A — Full Removal from Both Workflows

**Architecture:**
- Remove `Install Playwright Browsers` step from `deploy-dev.yml` and `deploy-prod.yml`
- Remove `Accessibility & E2E Tests` step from both workflows
- Remove `Lighthouse CI Audit` step from `deploy-dev.yml`
- Remove Java 21 setup step from both (only needed for emulators)
- Add inline comment in both YAMLs: `# A11y/E2E/LHCI: run locally — see docs/TESTING.md`
- Create `docs/TESTING.md` with clear instructions on when and how to run locally

**CI Pipeline after change:**
```
Push → Lint → Unit Tests → Build → Deploy
```

**Files changed:** `deploy-dev.yml`, `deploy-prod.yml`, new `docs/TESTING.md`

**Trade-offs:**
- ✅ Fastest velocity — every push is 3–5 min instead of 12–15 min
- ✅ Simplest change — 2 files, minimal diff
- ❌ Zero CI enforcement — tests only run if developer remembers
- ❌ No scheduled regression detection — regressions can accumulate silently over weeks

**Estimated Scope:** Small — 2 files, ~15 line deletion each

---

### Strategy B — Remove from Dev, Keep on Prod

**Architecture:**
- Remove E2E/A11y/LHCI from `deploy-dev.yml` only
- Keep E2E/A11y in `deploy-prod.yml` as a production safety gate
- Create `docs/TESTING.md`

**CI Pipeline after change:**
```
dev push  → Lint → Unit Tests → Build → Deploy (fast)
main push → Lint → Unit Tests → Build → E2E → Deploy (safe)
```

**Trade-offs:**
- ✅ Good architectural hygiene — prod still has a safety gate
- ✅ Velocity improvement covers ~95% of pushes (dev branch)
- ❌ Prod deploy (main branch) still slow — but this is already infrequent
- ❌ Since both branches currently deploy to `nats-rack` (temporary config), the safety gate is somewhat symbolic until prod switchover
- ❌ Still no scheduled regression detection

**Estimated Scope:** Small — 1 file changed, 1 new file

---

### Strategy C — Remove from Push, Add On-Demand + Scheduled Workflow (Recommended)

**Architecture:**
- Remove E2E/A11y/LHCI from **both** `deploy-dev.yml` and `deploy-prod.yml`
- Remove `Setup Java 21` and `Install Playwright Browsers` steps from both (they're only needed by E2E)
- Create new `.github/workflows/e2e.yml` with:
  - `workflow_dispatch` trigger — one-click manual run from GitHub Actions UI
  - `schedule: cron: '0 3 * * 0'` — Sunday 03:00 UTC weekly run (overnight, doesn't block dev)
  - Full pipeline: Java → npm ci → Playwright install → E2E → LHCI
- Create `docs/TESTING.md` — when to run locally and when to trigger the CI workflow

**CI Pipeline after change:**
```
Every push  → Lint → Unit Tests → Build → Deploy  (fast, always)
On demand   → Full E2E + A11y + LHCI              (one GitHub UI click)
Weekly auto → Full E2E + A11y + LHCI              (Sunday 03:00 UTC, silent)
```

**Files changed:**
- `deploy-dev.yml` — remove 3 steps
- `deploy-prod.yml` — remove 3 steps
- `.github/workflows/e2e.yml` — new file (~60 lines)
- `docs/TESTING.md` — new file

**Trade-offs:**
- ✅ Maximum velocity on every push
- ✅ Tests still available in CI with one click (pre-release validation)
- ✅ Weekly scheduled run catches accumulating regressions automatically
- ✅ Architecturally correct pattern for the prod-readiness phase
- ✅ LHCI results still tracked in CI for performance monitoring
- ❌ Slightly more files to maintain (+1 workflow)
- ❌ Weekly run may alert on failures nobody watches on a Sunday morning (low risk — still better than nothing)

**Estimated Scope:** Small — 2 files modified, 2 new files (~80 total lines)

---

## Anti-Regression Check

All three strategies:
- ✅ No hardcoded hex, no UI changes
- ✅ No Firestore fields
- ✅ No AI keys on client
- ✅ No scarcity tags
- ✅ No PII in logs
- ✅ No age gate changes
- ✅ No motion patterns
- ✅ Lint + Unit tests remain in all CI pipelines — core regression protection preserved

---

## Recommendation

**Strategy C.** It delivers immediate velocity (the primary ask) while preserving test infrastructure. The `workflow_dispatch` trigger is the key feature — before merging a large feature or doing a pre-release check, a single click in the GitHub Actions UI runs the full suite without any code push. The weekly scheduled run is a passive safety net that requires no developer action. Strategy A is the fastest to implement but creates a blind spot; Strategy B splits the problem without solving the "scheduled detection" gap.

---

## Local Testing Guide (all strategies)

```bash
# Full E2E + A11y suite (requires emulators running)
npm run test:e2e

# Accessibility spec only
npm run test:a11y

# Lighthouse audit (requires prior build + deployed preview URL or localhost)
npm run test:lhci

# Everything: lint + unit + e2e
npm run lint && npm run test && npm run test:e2e
```

**When to run before committing:**
- Any change to routing, age gates, or navigation → `test:a11y`
- Any large feature or fix (new page, major refactor) → `test:e2e`
- Performance-sensitive changes (bundle size, lazy loading) → `test:lhci`
- Pre-release to prod → full `test:e2e` (or trigger via GitHub Actions UI)
