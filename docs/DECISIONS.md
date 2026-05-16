# Decisions

> One-liner log of technical and architectural decisions.
> Add a line whenever you make a meaningful choice. Date it. That's it.
> Replaces formal ADR documents.

---

## Format

```
YYYY-MM-DD — Decision. Brief reason.
```

---

## Log

2026-05-16 — Primary dev environment is GitHub Codespaces. No local setup required or assumed.

2026-05-16 — Firestore prefix tokens (`searchTokens[]`) for search instead of Algolia. Revisit if search UX becomes a problem.

2026-05-16 — Two Firebase projects: `rpd-pawn-shop-dev` (dev) and `rpd-pawn-shop` (prod). No staging — overkill for one developer.

2026-05-16 — GitHub Issues as a simple numbered task list. No labels, no milestones, no Projects board.

2026-05-16 — No Storybook. Build components in context, iterate in the app.

2026-05-16 — `deploy-prod.yml` requires typing "DEPLOY" as confirmation. Intentional friction — prod deploys should be deliberate.

2026-05-16 — `aiDescription` is draft-only, never customer-facing, enforced by Firestore security rules. Staff must promote to `description` before publishing.

2026-05-16 — All AI API calls (Claude/Gemini) go through Cloud Functions. API keys never on the client.

2026-05-16 — Prices stored in CAD cents (integer) to avoid floating-point errors.

2026-05-16 — firebase.json emulators bound to `0.0.0.0` so they are reachable from Codespaces port forwarding.

---

*Add new entries above this line.*
