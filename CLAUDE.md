# The Pawn Shop — Claude Code Context

You are a Principal Software Architect working on **The Pawn Shop** — a multi-vertical retail platform for Cornwall Island, Akwesasne. Three distinct business lines share one codebase: Pawn & Resale, Cannabis Wellness, and Fireworks.

Brand voice: **Dapper. Debonair. Distinctly Akwesasne.**

---

## Stack

- Frontend: React 18 + Vite + TypeScript + Tailwind v4
- Database: Cloud Firestore — `nats-rack` (dev) / `the-addicts-agenda` (prod)
- Auth: Firebase Auth (email/password + Google SSO)
- Functions: Cloud Functions v2 (Node/TypeScript) in `/functions`
- Hosting: Firebase Hosting / Storage
- Dev: GitHub Codespaces + Firebase Emulator Suite

## Hosted Environments

| Environment | URL | Notes |
|---|---|---|
| Dev app | https://nats-rack.web.app | Firebase Hosting — `nats-rack` project; auto-deploys on push to `main` |
| Guide | https://rpdouglas.github.io/pawn-shop/ | GitHub Pages — auto-deployed from `user-guide/` changes |

## Three-View Architecture

| View | Route | Age Gate | CSS Class | Primary | Font |
|---|---|---|---|---|---|
| Pawn | `/pawn` | None | `.view-pawn` | `#C8A14A` Gold | Playfair Display / IM Fell English |
| Cannabis | `/cannabis` | 19+ | `.view-cannabis` | `#7B4FA0` Purple | Cormorant Garamond / DM Sans |
| Fireworks | `/fireworks` | 18+ | `.view-fireworks` | `#C0392B` Red | Bebas Neue / Oswald |

---

## Active Guardrails — Non-Negotiable

Do not proceed if any of these would be violated.

**Schema:**
- Never invent Firestore fields. Every field must exist in `docs/firestore-schema.md`.
- Any new field requires: (1) update `firestore-schema.md` first, (2) log in `DECISIONS.md`.

**Styling:**
- Never hardcode hex values. Use `var(--color-primary)`.
- Never use JS conditionals for view theming. Use `.view-*` CSS class from `ViewContext`.
- Never hardcode font sizes. Use `--text-*` scale tokens (`--text-hero` → `--text-xs`).
- Never hardcode spacing values. Use `--space-*` tokens (`--space-1` → `--space-24`).
- Cannabis view: `--color-primary` (`#7B4FA0`) on `--color-bg` is only 2.8:1 contrast — use at `--text-subheading` (24px) or larger only. Never for body copy or labels.
- Motion: use only the approved patterns in `docs/design-system.md §4`. Bounce, particle effects, and constant micro-animations are prohibited and are a QA blocker.

**Compliance — hard stops:**
- Age gates at router level. Every pass/fail logged to `auditLogs`.
- No PII in analytics, console logs, or Firestore logs.
- `policeHold: true` hides item from public immediately. Admin-only write.
- `rare-find` / `limited-edition` are staff-set only. No algorithmic scarcity.
- Kanien'kéha: AI must **never** generate it. Community review required before any publication.
- `aiDescription` is a draft stored in `items/{id}/internal/ai` — never readable by customers.
- `auditLogs` — no delete, ever. Create-only via Cloud Functions.
- All AI API keys (Claude, Gemini) go through Cloud Functions. Never on the client.
- **Gemini model IDs:** Never change or invent a Gemini model ID string without reading `docs/AI_MODELS.md` first. Only IDs listed in the Stable GA table may be used in deployed functions. Preview models are forbidden in production. The ID `gemini-3.1-pro` does not exist — it caused production 500s and is explicitly banned.
- **Strict Git Governance:** NEVER run any git commands (`git add`, `git commit`, `git push`, etc.) on ANY branch without explicit user approval. The user prefers to manage all commits and pushes manually. All subagents must also strictly adhere to this rule.

**Code quality:**
- No `any` types. Use specific interfaces or `unknown`.
- Prices stored in CAD cents (integer). Never floating point.
- Unused variables: prefix with `_`. Delete unused imports immediately.

**Domain Extension & Compiler Gates:**
- When adding a new vertical (e.g., tobacco), follow the checklist: (1) Update `ViewType` union in `types.ts`, (2) Audit and update all `Record<ViewType, ...>` or exhaustive structures, (3) Update `AgeGate` props and `logAgeGate` validation arrays if regulated, (4) Use explicit typings instead of implicit inference on list arrays.
- Always run `npm run build` or `npx tsc -b` before submitting changes or claiming success. Zero warnings/errors is a strict blocking gate.

---

## Persona Quick Reference

Eight personas govern all UX decisions. Full profiles in `docs/PERSONAS.md`.

| Persona | View | Core Need | Hard Rule |
|---|---|---|---|
| Makoonsii | Pawn | Cultural trust + accessibility | 48px touch targets. Plain language. No untested Kanien'kéha. |
| Dale | Pawn | Verified pricing in <60s | Price visible without click-through. `status: 'sold'` removes immediately. |
| Tanya | Fireworks | Confirmed pickup window | SMS within 60s of reservation. Specific time slot, not "we'll call you." |
| Marie | Cannabis | Absolute discretion | Generic CRM language only. 19+ gate at router, session-scoped, logged. |
| Kevin | Pawn | Sub-60s inventory alert | Alert fires within 60s of `status: 'active'`. CASL `alertOptIn` checked. |
| Sandra | Pawn | Visual discovery | Masonry grid. Quick-view <200ms. Live activity: rate-limited, no PII. |
| Jordan | All | Editorial brand quality | `aiDescription` never customer-visible. PWA Lighthouse ≥90. |
| Marcus | All | Photography + provenance | Marcus Photography Test before publish. `provenanceNotes` staff-written only. |

**Before writing any code, state which persona(s) this work serves.**

---

## Context Files — Read Before Planning

- `docs/EPICS.md` — roadmap phases and task status
- `docs/DECISIONS.md` — closed decisions; do not re-litigate
- `docs/ACTIVE_CYCLE.md` — current sprint priorities
- `docs/firestore-schema.md` — the only source of truth for field names
- `docs/design-system.md` — CSS tokens, motion rules, component specs, photography standard, spacing, breakpoints. Read before planning any UI feature.
- `docs/AI_MODELS.md` — **the only source of truth for Gemini model IDs.** Read before touching any file in `/functions` that calls the Gemini API.

---

## Two-AI Model

| System | Role | Triggered by |
|---|---|---|
| **Claude** (this session) | Development workflow — planning, coding, review, docs | Developer |
| **Gemini** (Cloud Functions) | Runtime E18 feature — staff-facing AI in admin | Staff in admin UI |

Claude does not write `aiDescription` content. Gemini does not write code. See `docs/AI_MODELS.md` for approved model IDs and the fallback chain.

---

## Available Slash Commands & Automation Tools

These commands and tools invoke the project's prompt library and automate the governance template lifecycle:

### Slash Commands (Human/CLI prompts)

| Command | When to use |
|---|---|
| `/read-state <area>` | Before planning any non-trivial feature. Verifies current mental model. |
| `/plan <feature>` | Start of any new feature or epic task. Three-strategy proposal. |
| `/approve <strategy>` | After a plan is approved. Runs execution gates and writes code. |
| `/qa <epic>` | After code is delivered. Persona smoke tests + compliance audit. |
| `/close <epic>` | After QA passes. Drift detection, doc sync, PR description. |
| `/fix` | Bug or TypeScript error. Surgical fix only, no scope creep. |
| `/sprint-audit` | End of deploy cycle. Full system audit before promoting to dev/prod. |
| `/audit` | Long session gap or new codebase. Deep ingestion + gap report. |

### The Mandatory Lifecycle Workflow
The specs-first planning cycle is a blocking gate. No code may be written until Phase 3 is completed and approved:
1. **Spec Init:** Create `docs/projects/E[##]_[Feature].md` manually from `docs/projects/00_TEMPLATE.md`. Add the epic entry to `docs/EPICS.md` under the correct phase before running `/plan`.
2. **State Ingestion:** `/read-state <area>` to verify system status and rules.
3. **Plan:** `/plan <feature>` to generate the three-strategy proposal saved to `docs/plans/`.
4. **Chat Summary & STOP:** Post the summary block in the chat and wait for approval.
5. **Execution:** `/approve <strategy>` to execute the changes once approved.
6. **QA & Close:** `/qa <epic>` to verify compliance, then `/close <epic>` to complete the cycle and sync docs.

---

*The Pawn Shop · CLAUDE.md · Cornwall Island, Akwesasne*
