# Project E13: Merchandising Engine

**Status:** Done — 2026-05-18 (deferred: vertical video on Cannabis + Fireworks pages — content dependency, no video assets; target: E17 or when assets are supplied)
**Epic:** E13 — Merchandising Engine
**Phase:** Phase 3 — Discovery & Merchandising
**Primary Persona:** Sandra — The Curious Passerby
**Secondary Personas:** Marie (Mood Collections), Marcus (rare-find display + quick-view photography standard), Kevin (just-arrived tag + trending-score browse), Jordan (related items + cross-view coherence), Dale (search decision + sub-300ms response), Tanya (Fireworks bundle collections)
**AI Involvement:** Claude (dev) only — no Gemini runtime involvement

**Objective:** Deliver the full merchandising layer — staff picks admin UI, `calculateTrendingScore` Cloud Function, `just-arrived` auto-tagging, Mood Collection pages per view, quick-view modal (≤200ms, pre-fetch on hover), and related items by trending score — transforming the platform from a searchable catalogue into a curated, discovery-first shopping experience.

---

## 1. User Story

> As **Sandra**, I want to open any item on the Pawn homepage without losing my place in the masonry grid — so that I can browse freely, follow my curiosity, and discover things I didn't know I was looking for.

> As **Marie**, I want to navigate the Cannabis view by mood (Relax, Focus, Social, Ceremony) on a dedicated collection page — so that I find what I need for my wellness routine without browsing by SKU.

> As **Kevin**, I want trending and just-arrived items to be visually flagged in the inventory grid — so that I can spot new and high-activity stock quickly when I'm browsing between alerts.

> As **admin staff**, I want a UI to curate the Staff Picks section with my own editorial notes — so that the platform reflects genuine human curation, not an algorithm.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Sandra

> *"Quick-view modal (E13) must be pre-fetched on hover, opening within 200ms of tap/click."*
> *"Staff Picks are editorial endorsements. Copy must be written in the brand voice — first-person curator perspective, not algorithm-generated bullets."*
> *"Pawn homepage must use masonry grid (E05.1), not a standard grid. Non-linear layout is a product requirement, not an aesthetic choice."*

Test: Hover any masonry card for 200ms on the Pawn homepage, then click. The quick-view modal must open within 200ms of click. Staff Picks section must display a staff-written curator note alongside each item — no AI-generated copy visible.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px) — quick-view open button, collection nav, staff picks CTA
- [ ] All copy uses plain language — no jargon, no retail buzzwords in collection page headings or staff pick labels
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true` — collection names (Mood Collections) must be English or reviewed
- [ ] Quick-view modal and collection pages are navigable in ≤3 taps from the homepage

### Marcus Photography Test (run — quick-view surfaces item imagery)

- [ ] Quick-view modal renders primary item image at full quality — no compression artefacts
- [ ] `rare-find` badge on quick-view and masonry cards only appears for staff-set `merchandisingTags` containing `rare-find` — never computed
- [ ] Staff Picks photography meets dark luxury standard before staff adds a pick

### Kevin Speed Test (run — just-arrived is a near-notification feature)

- [ ] `just-arrived` tag is visible on items published within the last 48 hours
- [ ] Items with `policeHold: true` never appear with `just-arrived` or any other tag in public views

### Marie Discretion Test (run — Mood Collection pages are cannabis-view features)

- [ ] Cannabis Mood Collection page headings use approved wellness language only — no medical claims, no clinical terminology
- [ ] No `--color-primary` on `--color-bg` below `--text-subheading` (24px) in any cannabis collection component

---

## 3. Compliance Gate

- [ ] **Age gate required?** No new routes are age-gated beyond what exists. Cannabis Mood Collection pages at `/cannabis/collections/*` inherit the existing 19+ router-level gate from `ViewContext`/`ProtectedRoute`. No additional gate logic required.
- [ ] **`auditLogs` events required?**
  - `staff_pick_set` — when staff adds `staff-pick` to an item's `merchandisingTags`
  - `staff_pick_removed` — when staff removes `staff-pick` from an item's `merchandisingTags`
  - Details map: `{ itemId, viewTag }` — no PII
- [ ] **PII exclusion** — `calculateTrendingScore` operates only on item-level counters (`viewCount`, `enquiryCount`). No user identifiers in any trending computation or log entry.
- [ ] **`policeHold` respected** — All item queries for Mood Collections, Staff Picks, Quick-View, and Related Items must include `policeHold != true`. The Firestore public read rule already enforces this; any client-side filtering must not loosen this constraint.
- [ ] **`aiDescription` draft-only** — Quick-view modal renders `items/{id}.description` only. No code path reads `items/{id}/internal/ai`.
- [ ] **AI API security** — N/A (E13 has no AI runtime calls)
- [ ] **CASL compliance** — N/A (E13 has no notifications or CRM sends)
- [ ] **Scarcity integrity** — `just-arrived` is time-based (< 48h since `createdAt`) — not manufactured scarcity, it is a factual recency signal. `rare-find` remains staff-set only; the `updateMerchandisingTags` CF must reject `rare-find` writes from non-staff callers. `limited-edition` same restriction.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read:  title, description, status, price, condition, images, videoUrl,
              viewTag, viewTags, policeHold, merchandisingTags, trendingScore,
              viewCount, enquiryCount, createdAt, provenanceNotes, category
Fields written: merchandisingTags (via updateMerchandisingTags CF — admin/manager/inventory_staff)
                trendingScore (via calculateTrendingScore scheduled CF)

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: staff_pick_set, staff_pick_removed
```

### New Fields Required

```
NEW FIELDS (update schema doc first — done below):
- items/{id} / enquiryCount — number — running count of reservations/click-and-collect
  requests for this item; incremented by createReservation CF; input to calculateTrendingScore.
  Default: 0. Not customer-visible; used only in trending computation.
```

New `auditLogs` event types to register in schema:
- `staff_pick_set`
- `staff_pick_removed`

### TypeScript Interfaces

```typescript
// Item — extend with enquiryCount (new field)
// MasonryCard, ItemQuickView — existing components from E05; enhance, don't replace
// StaffPick — local admin interface: { itemId: string, curatorNote: string, staffUid: string }
//   curatorNote stored on items/{id}.merchandisingTags[] implicitly via CF; note stored TBD
//   (see §6 Phase 2 — decision required: where does curatorNote live?)
```

> **Decision required before Phase 2:** Where does the staff curator note for a Staff Pick live?
> Option 1: A new `staffPickNote` field on `items/{id}` — clean, queryable, single document.
> Option 2: A new `staffPicks/{itemId}` collection — richer but adds a read for every Staff Picks render.
> Recommend Option 1 (see DECISIONS.md update in §6 Phase 1).

### Security Rules Required

```javascript
// No new rule collections needed.
// updateMerchandisingTags CF (Admin SDK) bypasses rules — enforce via claim check in CF.
// calculateTrendingScore scheduled CF (Admin SDK) — no rule change.
// Mood Collection pages: client reads items where viewTag == 'cannabis' && status == 'active'
//   && policeHold != true — already covered by existing public read rule.
// Quick-view: client reads single items/{id} — already covered by existing read rule.
```

---

## 5. AI Involvement Detail

### Claude (development):

- Applies: PLANNING.md, TESTING.md, TICKET_CLOSE.md
- Guardrails for E13:
  - Do not generate Kanien'kéha for any Mood Collection name or staff pick label.
  - `curatorNote` content in the staff picks admin UI is staff-written; Claude may write placeholder/example copy only, never production copy.
  - `rare-find` must never be auto-applied in any code path — validate in CF before write.

---

## 6. Implementation Phases

### Phase 1 — Schema & Decision Updates

- [ ] Update `docs/firestore-schema.md`: add `enquiryCount` field to `items/{id}`
- [ ] Update `docs/firestore-schema.md`: add `staffPickNote` field to `items/{id}` (staff-written curator note; staff-only write; customer-visible on Staff Picks display)
- [ ] Update `docs/firestore-schema.md`: add `staff_pick_set` and `staff_pick_removed` to `auditLogs` event type list
- [ ] Update `docs/DECISIONS.md`: log `enquiryCount` field decision + `staffPickNote` approach
- [ ] Update `docs/DECISIONS.md`: log search decision (Firestore prefix tokens retained — see §3 EPICS justification)
- [ ] No `firestore.rules` changes required (all E13 writes go through CFs with Admin SDK)
- [ ] Add composite index: `items` — `viewTag ASC`, `status ASC`, `trendingScore DESC` (for related items + collection pages sorted by score)

### Phase 2 — Cloud Functions

**`calculateTrendingScore` (scheduled, every 30 min):**
- [ ] Trigger: Cloud Scheduler — every 30 minutes
- [ ] Logic: Query all `items` with `status == 'active'`. For each item, compute:
  `trendingScore = (viewCount * 1.0) + (enquiryCount * 5.0) — (hoursSincePublished * 0.1)`
  (time decay reduces score for old items; linear for MVP)
- [ ] Write `trendingScore` back to each item document (batch writes, groups of 500)
- [ ] No `auditLogs` write (automated CF — no actor UID)
- [ ] File: `functions/src/trendingScore.ts` — exported and registered in `functions/src/index.ts`

**`updateMerchandisingTags` (callable, staff auth):**
- [ ] Trigger: callable
- [ ] Params: `{ itemId: string, tag: string, action: 'add' | 'remove', curatorNote?: string }`
- [ ] Auth: `admin`, `manager`, or `inventory_staff` custom claim required
- [ ] Logic:
  - Validate `tag` is one of `['staff-pick', 'rare-find', 'limited-edition', 'just-arrived']`
  - `action == 'add'`: `arrayUnion(tag)` on `items/{id}.merchandisingTags`; if `tag == 'staff-pick'` and `curatorNote` provided, update `staffPickNote` field
  - `action == 'remove'`: `arrayRemove(tag)` on `items/{id}.merchandisingTags`; if `tag == 'staff-pick'`, clear `staffPickNote`
- [ ] Write `auditLogs` entry: `staff_pick_set` or `staff_pick_removed` (for `staff-pick` tag only)
- [ ] Error: reject `rare-find` or `limited-edition` writes from `inventory_staff` (manager+ only)
- [ ] File: `functions/src/merchandising.ts` — exported and registered in `functions/src/index.ts`

**Modify `createReservation` (existing CF — E08):**
- [ ] After creating `reservations/{id}`, increment `items/{itemId}.enquiryCount` by 1 using `FieldValue.increment(1)` in the Admin SDK

**`removeJustArrivedTag` (scheduled, every 30 min — piggyback on trendingScore run or separate):**
- [ ] Query `items` where `merchandisingTags` array-contains `just-arrived` and `createdAt < now - 48h`
- [ ] For each match, `arrayRemove('just-arrived')` from `merchandisingTags`
- [ ] Can be a second function in `functions/src/trendingScore.ts` sharing the same schedule

**Modify `publishItem` (existing CF — E04):**
- [ ] After setting `status = 'active'`, add `just-arrived` to `merchandisingTags` via `arrayUnion`

### Phase 3 — UI Components

**Quick-View Modal enhancement (existing `ItemQuickView` from E05):**
- [ ] Add hover pre-fetch: `onMouseEnter` / `onTouchStart` on `MasonryCard` triggers Firestore `getDoc(items/{id})` and caches result in a `useRef` map
- [ ] On click, if cached data exists, open modal immediately (< 200ms target met)
- [ ] Modal content: primary image at full quality, title, price, condition, `merchandisingTags` badges, `staffPickNote` if staff-pick, truncated `description`, "View Full Details" CTA
- [ ] Motion: quick-view open uses `Quick-view open` pattern from design-system.md §4.2 (200ms)
- [ ] File: `src/components/ItemQuickView.tsx` — enhance existing; do not recreate

**Staff Picks display (Pawn homepage + masonry grid):**
- [ ] `StaffPicksSection` component — dedicated section on Pawn homepage above masonry grid
- [ ] Layout: 1→2→3 column grid per design-system.md §7.3 Staff Picks grid spec
- [ ] Each card: full image, title, price, `staffPickNote` (staff curator voice), Staff Pick gold badge
- [ ] Staff Pick badge: gold star icon + "Staff Pick" label — top-right overlay on card image
- [ ] Query: `items` where `status == 'active'` and `merchandisingTags` array-contains `staff-pick` and `policeHold != true`
- [ ] File: `src/components/StaffPicksSection.tsx`

**Staff Picks admin UI:**
- [ ] Component: `src/components/admin/StaffPicksManager.tsx`
- [ ] Route: `/admin/staff-picks` (add to `src/main.tsx`)
- [ ] Features:
  - List all active items with current `staff-pick` status shown
  - Toggle staff-pick on/off per item — calls `updateMerchandisingTags` CF
  - Curator note input (textarea, max 280 chars, brand voice guidance shown inline)
  - Preview of how the note will appear on the storefront
  - Filter by `viewTag` to manage each view separately
- [ ] CSS: follows existing admin inbox pattern (`.admin-inbox` classes)

**Mood Collection pages (Cannabis):**
- [ ] Routes: `/cannabis/collections/relax`, `/cannabis/collections/focus`, `/cannabis/collections/social`, `/cannabis/collections/ceremony`
- [ ] Component: `src/pages/cannabis/MoodCollectionPage.tsx` (parameterised by mood slug)
- [ ] Query: `items` where `viewTag == 'cannabis'` and `status == 'active'` and `policeHold != true` and `category` matches mood mapping (from E05 DECISIONS.md: relax→indica, focus→sativa, social→hybrid, ceremony→premium)
- [ ] Layout: 2-col mood collection grid per design-system.md §7.3
- [ ] Collection nav: horizontal scroll strip linking to all four moods — visible on all cannabis pages
- [ ] Vertical video: if `videoUrl` exists on an item, render in a `<video autoPlay muted loop playsInline>` element above the description in the collection card (cannabis view only)

**Fireworks Bundle collection page:**
- [ ] Route: `/fireworks/collections/bundles`
- [ ] Component: `src/pages/fireworks/BundleCollectionPage.tsx`
- [ ] Query: `items` where `viewTag == 'fireworks'` and `status == 'active'` and `policeHold != true` and `bundleIds.length > 0` OR `merchandisingTags` array-contains `limited-edition`
- [ ] Layout: Bundle Grid per design-system.md §7.3

**Related Items on detail page:**
- [ ] On `ItemDetailPage` (existing), add `RelatedItems` component at bottom
- [ ] Query: `items` where `viewTag == item.viewTag` and `category == item.category` and `status == 'active'` and `policeHold != true`, ordered by `trendingScore DESC`, limit 4
- [ ] Exclude the current item from results (client-side filter)
- [ ] Layout: horizontal scroll on mobile, 4-col grid on desktop
- [ ] File: `src/components/RelatedItems.tsx`

**Merchandising badges (shared):**
- [ ] `MerchandisingBadge` component: renders the correct badge for a given `merchandisingTags` entry
- [ ] `just-arrived`: teal/silver badge — "Just Arrived" label
- [ ] `staff-pick`: gold badge — star icon + "Staff Pick" label
- [ ] `rare-find`: amber/gold badge — "Rare Find" label (never auto-applied — display only)
- [ ] `limited-edition`: primary colour badge — "Limited Edition" label
- [ ] File: `src/components/MerchandisingBadge.tsx`

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Sandra persona smoke tests: quick-view < 200ms on masonry grid, Staff Picks editorial copy visible
- Marcus Photography Test: quick-view primary image quality, rare-find badge staff-verified
- Marie: Mood Collection pages accessible via 19+ gate, no medical claims in copy, `--color-primary` not used below 24px
- Kevin: `just-arrived` visible on newly published items, disappears after 48h
- Compliance: policeHold items absent from all new queries, no PII in auditLogs details

---

## 7. Definition of Done

- [ ] `calculateTrendingScore` scheduled CF deployed and running — `trendingScore` updates on active items every 30 min
- [ ] `updateMerchandisingTags` CF deployed — staff-pick add/remove works; `auditLogs` entries written
- [ ] `createReservation` CF updated — `enquiryCount` increments on reservation create
- [ ] `publishItem` CF updated — `just-arrived` added on publish; removal CF cleans up after 48h
- [ ] Staff Picks admin UI at `/admin/staff-picks` — list, toggle, curator note, preview
- [ ] `StaffPicksSection` renders on Pawn homepage — editorial cards with curator notes
- [ ] Mood Collection pages live at `/cannabis/collections/{mood}` — four moods, filtered correctly
- [ ] Fireworks Bundle collection page live at `/fireworks/collections/bundles`
- [ ] Quick-view opens in < 200ms (verified by browser DevTools network panel — data pre-fetched on hover)
- [ ] `RelatedItems` component on all three views' item detail pages — sorted by `trendingScore DESC`
- [ ] `MerchandisingBadge` component used consistently across masonry grid, quick-view, and detail pages
- [ ] `rare-find` badge never appears on items without staff-set tag — verified in QA
- [ ] Cannabis `--color-primary` contrast rule: no purple-on-plum below 24px anywhere in E13 components
- [ ] `enquiryCount` and `staffPickNote` fields added to `docs/firestore-schema.md`
- [ ] Search decision logged in `docs/DECISIONS.md`
- [ ] Composite index added to `firestore.indexes.json`
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] EPICS.md tasks ticked
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/E13_Merchandising_Engine.md*
