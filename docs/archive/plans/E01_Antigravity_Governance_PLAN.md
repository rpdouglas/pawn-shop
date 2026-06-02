# Feature Plan: Antigravity Governance Integration

This plan details the integration of The Pawn Shop's strict 5-phase project governance rules into the Antigravity developer workflow.

## User Review Required

> [!IMPORTANT]
> The Recommended Strategy (Strategy B) introduces zero-dependency, lightweight helper scripts under `scripts/governance/` and maps them in `package.json` to eliminate manual template copy-pasting friction. These scripts are purely developer utilities and do not run in production.

---

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona
*   **Primary Persona:** Staff (Developer Operations) — needs high assurance that the AI assistant remains locked within approved boundaries, does not execute unsanctioned code rewrites, and maintains documentation synchronization.
*   **Secondary Persona:** All (Makoonsii, Marie, Kevin, etc.) — benefit indirectly by guaranteeing that all customer-facing features are rigorously checked for compliance, age gates, contrast, and performance before deployment.

### 1.2 Compliance Gate

*   [x] **Age gate required?** (cannabis 19+, fireworks 18+) — *Not applicable to dev tools, but the setup strictly guarantees that age-gate checks are enforced for all features.*
*   [x] **`auditLogs` event defined?** — *None for this dev tools project.*
*   [x] **PII excluded from all logs and analytics?** — *Confirmed. No user or customer data is processed.*
*   [x] **`policeHold` logic respected?** — *Yes.*
*   [x] **`aiDescription` kept separate?** — *Yes.*
*   [x] **All AI API calls going through Cloud Functions?** — *Yes.*

---

## Phase 2 — Schema Audit

No database collections or schemas are modified for this developer-operations project.

```
Collections impacted: NONE
New fields required: NONE
```

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimalist Rules Bind (Rules-Only)

**Summary:** Update `GEMINI.md` and `CLAUDE.md` to add strict Planning Gate mandates and stop commands, with no automation scripts.

*   **Architecture:**
    *   Instructions live entirely within the project root rules files (`GEMINI.md` and `CLAUDE.md`) which the Antigravity CLI and external agents automatically parse at start-of-session.
    *   No Firestore or Cloud Function changes.
*   **Persona Lens:**
    *   Serves the developer by documenting the rules, but relies entirely on manual compliance (the developer must manually copy templates and write strategy files).
*   **Compliance:**
    *   Satisfies the planning gate through prose instructions.
*   **Trade-offs:**
    *   *Gains:* Extremely low overhead. Zero new code files or scripts.
    *   *Sacrifices:* Friction of manually copying templates from `00_TEMPLATE.md` and `PLANNING.md`. Higher risk of human error or AI ignoring text-only rules in complex sessions.
*   **Estimated scope:** Small — 2 files modified (`GEMINI.md` and `CLAUDE.md`).

---

### Strategy B — Complete Workspace Integration with Automation Scripts (Recommended)

**Summary:** Update workspace rules files and introduce lightweight, zero-dependency Node.js CLI scripts under `scripts/governance/` to automate spec generation, strategizing, and drift syncing, registered in `package.json`.

*   **Architecture:**
    *   Rule bindings are added to `GEMINI.md` and `CLAUDE.md`.
    *   A custom instruction configuration is added in `.antigravitycli/mandates.md` to physically lock the Antigravity developer session.
    *   A set of Node.js helper scripts are created:
        1.  `scripts/governance/init-project.js`: Prompts for Epic ID and name, copies `docs/projects/00_TEMPLATE.md` to the active project path, and auto-populates cycle metadata.
        2.  `scripts/governance/init-plan.js`: Reads the active project spec, extracts Firestore collection and file targets, and creates the plan file `docs/plans/[EPIC]_[FEATURE]_PLAN.md` with pre-filled checklists.
    *   Command mappings are added to `package.json` (e.g. `"governance:project"`, `"governance:plan"`).
*   **Persona Lens:**
    *   Provides high UX satisfaction for developers by removing template copy-paste friction, enabling one-command spec and plan generation.
*   **Compliance:**
    *   Guarantees that the physical templates are filled out identically and verified correctly before coding.
*   **Trade-offs:**
    *   *Gains:* Eliminates manual overhead, formats all files perfectly, and enforces planning systematically.
    *   *Sacrifices:* Adds three local Node.js utility scripts.
*   **Estimated scope:** Medium — 3 new scripts, 3 modified files (`GEMINI.md`, `CLAUDE.md`, `package.json`).

---

### Strategy C — CI/CD & Local Git Commit Gates (Robust)

**Summary:** Implement Strategy B, and add a local Git pre-commit hook (via a custom bash script or Husky) and a GitHub Action CI workflow to physically block commits or PR merges if code changes lack an approved plan.

*   **Architecture:**
    *   Strategy B architecture.
    *   A pre-commit script `.git/hooks/pre-commit` (or Husky config) parses `git diff` for changes in `src/` or `functions/src/`. If changes exist, it checks if a corresponding strategy plan exists in `docs/plans/` that is marked with `Approved: true`, exiting with an error if missing.
    *   A GitHub Actions workflow (`.github/workflows/governance-check.yml`) executes the same check on Pull Requests.
*   **Persona Lens:**
    *   Enforces ultimate compliance. Even if a developer tries to bypass the gate, the git commit or remote build will fail.
*   **Compliance:**
    *   Uncompromising enforcement. Bypassing the rules is programmatically impossible.
*   **Trade-offs:**
    *   *Gains:* 100% enforcement of the planning lifecycle.
    *   *Sacrifices:* Adds CI/CD pipeline complexity and increases friction for tiny emergency hotfixes.
*   **Estimated scope:** Large — 2 new configuration files, scripts, and git hooks.

---

### Recommendation

We highly recommend **Strategy B**. It hits the perfect sweet spot between high-compliance enforcement and low-friction developer speed. The Node.js scripts automate the boring parts of the spec/plan lifecycle, ensuring the developer (and the AI) *want* to use the process because it's faster than writing them from scratch, while the system rules in `GEMINI.md` and `.antigravitycli/` maintain a strict logical gate on code writes.

---

## Phase 4 — Anti-Regression Protocol

### 1. The Hardcoded Hex Trap
*   No UI styles are modified. Scripts will use standard system CLI logs.

### 2. The Firestore Field Invention Trap
*   No Firestore fields are added or modified.

### 3. The Client-Side AI Key Trap
*   No API keys are added.

### 4. The Scarcity Manufacture Trap
*   Not applicable.

### 5. The PII Log Trap
*   Automation scripts will log only filenames, paths, and epic metadata. No user data, names, or emails will ever be touched or logged.

### 6. The Age Gate Bypass Trap
*   Not applicable.

### 7. The Motion Trap
*   Not applicable.

### 8. The Typography Scale Trap
*   Not applicable.

### 9. The Brand Voice Trap
*   Not applicable.

---

## Phase 5 — Output & Storage

The full plan is saved to this file: `docs/plans/E01_Antigravity_Governance_PLAN.md`.

*The Pawn Shop · docs/plans/E01_Antigravity_Governance_PLAN.md · v1.0*
