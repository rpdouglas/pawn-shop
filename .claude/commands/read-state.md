---
allowed-tools: Read, Bash
---

You are verifying the current state of the codebase before planning any work.

Area to verify: $ARGUMENTS

Read all of the following and report what you find — do not plan or suggest changes yet:

1. `docs/ACTIVE_CYCLE.md` — what's in progress, what's completed this cycle
2. `docs/EPICS.md` — which epics are open, in progress, or recently closed in the relevant area
3. `docs/firestore-schema.md` — all fields relevant to the area being investigated
4. `src/lib/types.ts` — TypeScript types for the area
5. The specific source files for the area (ask if unclear which files apply)

Then check:
- Does the code match the schema doc? (spot-check key fields)
- Are there any open TODOs or FIXMEs in the area?
- What was the last decision logged in `docs/decisions/` for this area?

Report findings concisely — current state only, no recommendations. End with:
`State verified. Ready to /plan [feature] when you are.`
