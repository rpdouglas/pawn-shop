# Antigravity Skills Setup & Migration Plan

The codebase currently contains a rich set of AI workflows originally structured for Claude and generic prompt runners, but Antigravity (AGY) operates using a more dynamic, agent-based paradigm. 

## Open Questions
> [!IMPORTANT]
> - Do you want the Antigravity subagents defined globally (via `.antigravitycli/` config if supported in your setup) or generated dynamically at the start of new sessions using the `define_subagent` tool?
> - Should we delete the old `.claude/` directory to avoid confusion, or keep it for backward compatibility?

## Current State Analysis

Based on a review of the codebase, here is what we currently have:

1. **Structured Workflows (`docs/prompts/`)**: We have 11 highly detailed markdown prompts (`PLANNING.md`, `APPROVAL.md`, `TESTING.md`, `TICKET_CLOSE.md`, etc.) that define strict operational procedures.
2. **Claude Commands (`.claude/commands/`)**: 8 lightweight wrapper commands (e.g., `plan.md`, `approve.md`) that just tell the AI to go read the corresponding file in `docs/prompts/`.
3. **Claude Skills (`.claude/skills/`)**: 4 structured skills (`epic-planner`, `feature-executor`, `qa-verification`, `sprint-audit`) containing `SKILL.md` definitions.
4. **Antigravity Base (`GEMINI.md`)**: The core system prompt defining our persona (Principal Architect), mandates, and hard stops.

## Proposed Changes

To gear this strictly for Antigravity, we will migrate from static "commands" to **Antigravity Subagents** and **Native Slash Commands**.

### 1. Map Skills to Antigravity Subagents
Antigravity uses the `define_subagent` API to create specialized workers. We will create a script or a master prompt that initializes these subagents based on the `.claude/skills/` configurations.

- **Epic Planner Subagent**: Inherits the `docs/prompts/PLANNING.md` and `epic-planner/SKILL.md` instructions. Responsible for outputting 3-strategy proposals to `docs/plans/` without writing code.
- **Feature Executor Subagent**: Bound by `docs/prompts/FIX.md` and `feature-executor`. Granted strict write access only after a plan is approved.
- **QA Verifier Subagent**: Inherits `TESTING.md` and `qa-verification`. Runs in the background to validate compliance (No PII, router-level age gates, no hardcoded hexes).
- **Sprint Auditor Subagent**: Inherits `POST_SPRINT_AUDIT.md`. Validates drift detection across the schemas and epics.

### 2. Leverage Antigravity Native Slash Commands
Instead of `.claude/commands/`, we will map the workflow to native AGY slash commands in our documentation:
- **Planning:** Instead of `/plan`, we will instruct you to use `/grill-me` combined with the Epic Planner subagent to align on the 3-strategy proposal interactively.
- **Auditing:** Instead of `/audit`, we will delegate long-running codebase checks to a subagent using the `/goal` command, ensuring it runs exhaustively until completion.

### 3. Cleanup & Standardization
- [DELETE] `.claude/` directory (Optional: if we want to fully commit to AGY and remove legacy clutter).
- [MODIFY] `docs/AI_WORKFLOW.md` to document how to invoke the Antigravity subagents and utilize `/goal`, `/schedule`, and `/grill-me` for the Pawn Shop.

## Verification Plan

### Manual Verification
1. Approve this plan to begin execution.
2. We will initialize the **Epic Planner Subagent** via Antigravity's `define_subagent` tool using the rules from `PLANNING.md`.
3. We will run a test invocation of the subagent to ensure it correctly parses a dummy project spec and proposes a 3-strategy plan without writing code.
