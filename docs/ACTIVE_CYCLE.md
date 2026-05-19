# Active Cycle — The Pawn Shop

> **Sprint tracking file.** Update at the start and end of every work cycle.
> Referenced by `docs/prompts/INITIALIZATION.md` on session load.

---

## Current Cycle

**Cycle:** 25
**Started:** 2026-05-19
**Target close:** TBD
**Deploy target:** dev

---

## Cycle Goal

Complete remaining Cycle 23 QA items: `HomePage.tsx` and `UserProfileCircle.tsx` design system token violations; admin axe-core auth setup (if env vars available). Begin production readiness audit.

---

## In Progress

| Task | Epic | Persona | Owner | Notes |
|---|---|---|---|---|
| | | | | |

---

## Completed This Cycle

| Task | Epic | Completed |
|---|---|---|
| Optimize and integrate official brand logo on HomePage | E27 | 2026-05-19 |
| **E38 · Admin Desktop Portal** (Approaches, Layout, Components, Integration) | E38 | 2026-05-19 |
| **E38 CLOSED** | E38 | 2026-05-19 |

---

## Deferred / Blocked

| Item | Reason | Target cycle |
|---|---|---|
| MFA bypass confirmed impossible | Requires Identity Platform upgrade — pre-prod compliance gate | Before prod deploy (E11) |
| eBay developer account setup (webhook URL registration, notification subscription) | Requires eBay seller account and developer credentials — outside codebase scope | Before E06 deploys to prod |
| Admin axe-core tests (dashboard, inventory, preorders, campaigns) | Require `PLAYWRIGHT_AUTH_EMAIL` + `PLAYWRIGHT_AUTH_PASSWORD` env vars — skipped in CI | Cycle 24 (if auth vars available) |
| Performance ≥0.90 on Lighthouse | Requires SSR or pre-rendering — current SPA + static hosting cannot reach ≥0.90 on simulated 4G | Backlogged (future SSR cycle) |
| Vertical video on Cannabis + Fireworks pages | Content dependency — no video assets available | When assets supplied |
| `config/shopInfo` document creation | Requires admin to create via Firebase console (`foundedYear: <year>`) — no admin UI in E17 | Before E17 deploys to dev |
| E23 design system token violations | `HomePage.tsx`, `UserProfileCircle.tsx` — hardcoded px/rem/ms values | Cycle 24 (E23 QA clean-up) |
| `Navigation` drawer heading contrast | `--color-primary` at `--text-small` (14px) in cannabis view = 2.8:1 — WCAG AA failure at small text (pre-existing E23, not introduced by E25) | Cycle 24 (E23 QA clean-up) |

---

## Open Decisions Needed

| Question | Context | Urgency |
|---|---|---|
| Legal counsel on cannabis/fireworks regulation | Required before E11 features ship to prod | Before prod deploy |

---

## Previous Cycle Summary

**Cycle 24** (2026-05-19 → 2026-05-19) — Closed E38 · Admin Desktop Portal. Phase 7 continued.

| Task | Epic | Completed |
|---|---|---|
| Admin Desktop Portal implemented (Approach A: Nested Router Layout) | E38 | 2026-05-19 |
| Core Portal Components: `AdminLayout`, `AdminSidebar`, `AdminTopbar` delivered | E38 | 2026-05-19 |
| Persistent desktop shell (≥ 1024px) for all staff roles | E38 | 2026-05-19 |
| Makoonsii 48px hit area fix for sidebar icons | E38 | 2026-05-19 |
| **E38 CLOSED** | E38 | 2026-05-19 |

---

**Cycle 23** (2026-05-19 → 2026-05-19) — Closed E25 · Header Navigation Refinement. Phase 8 continued.

| Task | Epic | Completed |
|---|---|---|
| Admin dashboard link moved from `UserNav` header to `NavigationDrawer` drawer (staff-gated) | E25 | 2026-05-19 |
| Page title updated to "The Pawn Shop - [View]" format on all non-home routes | E25 | 2026-05-19 |
| `NavigationDrawer.tsx` token violations resolved — `--text-lead`, `--motion-speed-base` | E25 | 2026-05-19 |
| **E25 CLOSED** | E25 | 2026-05-19 |

---

**Cycle 22** (2026-05-19 → 2026-05-19) — Closed E24 · CI/CD Pipeline Strategy. Phase 8 complete.

| Task | Epic | Completed |
|---|---|---|
| `firebase-core.ts` split — auth/functions eager, Firestore/Storage/Analytics lazy | Cycle 22 infra | 2026-05-19 |
| React Router v7 `lazy()` for all 35+ page routes — main bundle 437 KB (135 KB gzip) | Cycle 22 infra | 2026-05-19 |
| `UserProfileCircle` WCAG AA contrast fix — `--color-on-primary` token, cannabis view 5.4:1 | Cycle 22 a11y | 2026-05-19 |
| Playwright + `@axe-core/playwright` setup — `e2e/accessibility.spec.ts`, zero violations | Cycle 22 QA | 2026-05-19 |
| LHCI setup — `lighthouserc.json`, `npm run test:lhci`, performance warn ≥0.40 | Cycle 22 QA | 2026-05-19 |
| `TESTING.md` updated to v1.1 — bundle architecture checks, automated a11y, LHCI thresholds | Cycle 22 docs | 2026-05-19 |
| `DECISIONS.md` — 4 new Cycle 22 architectural entries logged | Cycle 22 docs | 2026-05-19 |
| E24 CI/CD — `dev`/`main` branch split, `deploy-prod.yml` routes to `nats-rack` temporarily | E24 | 2026-05-19 |
| **E24 CLOSED** | E24 | 2026-05-19 |

---

**Cycle 21** (2026-05-19 → 2026-05-19) — Closed E23 · Unified Global Header.

| Task | Epic | Completed |
|---|---|---|
| Unified `GlobalHeader` with Hamburger Menu | E23 | 2026-05-19 |
| Contextual page title in header | E23 | 2026-05-19 |
| `NavigationDrawer` with Home, Pawn, Cannabis, Fireworks, Tobacco links | E23 | 2026-05-19 |
| `UserProfileCircle` with dropdown (Sign In / Profile / Sign Out) | E23 | 2026-05-19 |
| Basic `HomePage` landing page (`/`) | E23 | 2026-05-19 |
| Role-gated Admin button in header | E23 | 2026-05-19 |
| **E23 CLOSED** | E23 | 2026-05-19 |

---

**Cycle 20** (2026-05-19 → 2026-05-19) — Closed E12 · Alerts & Notifications (remaining tasks).

| Task | Epic | Completed |
|---|---|---|
| `sendSeasonalReminders` CF — campaign-driven SMS batch, idempotency via `reminderSentAt` | E12 | 2026-05-19 |
| `sendPickupReminders` CF — 24h advance SMS for confirmed reservations + preorders | E12 | 2026-05-19 |
| `sendWeeklyDigest` CF — Monday HTML email, subject "The Pawn Shop Update", CASL-gated | E12 | 2026-05-19 |
| `dispatchEmail` SendGrid utility (`functions/src/lib/email.ts`) | E12 | 2026-05-19 |
| `CampaignAdminPage` — `reminderSentAt` read-only display | E12 | 2026-05-19 |
| **E12 CLOSED** | E12 | 2026-05-19 |

---

**Cycle 19** (2026-05-19 → 2026-05-19) — Closed E19 · Editorial CMS & Brand Narrative.

| Task | Epic | Completed |
|---|---|---|
| `articles/{id}` collection + schema | E19 | 2026-05-19 |
| Admin Article Editor + Review Gate | E19 | 2026-05-19 |
| `createArticle` & `publishArticle` Cloud Functions | E19 | 2026-05-19 |
| Dynamic Public Article routes (`/articles/:slug`) | E19 | 2026-05-19 |
| Home-view `ArticleSection` & `ArticleCard` components | E19 | 2026-05-19 |
| Local SEO landing pages (≥6) | E19 | 2026-05-19 |
| FAQ engine & Admin UI | E19 | 2026-05-19 |
| **E19 CLOSED** | E19 | 2026-05-19 |

---

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-05-19 (Cycle 25 open)*
