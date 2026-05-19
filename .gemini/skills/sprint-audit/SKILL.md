---
name: sprint-audit
description: Comprehensive sprint audit and documentation synchronization workflow for The Pawn Shop. Use after a feature passes QA but before opening a PR. Combines internal governance drift detection (Schema, Decisions, Epics, Tech Debt) with external user-guide synchronization (VitePress site). Ensures the project's documentation map perfectly matches the territory of the code.
---

# Sprint Audit Skill — The Pawn Shop

This skill provides a unified workflow for closing tickets and epics, ensuring both internal governance files and external user guides are perfectly synchronized with the current codebase.

## Workflow Phases

### Phase 1 — Technical Deep Dive (Internal Governance Audit)
Systematically map the codebase to establish the "Source of Truth" and identify drift in project files.

- **Schema Audit:** Does `docs/firestore-schema.md` perfectly reflect the Firestore model in the code?
- **Decision Log:** Does `docs/DECISIONS.md` log every architectural choice (e.g., choice of triggers over scheduled jobs)?
- **Epic Progress:** Are the completed tasks correctly ticked in `docs/EPICS.md`?
- **Tech Debt Sweep:** Check for `console.log`, `TODO/FIXME`, `any` types, or hardcoded hexes in new code.
- **Compliance Check:** Verify age gates, PII exclusion in logs/analytics, and `policeHold` logic.

### Phase 2 — User Guide Gap Analysis
Compare the technical reality (routes, roles, and workflows) against the VitePress site in `/user-guide/`.

- **Technical Inventory:** Map all new routes (`src/main.tsx`), roles (`functions/src/auth.ts`), and workflows (e.g., Inventory Lifecycle).
- **Drift Detection:** Identify missing features or outdated steps in `/user-guide/`.
- **Brand Voice Alignment:** Ensure documentation reflects the "Dapper, Debonair, Distinctly Akwesasne" voice.

### Phase 3 — The Sync Plan
Produce a structured Action Plan listing exact updates needed for:
- Governance docs (`firestore-schema.md`, `DECISIONS.md`, `EPICS.md`).
- User guide files (specify files to Create, Update, or Delete).
- Persona impact summary (how these updates serve Makoonsii, Marie, Kevin, etc.).

### Phase 4 — Execution & Cycle Update
If an Epic has been closed (all tasks ticked in `docs/EPICS.md`):

- **Update `docs/ACTIVE_CYCLE.md`:** Move tasks to "Previous Cycle Summary", clear tables, increment cycle number, and set new goals.
- **Update Project Spec:** Update the status line in `docs/projects/*.md`.
- **Sync Files:** Apply the surgical markdown edits planned in Phase 3.

### Phase 5 — PR Description Generation
Generate a comprehensive PR description containing:
- Summary of what was built and which persona it serves.
- List of schema changes and decisions logged.
- Verification/Test plan (Build status, Persona smoke tests, Emulator results).

## Execution Guidelines
- **No Hex Codes:** Use brand terms or CSS token references in docs.
- **Surgical Edits:** Fix drift without unnecessary rewrites.
- **Dapper Voice:** Instructions must be professional and sophisticated.

## Sign-Off Criteria
If all drift is resolved and compliance is verified:
`TICKET CLOSED. Drift resolved. Compliance verified. EPICS.md updated. Ready to open PR.`
