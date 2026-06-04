# Technical Stack & Autonomous Workflow Audit

**Date:** 2026-06-04
**Objective:** Map the existing Antigravity subagents and commands against the actual `package.json` tech stack to identify missing automated roles for the solo-developer autonomous build process.

## 1. Current Subagents vs. Tech Stack
We currently have 4 specialized subagents:
1. **Brand_Auditor:** Enforces UX constraints (no "rare-find" spam).
2. **Data_Steward:** Manages `emulator-data`.
3. **Linguistic_Auditor:** Enforces the Kanien'kéha copy rules.
4. **Performance_Engineer:** Maps directly to our `@lhci/cli` dependency.

## 2. Identified Coverage Gaps in the Tech Stack
Upon reviewing `package.json`, we have several powerful tools installed that are **not** being utilized by our autonomous subagents.

### Gap A: End-to-End & Unit Testing
**Tech Stack Present:** `vitest`, `@playwright/test`, `@testing-library/react`
**Commands Present:** `npm run test:e2e`, `npm run test`
**Missing Subagent: `QA_Engineer`**
- **Purpose:** Right now, the "Blocking Compiler Gate" in `GEMINI.md` only runs `npm run build && npm run lint`. It does not execute tests. 
- **Action:** We should create a `QA_Engineer` subagent whose sole job is to write Vitest/Playwright tests for any new UI components and autonomously run the test suite before closing a ticket.

### Gap B: Firebase Security Rules
**Tech Stack Present:** `firebase`, `firebase-admin`, Firestore/Storage rules.
**Missing Subagent: `Security_Auditor`**
- **Purpose:** We heavily rely on Firebase Security Rules (`firestore.rules` and `storage.rules`) to protect the database, but our workflow only mandates updating `docs/firestore-schema.md`. 
- **Action:** Create a `Security_Auditor` subagent that is automatically invoked whenever a schema change occurs to ensure the `firestore.rules` are airtight and deny access by default.

### Gap C: Accessibility (a11y) Compliance
**Tech Stack Present:** `@axe-core/playwright`
**Commands Present:** `npm run test:a11y`
**Missing Subagent: `Accessibility_Auditor`**
- **Purpose:** We have Axe installed but no agentic workflow to enforce it.
- **Action:** Create an `Accessibility_Auditor` that runs the `test:a11y` script and automatically fixes missing `aria-labels`, poor color contrast in Tailwind, or broken keyboard navigation.

### Gap D: VitePress Documentation Integrity
**Tech Stack Present:** `vitepress`
**Commands Present:** `npm run guide:build`
**Missing Subagent: `Documentation_Specialist`**
- **Purpose:** We just manually added a "Documentation Audit" step to `GEMINI.md`. Instead of the primary agent guessing how to update the docs, a dedicated subagent could run `guide:build` to ensure no broken markdown links occur and automatically sync `docs/` with `user-guide/`.

## 3. Recommended Slash Commands to Add
To support the solo developer, we should formalize these slash commands in our mental model:
- **`/test`**: Immediately invokes the `QA_Engineer` to run the full Playwright and Vitest suites and output a coverage report.
- **`/audit-security`**: Triggers the `Security_Auditor` to review all Firebase Rules against the current schema.

## Summary Recommendation
To make your Antigravity build process completely bulletproof, I recommend we immediately define and register two new subagents: **`QA_Engineer`** and **`Security_Auditor`**. We should also update the `GEMINI.md` Blocking Compiler Gate to mandate that the `QA_Engineer` signs off on all E2E tests before a PR is closed.
