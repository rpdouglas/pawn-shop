# Plan: E76 — Extended Autonomous Subagents

**Epic:** E76
**Primary Persona:** Marcus (Developer)
**Secondary Personas:** Marie, Kevin

## Objective
Define and implement three new autonomous subagents (`Security_Auditor`, `Accessibility_Auditor`, `Documentation_Specialist`) to enforce security, accessibility, and documentation rules.

## Persona Impact Statement
- **Marcus:** Will receive automated, async feedback on security rules, test coverage, and docs-as-code alignment without manual intervention.
- **Makoonsii/Marie:** Ensures that the accessibility (`axe-core`) and documentation (`vitepress`) standards are met consistently, protecting the brand's premium and accessible feel.

## Compliance Checklist
- [x] No Kanien'kéha generation
- [x] No hardcoded hexes
- [x] `docs/reports/` used for all artifact outputs
- [x] Security rules (`firestore.rules`, `storage.rules`) strictly audited by AI.

## Schema Audit
- No changes to `firestore-schema.md` required for this developer-tooling epic.

---

## 3-Strategy Approach

### Strategy A: Minimal (Read-Only Advisors)
- **Subagent Setup:** Use `define_subagent` to create the three subagents with `enable_write_tools: false`.
- **Workflow:** Subagents act as pure analytical advisors. The parent agent must manually run `npm run test:e2e` (axe-core) or `npm run docs:build` and pass the raw stdout to the subagents via `send_message`. The parent agent then writes their findings to `docs/reports/`.
- **Pros:** High safety, lowest cost, no risk of subagents modifying the filesystem accidentally.
- **Cons:** Highly manual orchestration required by the parent agent.

### Strategy B: Recommended (Autonomous Executors)
- **Subagent Setup:** Define the subagents with `enable_write_tools: true` so they can run commands and write files directly.
- **Workflow:** 
  - `Security_Auditor` can autonomously run the Firebase Emulator to validate `firestore.rules`.
  - `Accessibility_Auditor` can autonomously run Playwright (`npm run test:e2e`) to harvest axe-core results.
  - `Documentation_Specialist` can autonomously run Vitepress builds and sync markdown.
  - Subagents write their own audit reports directly to `docs/reports/`.
- **Pros:** Offloads execution from the parent agent; subagents handle their own build/test processes end-to-end.
- **Cons:** Moderate token usage; requires trusting subagents with write/command access.

### Strategy C: Robust (Scheduled Sentinels)
- **Subagent Setup:** Define the subagents with `enable_write_tools: true` and `enable_subagent_tools: true`.
- **Workflow:** Subagents are invoked once and use the `schedule` tool (cron mode) to act as background daemons. They periodically poll the file system for changes to `firestore.rules`, UI components, or markdown docs. When changes are detected, they run their respective audits and generate reports in `docs/reports/` automatically.
- **Pros:** True "set-and-forget" continuous integration within the agentic IDE.
- **Cons:** High background token usage; potential race conditions with the parent agent modifying files simultaneously.

---
*Awaiting User Approval*
