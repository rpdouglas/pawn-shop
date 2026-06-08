---
allowed-tools: Read, Bash, Write, Edit, Agent
---

You are executing the Pawn Shop Sprint Audit — full system drift detection before promoting to dev/prod.

Execute all phases without asking for permission.

## Phase 1 — Technical Deep Dive

**Schema Audit**
Read `docs/firestore-schema.md`. For each collection, spot-check the corresponding source code (`src/`, `functions/src/`). Flag any field written in code that is not in the schema doc, or any schema field that no longer exists in code.

**Decision Log Audit**
Read `docs/DECISIONS.md` and `docs/decisions/`. Are all significant architectural choices logged? Check recent commits for patterns that should be documented (library additions, CF design choices, auth changes).

**Epic Progress Audit**
Read `docs/EPICS.md`. Are all completed tasks ticked? Are any closed epics missing their `[x] **E## CLOSED**` line?

**Tech Debt Sweep**
Search for: `console.log` in `functions/src/` and `src/`, `// TODO`, `// FIXME`, `as any`, hardcoded hex values (`#[0-9a-fA-F]{3,6}`), hardcoded font sizes (`font-size: [0-9]`).

**Compliance Check**
- Are all age gates at router level (check `src/main.tsx` and `src/router/`)?
- Do all `auditLog` writes go through Cloud Functions (grep `auditLogs` in `src/`)?
- Is `policeHold` respected in all public queries?
- Are `rare-find`/`limited-edition` tags only settable by staff?

## Phase 2 — User Guide Gap Analysis

Read `src/main.tsx` for all routes. Read `functions/src/auth.ts` for all roles. Compare against `/user-guide/` content.

Identify:
- New routes not documented in user guide
- New staff roles or permissions not explained
- Deprecated workflows still documented
- Screenshots or step-by-step instructions that are now wrong

## Phase 3 — Sync Plan

List every file to update:
- Governance docs: `firestore-schema.md`, `DECISIONS.md`, `EPICS.md`
- User guide: specific files to Create, Update, or Delete
- Persona impact: who benefits from these doc updates

## Phase 4 — Execution & Cycle Update

Apply all planned edits. Then update `docs/ACTIVE_CYCLE.md`:
- Move completed items to the Completed table if not already there
- Update the Cycle Goal if the focus has shifted
- Fix the footer timestamp

## Phase 5 — PR Description

Generate a PR description:
```
## Summary
- [bullet: what was built and which persona it serves]
- [bullet: schema changes]
- [bullet: decisions logged]

## Verification
- Build: [status]
- Lint: [status]
- Tests: [status]
- Persona smoke tests: [status]
- Emulator results: [status]

🤖 Generated with Claude Code
```

## Sign-Off
`SPRINT AUDIT COMPLETE. Drift resolved. Compliance verified. EPICS.md updated. Ready to open PR.`
