# Project E39: Cannabis Storefront Enhancement

**Status:** Done — 2026-05-21
**Epic:** E39 — Cannabis Storefront Enhancement
**Phase:** Phase 3 (Discovery & Merchandising)
**Primary Persona:** Marie
**Secondary Personas:** Jordan, Marcus
**AI Involvement:** Claude (dev)

**Objective:** Upgrade the Cannabis storefront page with an interactive filter panel (mood, category, price range, sort) and a layout toggle (grid2, grid3, list, magazine), matching the reference design in `docs/reports/cannabis-shop.jsx` while fully replacing all hardcoded values with design system tokens and removing the unimplemented shopping cart.

---

## 1. User Story

> As **Marie**, I want to **filter cannabis products by mood, category, and price and switch between grid and list layouts** so that I can **find the right wellness product quickly and discreetly without browsing an unorganised wall of items**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

> *Marie needs absolute discretion — generic CRM language, no category disclosure in notifications; and a calm, luxury browsing experience with no urgency pressure.*

Test for it: Filter and sort controls use plain labels (no strain jargon, no clinical terms). Price range slider displays in dollars (converted from cents). Layout toggle works on a 375px viewport without horizontal overflow. Zero items branded with algorithmic urgency.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px)
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Feature is navigable by a low-tech mobile user in under 3 taps

### Marie Discretion Test (run for any CRM, notification, or cannabis/fireworks feature)

- [ ] All CRM comms use "The Pawn Shop Update" — no category disclosure
- [ ] No cannabis/fireworks words in subject lines, SMS previews, or push notification copy

### Marcus Photography Test (run for any customer-facing item display)

- [ ] Primary item images meet dark luxury standard (macro, dark background, well-lit)
- [ ] No placeholder or poorly lit images in the feature's view

### Kevin Speed Test (run for any alert, notification, or new-listing flow)

- [N/A] Alert dispatches within 60 seconds of `status: 'active'`
- [N/A] CASL `alertOptIn: true` verified before every send

---

## 3. Compliance Gate

- [ ] **Age gate required?** Yes (19+) — already enforced at router level by E05. This feature adds no new routes; the gate is not affected.
- [ ] **`auditLogs` events required?** No new events. Existing `age_gate_pass` / `age_gate_fail` from E05 cover this route.
- [ ] **PII exclusion** — Confirmed. Filter state is client-only; no user identifiers enter Firestore or analytics.
- [ ] **`policeHold` respected** — `useItems('cannabis')` already filters `policeHold != true` via Firestore rules. No change required.
- [ ] **`aiDescription` draft-only** — No `aiDescription` reads in this feature. `LuxuryProductCard` uses `description` only.
- [ ] **AI API security** — N/A
- [ ] **CASL compliance** — N/A
- [ ] **Scarcity integrity** — `merchandisingTags` displayed read-only from Firestore. No algorithmic urgency. Tags are staff-set only.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read: title, description, category, status, price, images, merchandisingTags, policeHold, viewTag
Fields written: NONE

Collection: auditLogs/{id}
Fields written: NONE (age gate events already written by E05 router guard)
```

### New Fields Required

NONE. The reference design (`cannabis-shop.jsx`) includes star ratings and THC/CBD percentages — these fields do not exist in `docs/firestore-schema.md` and **must not be used**. If product intelligence data is needed in future, that is E29 scope.

### TypeScript Interfaces

```typescript
// Item — from src/lib/types.ts
// MoodCategory — from src/lib/types.ts (relax | focus | social | ceremony)
// LayoutMode — new union type: 'grid2' | 'grid3' | 'list' | 'magazine'
// FilterState — new local interface in CannabisPage.tsx
```

### Security Rules Required

None. Existing rules already enforce `status == 'active' && policeHold != true` for public reads.

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.
- Cannabis contrast hard rule must be enforced in all new components: `--color-primary` on `--color-bg` = 2.8:1 — use only at `--text-subheading` (24px+) or larger. Never for body copy, labels, or filter chips.

---

## 6. Implementation Phases

### Phase 1 — Filter Panel

- [ ] Add `FilterState` interface and `filterItems()` pure function to `CannabisPage.tsx`
  - Mood filter: maps to `category` (existing `MOOD_CATEGORY` map)
  - Category filter: distinct `category` values derived from loaded items
  - Price range: dual-handle slider from min/max of `item.price` (cents → dollars display)
  - Sort: `price-asc`, `price-desc`, `newest` (by `createdAt`), `trending` (by `trendingScore`)
- [ ] Create `src/components/cannabis/FilterPanel.tsx` — collapsible drawer, all tokens, no hardcoded values
- [ ] Create `src/components/cannabis/PriceRangeSlider.tsx` — dual-handle, `--color-primary` track, 48px thumb hit area
- [ ] Active filter chip strip — shows applied filters, one-click clear per filter

### Phase 2 — Layout Toggle

- [ ] Create `src/components/cannabis/LayoutToggle.tsx` — four modes: grid2, grid3, list, magazine; icon buttons, 48px hit area
- [ ] `LayoutMode` type in local scope (not global types — this is cannabis-specific)
- [ ] Grid2/Grid3: CSS grid, `--space-*` gap, card unchanged
- [ ] List: single-column row layout — image left (120px), title + price + tags right
- [ ] Magazine: first item spans two columns (large hero card), rest in 2-col grid

### Phase 3 — Enhanced Product Cards

- [ ] Update `LuxuryProductCard.tsx` — add `merchandisingTags` badge strip using `TagBadge` component (token colours only)
- [ ] Create `src/components/cannabis/TagBadge.tsx` — `just-arrived`, `rare-find`, `limited-edition`, `staff-pick` displayed with correct cannabis palette tokens
- [ ] Empty state per filter combination — plain language, no jargon
- [ ] Loading skeleton respects current layout mode

### Phase 4 — QA

- [ ] Run `npm run build` — zero errors
- [ ] Persona smoke tests: Marie (filter panel, layout toggle, discretion check), Makoonsii (48px targets, mobile), Marcus (card photography standard)
- [ ] Axe-core scan — zero violations on `/cannabis`
- [ ] Contrast audit: every new text element against `--color-bg` — verify cannabis rule compliance

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all applicable items passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `docs/EPICS.md` E39 tasks ticked
- [ ] `docs/DECISIONS.md` updated with any decisions made during implementation
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/E39_Cannabis_Storefront_Enhancement.md · v1.0*
