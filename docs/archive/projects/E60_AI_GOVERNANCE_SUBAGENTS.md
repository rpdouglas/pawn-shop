# Project E60: AI Governance & Automation Subagents

**Status:** Done — 2026-06-04
**Epic:** E60 — AI Governance & Automation Subagents
**Phase:** Phase 14
**Primary Persona:** Marcus
**Secondary Personas:** Marie, Kevin
**AI Involvement:** Antigravity Subagents

**Objective:** Define and implement four specialized Antigravity subagents (`Linguistic_Auditor`, `Data_Steward`, `Performance_Engineer`, `Brand_Auditor`) to automatically enforce our "Docs-as-Code" governance and compliance constraints during development.

---

## 1. User Story

> As **Marcus**, I want to **have automated AI subagents strictly enforce our cultural and governance rules** so that I can **guarantee no Kanien'kéha copy or compliance violations slip into production without manual review**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

> *"The Kanien'kéha Rule: Any feature touching collection names, editorial headings, or article content must not generate Kanien'kéha language without explicit review."*

Test for it: The `Linguistic_Auditor` subagent must successfully detect simulated Kanien'kéha generation and block progression until a sign-off is logged in `DECISIONS.md`.

### Makoonsii Trust Test (always run)

- [x] All touch targets ≥48px on mobile viewport (375px) - N/A (Internal Dev Tools)
- [x] All copy uses plain language — no jargon, no retail buzzwords - N/A
- [x] No Kanien'kéha without `indigenousLanguageReviewed: true` - Enforced by the new subagent.
- [x] Feature is navigable by a low-tech mobile user in under 3 taps - N/A

---

## 3. Compliance Gate

- [ ] **Age gate required?** — N/A
- [ ] **`auditLogs` events required?** — N/A (Dev workflow only)
- [ ] **PII exclusion** — N/A
- [ ] **`policeHold` respected** — N/A
- [ ] **`aiDescription` draft-only** — N/A
- [ ] **AI API security** — N/A
- [ ] **CASL compliance** — N/A
- [ ] **Scarcity integrity** — The `Brand_Auditor` subagent specifically exists to enforce this rule programmatically.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

None directly during runtime. This feature configures development tools.

### New Fields Required

NONE

### TypeScript Interfaces

NONE

### Security Rules Required

NONE

---

## 5. AI Involvement Detail

### If Claude (development):
- N/A

### If Gemini / Antigravity (runtime/dev):
- This project will utilize Antigravity's `define_subagent` tool to register `Linguistic_Auditor`, `Data_Steward`, `Performance_Engineer`, and `Brand_Auditor` within the workspace so they can be invoked via `invoke_subagent`.

---

## 6. Implementation Phases

### Phase 1 — Subagent Definitions

- [ ] Define the `Linguistic_Auditor` subagent system prompt and scope.
- [ ] Define the `Data_Steward` subagent system prompt and scope.
- [ ] Define the `Performance_Engineer` subagent system prompt and scope.
- [ ] Define the `Brand_Auditor` subagent system prompt and scope.

### Phase 2 — Orchestration

- [ ] Execute `define_subagent` for all four subagents to register them in the workspace.

### Phase 3 — QA

- [ ] Run a test invocation to ensure the subagents behave correctly according to their specific domains.

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: passed
- [ ] Compliance gate: verified
- [ ] Relevant `docs/EPICS.md` task(s) ticked
- [ ] Subagents successfully defined via `define_subagent`.

---

*The Pawn Shop · docs/projects/E60_AI_GOVERNANCE_SUBAGENTS.md · v1.0*
