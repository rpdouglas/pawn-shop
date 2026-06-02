# Active Cycle — The Pawn Shop

> **Sprint tracking file.** Update at the start and end of every work cycle.
> Referenced by `docs/prompts/INITIALIZATION.md` on session load.

---

## Current Cycle

**Cycle:** 32
**Started:** 2026-05-22
**Target close:** TBD
**Deploy target:** dev

---

## Cycle Goal

E21 · Vitest Unit Testing — Install Vitest + React Testing Library, configure `vite.config.ts` and `src/setupTests.ts`, implement initial unit tests for core utilities and compliance logic.

---

## In Progress

| Task | Epic | Persona | Owner | Notes |
|---|---|---|---|---|
| — | — | — | — | — |

---

## Completed This Cycle

| Task | Epic | Completed |
|---|---|---|
| Installed `vitest`, `jsdom`, `@testing-library/react` and configured `vite.config.ts` | E21 | 2026-05-22 |
| Implemented unit tests for `format.ts`, `Button.tsx`, and `AgeGate.tsx` | E21 | 2026-05-22 |
| **E21 CLOSED** | E21 | 2026-05-22 |
| Modified `deploy-dev.yml` to enforce Lint/Unit/A11y/LHCI gates | E44 | 2026-05-22 |
| **E44 CLOSED** | E44 | 2026-05-22 |
| Schema + `types.ts` updated with `cannabisProfile` | E29 | 2026-05-22 |
| `IntakeForm` extended with Cannabis attributes | E29 | 2026-05-22 |
| `TerpeneProfile` SVG spider chart + `CannabisProductData` detail panel built | E29 | 2026-05-22 |
| `CannabisPage` updated to show `ItemQuickView` with wellness profile | E29 | 2026-05-22 |
| **E29 CLOSED** | E29 | 2026-05-22 |
| `E45 Pawn Readability` — Lora font swap & contrast | E09 | 2026-06-02 |
| **E45 CLOSED** | E09 | 2026-06-02 |
| `E46 Admin Text Contrast` — Muted text visibility | E09 | 2026-06-02 |
| **E46 CLOSED** | E09 | 2026-06-02 |
| `E47 Mobile Intake Reliability` — CF Memory & UI State Fixes | E09 | 2026-06-02 |
| **E47 CLOSED** | E09 | 2026-06-02 |
| `E48 Mobile Intake Processing Resilience` — 30s timeout & CF Retry Logic | E48 | 2026-06-02 |
| **E48 CLOSED** | E48 | 2026-06-02 |

---

## Deferred / Blocked

| Item | Reason | Target cycle |
|---|---|---|
| MFA bypass confirmed impossible | Requires Identity Platform upgrade — pre-prod compliance gate | Before prod deploy (E11) |
| eBay developer account setup (webhook URL registration, notification subscription) | Requires eBay seller account and developer credentials — outside codebase scope | Before E06 deploys to prod |
| Admin axe-core tests (dashboard, inventory, preorders, campaigns) | Require `PLAYWRIGHT_AUTH_EMAIL` + `PLAYWRIGHT_AUTH_PASSWORD` env vars — skipped in CI | When auth vars available |
| Performance ≥0.90 on Lighthouse | Requires SSR or pre-rendering — current SPA + static hosting cannot reach ≥0.90 on simulated 4G | Backlogged (E37 SSR cycle) |
| Vertical video on Cannabis + Fireworks pages | Content dependency — no video assets available | When assets supplied |
| `config/shopInfo` document creation | Requires admin to create via Firebase console (`foundedYear: <year>`) — no admin UI in E17 | Before E17 deploys to dev |

---

## Open Decisions Needed

| Question | Context | Urgency |
|---|---|---|
| Legal counsel on cannabis/fireworks regulation | Required before E11 features ship to prod | Before prod deploy |

---





---

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-05-22 (Cycle 31 open — E21)*
