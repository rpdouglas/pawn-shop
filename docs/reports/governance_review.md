# Deep Review: Project Governance Docs (`/docs/`)

## 1. Overview & Structure
The `/docs/` folder serves as the central brain of The Pawn Shop's governance, providing an excellent, well-defined foundation for both AI agents and human developers. The documentation is structured into four main pillars:

### A. Strategic & Contextual Foundation
- **`CONTEXT.md`**: The master brief. Summarizes environments, design tokens, data schema, non-negotiable rules, personas, and the Two-AI strategy. Used to ground AI context on every session.
- **`AI_WORKFLOW.md` & `AI_MODELS.md`**: Clearly delineates the responsibilities of Antigravity (Agentic Developer) vs. Gemini (Staff Operations Assistant).
- **`PERSONAS.md`**: Outlines the 8 user archetypes used for validating feature UX and logic.

### B. Execution & Cycle Management
- **`ACTIVE_CYCLE.md`**: The sprint tracker. Captures what's currently being worked on, deferred items, and open decisions.
- **`EPICS.md`**: The backlog and historical log of massive feature drops.
- **`DECISIONS.md`**: The Architectural Decision Record (ADR) log documenting every major technical choice.
- **`plans/` & `projects/`**: The execution specs. Enforces the "Specs-First" pipeline before coding begins.

### C. Compliance & Guardrails
- **`COMPLIANCE.md`**: The central repository for critical platform rules (Age Gates, PIPEDA, Police Holds, Serial Blacklist, Kanien'keha review).
- **`CULTURAL_LOG.md`**: Tracks manual community sign-offs for cultural assets and indigenous language use.

### D. Technical References
- **`firestore-schema.md`**: The single source of truth for the database.
- **`design-system.md`**: The single source of truth for UI/UX styles.
- **`SECRETS_SETUP.md`**: Infrastructure setup for environments.
- **`subagents/`**: Role definitions for governance agents (e.g., `Brand_Auditor`, `Security_Auditor`).

---

## 2. Identified Issues & Drift Risks

While the governance framework is incredibly strong, there are structural redundancies and clutters that threaten its long-term scalability.

### 🔴 Redundancy & Fragmentation (The `policies/` folder)
There is significant overlap between files in the root `/docs` folder and the `/docs/policies/` subfolder:
- `COMPLIANCE.md` vs. `policies/compliance.md`
- `CULTURAL_LOG.md` vs. `policies/cultural.md`
- `design-system.md` vs. `policies/design.md`
This dual-maintenance requirement almost guarantees drift. If a new compliance rule is added, developers (or AI) might only update one of the two files.

### 🟡 Cluttered Execution Folders (`plans/`)
The `plans/` directory currently holds 33 files. There is no distinction between **active** plans and **completed** plans. As the project grows, finding the relevant active plan will become difficult.

### 🟡 Conflicting Archive Directories
There are currently two archive folders:
- `docs/archive/` (Contains `past_cycles_log.md` and structured `plans/`, `projects/` subdirectories)
- `docs/archives/` (Contains a flat list of old completed epic files and `.md` templates)
Having both creates confusion on where deprecating files should actually go.

### 🟡 Template Misuse
`docs/ticket_close.md` is named like a generic template but actually contains the completed ticket close audit for **E01 (Dev Environment Setup)**. It is essentially historical data cluttering the root namespace.

### 🟡 Large Monolithic Logs
`DECISIONS.md` is 56KB and `EPICS.md` is 66KB. As these logs grow, they become difficult to parse, and context injection for AI might consume unnecessary tokens for older, irrelevant decisions.

### 🟡 Missing Onboarding Index
While `CONTEXT.md` is an excellent entry point, there is no root `README.md` inside the `/docs` folder acting as a simple Table of Contents to help human developers navigate the repository's governance.

---

## 3. Recommended Actions

To harden the governance repository and improve maintenance, we recommend the following restructuring actions:

1. **Consolidate Policies:** Deprecate the `policies/` folder entirely. Merge any unique details into the root `COMPLIANCE.md`, `CULTURAL_LOG.md`, and `design-system.md` files.
2. **Merge the Archives:** Move all contents from `docs/archives/` into `docs/archive/` (ideally mapping them into their respective `plans/` or `projects/` subfolders), and delete the plural `archives/` directory.
3. **Archive Completed Plans:** Move the 33 completed plans in `docs/plans/` to `docs/archive/plans/` to keep the active directory clean.
4. **Fix the Ticket Close Template:** Rename `ticket_close.md` to `E01_ticket_close_audit.md` and move it to `reports/` or `archive/`. Create a blank `templates/TICKET_CLOSE_TEMPLATE.md` in its place.
5. **Create a `README.md`:** Add a simple Table of Contents at the root of `/docs/` mapping out the governance structure.
6. **(Future) Split Logs:** Consider splitting `DECISIONS.md` into yearly logs (e.g., `DECISIONS_2026.md`) or breaking it out into a standard ADR folder format.
