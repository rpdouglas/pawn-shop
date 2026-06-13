# E124 — Site Analytics: GA4 Activation & Enhanced Event Tracking
**Plan Date:** 2026-06-13
**Status:** Awaiting strategy approval

---

## Context

Firebase Analytics (GA4) is wired into the app but completely inactive — `VITE_FIREBASE_MEASUREMENT_ID`
is not set anywhere. All `Analytics.*` calls no-op silently. UTM params are captured but orphaned.
The existing event surface covers 5 event types across 11 call sites, but misses the homepage,
search, wishlist, and ecommerce-style funnel events needed for meaningful persona analysis.

### Existing Analytics Infrastructure (working once env var is set)

| File | Role |
|---|---|
| `src/lib/analytics.ts` | 5-event wrapper: `pageView`, `itemView`, `enquirySubmit`, `ageGateEvent`, `pawnFormSubmit` |
| `src/lib/firebase.ts` | Conditionally initialises GA4 on `VITE_FIREBASE_MEASUREMENT_ID` |
| `src/lib/utm.ts` | Captures 5 UTM params into `sessionStorage` on first load |
| `src/main.tsx:33` | Calls `captureUtm()` on app boot |

### Existing Call Sites

| File | Event | Gap |
|---|---|---|
| `CannabisPage.tsx:45` | `pageView` | Cannabis suspended — dormant |
| `FireworksPage.tsx:17` | `pageView` | Active |
| `PawnPage.tsx:34` | `pageView` | Active |
| `TobaccoPage.tsx:10` | `pageView` | Active |
| `ItemDetailPage.tsx:69` | `itemView` | Active |
| `ItemQuickView.tsx:55` | `itemView` | Active |
| `AgeGate.tsx:59,73` | `ageGateEvent` | Active |
| `PreorderModal.tsx:58` | `enquirySubmit` | Active |
| `ClickCollectModal.tsx:129` | `enquirySubmit` | Active |
| `PawnEnquiryForm.tsx:168` | `pawnFormSubmit` | Active |
| `HomePage.tsx` | *(none)* | **MISSING** |

---

## Persona Gate

| Persona | Role | Analytics Need |
|---|---|---|
| **Jordan (Primary)** | Editorial quality + PWA | Measures content engagement, cross-view journeys, Finds of the Week read rate |
| **Sandra (Primary)** | Discovery + impulse | Validates masonry grid scroll depth, Staff Picks CTR, quick-view engagement |
| **Dale (Primary)** | Price verification + conversion | Search-to-enquiry funnel, time-to-first-enquiry, recently-sold item CTR |
| **Kevin (Secondary)** | Alert-driven, speed-sensitive | Alert conversion rate, saved-search-to-visit attribution (UTM source = email/SMS) |
| **Marcus (Secondary)** | Photography + provenance | Item image click rate, `provenanceNotes` read rate, VIP early-access CTR |
| **Makoonsii (Compliance)** | Privacy, no PII | Ensures no user-identifiable data enters GA4 — uid, email, name excluded |
| **Marie (Compliance)** | Discretion | Category disclosure test: no cannabis/fireworks category words in event parameters |
| **Staff (Operator)** | Operations intelligence | Campaign performance, conversion by view, referral source quality |

**Tests that apply:**
- **Marie Discretion Test:** No category-disclosing parameter values in event calls. Use `view: 'cannabis'` as a GA4 custom dimension scoped to internal reporting only — confirm GA4 is not surfaced in any public page content.
- **Makoonsii Trust Test:** No PII (UID, email, phone, name) in any event parameter — ever.
- **Kevin Speed Test:** UTM source/medium from SMS alert emails must flow through to conversion events so alert ROI can be measured.
- **Jordan Standard:** Event naming follows GA4 recommended event schema (ecommerce events where applicable) to enable standard GA4 reports.

---

## Schema Audit

No new Firestore fields required for any strategy. All three strategies operate entirely on the
GA4 / client-side layer.

**Existing schema fields leveraged (read-only from analytics perspective):**

| Collection | Field | Use |
|---|---|---|
| `items/{id}` | `viewCount` | Server-side incremented — independent of GA4; not modified |
| `items/{id}` | `enquiryCount` | Server-side incremented — independent of GA4; not modified |
| `users/{uid}` | `crossViewFlag` | Existing field; analytics confirms the behaviour it captures |
| `users/{uid}` | `segments[]` | Existing; `is_vip` user property can mirror this — no PII |

No schema changes. No new `docs/decisions/` entry required for schema.

---

## GA4 Analytics Best Practices — Reference

### GA4 Recommended Event Schema

GA4 distinguishes between three event tiers. Implementing the recommended tier correctly
enables automatic GA4 standard reports (Funnel Exploration, Purchase Journey, etc.).

| Tier | Examples | Impact |
|---|---|---|
| **Automatically collected** | `session_start`, `first_visit`, `page_view` (if enabled) | Free; no code needed |
| **Enhanced measurement** | `scroll`, `outbound_click`, `file_download` | Enable in GA4 dashboard |
| **Recommended events** | `view_item_list`, `select_item`, `view_item`, `generate_lead` | Maps to standard GA4 reports |
| **Custom events** | `age_gate_event`, `pawn_form_submit` | Appear in Explore; no standard reports |

For a retail platform with no direct purchase flow, the key recommended events are:

```
view_item_list  → item appears in a listing grid (with item_list_id, item_list_name, items[])
select_item     → user taps an item card (with items[])
view_item       → item detail / quick-view opens (with items[])
generate_lead   → enquiry submitted (with value, currency, items[])
search          → search query executed (with search_term)
```

### UTM Attribution Best Practices

GA4 auto-detects UTM params in the URL and applies them to sessions. However, our current
`captureUtm()` reads params and stores them in `sessionStorage` — it does NOT modify the URL or
call GA4's built-in attribution. This means:

- Direct GA4 auto-detection still works when the user lands on a URL with UTM params
- `sessionStorage` capture is a redundant (but harmless) layer
- To pass UTM attribution through to custom events explicitly, params can be forwarded as
  `event_parameters` on conversion events

### PII Exclusion (Compliance)

GA4 rules for The Pawn Shop:
- Never pass `user_id`, `email`, `phone`, `name`, or `uid` as event parameters
- `user_properties` permitted: `preferred_view` (pawn/cannabis/fireworks), `is_staff` (boolean)
- No `customer_id` mapping — do not enable GA4 User-ID feature
- Cannabis/fireworks `view` dimension is acceptable as an internal GA4 custom dimension
  (it is never surfaced in public-facing pages; it is internal analytics data)

---

## Strategy A — GA4 Activation + Missing Events (Thin)

### What it does

Minimum viable analytics activation. Fix the env var gap, add the missing homepage `pageView`,
and wire UTM params through to conversion events. No structural changes.

### Architecture

**Env var fix:**
- Add `VITE_FIREBASE_MEASUREMENT_ID=` to `.env.example`
- Add to GitHub Codespaces Secrets + `VITE_FIREBASE_MEASUREMENT_ID` declaration in `vite-env.d.ts`

**New events (minimal):**
- `HomePage.tsx` — add `Analytics.pageView({ view: 'pawn', page_path: '/' })`
- `utm.ts` — expose `getUtm()` forwarding; update `analytics.ts` `fire()` to merge UTM params
  from `sessionStorage` into every event's parameter object

**No new event types.** The 5 existing wrappers remain unchanged.

### Files Changed

| File | Change |
|---|---|
| `.env.example` | Add `VITE_FIREBASE_MEASUREMENT_ID=` line |
| `src/vite-env.d.ts` | Already declared optional — no change needed |
| `src/lib/analytics.ts` | Merge `getUtm()` into every `fire()` call |
| `src/pages/HomePage.tsx` | Add `useEffect` → `Analytics.pageView` |

**Scope:** Small — 3 files, 1 env var, ~20 lines

### Persona Lens

- **Jordan:** Page view data now complete. UTM attribution on conversions enables campaign ROI measurement.
- **Sandra/Dale/Kevin:** UTM passthrough means email/SMS alert traffic is attributable to conversion.
- **Makoonsii:** No PII introduced. Analytics calls are unchanged in structure.

### Compliance

- No PII added anywhere
- No new Firestore fields
- No age gate changes
- UTM params are URL-sourced strings (non-PII) appended as event parameters

### Trade-offs

**Benefits:**
- Fastest path to any data at all
- Zero risk — only adds, never changes existing logic
- Activates existing infrastructure

**Costs:**
- GA4 standard reports (ecommerce funnel, item performance) won't work — wrong event names
- No item-level data in events → can't see which specific items drive conversions
- No search tracking, wishlist tracking, or user properties
- Delivers page view counts + form submit counts only — thin signal

**Estimated scope:** Small · 3 source files · 0 new dependencies

---

## Strategy B — GA4 Activation + Enhanced Event Catalog (Recommended)

### What it does

Activates GA4 and migrates the event catalog to GA4's recommended ecommerce schema. Adds
item-level data to events, UTM passthrough to conversions, user properties (no PII),
homepage and search tracking, and campaign impression/click tracking. Uses no new dependencies —
pure Firebase Analytics SDK, already bundled.

### Architecture

**Env var fix:** Same as Strategy A.

**Refactored `analytics.ts` — new event catalog:**

```typescript
// GA4 Recommended Events (enable standard GA4 reports)
viewItemList(p: ViewItemListParams): void  // items appear in grid/listing
selectItem(p: SelectItemParams): void      // item card tapped
viewItem(p: ViewItemParams): void          // detail page / quick-view opened
generateLead(p: GenerateLeadParams): void  // enquiry submitted (replaces enquirySubmit)
search(p: SearchParams): void              // search executed

// Existing (renamed for GA4 parity)
pageView(p: PageViewParams): void          // route-level view (existing, extended)
ageGateEvent(p: AgeGateParams): void       // compliance (existing, unchanged)
pawnFormSubmit(p: PawnSubmitParams): void  // pawn enquiry (existing, unchanged)

// New custom events
campaignView(p: CampaignParams): void      // campaign banner rendered
campaignClick(p: CampaignParams): void     // campaign CTA tapped
wishlistAdd(p: WishlistParams): void       // item saved to wishlist
wishlistRemove(p: WishlistParams): void    // item removed from wishlist
```

**Item parameter shape (GA4 standard `items[]` array):**
```typescript
interface GA4Item {
  item_id: string          // item.id
  item_name: string        // item.title — no PII
  item_category: string    // item.category
  item_variant: string     // item.condition (new/good/fair/poor)
  item_list_name: string   // 'pawn_grid' | 'search_results' | 'quick_view' | etc.
  price: number            // item.priceCents / 100 (display value in CAD)
  currency: 'CAD'
}
```

**UTM passthrough:** `getUtm()` merged into every `fire()` call as custom parameters
(`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`).

**User properties (set once on auth state change, no PII):**
```typescript
setUserProperty('preferred_view', viewTag)   // 'pawn' | 'fireworks' | 'tobacco'
setUserProperty('is_staff', 'true'|'false')  // filter staff sessions in GA4
```

**New call sites:**
| File | Event |
|---|---|
| `HomePage.tsx` | `pageView({ view: 'pawn', page_path: '/' })` |
| `PawnPage.tsx` / `FireworksPage.tsx` | `viewItemList()` when grid renders |
| `ItemQuickView.tsx` | `selectItem()` on open (replaces `itemView`) |
| `ItemDetailPage.tsx` | `viewItem()` on load (replaces `itemView`) |
| `useItemSearch.ts` or search component | `search({ search_term })` |
| `ClickCollectModal.tsx` / `PreorderModal.tsx` | `generateLead()` (replaces `enquirySubmit`) |
| `PawnEnquiryForm.tsx` | `generateLead()` (replaces `pawnFormSubmit`) |
| `CampaignAdminPage` / campaign banner | `campaignView()` + `campaignClick()` |
| Wishlist/Favourites component | `wishlistAdd()` + `wishlistRemove()` |
| `AuthContext.tsx` | `setUserProperty('is_staff', ...)` |
| `ViewContext.tsx` | `setUserProperty('preferred_view', viewTag)` |

### Files Changed

| File | Change |
|---|---|
| `.env.example` | Add `VITE_FIREBASE_MEASUREMENT_ID=` |
| `src/lib/analytics.ts` | Full event catalog refactor — GA4 recommended schema |
| `src/lib/utm.ts` | No change — `getUtm()` already exported |
| `src/lib/firebase.ts` | Add `setUserProperties` helper export |
| `src/contexts/AuthContext.tsx` | Set `is_staff` user property on auth state change |
| `src/contexts/ViewContext.tsx` | Set `preferred_view` user property on view change |
| `src/pages/HomePage.tsx` | `pageView` |
| `src/pages/PawnPage.tsx` | Add `viewItemList` when items load |
| `src/pages/FireworksPage.tsx` | Add `viewItemList` when items load |
| `src/components/pawn/ItemQuickView.tsx` | `selectItem` replaces `itemView` |
| `src/pages/ItemDetailPage.tsx` | `viewItem` replaces `itemView` |
| `src/components/pawn/ClickCollectModal.tsx` | `generateLead` replaces `enquirySubmit` |
| `src/components/fireworks/PreorderModal.tsx` | `generateLead` replaces `enquirySubmit` |
| `src/components/pawn/PawnEnquiryForm.tsx` | `generateLead` replaces `pawnFormSubmit` |

**Scope:** Medium · ~13 source files · 0 new dependencies

### Persona Lens

- **Jordan:** `viewItemList` / `select_item` / `view_item` → standard GA4 Item Performance report
  shows which items Jordan-type visitors engage with most. Cross-view `preferred_view` property
  enables Jordan segment in GA4 Explore.
- **Sandra:** `viewItemList` scroll impression + `selectItem` on quick-view = masonry grid CTR.
  Validates Staff Picks effectiveness (item list name = `'staff_picks'`).
- **Dale:** `search({ search_term })` reveals what Dale is searching for. `generateLead` with item
  price dimension shows which price bands convert. UTM from eBay referral attribution.
- **Kevin:** UTM from SMS alerts (`utm_source=sms&utm_medium=alert`) flows through to `generateLead`
  — proves 60-second alert ROI.
- **Marcus:** `viewItem` with photography engagement; `wishlistAdd` on luxury items.
- **Makoonsii:** Zero PII. No UID passed. `is_staff` filters her sessions out of customer funnels.

### Compliance

- No PII in any event parameter — enforced by typed interfaces
- `view: 'cannabis'` used only as GA4 internal custom dimension — never rendered to public HTML
- Marie Discretion Test: `generate_lead` has `view` parameter — acceptable as internal analytics;
  no `item_name` containing "cannabis" or "weed" (item names are staff-written)
- No Firestore reads or writes — pure client-side GA4 layer
- No AI API keys on client — analytics is frontend-only
- No age gate logic changes
- All motion: not applicable (no UI changes)

### Trade-offs

**Benefits:**
- Unlocks GA4 standard Funnel Exploration, Item Performance, and Ecommerce reports
- UTM attribution correctly flows to every conversion event
- Staff sessions filterable — clean customer analytics
- Campaign performance measurable (view → click → enquiry)
- Zero new dependencies — uses Firebase Analytics already bundled in vendor-firebase chunk
- Search terms reveal what inventory gaps exist (Dale/Kevin signal)
- Wishlist data validates Marcus/Sandra discovery patterns

**Costs:**
- Renaming `enquirySubmit` → `generateLead` requires updating 3 call sites (breaking old event name — GA4 will show two event names during transition; old events stop flowing, new ones start)
- ~13 files touched — moderate surface area
- No session replay, heatmaps, or A/B testing (that's Strategy C)
- GA4 sampling applies at >500K events/day (irrelevant at current traffic)

**Estimated scope:** Medium · ~13 source files · 0 new dependencies

---

## Strategy C — GA4 + PostHog (Full Observability Stack)

### What it does

Everything in Strategy B, plus PostHog (self-hosted or cloud) as a second analytics layer.
PostHog provides session replay, heatmaps, funnel analysis with cohort retention, feature flags,
and A/B testing — capabilities GA4 does not offer.

### Architecture

**All of Strategy B, plus:**
- Add `posthog-js` npm dependency
- `src/lib/posthog.ts` — PostHog initialisation, mirrors event calls from `analytics.ts`
- Session replay: captures DOM interaction (respects `data-ph-no-capture` mask on sensitive fields)
- Heatmaps: `<PawnPage>`, `<HomePage>`, `<CannabisPage>` (when Cannabis resumes)
- Funnel analysis: `browse → quick_view → enquiry → completion`
- Feature flags: replaces Firebase Remote Config for A/B tests
- Rage-click and dead-click detection

**PII masking (critical — non-negotiable):**
- All input fields inside `PawnEnquiryForm`, `WalkInPawnModal`, `IssueLoanModal` must have
  `data-ph-no-capture` or be in the masked input list
- Session replay must never capture credit card, phone, name, or ID fields
- PostHog `capture_pageview: false` — manual control, delegated to our `analytics.ts`

### Files Changed

Everything in Strategy B, plus:
- `package.json` — add `posthog-js`
- `src/lib/posthog.ts` — new init module
- `src/lib/analytics.ts` — dual-fire to GA4 + PostHog
- `src/contexts/AuthContext.tsx` — PostHog `identify()` with staff flag only (no email/uid)
- All form components — add `data-ph-no-capture` to sensitive inputs

**Scope:** Large · ~18 source files · 1 new dependency (posthog-js ~50KB gzipped)

### Persona Lens

Same as Strategy B, plus:
- **Sandra:** Session replay shows exactly where she drops off in the masonry grid. Rage-click detection catches broken quick-view interactions.
- **Jordan:** Heatmap on `HomePage.tsx` validates which portal card Jordan taps first.
- **Dale:** Funnel analysis with cohort retention shows Dale's multi-visit conversion timeline.
- **Marcus:** Session replay on item detail pages shows how far `provenanceNotes` scroll gets.

### Compliance

All Strategy B compliance, plus:
- Session replay data is PIPEDA-sensitive — PostHog server must be in Canada (CA region) or
  consent-gated under PIPEDA
- `data-ph-no-capture` masking is mandatory on all PII fields before any session replay is enabled
- Marie Discretion Test: PostHog session replay of Cannabis page must never be accessible to
  non-admin PostHog users
- Requires a Data Processing Agreement with PostHog Inc. (US company; standard clause available)

### Trade-offs

**Benefits:**
- Session replay + heatmaps eliminate guesswork about UX failures
- Cohort retention analysis shows which persona segment returns
- A/B testing enables evidence-based design decisions (e.g., masonry vs grid for Sandra)
- Funnel visualisation validates persona journey assumptions

**Costs:**
- New dependency: `posthog-js` ~50KB gzipped — bundle size impact on mobile (Jordan/Makoonsii concern)
- PostHog Cloud cost: ~$450/mo at 1M events; self-hosted is free but ops overhead
- PIPEDA compliance with session replay requires legal review before enabling
- PII masking implementation is itself a compliance task — must be done before first replay session
- Doubles the analytics implementation surface area

**Estimated scope:** Large · ~18 source files · 1 new dependency · 1 new PIPEDA/DPA review

---

## Recommendation: Strategy B

**Rationale:**

Strategy A is too thin — it activates analytics but misses the ecommerce event schema that
makes GA4 reports actually useful. It would deliver page views and form submit counts, but
not the funnel or item-level data needed to answer persona questions.

Strategy C is premature. Session replay requires PIPEDA review and PII masking work before
it can be enabled — and that work dwarfs the analytics implementation itself. PostHog bundle
size (50KB gzipped) is a real concern given Jordan's Lighthouse PWA standard. Add PostHog
in a future cycle when there is a specific UX hypothesis to test.

**Strategy B hits the right balance:**
- Zero new dependencies — uses the Firebase Analytics bundle already shipped
- GA4 recommended event schema unlocks standard GA4 Funnel Exploration and Item Performance reports
- UTM passthrough closes the attribution gap for Kevin (SMS alerts) and Dale (eBay referrals)
- User properties enable staff session filtering — immediately improves data quality
- 13 files is a medium surface area, manageable in a single cycle
- The `generateLead` rename is a one-time clean break — old event name was custom anyway

---

## Anti-Regression Checklist (all strategies)

| Rule | Status |
|---|---|
| No hardcoded hex values | ✅ — No UI changes in any strategy |
| No invented Firestore fields | ✅ — Analytics is client-side only; no Firestore writes |
| No AI API keys on client | ✅ — Not applicable |
| No auto-applied scarcity tags | ✅ — Not applicable |
| No PII in analytics or logs | ✅ — Enforced by typed event interfaces; UID/email/name excluded |
| Age gates not moved to component level | ✅ — No route or gate changes |
| No unapproved motion patterns | ✅ — No UI changes |
| Marie Discretion Test | ✅ — `view: 'cannabis'` is an internal GA4 dimension; never rendered to public HTML |

---

## Implementation Checklist (Strategy B — pending approval)

### Step 0 — Environment (pre-code)
- [ ] Locate GA4 Measurement ID in Firebase console (Project Settings → Web app → Measurement ID)
- [ ] Add `VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX` to Codespaces Secrets
- [ ] Add `VITE_FIREBASE_MEASUREMENT_ID=` (blank) to `.env.example`
- [ ] Log decision in `docs/decisions/0041-analytics-strategy-b.md`

### Step 1 — Core Analytics Module
- [ ] Refactor `src/lib/analytics.ts` — new typed event catalog (GA4 recommended schema)
- [ ] Update `src/lib/utm.ts` — confirm `getUtm()` export is sufficient (no changes expected)
- [ ] Add `setUserProperties` helper to `src/lib/firebase.ts`

### Step 2 — User Properties
- [ ] `src/contexts/AuthContext.tsx` — set `is_staff` user property on auth state confirm
- [ ] `src/contexts/ViewContext.tsx` — set `preferred_view` user property on view switch

### Step 3 — Page Views
- [ ] `src/pages/HomePage.tsx` — `pageView({ view: 'pawn', page_path: '/' })`
- [ ] Confirm `PawnPage`, `FireworksPage`, `TobaccoPage` still call `pageView` (no change)

### Step 4 — Item Events
- [ ] `src/pages/PawnPage.tsx` — add `viewItemList` when item grid renders
- [ ] `src/pages/FireworksPage.tsx` — add `viewItemList` when item grid renders
- [ ] `src/components/pawn/ItemQuickView.tsx` — `selectItem` replaces `itemView`
- [ ] `src/pages/ItemDetailPage.tsx` — `viewItem` replaces `itemView`

### Step 5 — Conversion Events
- [ ] `src/components/pawn/ClickCollectModal.tsx` — `generateLead` replaces `enquirySubmit`
- [ ] `src/components/fireworks/PreorderModal.tsx` — `generateLead` replaces `enquirySubmit`
- [ ] `src/components/pawn/PawnEnquiryForm.tsx` — `generateLead` replaces `pawnFormSubmit`

### Step 6 — Campaign + Wishlist Events
- [ ] Locate campaign banner component — add `campaignView` + `campaignClick`
- [ ] Locate wishlist/favourites component — add `wishlistAdd` + `wishlistRemove`

### Step 7 — Gates
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero violations
- [ ] `npm run test` — all tests pass
- [ ] PII audit: `grep -rn "email\|phone\|uid\|\.name" src/lib/analytics.ts` — zero matches
- [ ] Marie Discretion Test: confirm no category string appears in rendered HTML from analytics

---

*The Pawn Shop · docs/plans/E124_SITE_ANALYTICS_PLAN.md · 2026-06-13*
