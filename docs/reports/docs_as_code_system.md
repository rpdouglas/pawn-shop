# Pawn Shop Docs-as-Code System Architecture

**Version:** 1.0  
**Location:** `/docs/reports/docs_as_code_system.md`  

## 1. Overview
The Pawn Shop project eschews external project management tools (like Jira, Trello, or Notion) in favor of a rigid **Docs-as-Code** architecture. Every piece of context, schema, and operational governance is stored as Markdown alongside the source code. 

This guarantees that AI agents (like Antigravity and Claude Code) have 100% visibility into the "why" and "how" of the project without needing external API integrations, and ensures that documentation versions perfectly match the codebase version.

## 2. The Core Governance Pillars

These are the foundational files that dictate the boundaries of the system. AI agents are instructed to treat these files as absolute laws.

| File | Purpose | AI Rule |
| :--- | :--- | :--- |
| `docs/firestore-schema.md` | The single source of truth for all database models, typing, and collections. | AI **never** invents or assumes Firestore fields. It must read this file, and if a change is needed, update this file during Phase C ticket close. |
| `docs/PERSONAS.md` | Detailed psychological, cultural, and behavioral profiles (e.g., Makoonsii, Marie, Kevin). | Every feature or strategy must pass the explicit "Tests" outlined for the affected personas. |
| `docs/EPICS.md` | The macro-level product roadmap and checklist. | Used to track broad completion of major modules (e.g., E28 Markdown Engine). |
| `docs/ACTIVE_CYCLE.md` | The tactical, granular tracker for the current sprint. | AI updates task statuses here as it executes the `/goal` command. |
| `docs/decisions/` | Architecture Decision Records (ADRs). | Any permanent shift in stack, design, or business logic must be logged here so future agents understand the historical context. |

## 3. The 3-Phase AI Execution Pipeline

We use a specific file structure to gate the AI workflow. The AI cannot touch `src/` code until the planning files exist.

### Phase A: The Planning Gate
1. **`docs/projects/` (Epic Specs):** When a new Epic begins (e.g., `E28_MARKDOWN_ENGINE.md`), a formal spec is created here outlining the goals, requirements, and personas involved.
2. **`docs/plans/` (3-Strategy Plans):** The AI generates a document here containing *Strategy A (Minimal)*, *Strategy B (Recommended)*, and *Strategy C (Robust)*. The developer must approve one before execution begins.

### Phase B: Autonomous Execution
The AI writes the code, modifies `src/` and `functions/`, and runs tests. Documentation is purely read-only during this phase to ensure focus on compilation and testing.

### Phase C: Autonomous Ticket Close (Drift Detection)
Once tests pass, the AI automatically performs "drift detection" and updates the documentation to match reality:
1. **`docs/reports/`:** Any generated audits, security reviews, or summaries are saved here (like this very file).
2. **`user-guide/`:** The AI automatically updates the staff and customer-facing markdown guides to reflect the new UI or logic so that the user manual is never out of date.

## 4. Specialized Domain Documentation

Beyond governance and execution, the `/docs/` directory houses specialized context needed for complex agentic workflows:

- `docs/AI_WORKFLOW.md` / `docs/AI_MODELS.md`: Defines the internal architecture of the runtime AI features (e.g., Gemini descriptions).
- `docs/COMPLIANCE.md`: Regulatory and legal boundaries (Cannabis age gates, tobacco laws, police hold data retention).
- `docs/CULTURAL_LOG.md`: Logs of culturally sensitive decisions, Kanien'kéha translations, and community review notes.
- `docs/design-system.md`: The source of truth for the Dapper/Debonair Tailwind aesthetics and `viewTag` theme variables.

## 5. Summary of the AI Contract
By keeping all context inside `/docs/` and `/user-guide/`, the AI operates with zero hallucination regarding project state. If a developer needs the AI to understand a new business requirement, they simply update the markdown. The code follows the docs.
