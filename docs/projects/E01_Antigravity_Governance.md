# Project E01: Antigravity Governance Integration

**Status:** Done — 2026-05-20
**Epic:** E01 — Dev Environment Setup
**Phase:** Phase 1 from EPICS.md
**Primary Persona:** Staff
**Secondary Personas:** All
**AI Involvement:** Claude (dev)

**Objective:** Integrate strict 5-phase project governance rules natively into the Antigravity developer workflow to guarantee that no code is written before plan approval and that all roadmaps are kept strictly in sync.

---

## 1. User Story

> As **Staff (Developer Operations)**, I want **the Antigravity agentic environment to strictly enforce planning and spec gates** so that **I can prevent context drift, avoid compliance slips, and ensure all changes are approved before execution**.

---

## 2. Persona Acceptance Criteria

These are **pass/fail requirements**, not guidelines. The feature must satisfy every applicable item before it ships.

### Primary Persona Gate (Staff)

- [x] Antigravity halts and exits execution immediately after generating a strategy plan in `docs/plans/` and outputting the summary block.
- [x] No tools that write or edit source code are called during the PLANNING phase.
- [x] System-wide rule instructions force compliance checks (age gates, PII exclusion, schema alignment) before any plan is proposed.

### Makoonsii Trust Test (always run)

- [x] Not directly applicable for developer operations, but ensures that no Makoonsii-facing layout uses hardcoded hex values or untested Kanien'kéha, as all code changes must first go through the strategy gates.

---

## 3. Compliance Gate

Complete before any code is written. If any item applies, define how it will be handled.

- [x] **Age gate required?** (cannabis 19+, fireworks 18+) — Enforced at router level, not component level
  - *Not directly applicable to this developer setup feature, but the setup will enforce that all subsequent feature plans have verified age gates in place before coding begins.*
- [x] **`auditLogs` events required?** — None for dev setup.
- [x] **PII exclusion** — Confirm no names, emails, phone numbers enter logs or setup files.
- [x] **`policeHold` respected** — Ensured.
- [x] **`aiDescription` draft-only** — Ensured.
- [x] **AI API security** — Ensured.
- [x] **CASL compliance** — Ensured.
- [x] **Scarcity integrity** — Ensured.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

None for this developer environment/governance setup task.

```
Collection: NONE
```

### New Fields Required

None.

```
NEW FIELDS: NONE
```

### TypeScript Interfaces

None.

### Security Rules Required

None.

---

## 5. AI Involvement Detail

### If Claude (development):
- Which `docs/prompts/` files apply to this project? `docs/prompts/INITIALIZATION.md`, `docs/prompts/PLANNING.md`, `docs/prompts/APPROVAL.md`, `docs/prompts/TICKET_CLOSE.md`.
- Any specific Claude guardrails for this feature? Ensure that planning is performed before any code or config modification is executed.

---

## 6. Implementation Phases

### Phase 1 — Rule Integration
- [x] Update `GEMINI.md` in the project root with the strict Planning Gate mandate.
- [x] Update `CLAUDE.md` in the project root to align the slash command descriptions and governance requirements.
- [x] Define custom system instruction hooks in `.antigravitycli/mandates.md` to bind the Antigravity developer session.

### Phase 2 — Governance Automation Scripts
- [x] Create a lightweight template generator script at `scripts/governance/init-project.js` to automate project spec creation.
- [x] Create a lightweight plan generator script at `scripts/governance/init-plan.js` to automate planning template copy-pasting.
- [x] Register scripts as npm run tasks in `package.json` for easy CLI execution.

### Phase 3 — QA & Validation
- [x] Run `npx tsc -b` and `npm run build` to verify there are zero build breakages.
- [x] Verify that a mock ticket successfully goes through the `/read-state` -> `/plan` -> wait for approval loop.

---

## 7. Definition of Done

A feature is done when all of these are true:

- [x] Persona acceptance criteria: all applicable items passed.
- [x] Compliance gate: all applicable items verified.
- [x] `npm run build` — zero errors.
- [x] `npm run lint` — zero warnings.
- [x] `docs/EPICS.md` E01 Docs-as-Code Planning task ticked.
- [x] `docs/DECISIONS.md` updated with the decision to integrate Antigravity governance.
- [x] PR description generated.

---

*The Pawn Shop · docs/projects/E01_Antigravity_Governance.md · v1.0*
