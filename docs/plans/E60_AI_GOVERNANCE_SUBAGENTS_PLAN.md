# Implementation Plan: E60 AI Governance & Automation Subagents

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona
- **Primary persona:** Marcus (Requires absolute adherence to Kanien'kéha rules and brand consistency).
- **Secondary personas:** Marie (Compliance assurance), Staff (Development workflow).

### 1.2 Compliance Gate
- [x] Age gate required? N/A
- [x] `auditLogs` event defined? N/A
- [x] PII excluded from all logs and analytics? N/A
- [x] `policeHold` logic respected? N/A
- [x] `aiDescription` kept separate from `description`? N/A
- [x] All AI API calls going through Cloud Functions? N/A

## Phase 2 — Schema Audit
Collections impacted: NONE
New fields required: NONE

## Phase 3 — Three-Strategy Proposal

### Strategy A — Markdown Definitions Only
**Summary:** Create raw markdown system prompts for each of the four subagents in a new `docs/subagents/` directory, requiring developers to manually configure them when needed.
**Architecture:** 
- Markdown files only.
**Persona Lens:** Provides the documentation to satisfy Marcus, but relies on human memory to actually invoke them.
**Compliance:** N/A
**Trade-offs:** Gains visibility in git, sacrifices guaranteed enforcement.
**Estimated scope:** Small — 4 files.

### Strategy B — Native Antigravity Registration & Git Tracking
**Summary:** Use the Antigravity `define_subagent` tool to programmatically register all four subagents into the active environment right now, while simultaneously saving their system prompts to `docs/subagents/` for version control.
**Architecture:**
- Uses `define_subagent` tool.
- Creates `docs/subagents/*.md` for git tracking.
**Persona Lens:** Ensures instant, zero-friction enforcement for Marcus's strict linguistic and brand rules.
**Compliance:** N/A
**Trade-offs:** Gains immediate functionality and git tracking.
**Estimated scope:** Medium — 4 files + 4 tool calls.

### Strategy C — Complete Pod Orchestrator
**Summary:** In addition to registering the four subagents, create a master `Compliance_Orchestrator` subagent that automatically delegates tasks to the other four whenever a PR is opened or code is modified.
**Architecture:** 
- 5 subagents registered via `define_subagent`.
- Custom git pre-commit hooks to trigger the orchestrator.
**Persona Lens:** Absolute maximum security for Marcus and Marie.
**Compliance:** N/A
**Trade-offs:** High complexity and potential to slow down the development loop significantly with too many AI cross-checks.
**Estimated scope:** Large — 5 files, git hooks, tool calls.

## Phase 4 — Anti-Regression Protocol
1. **The Hardcoded Hex Trap:** N/A.
2. **The Firestore Field Invention Trap:** Verified against `docs/firestore-schema.md`.
3. **The Client-Side AI Key Trap:** N/A.
4. **The Scarcity Manufacture Trap:** The `Brand_Auditor` subagent is specifically designed to prevent this trap.
5. **The PII Log Trap:** N/A.
6. **The Age Gate Bypass Trap:** N/A.
7. **The Motion Trap:** N/A.
8. **The Typography Scale Trap:** N/A.
9. **The Brand Voice Trap:** The `Linguistic_Auditor` subagent specifically prevents brand voice failures (Kanien'kéha).
