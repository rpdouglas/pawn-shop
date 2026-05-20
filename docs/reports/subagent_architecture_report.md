# Subagent Architecture Report — The Pawn Shop

This report reviews the proposed subagent ecosystem for Antigravity and provides recommendations based on industry best practices for similar high-compliance, persona-driven React/Firebase applications.

## 1. Review of Proposed Subagents

| Subagent | Domain | Key Responsibilities | Persona Alignment |
|---|---|---|---|
| **`Architect`** | Systems & Planning | Persona Gate, Schema Audit, User Guide drift detection. | **Jordan**, **Marcus** |
| **`Firebase_Specialist`** | Cloud Infrastructure | Security Rules, Auth custom claims, Cloud Function logic, Emulators. | **Marie**, **Dale** |
| **`Compliance_Officer`** | Risk & Security | Age gates, PII leak audit, `auditLogs` integrity, Lighthouse SEO/A11y. | **Marie** |
| **`QA_Analyst`** | Verification | Token validation, Playwright E2E (`test:e2e`), A11y scans (`test:a11y`). | **Kevin**, **Sandra** |
| **`Technical_Writer`** | Documentation | VitePress `user-guide` sync, `DECISIONS.md` maintenance. | **Makoonsii** |

---

## 2. Industry Deep Dive: Similar Architectures

Based on a review of AI-driven development in serverless (BaaS) and multi-vertical retail stacks, we recommend the following additional subagent roles to prevent "invisible drift" and cultural regression.

### A. Linguistic & Cultural Reviewer (`Linguistic_Auditor`)
*   **Need:** The user guide and system prompts strictly forbid AI-generated Kanien'kéha.
*   **Role:** Scans all proposed UI copy, articles, and documentation for Kanien'kéha content. If found, it flags the file for "Manual Community Review" and blocks the PR until a human sign-off is logged in `DECISIONS.md`.
*   **Persona:** **Makoonsii**, **Marcus**.

### B. Data & State Steward (`Data_Steward`)
*   **Need:** Firebase projects rely heavily on seed data for local development (`emulator-data`).
*   **Role:** Manages the consistency of emulator data exports. Ensures that new features have corresponding "Seed Sets" (e.g., a "Tobacco" seed set for the upcoming view) and verifies that `export-on-exit` is functioning correctly.
*   **Persona:** **Dale**, **Sandra**.

### C. Performance & Bundle Engineer (`Performance_Engineer`)
*   **Need:** Current bundle size is ~437 KB. Lighthouse targets are aggressive (Accessibility ≥ 0.90).
*   **Role:** Monitors bundle impact of new dependencies. Runs `npm run test:lhci` and compares results against the last cycle's baseline. Flags "Performance Regressions" before they reach the `Compliance_Officer`.
*   **Persona:** **Jordan**.

### D. Merchandising & Urgency Auditor (`Brand_Auditor`)
*   **Need:** `GEMINI.md` forbids algorithmic scarcity (auto-applying `rare-find`, etc.).
*   **Role:** Audits any logic involving `items` collection writes to ensure `merchandisingTags` are only modified by staff-driven functions or explicitly requested by the user. Prevents "Dark Pattern" regressions.
*   **Persona:** **Makoonsii**, **Kevin**.

---

## 3. Final Recommendations

> [!TIP]
> **Consolidated Expert Model:** Instead of 10+ subagents, we recommend a "Pod" structure where subagents share a common knowledge base (`mandates.md`) but have distinct "Pre-Execution Hooks".

### Recommendation Checklist:
1.  [x] **Implement `Linguistic_Auditor`**: Critical for the Akwesasne cultural mandate.
2.  [x] **Implement `Firebase_Specialist`**: To own the security rules which are the project's primary defense.
3.  [x] **Automate "Ticket Close" with `Technical_Writer`**: To bridge the gap between code and the VitePress guide.

### Next Steps:
Shall I define the **`Linguistic_Auditor`** and **`Firebase_Specialist`** as our first operational subagents?
