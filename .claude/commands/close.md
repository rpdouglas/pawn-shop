---
allowed-tools: Read, Bash, Write, Edit
---

You are executing the Pawn Shop AI Workflow — Phase C: Autonomous Ticket Close.

Epic to close: $ARGUMENTS

Execute all steps below without asking for permission. Do NOT commit or push.

## Step 1 — Schema Sync
Read `docs/firestore-schema.md`. Does it reflect every field written or read by this epic? If any field is missing or changed, update `docs/firestore-schema.md` now.

## Step 2 — Decision Log
Did this epic make any meaningful architectural choices (library selection, data model shape, CF pattern, auth approach)? If yes, create `docs/decisions/000X-name.md` using `docs/decisions/0004-inventory-table-tanstack.md` as the template. Increment the number from the highest existing file.

## Step 3 — EPICS.md
Open `docs/EPICS.md` and:
- Tick (`[x]`) every task completed by this epic.
- Add `- [x] **E[##] CLOSED** | YYYY-MM-DD` at the bottom of the epic's task list.

## Step 4 — ACTIVE_CYCLE.md
Open `docs/ACTIVE_CYCLE.md` and:
- Add a row to the "Completed This Cycle" table.
- Update the "Cycle Goal" line to reflect the new focus (or mark as complete).
- Fix the footer timestamp to today's date.

## Step 5 — Project Spec
Open `docs/projects/E[##]_[FEATURE].md` and:
- Set Status to `✅ CLOSED — YYYY-MM-DD`.
- Add a "Gate Results" table showing build, lint, test, and compliance check results.

## Step 6 — QA Report
Save a formal QA sign-off to `docs/reports/E[##]_QA_REPORT.md` using `docs/reports/E94_QA_REPORT.md` as the template.

## Step 7 — User Guide Drift
Scan `/user-guide/` for any pages that describe workflows changed by this epic. If a page is stale, update it to reflect the new behaviour. Use the "Dapper, Debonair, Distinctly Akwesasne" brand voice.

## Step 8 — Firestore Rules & Indexes
Check `firestore.rules` and `firestore.indexes.json`. If this epic added new collections or query patterns, add the required rules and indexes now.

## Sign-Off
When complete, output:
`TICKET CLOSED. [E##] [Feature]. Drift resolved. Compliance verified. EPICS.md updated. ACTIVE_CYCLE.md updated. Ready to open PR.`
