---
name: epic-planner
description: Formal feature implementation planning workflow for The Pawn Shop. Use before writing code for any new feature or epic. Conducts pre-flight checks (spec verification), Persona & Compliance gating, Schema Audit, and produces a 3-strategy proposal (Minimal, Recommended, Robust) saved to the docs/plans/ directory.
---

# Epic Planner Skill — The Pawn Shop

This skill provides a systematic workflow for architecting and planning new features while maintaining strict persona alignment and system integrity.

## Pre-Flight Checklist
Before planning begins, you MUST:
1.  **Verify Project Spec:** Ensure a spec exists at `docs/projects/[ID]_[FEATURE].md`. If not, STOP and ask the user to create one.
2.  **Verify Context:** Read the complete, current contents of every file intended to be modified.

## Workflow Phases

### Phase 1 — Persona & Compliance Gate
- **Identify Persona:** Explicitly state the primary and secondary personas (Makoonsii, Marie, Kevin, etc.).
- **Apply Tests:** Determine which tests from `docs/PERSONAS.md` apply (e.g., Kevin Speed Test, Marie Discretion Test).
- **Compliance Audit:** Confirm requirements for Age Gates, `auditLogs`, PII exclusion, `policeHold` logic, and AI API routing (Cloud Functions only).

### Phase 2 — Schema Audit
- List all Firestore collections impacted.
- Quote relevant fields from `docs/firestore-schema.md`.
- If new fields are needed: STOP, update the schema and `DECISIONS.md` first.

### Phase 3 — Three-Strategy Proposal
Present three implementation approaches (Minimal, Recommended, Robust). Each must include:
- **Architecture:** Logic location, Firestore ops, Cloud Functions, and security rules.
- **Persona Lens:** Impact on primary and secondary personas.
- **Compliance:** Satisfaction of the compliance gate.
- **Trade-offs:** Benefits vs. sacrifices.
- **Estimated Scope:** Small/Medium/Large with file count.

**Recommendation:** State the recommended strategy and explain why it best serves the persona and compliance requirements.

### Phase 4 — Anti-Regression Protocol
Explicitly verify the plan against:
- Hardcoded hex/px values.
- Firestore field invention.
- Client-side AI keys.
- Manufactured scarcity.
- PII in logs.
- Component-level only age gates (must be at router).
- Unapproved motion patterns.
- Brand voice violations.

## Output & Storage
1.  **Save Plan:** Create a new markdown file at `docs/plans/[ID]_[FEATURE]_PLAN.md`.
2.  **Present Summary:** Provide a brief summary in the chat with the three strategies.
3.  **STOP:** Wait for approval via `APPROVAL.md`. Do not write code.

## Execution Guidelines
- **No Hex Codes:** Use brand terms or CSS tokens.
- **Dapper Voice:** Maintain a professional and sophisticated brand voice.
- **Persona Centric:** Every decision must be justified through a persona lens.
