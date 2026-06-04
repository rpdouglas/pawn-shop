# AI Workflow Guide — The Pawn Shop
**Version:** 2.0 · **Read once. Reference often.**

> This document explains which AI tool does what, when to use each subagent, and how human judgment fits into the workflow.

---

## The Two-AI Model

The Pawn Shop uses two AI systems with completely separate roles:

| System | Role | Where it lives | Triggered by |
|---|---|---|---|
| **Antigravity (AGY)** | Agentic Development workflow — goals, subagents, codebase operations | Developer's session | Developer |
| **Gemini** (via Cloud Functions) | Runtime product feature — staff-facing AI in the admin (E18) | Firebase Cloud Functions | Staff in the admin UI |

These systems never overlap. Antigravity acts as the Principal Architect and Developer. Gemini acts as an operations assistant for staff. API keys for all live in Cloud Functions or GitHub Secrets — never in `src/`.

---

## Antigravity (AGY) — Agentic Workflow

Antigravity operates autonomously using native commands and subagents. Manual prompt templates (e.g. `docs/prompts/`) have been **deprecated** in favor of agentic slash commands and the `GEMINI.md` system prompt.

### Antigravity Slash Commands
- **`/grill-me`**: Triggers an interactive interview to construct a compliant 3-strategy plan for a new Epic.
- **`/goal`**: Executes a complex multi-file task, refactor, or audit autonomously in the background until complete.
- **`/schedule`**: Sets up recurring sprint audits or background codebase checks.

### Antigravity Subagents
These subagents execute specific roles in the background:
- **QA_Engineer**: Runs end-to-end and unit tests using Vitest and Playwright. It must navigate the modular `functions/` boundaries (`core`, `operations`) for testing.
- **Brand_Auditor**: Ensures the Dapper/Debonair styling remains intact and Tailwind v4 `.view-*` variables are respected.
- **Data_Steward**: Guards the Firestore schema from hallucinated fields and prevents raw `as any` casting.
- **Linguistic_Auditor**: Prevents AI generation of Mohawk language and ensures proper tagging for Community Review.
- **Security_Auditor**: Sweeps `firestore.rules` and `Cloud Functions` to ensure age gates and access controls aren't bypassed.
- **Performance_Engineer**: Ensures Lighthouse thresholds and Cold Start optimizations are preserved.

---

## Gemini — Runtime Product Feature (E18)

Gemini powers the AI Operations Assistant — the staff-facing admin tool that helps with inventory descriptions, pricing, and tagging.

### Features powered by Gemini

| Feature | Function name | Model | Trigger |
|---|---|---|---|
| Item description draft | `generateAIDescription` | Pro | Staff clicks "Generate" in admin |
| eBay title suggestion | `generateEbayTitle` | Pro | Staff clicks "Optimise for eBay" |
| Price suggestion | `generatePriceSuggestion` | Pro | Item intake, staff review |
| Auto-tagging | `suggestItemTags` | Flash | Automatic on item create |
| Duplicate detection | `checkDuplicateItem` | Flash | Before item publish |

### The staff review gate (non-negotiable)

Gemini output is **always a draft**. It saves to `aiDescription`, never to `description`. Staff must explicitly promote content before any customer sees it.

This is enforced at three levels:
1. **Cloud Function:** writes only to `aiDescription` field
2. **Firestore security rules:** customers cannot read `aiDescription`
3. **UI:** admin intake form clearly labels "AI Draft — review before publishing"

### Gemini model selection

- **Pro (or equivalent depth model):** descriptions, pricing, eBay titles — quality over speed
- **Flash (or equivalent speed model):** auto-tags, duplicate check — speed over depth

Log model selection in `DECISIONS.md` when the choice is made. Revisit if API costs or quality change significantly.

### What Gemini must never do
- Generate Kanien'kéha language
- Auto-publish to `description` without staff review
- Set `rare-find`, `limited-edition`, or `staff-pick` tags (suggestions only, staff confirms)
- Invent provenance or condition information not provided in the item data
- Use casual or slang cannabis terminology
- Make price suggestions framed as final values

---

## Human Judgment — Required Domains

Some things are not AI decisions. No amount of prompting changes this.

### Always human

| Decision | Why |
|---|---|
| **Kanien'kéha language** | Community review is a cultural obligation, not a process step. |
| **`provenanceNotes` for high-value items** | Cultural and historical significance requires real expertise. AI drafts are a starting point, not a source of truth. |
| **Police hold management** | Legal and law enforcement context. Admin-only. |
| **`rare-find` / `limited-edition` designation** | Must reflect genuine rarity. Human knows the inventory, AI does not. |
| **Staff Pick designation** | Editorial voice is human. AI can draft; only staff can pick. |
| **VIP tier assignment** | Engagement scoring can surface candidates; staff confirms. |
| **Legal counsel review** | Cannabis licensing, fireworks regulations, Akwesasne jurisdiction, PIPEDA — get counsel before launch. |
| **Production deploys** | The "DEPLOY" confirmation in `deploy-prod.yml` is intentional friction. Prod deploys are deliberate. |

### AI-assisted, human-approved

| Decision | AI role | Human role |
|---|---|---|
| Item descriptions | Gemini drafts | Staff reviews + promotes |
| eBay titles | Gemini suggests 3 variants | Staff selects |
| Price suggestions | Gemini provides range + comps | Staff sets final price |
| Auto-tags | Gemini suggests | Staff confirms each tag |
| Duplicate detection | Gemini flags | Staff decides whether to publish |
| Feature planning | Antigravity proposes 3 strategies | Developer approves one |
| Bug fixes | Antigravity diagnoses + proposes | Developer approves before applying |

---

## AI Session Discipline

### Use the `GEMINI.md` Ruleset
Antigravity automatically inherits the project's global rules from `GEMINI.md` on session load. Do not attempt to manually load legacy markdown prompts.

### Execute the 3-Phase Gate
1. **Phase A (Planning):** Ensure a plan is written to `docs/plans/` and approved by the developer.
2. **Phase B (Execution):** Run autonomous coding loops. Invoke subagents like `QA_Engineer` to verify the codebase compiles and passes tests before claiming completion.
3. **Phase C (Ticket Close):** Check off Epics, update `firestore-schema.md` or `user-guide` files, and log changes to `DECISIONS.md`.

### The anti-hallucination rule
If you make a claim about a file's current contents — a function signature, a Firestore field name, a rule condition — verify it. Read the file. Do not trust remembered state from a previous session.

---

*The Pawn Shop · docs/AI_WORKFLOW.md · v2.0*
