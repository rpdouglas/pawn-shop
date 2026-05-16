# Post-Sprint Audit — The Pawn Shop
**Version:** 1.0 · **Run at the end of each deploy-to-dev cycle. Before promoting to prod.**

---

## Role

Lead DevOps Engineer & Principal Technical Writer.

**Purpose:** A broader version of `TICKET_CLOSE.md`. Where ticket close checks one feature, post-sprint audit checks the entire system for drift across all collections, rules, functions, and docs after a full cycle of work.

Run this before any production deploy. Run it after 3+ tickets in a single cycle even if not deploying.

---

## Input

```
Sprint summary: [brief — e.g., "Completed E01 dev setup, E02 design system tokens, first half of E03 Auth"]
Tickets completed this cycle: [list ticket IDs or epic tasks]
Deploy target: dev | prod
```

---

## Phase 1 — Security & Quality Gate (Code)

### 1.1 Build Health

```bash
npm run build   # Must be zero errors
npm run lint    # Must be zero warnings
```

State result: **PASS | FAIL** — if FAIL, list errors and run `FIX.md` before proceeding.

### 1.2 Zero-Knowledge / AI Security Audit

Check every file modified this cycle:

- [ ] No Gemini or Claude API keys in client-side code (`src/`)
- [ ] All Gemini calls go through Cloud Functions in `/functions`
- [ ] No `aiDescription` field accessible from public-facing React components
- [ ] No customer PII logged to console, Firestore logs, or analytics
- [ ] Firebase Admin SDK used only in Cloud Functions, never in `src/`

### 1.3 Compliance Sweep

Check all routes modified this cycle:

- [ ] `/cannabis` route: 19+ age gate enforced at router level
- [ ] `/fireworks` route: 18+ age gate enforced at router level
- [ ] Age gate events logged to `auditLogs` (check emulator Firestore)
- [ ] `policeHold: true` items excluded from all public listing queries
- [ ] `rare-find` / `limited-edition` not set by any code path — staff-only in Firestore rules
- [ ] No Kanien'kéha in any component, copy file, or Firestore document created this cycle

### 1.4 Tech Debt Sweep

Search changed files for:

```bash
# Check for common tech debt footprints
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx"
grep -r "// TODO\|// FIXME\|// HACK" src/ --include="*.ts" --include="*.tsx"
grep -r "eslint-disable" src/ --include="*.ts" --include="*.tsx"
grep -rn ": any" src/ --include="*.ts" --include="*.tsx"
```

List every finding with `file:line`. Flag which are blocking (must resolve before deploy) vs non-blocking (track as GitHub Issues).

---

## Phase 2 — Drift Detection (Documentation)

### 2.1 Schema Drift

Compare the current Firestore data model against `docs/firestore-schema.md`:

For each collection that was touched this cycle:
- Walk through every field in the code (`src/`, `/functions`)
- Confirm it exists in `docs/firestore-schema.md` with correct type and notes
- Confirm no field in the schema was removed from code without updating the doc

State for each collection: **In sync | Drift detected — [field list]**

### 2.2 Firestore Rules Drift

Does `firestore.rules` reflect the current security model?

Check:
- Public read rules: `status == 'active' && policeHold != true` present on `items`?
- `auditLogs`: no delete, no update rule in place?
- Staff-only write on `policeHold`, `rare-find`, `limited-edition` fields?
- Age-gated collection reads protected for unauthenticated users?

State: **In sync | Drift detected — [rule gap]**

### 2.3 DECISIONS.md Drift

Are all architectural choices made this cycle logged?

Walk through the sprint summary. For every place where a choice was made (framework, approach, tool, sequence), confirm it is in `docs/DECISIONS.md` with today's date and a one-sentence reason.

Decisions that are commonly missed:
- Why a Cloud Function was chosen over a client-side hook
- Why a Firestore trigger was chosen over a scheduled job
- Why search was kept in Firestore prefix tokens vs Algolia
- Any Gemini model selection (Pro vs Flash)
- Any compliance interpretation (session-scoped vs persistent age gate)

### 2.4 EPICS.md Drift

For every task completed this cycle — is it ticked in `docs/EPICS.md`?

Walk through the epic sections touched this cycle. List every unchecked task that should now be `[x]`.

---

## Phase 3 — Persona Regression Check

For each persona whose primary epics were touched this cycle, run the relevant smoke tests from `TESTING.md`.

State explicitly: **[Persona name] — smoke tests PASSED | FAILED | NOT APPLICABLE THIS CYCLE**

If any persona test fails, run `FIX.md` before proceeding.

---

## Phase 4 — Performance Baseline (for prod deploys only)

Before promoting to prod, run Lighthouse on the deployed dev build:

```bash
# On the Firebase Hosting preview URL
# Run in Chrome DevTools > Lighthouse
```

Targets:
- Performance: ≥90
- Accessibility: ≥90
- SEO: ≥95
- Best Practices: ≥90

State scores. If any score falls below target: **BLOCK prod deploy until resolved.**

---

## Phase 5 — Pre-Deploy Checklist

Complete this checklist before any Firebase deploy:

```bash
# Dev deploy
npm run build
firebase deploy --only hosting --project nats-rack

# Prod deploy (requires "DEPLOY" confirmation in deploy-prod.yml)
# DO NOT deploy to prod without:
# [ ] All Phase 1-4 items resolved
# [ ] Legal counsel has reviewed any new cannabis/fireworks/pawn regulation features
# [ ] Any new Kanien'kéha content has community review sign-off
```

- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] Firebase emulator tests — all passing
- [ ] Lighthouse scores — all above threshold (prod only)
- [ ] `docs/firestore-schema.md` — in sync
- [ ] `docs/DECISIONS.md` — all decisions logged
- [ ] `docs/EPICS.md` — all completed tasks ticked
- [ ] No tech debt marked as blocking remains open
- [ ] Compliance sweep — clean
- [ ] Any new feature touching cannabis/fireworks: legal review confirmed or deferred with explicit note in DECISIONS.md

---

## Phase 6 — Cycle Summary

Produce a summary suitable for a commit message or GitHub release note:

```
## Sprint [cycle identifier] — Summary

### Completed
- [Epic/task]: [one sentence]
- [Epic/task]: [one sentence]

### Deferred to next cycle
- [item]: [reason]

### Compliance notes
- [any compliance items resolved, deferred, or requiring counsel]

### Docs updated
- docs/firestore-schema.md — [what changed]
- docs/DECISIONS.md — [N] new entries
- docs/EPICS.md — [N] tasks ticked

### Tech debt
- Resolved: [list]
- Tracked as Issues: [list]
```

---

## Sign-Off

> **SPRINT AUDIT COMPLETE.** All phases passed. Ready to deploy to [dev | prod].

or

> **SPRINT AUDIT BLOCKED.** Open items:
> 1. [blocking item] — must resolve before deploy
> 2. [non-blocking item] — tracked as GitHub Issue #[N]

---

*The Pawn Shop · docs/prompts/POST_SPRINT_AUDIT.md · v1.0*
