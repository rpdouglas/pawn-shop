# Active Cycle — The Pawn Shop

> **Sprint tracking file.** Update at the start and end of every work cycle.
> Referenced by `docs/prompts/INITIALIZATION.md` on session load.

---

## Current Cycle

**Cycle:** 21
**Started:** 2026-05-19
**Target close:** TBD
**Deploy target:** dev

---

## Cycle Goal

Deploy E12 to dev; complete all outstanding browser-based QA verification (Lighthouse ≥90, axe-core runs deferred from E09, E14, E17, E19).

---

## In Progress

| Task | Epic | Persona | Owner | Notes |
|---|---|---|---|---|
| | | | | |

---

## Completed This Cycle

| Task | Epic | Completed |
|---|---|---|
| | | |

---

## Deferred / Blocked

| Item | Reason | Target cycle |
|---|---|---|
| Lighthouse ≥90 performance, ≥90 accessibility, ≥95 SEO | **Unblocked** — run `npm run test:lhci` against https://nats-rack.web.app | Cycle 21 (current) |
| WCAG AA axe-core browser verification on `/pawn`, `/cannabis`, `/fireworks` | **Unblocked** — run `npm run test:a11y` against https://nats-rack.web.app | Cycle 21 (current) |
| axe-core browser run on admin dashboard + PoliceHoldManager | **Unblocked** — run `npm run test:a11y` (requires staff auth env vars) | Cycle 21 (current) |
| axe-core browser run on E17 components (RecentlySoldStrip, ActivityFeed, HoldCountdownBadge) | **Unblocked** — covered by `/pawn` axe-core run (components render on public homepage) | Cycle 21 (current) |
| MFA bypass confirmed impossible | Requires Identity Platform upgrade — pre-prod compliance gate | Before prod deploy (E11) |
| eBay developer account setup (webhook URL registration, notification subscription) | Requires eBay seller account and developer credentials — outside codebase scope | Before E06 deploys to prod |
| axe-core browser run on admin intake success view (EbayPushButton) | **Unblocked** — run `npm run test:a11y` (requires staff auth env vars) | Cycle 21 (current) |
| axe-core browser run on E14 components (PreorderModal, PreorderInboxPage, CampaignBanner, CampaignAdminPage) | **Unblocked** — CampaignBanner on public view; admin routes require staff auth env vars | Cycle 21 (current) |
| Vertical video on Cannabis + Fireworks pages | Content dependency — no video assets available | When assets supplied |
| `config/shopInfo` document creation | Requires admin to create via Firebase console (`foundedYear: <year>`) — no admin UI in E17 | Before E17 deploys to dev |

---

## Open Decisions Needed

| Question | Context | Urgency |
|---|---|---|
| Legal counsel on cannabis/fireworks regulation | Required before E11 features ship to prod | Before prod deploy |

---

## Previous Cycle Summary

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

**Cycle 18** (2026-05-19 → 2026-05-19) — Closed E18 · AI Assistant.

| Task | Epic | Completed |
|---|---|---|
| `generateAIDescription` (Gemini 1.5 Pro) | E18 | 2026-05-19 |
| `suggestAiPrice` (eBay comp analysis) | E18 | 2026-05-19 |
| `suggestAiTags` (Gemini 1.5 Flash) | E18 | 2026-05-19 |
| `AiAssistantPanel` Staff Review Toolkit | E18 | 2026-05-19 |
| `internal/ai` Firestore firewall rules | E18 | 2026-05-19 |
| **E18 CLOSED** | E18 | 2026-05-19 |

---

**Cycle 17** (2026-05-19 → 2026-05-19) — Closed E16 · Post-Sale Operations.

| Task | Epic | Completed |
|---|---|---|
| `disputes/{id}` collection + schema | E16 | 2026-05-19 |
| `ReturnRequestForm` customer component | E16 | 2026-05-19 |
| `DisputeAdminPage` & `RestockAction` admin UI | E16 | 2026-05-19 |
| `createDispute` & `resolveDispute` Cloud Functions | E16 | 2026-05-19 |
| Atomic restock logic with Kevin alert trigger | E16 | 2026-05-19 |
| **E16 CLOSED** (eBay background sync deferred to E22) | E16 | 2026-05-19 |

---

**Cycle 16** (2026-05-19 → 2026-05-19) — Closed E12 · Alerts & Notifications.

| Task | Epic | Completed |
|---|---|---|
| `savedSearches/{id}` collection + customer UI | E12 | 2026-05-19 |
| Favourites/wishlist UI (`FavouritesPage`) | E12 | 2026-05-19 |
| `onItemPublished` Firestore alert trigger | E12 | 2026-05-19 |
| In-app notification centre dropdown | E12 | 2026-05-19 |
| CASL opt-in check and discretion branding | E12 | 2026-05-19 |
| **E12 CLOSED** | E12 | 2026-05-19 |

---

**Cycle 15** (2026-05-19 → 2026-05-19) — Closed E15 · CRM & Retention.

| Task | Epic | Completed |
|---|---|---|
| `purchaseHistory` and `inquiryHistory` automated tracking | E15 | 2026-05-19 |
| VIP flag and Reseller Tier management callables | E15 | 2026-05-19 |
| `crmDailyReminders` scheduled follow-up job | E15 | 2026-05-19 |
| `/admin/crm` dashboard and customer detail pages | E15 | 2026-05-19 |
| Cross-view browsing detection logic | E15 | 2026-05-19 |
| **E15 CLOSED** | E15 | 2026-05-19 |

---

**Cycle 14** (2026-05-19 → 2026-05-19) — Closed E11 · Compliance Programme & Documentation Sync.

| Task | Epic | Completed |
|---|---|---|
| Age gate audit log entries confirmed working | E11 | 2026-05-19 |
| `purgeExpiredData` documented and scheduled | E11 | 2026-05-19 |
| Legal review and NVDA spot-check scheduled | E11 | 2026-05-19 |
| `/accessibility` page confirmed live | E11 | 2026-05-19 |
| VitePress User Guide synced with current codebase | E22 | 2026-05-19 |
| Codebase Export script (`export:llm`) implemented | E22 | 2026-05-18 |
| Docs-as-Code Planning workflow implementation | E01 | 2026-05-18 |
| **E11 CLOSED** | E11 | 2026-05-19 |

---

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-05-19 (Cycle 21 open)*
