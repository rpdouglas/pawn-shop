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
- **Database:** Cloud Firestore (`rpd-pawn-shop-dev` / `rpd-pawn-shop`)
- **Auth:** Firebase Auth (email/password + Google SSO)
- **Functions:** Cloud Functions v2 (Node/TypeScript) in `/functions`
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

## AI Assistant Rules

- Schema is in `docs/firestore-schema.md`. Do not invent fields.
- Styling uses CSS tokens. Do not use inline JS conditionals for view theming.
- Note tech choices in `docs/DECISIONS.md` when a decision is made.
- Flag compliance-sensitive features for human review before deploying to prod.
