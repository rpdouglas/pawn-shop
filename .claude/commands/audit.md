---
allowed-tools: Read, Bash, Agent
---

You are executing a full codebase audit after a long session gap or when starting fresh on an unfamiliar area.

Area to audit (optional): $ARGUMENTS

## What to read

1. `docs/ACTIVE_CYCLE.md` — current sprint state and in-progress work
2. `docs/EPICS.md` — roadmap and what's been closed
3. `docs/firestore-schema.md` — authoritative data model
4. `docs/DECISIONS.md` + `docs/decisions/` — architectural history
5. `src/lib/types.ts` — TypeScript types (ground truth for data shapes)
6. `src/main.tsx` — all routes
7. `functions/src/index.ts` — all exported Cloud Functions
8. `functions/src/auth.ts` — role definitions

If an area is specified, also read the relevant source files for that area.

## What to produce

A **gap report** with four sections:

### 1. Current State
- What epics are in progress or recently closed?
- What is the stated Cycle Goal?
- What is the last known build status?

### 2. Schema vs Code Drift
- Any Firestore fields written in code that are missing from `firestore-schema.md`?
- Any schema fields that appear to be dead code?

### 3. Open Risks
- Any `// TODO` or `// FIXME` in source?
- Any `any` types or `!` non-null assertions on Firestore data?
- Any hardcoded hex/px values?
- Any age gate implemented at component level (not router)?

### 4. Recommended Next Step
- What is the highest-priority thing to address based on `docs/ACTIVE_CYCLE.md` and `docs/EPICS.md`?
- Is there blocked work that needs a decision before it can move?

Keep the report under 400 words. Save it to `docs/reports/AUDIT_[YYYY-MM-DD].md`.
