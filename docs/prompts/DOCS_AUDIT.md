# Documentation Audit & Update Prompt — The Pawn Shop
**Version:** 1.0 · **Run to sync VitePress user guides with the current codebase.**

---

## Role

Senior Technical Architect & Head of Product Documentation.

**Objective:** Perform a deep-dive analysis of the application code to understand current functionality, compare it against the VitePress site in `/user-guide/`, and produce a surgical action plan to resolve documentation drift.

---

## Phase 1 — Technical Deep Dive (Codebase Inventory)

Systematically map the following areas to establish the "Source of Truth":

### 1.1 Routes & Views
- Scan `src/main.tsx` for all active routes.
- Identify the three primary views: `pawn`, `cannabis`, and `fireworks`.
- List all admin sub-routes (`/admin/*`) and staff sub-routes (`/staff/*`).

### 1.2 Roles & Permissions
- Analyze `src/context/AuthContext.tsx` and `functions/src/auth.ts` for role definitions.
- Map which roles (Admin, Manager, Staff, Customer) have access to which pages.

### 1.3 Core Workflows
- **Inventory Lifecycle:** Draft → Photo Upload → AI Suggestion → Publish.
- **Transactions:** Click & Collect, Pawn Enquiries, Reservations.
- **Staff Operations:** Shift Scheduling, Police Holds, Serial Blacklisting, Staff Picks.

---

## Phase 2 — User Guide Audit (Gap Analysis)

Review the current contents of `/user-guide/` and compare them against the findings from Phase 1.

### 2.1 File Tree Analysis
- List all `.md` files in `/user-guide/`.
- Cross-reference these files with the high-level folders: `admin/`, `compliance/`, `inventory/`, `pawn/`, etc.

### 2.2 Drift Detection
Identify:
- **Missing Features:** Features implemented in code but not mentioned in docs (e.g., E20 Staff Management, E10 Dashboard).
- **Outdated Steps:** Documentation that describes old logic or missing UI fields.
- **Brand Voice Alignment:** Ensure documentation reflects the "Dapper, Debonair, Distinctly Akwesasne" voice.

---

## Phase 3 — The Action Plan

Produce a structured report with the following sections:

### 3.1 Documentation Drift Report
A table or list showing exactly where the code and docs have diverged.

### 3.2 Prioritized Update List
List specific markdown files to be **Created**, **Updated**, or **Deleted**.

### 3.3 Persona Impact
State how these documentation updates serve the primary personas (e.g., helping **Marie** understand compliance settings or **Kevin** use the new dashboard).

---

## Execution Guidelines

- **No Hex Codes:** When describing the UI, use brand terms (e.g., "The Pawn Palette") rather than hex values.
- **Surgical Edits:** Propose updates that fix the drift without rewriting established, accurate content.
- **Dapper Voice:** Instructions should be helpful, professional, and sophisticated.

---

## Output Format

1. **Phase 1 Summary:** List of currently implemented features/roles discovered in code.
2. **Phase 2 Summary:** List of gaps found in `/user-guide/`.
3. **Action Plan:** Bulleted list of files to modify and new files to create.
4. **STOP.** Wait for approval before applying any changes to the user guide files.

---

*The Pawn Shop · docs/prompts/DOCS_AUDIT.md · v1.0*
