# Claude Code Skills Setup — The Pawn Shop
**Date:** 2026-06-08

This report describes the Claude Code workflow skill files that mirror the `.gemini/skills/` directory. Claude Code's auto-mode security classifier blocks the agent from creating `.claude/commands/` (it controls Claude's own behavior), so the developer must create this directory and these files manually.

---

## How to Apply

Run the following in your terminal to create the directory:

```bash
mkdir -p .claude/commands
```

Then create each file below.

---

## `.claude/commands/plan.md`

Invoked as `/plan <feature>`. Triggers the Specs-First Planning Gate.

```markdown
---
allowed-tools: Read, Bash, Write, Edit, Agent, AskUserQuestion
---

You are executing the E94 AI Workflow — Phase A: Specs-First Planning Gate.

STOP and verify before writing any code:

1. **Spec File:** Check that `docs/projects/E[##]_[FEATURE].md` exists. If not, create one from the pattern in `docs/projects/E93_AI_INTAKE_TOGGLE.md`.

2. **State Read:** Read `docs/ACTIVE_CYCLE.md`, `docs/EPICS.md`, `docs/firestore-schema.md`, and any files you intend to modify.

3. **Persona Gate:** Identify which persona(s) this feature serves (Makoonsii, Marie, Kevin, etc.) and apply their specific tests from `docs/PERSONAS.md`.

4. **Schema Audit:** List all Firestore collections impacted. Quote field names from `docs/firestore-schema.md`. If new fields are needed: STOP, update the schema and `docs/DECISIONS.md` first.

5. **Three-Strategy Proposal:** Present Strategy A (Minimal), B (Recommended), C (Robust). Each must include: Architecture, Persona Impact, Compliance, Trade-offs, Estimated Scope.

6. **Anti-Regression Check:** Verify: no hardcoded hex, no invented Firestore fields, no client AI keys, no manufactured scarcity, no PII in logs.

7. **Save Plan:** Write the plan to `docs/plans/[EPIC]_[FEATURE]_PLAN.md`.

8. **STOP.** Present the summary and wait for user approval. Do NOT write code until approved.

Feature to plan: $ARGUMENTS
```

---

## `.claude/commands/approve.md`

Invoked as `/approve <strategy>`. Executes the approved strategy.

```markdown
---
allowed-tools: Read, Bash, Write, Edit, Agent
---

You are executing the E94 AI Workflow — Phase B: Autonomous Execution.

Strategy approved: $ARGUMENTS

Before writing code:
1. Read the approved plan from `docs/plans/`.
2. Read the complete current contents of every file you will modify.
3. List the exact files to CREATE and MODIFY. Do not touch files outside this list.

During execution:
- No `any` types. Cast Firestore `doc.data()` as `Record<string, unknown>`.
- No hardcoded hex/px/spacing — use `var(--color-*)`, `var(--text-*)`, `var(--space-*)` tokens.
- Prices in CAD cents (integer). Never float.
- No console.log in Cloud Functions or src files.
- Age gates at router level only.
- `auditLogs` via Cloud Function Admin SDK only — no PII in `details`.

After execution:
1. Run `npm run build && npm run lint` — must pass with zero errors AND zero warnings.
2. Run `npm run test` — must pass with zero failures.
3. Run `npx tsc -b` in `/functions` — zero errors.

Then immediately proceed to Phase C (ticket close) without asking.
```

---

## `.claude/commands/qa.md`

Invoked as `/qa <epic>`. Runs the 5-part QA audit.

```markdown
---
allowed-tools: Read, Bash, Agent
---

You are executing the E94 AI Workflow — Phase B QA Gate (qa-verification skill).

Epic: $ARGUMENTS

**Part 1 — Build Health**
- Run `npm run build` — zero TypeScript errors.
- Run `npm run lint` — zero ESLint warnings or errors.
- Run `npm run test` — zero test failures.
- Run `npx tsc -b` in `/functions` — zero errors.
- Audit for `any` types, `!` non-null assertions, hardcoded hex/px values.

**Part 2 — Persona Smoke Tests**
State which persona(s) this epic serves and run their specific tests:
- Makoonsii: 48px minimum hit areas, plain language, no Kanien'kéha.
- Dale: Price visible, status badge correct.
- Marie: Discretion — no PII in any log, 19+ gate intact.
- Kevin: Alert fires within 60s, CASL `alertOptIn` checked.
- Sandra: Masonry grid, quick-view <200ms.
- Jordan/Marcus: `aiDescription` firewall, photography standard.

**Part 3 — Compliance Audit**
Verify: auditLogs via CF only, no PII, eventType matches schema, `policeHold` gate, AI keys on CF only.

**Part 4 — Accessibility Check**
48px touch targets, focus states, `alt` text, WCAG AA contrast (4.5:1 for body copy).

**Part 5 — Design System**
No hardcoded tokens. Motion: only approved patterns. No prohibited vocabulary.

Report: QA PASSED or QA BLOCKED with specific failures.
```

---

## `.claude/commands/close.md`

Invoked as `/close <epic>`. Runs Phase C — Autonomous Ticket Close.

```markdown
---
allowed-tools: Read, Bash, Write, Edit
---

You are executing the E94 AI Workflow — Phase C: Autonomous Ticket Close.

Epic: $ARGUMENTS

Run all four drift checks without asking for permission:

1. **Schema Sync:** Does `docs/firestore-schema.md` reflect current code? Update if needed.

2. **Decision Log:** Add any missing architectural choices to `docs/DECISIONS.md` (as a new file in `docs/decisions/000X-name.md`).

3. **EPICS.md:** Tick all completed tasks for this epic. Add `[x] **E[##] CLOSED** | YYYY-MM-DD`.

4. **Active Cycle:** Add entry to Completed table in `docs/ACTIVE_CYCLE.md`. Update Cycle Goal. Fix footer date.

5. **Project Spec:** Update `docs/projects/E[##]_[FEATURE].md` — set Status to ✅ CLOSED and add Gate Results.

6. **QA Report:** Save a QA report to `docs/reports/E[##]_QA_REPORT.md`.

7. **User Guide Drift:** Check `/user-guide/` for any pages that document workflows changed by this epic. Update if stale.

Then present the final summary. Do NOT commit or push.
```

---

## `.claude/commands/sprint-audit.md`

Invoked as `/sprint-audit`. Full system audit before deploy.

```markdown
---
allowed-tools: Read, Bash, Agent
---

You are executing the Sprint Audit — full system drift detection before deploy promotion.

Run all phases from the sprint-audit skill in `.gemini/skills/sprint-audit/SKILL.md`:

**Phase 1 — Technical Deep Dive**
- Schema Audit: Does `docs/firestore-schema.md` perfectly match the code?
- Decision Log: Does `docs/DECISIONS.md` log every architectural choice?
- Epic Progress: Are completed tasks ticked in `docs/EPICS.md`?
- Tech Debt Sweep: Any `console.log`, `TODO/FIXME`, `any` types, hardcoded hexes?
- Compliance: Age gates at router, PII exclusion, `policeHold` logic?

**Phase 2 — User Guide Gap Analysis**
- Map all routes in `src/main.tsx`.
- Map all roles in `functions/src/auth.ts`.
- Identify missing features or outdated steps in `/user-guide/`.

**Phase 3 — Sync Plan**
List exact updates needed for governance docs and user guide.

**Phase 4 — Execution**
Apply surgical markdown edits. Update `docs/ACTIVE_CYCLE.md`.

Report: SPRINT AUDIT COMPLETE with all drift resolved, or list of blockers.
```

---

*The Pawn Shop · docs/reports/CLAUDE_SKILLS_SETUP.md · 2026-06-08*
