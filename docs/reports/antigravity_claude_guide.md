# Antigravity (AGY) Setup & Workflow Guide

This document explains the setup, capabilities, and operational workflow of **Antigravity** (the agentic AI coding assistant built by Google DeepMind) for use in our project. You can provide this to Claude Code or any other AI system to help it understand how Antigravity operates within the environment.

## 1. What is Antigravity?
Antigravity is a powerful, autonomous CLI-based AI agent that operates directly within the developer's session. Unlike standard chat assistants, Antigravity functions as a **Principal Architect and Developer** with end-to-end access to the file system, terminal, and background processing. 

### Core Capabilities ("Skills"):
- **Native Terminal Execution:** Can run shell commands (e.g., `npm run test`, `npm run build`), manage background tasks, and kill processes.
- **File System Operations:** Can view, read, search (`grep`), create, and edit files. It supports single-line edits, multi-line replacements, and full-file overwrites.
- **Web & Visual Capabilities:** Can search the web, read URL contents, and generate UI mockups or design assets.
- **Asynchronous Task Management:** Can schedule timers (`cron` or one-shot) and wait for background jobs (like test suites or build processes) to complete.
- **Artifact Generation:** Generates formatted markdown artifacts (reports, diagrams, tables) to cleanly present data outside of the chat stream.

## 2. Subagent Architecture
Antigravity is a multi-agent system. It can define, invoke, and communicate with specialized "Subagents" in the background to parallelize workloads.

- **`invoke_subagent` & `define_subagent`:** Antigravity can spin up temporary or specialized subagents to handle distinct tasks (e.g., researching a codebase, running tests, or auditing security).
- **Communication:** Antigravity uses a native `send_message` tool to communicate with subagents without cluttering the user's chat. Subagents notify the primary agent asynchronously when their tasks are complete.

**Project-Specific Subagents:**
- `QA_Engineer`: Invoked strictly to run `npm run test` and `npm run test:e2e` after compilation.
- `Brand_Auditor`: Ensures Dapper/Debonair styling and correct use of Tailwind CSS variables.
- `Data_Steward`: Guards the Firestore schema against hallucinated fields and prevents raw `any` casting.
- `Security_Auditor`: Validates Firestore rules and Cloud Function access constraints.
- `Linguistic_Auditor`: Enforces project-specific language rules (e.g., preventing Mohawk generation without human review).

## 3. The Slash Commands
Antigravity supports UI-level slash commands to automate workflows. (These are triggered by the user, not the agent itself).
- `/goal`: Triggers autonomous end-to-end execution of an Epic or complex task. Antigravity will work iteratively and not stop until the goal is fully achieved.
- `/schedule`: Runs a specific instruction on a recurring schedule (e.g., "Check deployment status every 5 minutes").
- `/grill-me`: Initiates a Q&A interview with the user to clarify requirements or resolve design decisions before writing code.
- `/teamwork-preview`: Orchestrates a team of autonomous subagents to tackle a large project concurrently.

## 4. The Autonomous Workflow (3-Phase Gate)
Antigravity follows a strict "Specs-First -> Autonomous Execution -> Ticket Close" lifecycle. It does not wait for manual checklists once a strategy is approved.

### Phase A: Specs-First Planning Gate
1. Antigravity requires a project spec in `docs/projects/`.
2. It drafts a 3-strategy plan (Minimal, Recommended, Robust) in `docs/plans/` including a Persona Impact Statement, Compliance Checklist, and Schema Audit.
3. It pauses to wait for explicit human approval of one strategy.

### Phase B: Autonomous Execution & Validation
Once the user approves a strategy, Antigravity executes autonomously:
- It makes the surgical codebase edits.
- It invokes background subagents (e.g., `QA_Engineer`) to run linting, builds, and test suites.
- **Strict Testing Gate:** It refuses to proceed until `npm run build && npm run lint` pass and the `QA_Engineer` signs off on zero test failures.

### Phase C: Autonomous Ticket Close (Drift Detection)
When tests pass, Antigravity autonomously synchronizes the project documentation:
- Updates `docs/firestore-schema.md` (if changed).
- Logs decisions in `docs/DECISIONS.md` and updates `docs/EPICS.md` / `docs/ACTIVE_CYCLE.md`.
- Audits the `user-guide/` to ensure documentation matches the new code.
- Returns a final summary to the user.

## 5. Strict Guardrails & Governance
Antigravity is bound by the `GEMINI.md` system prompt and project rules:
1. **Strict Git Governance:** It is **prohibited** from running `git add`, `git commit`, or `git push`. The human developer retains total control over version control operations.
2. **Schema Integrity:** It never invents Firestore fields. `docs/firestore-schema.md` is the absolute source of truth.
3. **No PII or Secrets:** API keys remain in Cloud Functions; logs are sanitized.
4. **Cultural/Domain Restraints:** No Kanien'kéha (Mohawk) language generation. Strict enforcement of age-gating schemas (`viewTag`).

---
*Provide this document to Claude Code so it understands the local Antigravity orchestration and boundary rules.*
