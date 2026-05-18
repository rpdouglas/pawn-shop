# Active Cycle — The Pawn Shop

> **Sprint tracking file.** Update at the start and end of every work cycle.
> Referenced by `docs/prompts/INITIALIZATION.md` on session load.

---

## Current Cycle

**Cycle:** 10
**Started:** 2026-05-18
**Target close:** TBD
**Deploy target:** dev

---

## Cycle Goal

Deliver E17 · Conversion Optimisation — recently sold strip (real data, `onItemSold` events), years-in-business badge + testimonials module, privacy-safe live activity feed (city-level only, rate-limited, no PII), `limited-edition`/`rare-find` display (staff-set only), hold countdown badge on reserved items.

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
| MFA bypass confirmed impossible | Requires Identity Platform upgrade — pre-prod compliance gate | Before prod deploy (E11) |
| eBay developer account setup (webhook URL registration, notification subscription) | Requires eBay seller account and developer credentials — outside codebase scope | Before E06 deploys to prod |
| axe-core browser run on admin intake success view (EbayPushButton) | Requires live browser session | Post-E06 merge verification |
| Vertical video on Cannabis + Fireworks pages | Content dependency — no video assets available | E17 or when assets supplied |

---

## Open Decisions Needed

| Question | Context | Urgency |
|---|---|---|
| Legal counsel on cannabis/fireworks regulation | Required before E11 features ship to prod | Before prod deploy |
| Kanien'kéha community review process | Required before E19 (Akwesasne Identity System) begins | Before E19 starts |

---

## Previous Cycle Summary

**Cycle 09** (2026-05-18 → 2026-05-18) — Closed Firebase 403 Fix & Inventory/404 Implementation.

| Task | Epic | Completed |
|---|---|---|
| `src/lib/featureFlags.ts` updated with descriptive 403 console warning | E10 | 2026-05-18 |
| Manual GCP instructions provided for Installations API permissions | E10 | 2026-05-18 |
| `InventoryPage.tsx` + `/admin/inventory` route implemented | E10 | 2026-05-18 |
| `NotFoundPage.tsx` + global `errorElement` + `*` catch-all route implemented | E10 | 2026-05-18 |
| `DECISIONS.md` updated with 403 diagnostic and Inventory/404 rationale | E10 | 2026-05-18 |
| **Cycle 09 CLOSED** | E10 | 2026-05-18 |

---

**Cycle 08** (2026-05-18 → 2026-05-18) — Closed E10 · Analytics, Feature Flags & Admin Dashboard.

| Task | Epic | Completed |
|---|---|---|
| `docs/projects/E10_Analytics_Feature_Flags_Admin_Dashboard.md` spec drafted | E10 | 2026-05-18 |
| `src/lib/firebase.ts` updated: `analytics` + `remoteConfig` exports + `measurementId` env var | E10 | 2026-05-18 |
| `src/lib/analytics.ts` — typed PII-safe GA4 event helper (5 event types; null-guard for unconfigured environments) | E10 | 2026-05-18 |
| `src/lib/featureFlags.ts` — Remote Config hook (3 flags: `show_staff_picks`, `show_related_items`, `pawn_form_enabled`; 60s fetch interval in prod) | E10 | 2026-05-18 |
| `src/lib/utm.ts` — UTM sessionStorage capture + retrieval (sessionStorage-only, never Firestore) | E10 | 2026-05-18 |
| GA4 `page_view` events: `PawnPage`, `CannabisPage`, `FireworksPage` (on mount) | E10 | 2026-05-18 |
| GA4 `item_view` event: `ItemQuickView` (on mount, fires per item open) | E10 | 2026-05-18 |
| GA4 `enquiry_submit` event: `ClickCollectModal` (on createReservation success) | E10 | 2026-05-18 |
| GA4 `age_gate_event` pass/fail: `AgeGate` (alongside existing logAgeGateFn CF call) | E10 | 2026-05-18 |
| GA4 `pawn_form_submit` event: `PawnEnquiryForm` (on submitPawnRequest success) | E10 | 2026-05-18 |
| Feature flag consumption: `PawnPage` (`showStaffPicks`, `showRelatedItems`), `SellPage` (`pawnFormEnabled`) | E10 | 2026-05-18 |
| `setPoliceHold` callable CF — admin claim only, `policeHold` write + `police_hold_set` auditLog | E10 | 2026-05-18 |
| `PoliceHoldManager` admin component — item lookup by Firestore ID, toggle with confirmation dialog | E10 | 2026-05-18 |
| `DashboardPage` + `/admin/dashboard` route — status count cards, view breakdown, pawn volume, top 5 trending items table | E10 | 2026-05-18 |
| `captureUtm()` called at module load in `main.tsx` — UTM captured on every landing URL | E10 | 2026-05-18 |
| 8 `DECISIONS.md` entries: analytics null-guard, Remote Config intervals, defaults placement, UTM scope, setPoliceHold claim rationale, getDocs/getCountFromServer pattern, dashboard auth gates | E10 | 2026-05-18 |
| **E10 CLOSED** | E10 | 2026-05-18 |

---

**Cycle 07** (2026-05-18 → 2026-05-18) — Closed E13 · Merchandising Engine.

| Task | Epic | Completed |
|---|---|---|
| `docs/projects/E13_Merchandising_Engine.md` spec drafted | E13 | 2026-05-18 |
| `enquiryCount` + `staffPickNote` fields added to `firestore-schema.md` | E13 | 2026-05-18 |
| `staff_pick_set` / `staff_pick_removed` event types added to auditLogs schema | E13 | 2026-05-18 |
| 6 DECISIONS.md entries: enquiryCount rationale, trendingScore formula, scheduling, StaffPicksSection query, search decision | E13 | 2026-05-18 |
| `updateMerchandisingTags` callable CF — staff auth, manager+ gate for rare-find/limited-edition, auditLogs | E13 | 2026-05-18 |
| `calculateTrendingScore` scheduled CF — every 30 min, viewCount + enquiryCount×5, batch-writes | E13 | 2026-05-18 |
| `removeJustArrivedTags` scheduled CF — every 30 min, memory-filters createdAt < 48h | E13 | 2026-05-18 |
| `publishItem` CF updated: `FieldValue.arrayUnion('just-arrived')` on publish | E13 | 2026-05-18 |
| `createReservation` CF updated: `FieldValue.increment(1)` on `enquiryCount` | E13 | 2026-05-18 |
| `functions/src/index.ts` updated: exports merchandising CFs | E13 | 2026-05-18 |
| `Item` interface + `useItems` hook: `enquiryCount`, `staffPickNote` fields | E13 | 2026-05-18 |
| `MerchandisingBadge` component — 4 tag variants, CSS custom property tokens | E13 | 2026-05-18 |
| `StaffPicksSection` component — onSnapshot query, curator note, quick-view CTA | E13 | 2026-05-18 |
| `RelatedItems` component — trending-sorted, category-filtered horizontal strip | E13 | 2026-05-18 |
| `ItemQuickView` updated: `MerchandisingBadge`, staffPickNote display, RelatedItems | E13 | 2026-05-18 |
| `MasonryGrid` updated: `MerchandisingBadge`, `onHover` prop for prefetch trigger | E13 | 2026-05-18 |
| `PawnPage` updated: `prefetchCache` ref, hover prefetch, `StaffPicksSection`, `onSelectRelated` | E13 | 2026-05-18 |
| `StaffPicksManager` admin component — view tabs, item table, tag add/remove, curator note | E13 | 2026-05-18 |
| `StaffPicksPage` admin page + `/admin/staff-picks` route | E13 | 2026-05-18 |
| `MoodCollectionPage` — Cannabis mood nav strip + category-filtered grid, contrast fix | E13 | 2026-05-18 |
| `BundleCollectionPage` — Fireworks bundle/limited-edition filter + ClickCollectModal | E13 | 2026-05-18 |
| `main.tsx` routes: cannabis collections, fireworks bundles, admin staff-picks | E13 | 2026-05-18 |
| `firestore.indexes.json`: composite index for `merchandisingTags array-contains` | E13 | 2026-05-18 |
| `src/index.css`: merch-badge tokens + component styles (QA fixes: class names, contrast) | E13 | 2026-05-18 |
| Badge color CSS tokens promoted to `:root` custom properties (tech debt resolved) | E13 | 2026-05-18 |
| **E13 CLOSED** (deferred: vertical video — content dependency, target: E17) | E13 | 2026-05-18 |

---

**Cycle 06** (2026-05-18 → 2026-05-18) — Closed E09 · Quality, Security & Accessibility.

| Task | Epic | Completed |
|---|---|---|
| Firestore security rules audit — all 13 rule blocks reviewed | E09 | 2026-05-18 |
| `auditLogs` create rule tightened: `isSignedIn()` → `if false` | E09 | 2026-05-18 |
| `savedSearches` create rule fixed: `resource.data.uid` → `request.resource.data.uid` | E09 | 2026-05-18 |
| `purgeExpiredData` scheduled CF — PIPEDA 730-day retention, weekly Sunday 02:00 UTC | E09 | 2026-05-18 |
| `addSerialToBlacklist` / `removeSerialFromBlacklist` callable CFs (admin-only) | E09 | 2026-05-18 |
| `SerialBlacklistManager` admin UI — real-time list, add form, confirm-before-remove | E09 | 2026-05-18 |
| `/accessibility` statement page — WCAG 2.1 AA commitment, known limitations, contact | E09 | 2026-05-18 |
| Skip-to-content link + `<main id="main-content">` landmark + site footer | E09 | 2026-05-18 |
| Global `a:focus-visible`, `select:focus-visible`, `cc-slot-btn:focus-visible` CSS | E09 | 2026-05-18 |
| Kanien'kéha codebase scan — clean; two Akwesasne proper noun refs documented | E09 | 2026-05-18 |
| **E09 CLOSED** (deferred: Lighthouse score — requires deployed URL, target: before E13 ships) | E09 | 2026-05-18 |

---

**Cycle 05** (2026-05-18 → 2026-05-18) — Closed E08 · Click & Collect / Contact.

| Task | Epic | Completed |
|---|---|---|
| Click-and-collect request form on Pawn + Fireworks item pages (`ClickCollectModal`) | E08 | 2026-05-18 |
| `reservations/{id}` collection + status flow (pending → confirmed → declined → completed) | E08 | 2026-05-18 |
| `createReservation` / `confirmReservation` / `completeReservation` callable CFs | E08 | 2026-05-18 |
| SMS confirmation inline in CF — guarantees 60-second SLA (Twilio) | E08 | 2026-05-18 |
| `ReservationInbox` admin component — real-time onSnapshot, confirm/decline/complete | E08 | 2026-05-18 |
| `updateStoreHours` CF + `StoreHoursEditor` admin component — 30-min slot generation | E08 | 2026-05-18 |
| `sendContactEmail` CF (SendGrid) + `ContactPage` with Google Maps iframe | E08 | 2026-05-18 |
| Firestore rules — reservations client write blocked; `config/{docId}` read: signed-in only | E08 | 2026-05-18 |
| **E08 CLOSED** | E08 | 2026-05-18 |

---

**Cycle 04** (2026-05-17 → 2026-05-18) — Closed E07 · Pawn Form & Inbox.

| Task | Epic | Completed |
|---|---|---|
| Customer pawn enquiry form (`PawnEnquiryForm`) + `/pawn/sell` route | E07 | 2026-05-18 |
| `submitPawnRequest` callable CF — serial blacklist check, auditLogs, admin alert | E07 | 2026-05-18 |
| `pawnRequests/{id}` Firestore rules — create blocked on client, update field-scoped | E07 | 2026-05-18 |
| `PawnInbox` admin component — real-time `onSnapshot`, status/notes update | E07 | 2026-05-18 |
| Storage rules — `pawn-requests/` read restricted to staff custom claims | E07 | 2026-05-18 |
| **E07 CLOSED** | E07 | 2026-05-18 |

---

**Cycle 03** (2026-05-17 → 2026-05-17) — Closed E06 · eBay Cross-Posting.

| Task | Epic | Completed |
|---|---|---|
| `docs/projects/E06_eBay_Cross_Posting.md` spec drafted | E06 | 2026-05-17 |
| `pushToEbay` callable CF — three-step eBay Sell Inventory API flow | E06 | 2026-05-17 |
| `ebayWebhook` HTTP CF — HMAC-verified real-time sold sync | E06 | 2026-05-17 |
| `EbayPushButton` admin component + CSS | E06 | 2026-05-17 |
| `auditLogs` event types `ebay_push` and `ebay_sync_sold` added to schema | E06 | 2026-05-17 |
| **E06 CLOSED** (eBay developer account setup required before prod deploy — see Deferred) | E06 | 2026-05-17 |

---

## Next Cycle Preview

After E17 closes: E14 · Seasonal Campaign Scheduler — campaigns/{id} collection, activateCampaign + deactivateCampaign Cloud Functions, admin campaign calendar UI, real-date countdown timer, Fireworks pre-order flow.

---

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-05-18*
