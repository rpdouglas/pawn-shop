# Implementation Plan — E24 · CI/CD Pipeline Strategy

**Project:** The Pawn Shop
**Epic:** E24 — CI/CD Pipeline Strategy
**Phase:** Phase 8 (Infrastructure)
**Date:** 2026-05-19
**Status:** Awaiting approval

---

## Context

The project currently has one GitHub Actions workflow active for automated deploys: `deploy-dev.yml` triggers on every push to `main` and deploys to the `nats-rack` dev Firebase project. `deploy-prod.yml` exists but is manual-only (requires typing "DEPLOY" to confirm). There is no `dev` branch and no CI/CD distinction between feature work and stable main.

E24 introduces a `dev` → `main` branch flow where both branches deploy to the dev environment (`nats-rack`) during this phase. This gives the developer a safe scratch target for feature branches (`dev`) while keeping `main` as the stable integration branch — without prematurely routing `main` to the production Firebase project (`the-addicts-agenda`), which is not yet production-ready.

---

## Phase 1 — Persona & Compliance Gate

**Primary persona:** Developer (Staff). No customer-facing surface.  
**Secondary personas:** None directly impacted.

All persona compliance tests (Makoonsii, Marie, Marcus, Kevin) and all application compliance checks (age gate, auditLogs, PII, policeHold, aiDescription, AI API keys) are **N/A** — this is a pure CI/CD infrastructure change.

---

## Phase 2 — Schema Audit

```
Collections impacted: NONE
New fields required:   NONE
Security rules:        NONE
TypeScript interfaces: NONE
```

Firebase projects affected:
- `nats-rack` (dev) — receives deploys from both `dev` branch and `main` branch (temporarily)
- `the-addicts-agenda` (prod) — no automated deploys until prod switchover is executed

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimal (Branch Swap Only)

**Summary:** Flip `deploy-dev.yml` trigger to `dev`, add `push: branches: [main]` to `deploy-prod.yml` keeping it wired to production (`the-addicts-agenda` / `PROD_FIREBASE_*`).

- **Scope:** 2-line change across 2 files
- **Con:** Non-compliant with spec. Spec explicitly requires `main` to route to dev temporarily. Also requires `PROD_FIREBASE_*` secrets and `the-addicts-agenda` hosting to be verified and ready.

### Strategy B — Dev-First, Spec-Aligned *(Recommended)*

**Summary:** Reroute `deploy-dev.yml` to `dev` branch; modify `deploy-prod.yml` to add a `push: branches: [main]` trigger while temporarily mapping it to `nats-rack` using `DEV_FIREBASE_*` secrets; embed a prod switchover comment block; add parity improvements.

**Exact changes:**

**`deploy-dev.yml`** — 1 line:
- `branches: [main]` → `branches: [dev]`

**`deploy-prod.yml`** — 5 categories of change:
1. **Switchover comment block** — add immediately below `name:` line, before `on:`. Documents the exact 4 steps to flip to production (which secret keys to swap, what to update, what to log in DECISIONS.md, prerequisites).
2. **`on:` trigger block** — add `push: branches: [main]` with the same `paths:` filter as `deploy-dev.yml` (11 patterns: src/**, public/**, functions/**, .github/workflows/**, package.json, package-lock.json, vite.config.ts, index.html, firebase.json, firestore.rules, firestore.indexes.json, storage.rules). Retain existing `workflow_dispatch` with "DEPLOY" confirmation input.
3. **`if:` job guard** — replace `if: ${{ github.event.inputs.confirm == 'DEPLOY' }}` with `if: github.event_name == 'push' || github.event.inputs.confirm == 'DEPLOY'`. The current guard blocks push triggers (no `inputs.confirm` on a push event). Manual dispatch still requires confirmation.
4. **"skip if no package.json" step** — add the identical safety check from `deploy-dev.yml` as the first step after checkout, with matching `if: steps.check.outputs.skip != 'true'` guards on all subsequent steps. Eliminates asymmetry.
5. **Build and Deploy steps** — temporarily use `DEV_FIREBASE_*` secrets and `FIREBASE_SERVICE_ACCOUNT_DEV` / `nats-rack` in place of prod equivalents. The comment block documents the exact lines to change.

**`docs/DECISIONS.md`** — add entry:
```
2026-05-19 — E24 CI/CD: deploy-dev.yml re-targeted to `dev` branch. deploy-prod.yml
triggered on `main` push but temporarily routes to nats-rack dev project using
DEV_FIREBASE_* secrets. Prod switchover instructions embedded as a comment block in
deploy-prod.yml. Both branches validate against the same dev environment during this phase.
```

- **Scope:** 4 changes across 2 workflow files + 1 DECISIONS.md entry
- **Pro:** Fully spec-compliant, no new secrets, no GitHub admin configuration required, co-located documentation

### Strategy C — Robust (GitHub Environments + Protection Rules)

**Summary:** Introduce GitHub Environments (`development`, `production`) with environment-scoped secrets and a required-reviewer approval gate on `production`. Wire each workflow to its environment via an `environment:` key.

- **Scope:** 14+ GitHub UI steps + 2 YAML changes + 1 DECISIONS.md entry
- **Con:** Required reviewers require a paid GitHub plan for private repos. "Dev secrets stored under the production environment name" is actively confusing. Adds an approval gate to every `main` push during the dev-first phase — slowing down the very workflow E24 is designed to improve. Over-engineered for a single-developer project.

---

## Phase 4 — Recommendation

**Strategy B.** It is the only option fully compliant with the E24 spec. Strategy A fails the spec's explicit "main → nats-rack temporarily" requirement. Strategy C over-engineers for a single-developer project and may not be available without a paid GitHub plan. Strategy B's additional parity improvements (`if:` guard fix, skip-check, paths filter) address latent bugs in `deploy-prod.yml` without adding scope.

---

## Phase 5 — Anti-Regression Protocol

Application traps (hex values, Firestore fields, AI keys, scarcity, PII, age gates, motion, typography, brand voice) are all **N/A**.

Infrastructure-specific risks:
1. **`deploy-docs.yml` must not be modified.** Independent VitePress workflow — leave untouched.
2. **`workflow_dispatch` confirmation gate must be preserved.** The "DEPLOY" string-match guard is a documented deliberate friction mechanism. The new `if:` expression must not simplify away the manual confirmation requirement.
3. **`deploy-dev.yml` paths filter must be preserved exactly** (all 11 patterns) or rule/config changes merged to `dev` will silently skip CI.
4. **Both workflows share `FIREBASE_SERVICE_ACCOUNT_DEV` after B is implemented.** A secret rotation breaks both pipelines simultaneously — expected and acceptable during the dev-first phase.

---

## Implementation Sequence

1. Modify `deploy-dev.yml` — change trigger branch to `dev`
2. Modify `deploy-prod.yml` — all 5 changes above
3. Update `docs/DECISIONS.md`
4. Open PR from a feature branch targeting `main` (all 3 files)
5. After merge, verify `deploy-prod.yml` triggers on `main` push, uses `DEV_FIREBASE_*`, targets `nats-rack`
6. Push test commit to `dev`, verify only `deploy-dev.yml` triggers

---

## Definition of Done

- [ ] `deploy-dev.yml` targets `dev` branch only
- [ ] `deploy-prod.yml` triggers on `main` push; deploys to `nats-rack` with `DEV_FIREBASE_*` / `FIREBASE_SERVICE_ACCOUNT_DEV`
- [ ] `deploy-prod.yml` contains prod switchover comment block
- [ ] `deploy-prod.yml` has "skip if no package.json" parity step
- [ ] `deploy-prod.yml` has `paths:` filter matching `deploy-dev.yml`
- [ ] `deploy-prod.yml` `if:` guard allows push triggers while still requiring "DEPLOY" confirmation for manual dispatch
- [ ] `docs/DECISIONS.md` updated
- [ ] CI verified: `dev` push → only `deploy-dev.yml`; `main` push → only `deploy-prod.yml`

---

## Critical Files

- `.github/workflows/deploy-dev.yml`
- `.github/workflows/deploy-prod.yml`
- `docs/DECISIONS.md`
