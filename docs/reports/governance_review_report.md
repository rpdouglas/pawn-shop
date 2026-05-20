# Project Governance Review & Antigravity Tweaks

This report evaluates The Pawn Shop's existing project governance against industry best practices for AI-driven "Docs-as-Code" workflows and proposes specific tweaks for the Antigravity migration.

## 1. Assessment of Current Practices

The Pawn Shop currently follows a high-discipline **Manual-Agentic** governance model:
*   **Strengths:** Single source of truth (`firestore-schema.md`), rigid persona-gate checks, and a versioned decision log (`DECISIONS.md`).
*   **Gaps:** No explicit lineage tracking for AI-driven decisions, manual overhead in syncing `EPICS.md` and `ACTIVE_CYCLE.md`, and lack of structured validation proofs (Lighthouse/Playwright results) in the historical record.

---

## 2. Industry Benchmarking (AI-Driven Governance)

Developers using agentic workflows (Antigravity, Cursor, Windsurf) and "Docs-as-Code" are moving toward:
*   **Policy-as-Code:** Moving rules from "prompts" to "repo-resident policies" that agents can read and enforce.
*   **Agent Attribution:** Tracking which specific subagent or "Expert" made a choice to facilitate human-in-the-loop debugging.
*   **Verification Anchoring:** Automatically attaching test artifacts (reports, screenshots) to the documentation of a feature.

---

## 3. Proposed Governance Tweaks

### Tweak 1: Agent Attribution in `DECISIONS.md`
To maintain a clear audit trail between human and AI choices, append an `(Agent)` or `(Subagent Name)` suffix to any automated architectural choice.
*   **Current:** `2026-05-19 — Added soldAt timestamp to items/{id}.`
*   **Tweak:** `2026-05-19 — Added soldAt timestamp to items/{id}. (Firebase_Specialist)`

### Tweak 2: "Validation Proof" Appendix
Modify the **`walkthrough.md`** and **PR Description** requirements to include a "Verification Payload."
*   **Requirement:** Attach the summary output of `npm run test:lhci` and `npm run test:a11y` directly to the documentation. This anchors the code's quality to a specific point in time.

### Tweak 3: Modular Policy Directory (`docs/policies/`)
Move high-level mandates from `GEMINI.md` and `docs/prompts/` into a structured `docs/policies/` directory. This allows subagents to reference specific policies by path.
*   `docs/policies/compliance.md` (Age Gates, PII)
*   `docs/policies/cultural.md` (Kanien'kéha Rule)
*   `docs/policies/design.md` (Motion & Tokens)

### Tweak 4: Linguistic Review Registry (`docs/CULTURAL_LOG.md`)
Create a dedicated log for the **Linguistic_Auditor** to track human sign-offs.
*   **Workflow:** Subagent detects Kanien'kéha → Blocks PR → User reviews → User adds entry to `CULTURAL_LOG.md` → Subagent verifies entry and unblocks.

---

## 4. Modified Build & Governance Sync

With the move to Antigravity, the `Technical_Writer` subagent will now automate the following:
1.  **Sync `task.md` → `EPICS.md`**: Automatically tick off tasks in the high-level epic doc.
2.  **Generate `DECISIONS.md`**: Extract decisions from the `implementation_plan.md` and log them with attribution.
3.  **Audit `user-guide`**: Perform a "Drift Check" before the PR is opened to ensure VitePress matches the new components.

### Recommendation:
Shall I initialize the `docs/policies/` directory and create the `docs/CULTURAL_LOG.md` to formally implement these tweaks?
