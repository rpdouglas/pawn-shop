# E102 — Vertical Hero Sections · Plan
**Epic:** E102 · **Status:** AWAITING APPROVAL · **Cycle:** TBD

---

## Context Ingested

### Current State — What Exists

| Component | File | Height | Media | Gap vs. Design Spec |
|---|---|---|---|---|
| `PawnHero` | `src/components/pawn/PawnHero.tsx` | 50vh min | None | Design spec: ≥80vh + shimmer headline + "Find of the Day" |
| `CinematicHero` | `src/components/cannabis/CinematicHero.tsx` | 20vh min | Optional bg image at 35% opacity | Design spec: 100vh, full-bleed, slow-fade 600ms |
| Fireworks inline | `FireworksPage.tsx` (inline) | 30vh min | None | Design spec: full-screen, countdown + event nav |
| Tobacco | `TobaccoPage.tsx` + `PortalLayout` | No hero | None | No design spec. `.view-tobacco` tokens DO NOT EXIST. |

### Design System Hero Spec (§6.2 — already approved)

| View | Height | Key Elements | Motion |
|---|---|---|---|
| Pawn | ≥80vh | Shimmer headline (Playfair Display) · "Find of the Day" · Dual CTAs: Browse Inventory / Pawn or Sell | Staggered text reveal · Subtle shimmer on gold · 400ms |
| Cannabis | 100vh | Single CTA · Cormorant Garamond title · Mood tagline · No hard sell | Slow fade 600ms · Ambient overlay glow pulse |
| Fireworks | Full-screen | Countdown timer · Bebas Neue time display · Event nav below fold | Countdown digit flip · Ember accent (no particle effects) |

### Critical Finding: Tobacco Tokens Missing

`.view-tobacco` CSS class has zero token definitions in the codebase. `TobaccoPage.tsx` sets `className="view-tobacco"` but there are no `--color-primary`, `--color-bg`, `--font-display`, etc. for this view. All three strategies defer tobacco to Phase 2.

---

## Persona Gate

**Primary:** Sandra (discovery), Jordan (editorial quality)
**Secondary:** Marcus (photography standard), Tanya (fireworks seasonal narrative), Marie (cannabis discretion), Makoonsii (accessibility)

**Applicable persona tests this epic must pass:**
1. **Sandra**: Hero creates the "I could find something here" impulse within 10 seconds of page load
2. **Jordan**: Would Jordan screenshot and share the hero? Editorial quality visible above fold on each view.
3. **Marcus Photography Test**: All hero images must be dark luxury standard before shipping. No supplier images.
4. **Marie Discretion Test**: Cannabis hero copy uses boutique wellness language. No hard sell.
5. **Makoonsii**: CTAs ≥48px, all media has alt text, carousel has accessible keyboard/pause controls

---

## Schema Audit

### Current `config/shopInfo` fields (full list):

```
foundedYear     number
ownerName       string
phoneNumber     string
updatedBy       string
updatedAt       timestamp
```

### New fields required (Strategy C only):

**`config/shopInfo.heroData`** — map keyed by viewTag

| Field | Type | Notes |
|---|---|---|
| `heroData` | map | Keys: `pawn`, `cannabis`, `fireworks`. Each value: `HeroMedia` map |
| `heroData.{view}.mediaType` | string | `'youtube'` \| `'carousel'` \| `'none'` |
| `heroData.{view}.youtubeId` | string | YouTube video ID (not full URL). Used with youtube-nocookie.com |
| `heroData.{view}.carouselImages` | array\<map\> | Each: `{ url: string, alt: string }` — Firebase Storage WebP URLs |

**Strategies A and B use different schema approaches — see below.**

---

## Three Strategies

---

### Strategy A — Upgraded Static Heroes

**Approach:** Revamp all three vertical hero components to design-spec height with hardcoded media. Image carousel + YouTube embed options are wired to static constants in the component file. No Firestore reads. No new schema fields.

**Architecture:**
- `PawnHero.tsx` — revamp to ≥80vh, add image carousel (slow-fade, 6s interval) using an array of hardcoded Firebase Storage URLs. YouTube option: hardcoded `PAWN_HERO_VIDEO_ID` constant.
- `CinematicHero.tsx` — revamp to 100vh, full-bleed, add carousel/YouTube facade.
- `FireworksPage.tsx` — extract inline section into `FireworksHero.tsx`, revamp to full-screen, carousel support.
- `TobaccoHero.tsx` — deferred to Phase 2.
- No new Firestore reads — critical above-fold path stays fast (no LCP impact from data fetching).
- Media update requires code deploy.

**Files changed (~7):**
- `src/components/pawn/PawnHero.tsx`
- `src/components/cannabis/CinematicHero.tsx`
- `src/components/fireworks/FireworksHero.tsx` (new)
- `src/pages/PawnPage.tsx` (if needed)
- `src/pages/CannabisPage.tsx` (if needed)
- `src/pages/FireworksPage.tsx`
- `src/components/ui/ImageCarousel.tsx` (new shared component)

**Persona Lens:**
- Sandra: Rich visual hero loads instantly — no Firestore latency on above-fold content.
- Jordan: Editorial quality fully controlled by dev; no content drift from staff edits.
- Marcus: Hero images hardcoded ensures quality gate is enforced at deploy time.
- Marie: Cannabis copy fully controlled; no risk of accidental non-compliant staff edit.

**Compliance:** Clean. No new Firestore surface area. No schema changes.

**Trade-offs:**
- ✅ Fastest to ship (no schema work). Best LCP. No Firestore dependency in hero.
- ✅ Quality gate enforced at code review — Marcus Photography Test enforced before deploy.
- ❌ Content updates require code deploy. Staff cannot update hero media autonomously.
- ❌ YouTube ID and carousel images require PR to change.
- ❌ "Hero is content" mismatch — editorial content hardcoded in code.

**Estimated Scope:** Medium · ~7 files

---

### Strategy B — Firestore Hero CMS

**Approach:** A new `heroContent/{viewTag}` Firestore collection stores fully configurable hero data per view. Staff can update heading, subheading, media type, YouTube ID, and carousel images from an Admin UI without code deploy.

**Architecture:**
- New Firestore collection: `heroContent/{viewTag}` (one document per view: `pawn`, `cannabis`, `fireworks`)
- Schema fields: `{ heading, subheading, ctaLabel, ctaPath, mediaType: 'carousel'|'youtube'|'none', carouselImages: [{url, alt}], youtubeId, isPublished, updatedAt, updatedBy }`
- `useHeroContent(viewTag)` React hook — public read (no auth required)
- Falls back to hardcoded defaults if document absent or `isPublished: false`
- New admin page `/admin/hero-editor` (or tab within existing admin) for staff to manage hero content
- Image upload flow: staff uploads carousel images via admin, paths written to `carouselImages[]`
- Firestore rules: public read, staff write only

**Files changed (~14):**
- `docs/firestore-schema.md` (update first — blocking gate)
- `docs/decisions/NNNN-hero-cms.md`
- `firestore.rules`
- `src/lib/types.ts`
- `src/hooks/useHeroContent.ts` (new)
- `src/components/pawn/PawnHero.tsx` (CMS-driven)
- `src/components/cannabis/CinematicHero.tsx` (CMS-driven)
- `src/components/fireworks/FireworksHero.tsx` (new, CMS-driven)
- `src/components/ui/ImageCarousel.tsx` (new)
- `src/components/ui/YouTubeFacade.tsx` (new)
- `src/pages/PawnPage.tsx`
- `src/pages/CannabisPage.tsx`
- `src/pages/FireworksPage.tsx`
- `src/pages/admin/HeroEditorPage.tsx` (new) OR extend existing admin page

**Persona Lens:**
- Sandra: Staff can react to seasonal trends immediately — update hero for holidays without code deploy.
- Jordan: Full editorial control for staff means brand narrative stays current.
- Marcus: Photography Test discipline must be enforced procedurally (staff can upload any image) — CMS doesn't enforce quality.
- Marie: Staff can accidentally introduce non-compliant copy — requires editorial discipline.

**Compliance:** New Firestore read on public page — no PII, public read-only. Cannabis copy risk: staff edits require Marie Discretion Test review. No automated enforcement.

**Trade-offs:**
- ✅ Full staff control. Update content without code deploy.
- ✅ Best long-term flexibility (seasonal campaigns, rotating hero content).
- ❌ Largest scope. New collection, admin UI, hook, and Firestore rules.
- ❌ Firestore read on above-fold path → potential LCP impact (needs careful loading strategy: static skeleton + async inject).
- ❌ Marcus Photography Test and Marie Discretion Test enforcement becomes process-dependent, not code-enforced.
- ❌ More compliance surface area (public-readable collection).

**Estimated Scope:** Large · ~14 files

---

### Strategy C — Hybrid: Static Structure + Config-Driven Media ⭐ RECOMMENDED

**Approach:** Hero layout, copy, and CTA are static React (zero Firestore latency above fold, code-enforced compliance). Only the media layer (YouTube ID or carousel image array) is staff-configurable via the existing `config/shopInfo` document — no new collection. Falls back gracefully to text-only hero if no media configured.

**Architecture:**
- Static React components for hero structure, heading, subheading, and CTAs per view (no data fetch blocking LCP)
- `config/shopInfo` document gains a `heroData` field: `Record<'pawn'|'cannabis'|'fireworks', HeroMedia>`
- `HeroMedia` = `{ mediaType: 'youtube'|'carousel'|'none', youtubeId?: string, carouselImages?: {url: string, alt: string}[] }`
- `useHeroMedia(viewTag)` hook — reads `config/shopInfo` (already fetched elsewhere in the app for `phoneNumber`)
- `ImageCarousel.tsx` — shared, reusable. Slow-fade transition (approved motion pattern), 6-second auto-advance, pause on hover/focus, keyboard navigable
- `YouTubeFacade.tsx` — shared. Shows static thumbnail + play button (no iframe loaded until click), uses `youtube-nocookie.com` for privacy, fully lazy
- Carousel images staff-uploadable via Firebase Storage; URLs written to `shopInfo.heroData` via Firebase console or a minimal "Hero Media" tab in store admin
- Schema update to `config/shopInfo` required before implementation (blocking gate)
- Tobacco Phase 2: deferred until `.view-tobacco` CSS tokens are defined

**Component tree:**
```
PawnPage
  └── PawnHero (static copy + CTAs)
        └── useHeroMedia('pawn') → optional
              ├── ImageCarousel (if mediaType === 'carousel')
              └── YouTubeFacade (if mediaType === 'youtube')

CannabisPage
  └── CinematicHero (revamped — static copy/CTA)
        └── useHeroMedia('cannabis') → optional media

FireworksPage
  └── FireworksHero (new extracted component)
        └── CountdownTimer (retained — Tanya persona)
        └── useHeroMedia('fireworks') → optional media
```

**Files changed (~10):**
- `docs/firestore-schema.md` — add `heroData` to `config/shopInfo` **(blocking gate — update first)**
- `docs/decisions/NNNN-hero-media-config.md`
- `src/lib/types.ts` — add `HeroMedia` interface, extend `ShopInfo`
- `src/hooks/useHeroMedia.ts` (new)
- `src/components/ui/ImageCarousel.tsx` (new shared component)
- `src/components/ui/YouTubeFacade.tsx` (new shared component)
- `src/components/pawn/PawnHero.tsx` — revamp to ≥80vh spec, wire media
- `src/components/cannabis/CinematicHero.tsx` — revamp to 100vh spec, wire media
- `src/components/fireworks/FireworksHero.tsx` (new extracted component)
- `src/pages/FireworksPage.tsx` — use `FireworksHero` instead of inline section

**Persona Lens:**
- Sandra: Hero loads instantly (static copy above fold). Media injects async below — no LCP penalty.
- Jordan: Copy + CTAs stay code-controlled (quality gate at PR). Media configurable by staff.
- Marcus: Photography Test enforceable at code review (default images). Staff can update carousel without losing quality gate if review process is in place.
- Marie: Cannabis heading/CTA/tone is code-controlled — no risk of accidental non-compliant staff edit to critical copy. Only media URLs are staff-editable.
- Makoonsii: Carousel has pause-on-hover/focus, keyboard controls, alt text required field enforced in HeroMedia type.
- Tanya: CountdownTimer component retained and prominent in FireworksHero.

**Compliance:**
- No new collection — no new Firestore rules surface area.
- `config/shopInfo` already public-read. Adding `heroData` extends existing public doc.
- YouTube: `youtube-nocookie.com` domain, no autoplay (user-initiated only) — no third-party cookie consent risk.
- Cannabis copy: heading/subheading/CTA are static → code-enforced Marie Discretion Test compliance. Only carousel image `alt` text is staff-configurable — minimal risk.
- Motion: ImageCarousel uses slow-fade (approved). YouTubeFacade is static until clicked — no constant animation.

**Trade-offs:**
- ✅ Best LCP: static copy above fold, async media inject.
- ✅ Quality-controlled: critical copy (heading, CTA, compliance language) is code-controlled.
- ✅ Staff-configurable media: YouTube IDs and carousel images updatable without code deploy.
- ✅ Graceful degradation: each vertical hero works perfectly with zero media configured.
- ✅ Minimum new schema surface (extends existing `config/shopInfo`).
- ⚠ Staff edits media via Firebase console (or we extend existing admin UI — scoped separately).
- ❌ Tobacco deferred.
- ❌ Carousel image upload UX requires Firebase Storage + console access for staff.

**Estimated Scope:** Medium · ~10 files

---

## Recommendation

**Strategy C.** It delivers a richer hero experience for all three primary verticals while protecting LCP, maintaining code-enforced compliance for critical cannabis copy, and giving staff the ability to update media without code deploys. The schema change is minimal and targeted. Tobacco deferred is correct — shipping a hero without `.view-tobacco` tokens would produce broken styling.

---

## Anti-Regression Checklist (All Strategies)

| Check | Status |
|---|---|
| No hardcoded hex values in any new component | Must use `var(--color-*)` |
| No hardcoded px/rem for font sizes | Must use `--text-*` tokens |
| No hardcoded spacing values | Must use `--space-*` tokens |
| No JS conditionals for view theming | CSS `.view-*` class drives all token cascades |
| No AI API keys on client | Not applicable to this epic |
| No `rare-find`/`limited-edition` auto-apply | Not applicable to this epic |
| No PII in hero content | Enforced by not reading any user data in hero |
| Age gates remain at router level | Hero renders post-gate; no regression |
| No bounce/particle/constant micro-animations | Slow-fade only; auto-advance pauses on focus |
| `auditLogs` write pattern | Not applicable to this epic |

---

## Phase 2 (Post-Approval, After Tobacco Tokens Defined)

Once `.view-tobacco` CSS tokens are defined (separate prerequisite task):
- `TobaccoHero.tsx` component
- Wire `heroData.tobacco` in `config/shopInfo`
- Integrate into `TobaccoPage.tsx`

---

*The Pawn Shop · docs/plans/E102_VERTICAL_HERO_SECTIONS_PLAN.md · Awaiting strategy approval*
