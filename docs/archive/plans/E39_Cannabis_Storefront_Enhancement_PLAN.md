# E39 — Cannabis Storefront Enhancement: Implementation Plan

**Spec:** `docs/projects/E39_Cannabis_Storefront_Enhancement.md`
**Reference design:** `docs/reports/cannabis-shop.jsx`
**Planned:** 2026-05-21

---

## Phase 1 — Persona & Compliance Gate

**Primary persona:** Marie — The Wellness Seeker. Needs a calm, private, luxury browsing experience. Zero urgency signals. Filter controls that use plain mood language, not strain jargon or clinical terms.

**Secondary personas:**
- Jordan — layout modes must meet dark luxury aesthetic at all breakpoints
- Marcus — photography must not be cropped or distorted in list/magazine card variants

**Tests that apply:**
- Marie Discretion Test — no cannabis words in any notification path; filter labels use plain language only
- Marcus Photography Test — all card variants frame primary image correctly
- Makoonsii Trust Test — 48px touch targets, 375px viewport navigable, plain language

**Compliance:**
- Age gate: 19+ enforced at router level by E05. Not modified.
- `auditLogs`: no new events
- PII: filter state is client-only; no user data in Firestore or analytics
- `policeHold`: enforced upstream by `useItems()` Firestore query
- Scarcity: `merchandisingTags` read-only, staff-set only

---

## Phase 2 — Schema Audit

```
Collections impacted:
- items/{id}
  Fields read: title, description, category, status, price, images,
               merchandisingTags, trendingScore, createdAt, policeHold, viewTag
  Fields written: NONE

- auditLogs/{id}: NONE

New fields required: NONE
```

**Excluded from scope:** The reference design (`cannabis-shop.jsx`) shows star ratings and THC/CBD percentages. Neither field exists in `docs/firestore-schema.md`. These must not be implemented here — if product intelligence data is needed, that is E29 scope.

---

## Phase 3 — Three-Strategy Proposal

---

### Strategy A — Filter Panel Only (Minimal)

**Summary:** Add the filter panel and sort controls to the existing page without changing the grid layout or product card structure.

**Architecture:**
- All logic lives in `CannabisPage.tsx` — no new page file
- `FilterPanel.tsx` — collapsible, client-side only
- `PriceRangeSlider.tsx` — dual-handle, derived from min/max of loaded `items`
- Mood filter reuses existing `selectedMood` state; adds category + price + sort
- No Firestore changes; all filtering/sorting done against `items[]` array in memory
- Zero Cloud Functions

**Persona Lens:**
- Marie: filter panel reduces browsing friction immediately; mood filter already exists so the pattern is familiar
- No harm to secondary personas — product cards unchanged

**Compliance:**
- All existing gates remain intact
- Filter labels: Relax / Focus / Social / Ceremony (plain language, no strain names)

**Trade-offs:**
- Gains: fast delivery, low risk, existing card components untouched
- Sacrifices: layout stays as fixed auto-fill grid; Marie can't choose density; magazine layout not available

**Estimated scope:** Small — 3 new files, 1 modified (`CannabisPage.tsx`)

---

### Strategy B — Filter Panel + Layout Toggle (Recommended)

**Summary:** Add the full filter panel and a four-mode layout toggle (grid2, grid3, list, magazine), replacing only the product grid section of `CannabisPage.tsx` while leaving the hero, mood cards, and editorial sections intact.

**Architecture:**
- `FilterPanel.tsx` — collapsible filter drawer with mood, category, price range, sort
- `PriceRangeSlider.tsx` — dual-handle, token-based, 48px thumb hit area
- `LayoutToggle.tsx` — icon button group (grid2/grid3/list/magazine), 48px targets
- `LayoutMode` type — local union `'grid2' | 'grid3' | 'list' | 'magazine'`
- `TagBadge.tsx` — displays `merchandisingTags` with cannabis palette tokens
- `LuxuryProductCard.tsx` modified — add `layoutMode` prop to switch between card/row/magazine variants
- `CannabisPage.tsx` — replaces product grid section; filter + sort + layout state all local
- All filtering/sorting in memory against loaded `items[]` array
- No Firestore changes; no Cloud Functions

**Persona Lens:**
- Marie: filter panel + layout choice gives her full control over density and browsing pace, which matches her deliberate, private shopping style
- Jordan: magazine layout (first item spans two columns) gives the editorial luxury feel; grid3 satisfies dense discovery
- Marcus: list variant must keep full image — no cropping; constrained to `aspect-ratio: 1/1` square thumbnail left side

**Compliance:**
- All existing gates intact
- `TagBadge` reads `merchandisingTags` — staff-set only, no algorithmic application verified in spec

**Trade-offs:**
- Gains: full reference design parity (minus cart); significantly better browsing UX for Marie
- Sacrifices: more components to maintain; `LuxuryProductCard` gains a prop surface

**Estimated scope:** Medium — 5 new files, 2 modified (`CannabisPage.tsx`, `LuxuryProductCard.tsx`)

---

### Strategy C — New Cannabis Shop Page (Robust)

**Summary:** Extract the entire product browsing section into a dedicated `CannabisShopPage.tsx` at `/cannabis/shop`, with the main `CannabisPage.tsx` becoming a pure editorial landing page that CTAs into it.

**Architecture:**
- New route `/cannabis/shop` — age-gated at router level (inherits `/cannabis/*` guard)
- `CannabisShopPage.tsx` — self-contained product browsing page
- All Strategy B components plus a dedicated page-level layout
- `CannabisPage.tsx` reduced to hero + mood cards + editorial CTA to `/cannabis/shop`
- React Router v7 `lazy()` for `CannabisShopPage`

**Persona Lens:**
- Marie: cleaner URL separation between editorial and transactional content; `/cannabis/shop` is a distinct browsing space
- Jordan: `CannabisPage.tsx` becomes a pure brand/editorial page, which meets the luxury standard better than a combined page

**Compliance:**
- Age gate must cover `/cannabis/shop` — must verify the existing guard applies to `/cannabis/*` not just `/cannabis`
- Compliance risk: if the guard only matches exact `/cannabis`, the shop route could be unprotected

**Trade-offs:**
- Gains: clean separation of concerns; editorial and transactional pages both purpose-built
- Sacrifices: two pages to maintain; route guard must be verified; more navigation for Marie (extra tap to reach products); larger scope

**Estimated scope:** Large — 6 new files, 3 modified (`CannabisPage.tsx`, `LuxuryProductCard.tsx`, router config)

---

### Recommendation

**Strategy B** is recommended.

Strategy A leaves the layout fixed, which misses half the user's request. Strategy C introduces a new route that requires careful age-gate verification and adds a navigation tap for Marie (who already passes through the age gate on `/cannabis` — adding another step works against her). Strategy B delivers full filter + layout toggle parity with the reference design, keeps everything within the existing page structure, and introduces no compliance risk. The component count is manageable and `LuxuryProductCard` already needs a layout-aware update.

---

## Phase 4 — Anti-Regression Protocol

**1. Hardcoded Hex Trap**
The reference design (`cannabis-shop.jsx`) uses a hardcoded palette object `const C = { bg0: "#1e1630", purple: "#8a62c2", ... }`. Every colour in the implementation must use CSS custom properties: `var(--color-primary)`, `var(--color-bg)`, `var(--color-surface)`, `var(--color-border)`, `var(--color-text)`, `var(--color-text-muted)`. No exceptions.

**2. Firestore Field Invention Trap**
All fields read are verified against `docs/firestore-schema.md`. Star ratings and THC/CBD data from the reference design are explicitly excluded — those fields do not exist.

**3. Client-Side AI Key Trap**
N/A — no AI calls in this feature.

**4. Scarcity Manufacture Trap**
`TagBadge` reads `merchandisingTags` from Firestore — staff-set only. No component applies tags algorithmically.

**5. PII Log Trap**
Filter state (mood, category, price range) is client-only. Nothing enters analytics or `auditLogs`.

**6. Age Gate Bypass Trap**
No new routes. Existing `/cannabis` route guard (E05) unchanged. Strategy B is safe.

**7. Motion Trap**
The reference design uses `transition: all 0.15s` — this must become `transition: all var(--motion-speed-fast)`. Filter panel open/close must use the approved "smooth hover" or "slow fade" pattern only. No slide-in-from-sides, bounce, or particle effects.

**8. Typography Scale Trap**
The reference design hardcodes `font-size: 14px`, `18px`, `12px` throughout. All sizes must become `--text-small`, `--text-body`, `--text-xs` etc. Display font (`var(--font-display)` = Cormorant Garamond) for product names/headings; body font (`var(--font-body)` = DM Sans) for labels, filter chips, prices.
Cannabis contrast rule: `--color-primary` on `--color-bg` = 2.8:1 — never use for body copy or labels. Filter chip active state must use a compliant colour (e.g., `--color-text` on `--color-surface`, or `--color-primary` at `--text-subheading` size only).

**9. Brand Voice Trap**
Filter labels: "Relax", "Focus", "Social", "Ceremony" — no strain names, no clinical terms, no medical claims. Sort label: "Newest arrivals" not "Just dropped". Price range label: "Price range" not "Budget filter".

---

*The Pawn Shop · docs/plans/E39_Cannabis_Storefront_Enhancement_PLAN.md · v1.0*
