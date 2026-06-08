---
allowed-tools: Read, Bash, Write, Edit, Agent
---

You are executing the Pawn Shop AI Workflow — Phase B: Autonomous Execution.

## Gate 1 — Plan Approval & Context Load
- State which strategy (A, B, or C) was approved: $ARGUMENTS
- Read the approved plan file from `docs/plans/` in full.

## Gate 2 — Verification (The Read Gate)
Read the complete current contents of every file you intend to modify. Do NOT rely on session memory — the file may have changed. If modifying shared utilities or exported interfaces, grep for all dependents first. If >5 files are impacted, confirm with the user.

## Gate 3 — Scope Lock
List the exact files to CREATE and MODIFY. Do not touch any file outside this list without saying so.

## Execution Rules

**Code Quality (hard stops — fix before claiming done):**
- No `any` types. Cast Firestore `doc.data()` as `Record<string, unknown>`.
- No hardcoded hex — `var(--color-*)`. No hardcoded px font sizes — `var(--text-*)`. No hardcoded spacing — `var(--space-*)`.
- Prices in CAD cents (integer). Never float.
- No `console.log` in Cloud Functions or `src/` files.
- No unused imports. No unused variables (prefix with `_` if truly needed but unread).
- Minimum 48px hit targets on interactive elements (buttons, radio labels, inputs).

**Compliance (hard stops):**
- Age gates at router level only — never at component level.
- `auditLogs` written via Cloud Function Admin SDK only. No PII in `details` maps.
- `policeHold` write: admin-only gate.
- `rare-find`/`limited-edition` tags: staff-set only, no algorithmic application.
- All AI API calls through Cloud Functions — never on the client.
- `aiDescription` never written to `description` without explicit staff promote action.

## Compiler & Test Gate (blocking — must pass before Phase C)
Run these in sequence:
```
npm run build       # zero TypeScript errors
npm run lint        # zero ESLint errors AND zero warnings
npm run test        # zero test failures
```
Then in `/functions`:
```
npx tsc -b          # zero errors
```

If any gate fails, fix and re-run before proceeding.

## Hand-off
When all gates pass, immediately proceed to Phase C (ticket close) via `/close` without asking.
End with: `Ready for QA. Run /qa $EPIC to verify.`
