# [Implementation Plan] Antigravity Workflow Optimization

Align the Antigravity (Gemini-based) assistant workflow with the established Pawn Shop governance, replacing manual prompt pasting with native agentic capabilities.

## User Review Required

> [!IMPORTANT]
> **Workflow Shift:** This plan moves from "pasting prompts" to "delegating to subagents". I will define subagents that encapsulate the logic in `docs/prompts/`.
> **Artifact Usage:** Antigravity's native `implementation_plan.md` and `walkthrough.md` will replace the manual creation of files in `docs/plans/` (though I can still copy them there for persistence if requested).

## Proposed Changes

### 1. Persistent Context & Guardrails
Leverage `.antigravitycli/mandates.md` (already created) as the "always-on" initialization. I will update it to include the persona quick-reference and anti-hallucination rules.

#### [MODIFY] [mandates.md](file:///workspaces/pawn-shop/.antigravitycli/mandates.md)
*   Integrate full persona "Tests" (Kevin Speed Test, Marie Discretion Test, etc.).
*   Add the "Three-Strategy" requirement as a default for any feature planning.

---

### 2. Specialized Subagent Definitions
Define subagents that can be invoked to handle specific phases of the existing workflow.

#### [NEW] [subagents]
*   **`Architect`**: Responsible for Phase 1 (Persona Gate), Phase 2 (Schema Audit), and User Guide drift detection.
*   **`Firebase_Specialist`**: Responsible for Firestore Security Rules, Cloud Function auth logic, and Emulator-driven testing.
*   **`Compliance_Officer`**: Responsible for auditing age gates, `auditLogs` logic, PII leak detection, and SEO/A11y thresholds (Lighthouse).
*   **`Quality_Assurance`**: Responsible for design system token validation, Playwright E2E tests (`test:e2e`), and automated A11y scans (`test:a11y`).
*   **`Technical_Writer`**: Responsible for syncing changes to the VitePress `user-guide`.

---

### 3. Automated Governance
Integrate "Ticket Close" (docs sync, decisions log) into my finalization step.

#### [MODIFY] [task.md](file:///home/codespace/.gemini/antigravity-cli/brain/055ee927-2927-46d1-9e01-f25879f5efd0/task.md)
*   Add a standard "Governance" section to every task list:
    - [ ] Update `docs/firestore-schema.md` (if fields changed)
    - [ ] Update `docs/DECISIONS.md`
    - [ ] Update `docs/EPICS.md`
    - [ ] Update `user-guide/` (if UI/UX or staff workflows changed)
    - [ ] Verify `firestore.rules` and `storage.rules` (if data model changed)
    - [ ] Verify Cloud Function PII audit (zero `console.log` of user data)
    - [ ] Generate `walkthrough.md` with persona verification results.

---

### 4. Slash Commands & Shortcuts
Map existing `/.claude/commands/` logic to Antigravity recommendations.
*   `/goal`: Recommended for full feature execution.
*   `/grill-me`: Recommended for Strategy B vs C debates.

## Verification Plan
### Automated Tests
*   `npm run test:a11y` — Ensure zero accessibility violations via Playwright.
*   `npm run test:lhci` — Verify Performance (≥0.40), A11y (≥0.90), and SEO (≥0.95).
*   Verify subagents can correctly identify persona violations in a test component.
*   Verify `mandates.md` is referenced in subagent prompts.

### Manual Verification
*   Execute a "dry run" planning session for a dummy feature (e.g., "Tobacco View Landing Page").
