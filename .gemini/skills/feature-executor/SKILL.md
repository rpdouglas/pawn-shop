---
name: feature-executor
description: Professional feature implementation and execution workflow for The Pawn Shop. Use AFTER a plan is approved. Executes the Three Gates (Approval, Verification, Scope Lock), enforces strict code quality and compliance standards, and performs post-execution governance sync.
---

# Feature Executor Skill — The Pawn Shop

This skill provides a systematic workflow for safely and effectively implementing new features and bug fixes once an architectural plan has been approved.

## The Three Gates (Pre-Execution)

You MUST complete all three gates before writing a single line of code.

### Gate 1 — Plan Approval & Context Load
- **State Approval:** Explicitly state which strategy (A, B, or C) was approved.
- **Load Plan:** Read the approved plan file from `docs/plans/` to load schema audits, compliance requirements, and implementation details.

### Gate 2 — Verification (The Read Gate)
- **Read Files:** Read the complete, current contents of every file you intend to modify. Do NOT rely on prior session memory.
- **Blast Radius:** If modifying shared utilities, interfaces (`src/lib/types.ts`), or exported components, perform a `grep_search` to map dependencies. If >5 files are impacted, confirm with the user.

### Gate 3 — Scope Lock
- **List Files:** Enumerate the exact list of files to be CREATED and MODIFIED. Do not touch files outside this list.

## Execution Protocol

### Code Quality Rules
- **No `any` types:** Use specific interfaces or `unknown`. Never cast Firestore data as `any`.
- **CSS Tokens:** Use `var(--color-primary)` and `.view-*` classes. No hardcoded hex values.
- **Price Integrity:** Use CAD cents (integers) exclusively.
- **Date Handling:** Convert Firestore `Timestamp` to JS `Date` using `.toDate()` where appropriate.
- **Clean Code:** No `console.log`, no unused imports, no unused variables (prefix with `_`).

### Compliance Execution
- **Router-Level Gates:** Implement age gates at the router, not the component level.
- **Admin SDK Logs:** Ensure `auditLogs` are written via Cloud Functions (Admin SDK).
- **PII Exclusion:** Verify no PII (names, emails, phones) enters logs, analytics, or console.
- **Police Hold:** Ensure public queries respect `policeHold: true`.

## Post-Execution Sync
After code delivery, confirm:
1.  **Schema Sync:** New fields added to `docs/firestore-schema.md`.
2.  **Decision Log:** Architectural choices added to `docs/DECISIONS.md`.
3.  **Epic Progress:** Relevant tasks ticked in `docs/EPICS.md`.
4.  **Rules/Indexes:** `firestore.rules` and `firestore.indexes.json` updated.

## Hand-off
End with:
`Ready for QA. Run qa-verification to verify. Suggested smoke tests: [list 2-3 tests].`
