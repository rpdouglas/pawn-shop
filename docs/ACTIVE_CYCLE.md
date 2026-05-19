# Active Cycle — The Pawn Shop

> **Sprint tracking file.** Update at the start and end of every work cycle.
> Referenced by `docs/prompts/INITIALIZATION.md` on session load.

---

## Current Cycle

**Cycle:** 19
**Started:** 2026-05-19
**Target close:** TBD
**Deploy target:** dev

---

## Cycle Goal

Deliver E19 · Editorial CMS & Brand Narrative — Foundation of the Akwesasne identity series.

---

## In Progress

| Task | Epic | Persona | Owner | Notes |
|---|---|---|---|---|
| — | — | — | — | No tasks in flight |

---

## Completed This Cycle

| Task | Epic | Completed |
|---|---|---|
| — | — | — |

---

## Deferred / Blocked

| Item | Reason | Target cycle |
|---|---|---|
| Lighthouse ≥90 performance, ≥90 accessibility, ≥95 SEO | Requires deployed URL + Chrome DevTools — cannot run in Codespaces terminal | Before E13 ships to dev |
| WCAG AA axe-core browser verification | Requires running browser session on `/pawn`, `/cannabis`, `/fireworks` | Before E02 fully closes |
| axe-core browser run on admin dashboard + PoliceHoldManager | Requires live browser session | Post-E10 merge verification |
| axe-core browser run on E17 components (RecentlySoldStrip, ActivityFeed, HoldCountdownBadge) | Requires live browser session | Post-E17 merge verification |
| MFA bypass confirmed impossible | Requires Identity Platform upgrade — pre-prod compliance gate | Before prod deploy (E11) |
| eBay developer account setup (webhook URL registration, notification subscription) | Requires eBay seller account and developer credentials — outside codebase scope | Before E06 deploys to prod |
| axe-core browser run on admin intake success view (EbayPushButton) | Requires live browser session | Post-E06 merge verification |
| axe-core browser run on E14 components (PreorderModal, PreorderInboxPage, CampaignBanner, CampaignAdminPage) | Requires live browser session | Post-E14 merge verification |
| Vertical video on Cannabis + Fireworks pages | Content dependency — no video assets available | When assets supplied |
| `config/shopInfo` document creation | Requires admin to create via Firebase console (`foundedYear: <year>`) — no admin UI in E17 | Before E17 deploys to dev |

---

## Open Decisions Needed

| Question | Context | Urgency |
|---|---|---|
| Legal counsel on cannabis/fireworks regulation | Required before E11 features ship to prod | Before prod deploy |
| Kanien'kéha community review process | Required before E19 (Akwesasne Identity System) begins | Before E19 starts |

---

## Previous Cycle Summary

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

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-05-18*
