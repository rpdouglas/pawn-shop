# The Pawn Shop — Context

> **Paste this file at the start of every AI coding session.**
> Keep it short. Update it when things change.

---

## What This Is

A multi-vertical retail website for **The Pawn Shop**, Cornwall Island, Akwesasne.
Three distinct business lines share one codebase:

| View | Route | Age Gate | Theme Class |
|------|-------|----------|-------------|
| Pawn | `/pawn` | None | `.view-pawn` |
| Cannabis | `/cannabis` | **19+** | `.view-cannabis` |
| Fireworks | `/fireworks` | **18+** | `.view-fireworks` |

Brand voice: **"Dapper. Debonair. Distinctly Akwesasne."**

---

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind v4
- **Database:** Cloud Firestore (`nats-rack` / `the-addicts-agenda`)
- **Auth:** Firebase Auth (email/password + Google SSO)
- **Functions:** Cloud Functions v2 (Node/TypeScript) in `/functions` (Modular codebases: `core`, `operations`, `shared`)
- **Hosting:** Firebase Hosting
- **Storage:** Firebase Storage (item images, pawn attachments)
- **Dev environment:** GitHub Codespaces + Firebase Emulator Suite

---

## Design Tokens (Tailwind v4 `@theme`)

```css
.view-pawn      { --color-primary: #C8A14A; --color-bg: #080706; }
.view-cannabis  { --color-primary: #7B4FA0; --color-bg: #1A0D2E; }
.view-fireworks { --color-primary: #C0392B; --color-bg: #1A0A0A; }
```

Fonts — Pawn: Playfair Display / IM Fell English
        Cannabis: Cormorant Garamond / DM Sans
        Fireworks: Bebas Neue / Oswald

**Rule:** Never hardcode hex values. Always use `var(--color-primary)`.
**Rule:** Never use JS conditionals for theming. Use the `.view-*` CSS class from ViewContext.

---

## Firestore Collections (never invent fields — see `firestore-schema.md`)

| Collection | Purpose |
|---|---|
| `items/{id}` | All inventory across all views |
| `pawnRequests/{id}` | Customer pawn enquiry submissions |
| `reservations/{id}` | Click-and-collect |
| `users/{uid}` | Customer profiles + CRM |
| `auditLogs/{id}` | Immutable event log |
| `campaigns/{id}` | Seasonal campaign scheduler |
| `serialBlacklist/{id}` | Flagged serial numbers |
| `savedSearches/{id}` | Customer saved searches + alert subscriptions |
| `disputes/{id}` | Returns + post-sale disputes |
| `articles/{id}` | Editorial CMS |
| `preorders/{id}` | Fireworks pre-orders |

---

## Roles (Firebase Auth custom claims)

`admin` · `manager` · `inventory_staff` · `marketing_staff` · `customer`

Staff = admin | manager | inventory_staff. MFA mandatory for all staff roles.

---

## Compliance — Non-Negotiable

1. **Age gates** at route level. Every pass/fail logged to `auditLogs`.
2. **No PII** in analytics, console logs, or Firestore logs.
3. **`policeHold: true`** hides item from public immediately. Admin-only write.
4. **Serial blacklist** checked on every pawn form submit and item intake.
5. **`rare-find` / `limited-edition`** staff-set only. No manufactured scarcity.
6. **Kanien'keha language** — AI must never generate it. Community review required.
7. **`aiDescription`** is a draft — never readable by customers.
8. **`auditLogs`** — no delete, ever. Create-only via Cloud Functions.
9. All AI API keys (Claude, Gemini) go through Cloud Functions. Never on the client.

---

## Personas (8 anchors — see `docs/PERSONAS.md`)

| Tag | Persona | Primary vertical | Hard rule |
|---|---|---|---|
| Mak | Makoonsii — The Reserve Regular | Pawn | All touch targets ≥48px; plain language only; ≤3 taps |
| Dale | Dale — The Cross-Border Bargain Hunter | Pawn | CAD price must be primary; never USD-first |
| Tan | Tanya — The Seasonal Celebrator | Fireworks / Cannabis | Age gate always before product reveal |
| Marie | Marie — The Wellness Seeker | Cannabis | No category disclosure in any outbound comms |
| Kev | Kevin — The Reseller & Picker | Pawn | Alerts within 60 seconds of `status: 'active'`; CASL opt-in required |
| San | Sandra — The Curious Passerby | All | Grid layout must be scannable at a glance; no jargon |
| Jord | Jordan — The Lifestyle Connoisseur | Cannabis | Product pages must feel editorial, not transactional |
| Marc | Marcus — The Dapper Connoisseur | Pawn | Dark-luxury macro photography; no placeholder images |

**Persona checks run before every feature ships.** The Makoonsii Trust Test always runs. See `docs/PERSONAS.md §0` for the full check ritual.

---

## AI Workflow (see `docs/AI_WORKFLOW.md`)

Two AI systems — completely separate roles:

| System | Role | Invoked by |
|---|---|---|
| **Antigravity (AGY)** | Development workflow — autonomous goal execution, specs-first planning, review, docs, and subagent orchestration | Developer session |
| **Gemini** | Runtime E18 staff feature — descriptions, pricing, tags | Staff in admin UI |

**Start every session relying on the `GEMINI.md` system prompt and `docs/CONTEXT.md`.**
Rely on autonomous execution via `/goal` and slash commands rather than manual prompt templates.

---

## AI Assistant Rules

- Schema is in `docs/firestore-schema.md`. Do not invent fields.
- Styling uses CSS tokens. Do not use inline JS conditionals for view theming.
- Note tech choices in `docs/DECISIONS.md` when a decision is made.
- Flag compliance-sensitive features for human review before deploying to prod.
- Gemini output saves to `aiDescription` only — never auto-promote to `description`.
- Never generate Kanien'kéha. Community review required before any Mohawk language ships.
