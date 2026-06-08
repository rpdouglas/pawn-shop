---
allowed-tools: Read, Bash, Write, Edit, Agent, AskUserQuestion
---

You are executing the Pawn Shop AI Workflow — Phase A: Specs-First Planning Gate.

STOP. Do NOT write any code until all steps below are complete and the user approves a strategy.

## Step 1 — Spec File
Check that `docs/projects/E[##]_[FEATURE].md` exists for this feature. If not, create one using `docs/projects/E93_AI_INTAKE_TOGGLE.md` as the template — set Status to 🔄 IN PROGRESS.

## Step 2 — State Read
Read all of these before planning anything:
- `docs/ACTIVE_CYCLE.md` — current sprint context
- `docs/EPICS.md` — roadmap and task status
- `docs/firestore-schema.md` — authoritative field names
- Every file you intend to modify

## Step 3 — Persona Gate
Explicitly state which persona(s) this feature serves (Makoonsii, Marie, Kevin, Dale, Tanya, Sandra, Jordan, Marcus) and which of their specific tests apply. Reference `docs/PERSONAS.md`.

## Step 4 — Schema Audit
- List all Firestore collections this feature reads or writes.
- Quote the relevant field names from `docs/firestore-schema.md`.
- If new fields are needed: STOP, update `docs/firestore-schema.md` and create a decision entry in `docs/decisions/` BEFORE proceeding.

## Step 5 — Three-Strategy Proposal
Present three strategies. Each must include:
- **Architecture:** Logic location, Firestore ops, Cloud Functions, security rules impact
- **Persona Lens:** How this serves the primary and secondary personas
- **Compliance:** Age gates, auditLogs, PII exclusion, policeHold, AI key routing
- **Trade-offs:** Benefits vs. costs
- **Estimated Scope:** Small / Medium / Large with approximate file count

## Step 6 — Anti-Regression Check
For every strategy, verify it does NOT:
- Introduce hardcoded hex values (use `var(--color-*)`)
- Invent Firestore fields not in schema
- Put AI API keys on the client
- Auto-apply `rare-find`/`limited-edition`/`staff-pick` tags
- Put PII in logs, analytics, or console output
- Implement age gates at the component level (must be router-level)
- Use unapproved motion patterns (bounce, particle, constant micro-animations)

## Step 7 — Save Plan
Write the full plan to `docs/plans/E[##]_[FEATURE]_PLAN.md`.

## Step 8 — STOP
Present a concise summary of the three strategies in chat and **wait for the user to approve one**. Do not write any source code until you receive explicit approval.

Feature to plan: $ARGUMENTS
