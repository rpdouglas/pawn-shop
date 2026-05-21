# AI Workflow Guide — The Pawn Shop
**Version:** 1.0 · **Read once. Reference often.**

> This document explains which AI tool does what, when to use each prompt, and how human judgment fits into the workflow.

---

## The Two-AI Model

The Pawn Shop uses two AI systems with completely separate roles:

| System | Role | Where it lives | Triggered by |
|---|---|---|---|
| **Antigravity (AGY)** | Agentic Development workflow — subagents, goals, testing | Developer's session | Developer |
| **Claude** | CLI Development workflow — planning, coding, review, documentation | Developer's session | Developer |
| **Gemini** (via Cloud Functions) | Runtime product feature — staff-facing AI in the admin (E18) | Firebase Cloud Functions | Staff in the admin UI |

These systems never overlap. Claude and Antigravity do not power in-product features. Gemini does not write code or documentation. API keys for all live in Cloud Functions or GitHub Secrets — never in `src/`.

---

## Antigravity (AGY) — Agentic Workflow

Antigravity operates with autonomous **Subagents** rather than static wrapper scripts. You can invoke these directly or use native slash commands.

### Antigravity Slash Commands
- **`/grill-me`**: Use this when you need the `EpicPlanner` subagent to interview you and construct a compliant 3-strategy plan (equivalent to `.claude/commands/plan.md`).
- **`/goal`**: Use this when you need the `QAVerifier` or `FeatureExecutor` to work autonomously in the background until a complex multi-file task or audit is complete.
- **`/schedule`**: Use this for recurring sprint audits or background codebase checks.

### Antigravity Subagents
These subagents are defined and mapped to the existing `docs/prompts`:
- **EpicPlanner**: Specializes in producing 3-strategy plans (maps to `PLANNING.md`).
- **FeatureExecutor**: Follows strict write-access rules to execute approved plans (maps to `FIX.md` / `APPROVAL.md`).
- **QAVerifier**: Inherits `TESTING.md` to rigorously check compliance gates.
- **SprintAuditor**: Inherits `POST_SPRINT_AUDIT.md` to run drift detection across schemas and epics.

---

## Claude — Development Workflow

Claude assists with every phase of the software development lifecycle. Use the prompt library in `docs/prompts/` to guide each phase.

### When to use which prompt

```
New feature or epic task:
  1. docs/prompts/READ_STATE.md       ← Verify AI has current mental model
  2. docs/prompts/PLANNING.md         ← Three-strategy proposal, persona check
  3. docs/prompts/APPROVAL.md         ← Execute after plan is approved
  4. docs/prompts/TESTING.md          ← QA smoke tests, compliance verification
  5. docs/prompts/TICKET_CLOSE.md     ← Drift detection, docs sync, PR description

Bug or error:
  docs/prompts/FIX.md                 ← Surgical fix only, no scope creep

End of sprint or before prod deploy:
  docs/prompts/POST_SPRINT_AUDIT.md   ← Full system audit, Lighthouse, compliance sweep

Long session gap or new codebase:
  docs/prompts/CODEBASE_AUDIT.md      ← Deep ingestion + gap report

Start of any session:
  docs/prompts/INITIALIZATION.md      ← Always. Loads context, guardrails, persona lens.
```

### What Claude is good for in this project

- TypeScript component architecture and typing
- Firestore schema design and security rules
- Cloud Function structure (auth checks, audit log writes, error handling)
- Tailwind v4 token system and `.view-*` CSS architecture
- Firebase Hosting deployment configuration
- Docs-as-code: maintaining `firestore-schema.md`, `DECISIONS.md`, `EPICS.md`
- Persona-gate analysis: "does this feature serve Kevin or harm Makoonsii?"
- Compliance reviews before shipping

### What Claude must never do in this project

- Generate Kanien'kéha language
- Write `aiDescription` content (that's Gemini's job, from Cloud Functions)
- Make assumptions about the codebase without first reading the file
- Invent Firestore fields not in `docs/firestore-schema.md`
- Apply scarcity signals algorithmically

---

## Gemini — Runtime Product Feature (E18)

Gemini powers the AI Operations Assistant — the staff-facing admin tool that helps with inventory descriptions, pricing, and tagging. See `docs/prompts/GEMINI_INITIALIZATION.md` for the full prompt library.

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

Use the model cascade defined in `docs/prompts/GEMINI_INITIALIZATION.md`:

- **Pro (or equivalent depth model):** descriptions, pricing, eBay titles — quality over speed
- **Flash (or equivalent speed model):** auto-tags, duplicate check — speed over depth

Log model selection in `DECISIONS.md` when the choice is made. Revisit if API costs or quality change significantly.

### What Gemini must never do (embedded in every system prompt)

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
| Feature planning | Claude proposes 3 strategies | Developer approves one |
| Bug fixes | Claude diagnoses + proposes | Developer approves before applying |

---

## AI Session Discipline

### Start every Claude session with `INITIALIZATION.md`

Every session. Without exception. Claude does not retain memory between conversations. Starting without context produces plans built on stale or hallucinated state.

### Run `READ_STATE.md` before planning complex features

If the feature touches more than one collection, involves a Cloud Function, or modifies auth/compliance logic — run `READ_STATE.md` first. A 2-minute context dump prevents a 2-hour regression.

### Never skip `TICKET_CLOSE.md`

A feature that works but has not been documented has created invisible drift. Future sessions will plan against a stale mental model of the system. `TICKET_CLOSE.md` takes 5 minutes and prevents this.

### The anti-hallucination rule

If Claude makes a claim about a file's current contents — a function signature, a Firestore field name, a rule condition — verify it. Read the file. Do not trust remembered state from a previous session. The `Read` tool exists for this reason.

---

## Prompt Versioning

Every prompt file has a version number in the header. When a prompt is updated:

1. Increment the version number
2. Add a one-line changelog comment at the top explaining what changed
3. Log the update in `docs/DECISIONS.md`

Old versions are not archived — the git history serves as the version log.

---

*The Pawn Shop · docs/AI_WORKFLOW.md · v1.0*
