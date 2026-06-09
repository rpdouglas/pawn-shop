# E103 — Fireworks Hero Video · Plan
**Epic:** E103 · **Status:** AWAITING APPROVAL · **Cycle:** 32

---

## Context Ingested

### Current State
- `FireworksHero.tsx` renders `YouTubeFacade` conditionally — only when `useHeroMedia('fireworks')` returns `mediaType: 'youtube'` with a `youtubeId`. No Firestore document has been written for this, so the video never appears.
- `YouTubeFacade` already implements stopped-by-default: it shows a static thumbnail + YouTube SVG play button. The iframe is not loaded until the user clicks. `youtube-nocookie.com` is already the embed domain. ✓
- Current video placement: inside the centered flex content div (max-width 640px) — fine on mobile, visually narrow on desktop.
- Target video: `8rmpm3ZOn50`

### Design System Breakpoints (§7)
- Tablet: `768px` · Laptop: `1024px` · All three viewports (375px, 768px, 1280px) must render correctly.

### Schema Audit
No new fields needed. `heroData.fireworks.youtubeId` is already documented in `docs/firestore-schema.md` (E102). No changes to schema or `docs/decisions/`.

---

## Persona Gate

| Persona | Test |
|---|---|
| **Tanya** (primary) | Video is immediately visible, countdown remains above it. Confirms the event and builds excitement. |
| **Jordan** (primary) | Video embed looks editorial and intentional on 1280px desktop. Not cramped or floating awkwardly. |
| **Makoonsii** | Play button ≥48px (enforced by `.youtube-facade__play` CSS min-width/min-height). Video has accessible `title` attribute. |

---

## Three Strategies

---

### Strategy A — Hardcode Video ID + Stacked Layout

**Approach:** Add `const DEFAULT_VIDEO_ID = '8rmpm3ZOn50'` directly in `FireworksHero.tsx`. Always render the video unconditionally. Move the video outside the narrow centered content column into a full-width section at the bottom of the hero. No Firestore read needed for video.

**Architecture:**
- `FireworksHero.tsx`: Add constant at top. Replace `heroMedia?.mediaType === 'youtube'` conditional with always-render logic. Restructure JSX so video sits in its own row below the content, full width of section, `max-width: 900px`, centered.
- `useHeroMedia` still called (for potential carousel background) but video ID comes from the constant.
- No Firestore configuration needed.
- No new CSS classes — layout via inline styles.

**Layout:**
```
┌─────────────────────────────────────────┐
│  THE PAWN SHOP                          │
│  FIREWORKS                              │
│  Celebrate the moment properly.         │
│  [Countdown Timer — if active]          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  YouTube Facade (16:9, ~900px)  │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```
- Desktop: max-width 900px centered, 16:9 aspect ratio
- Mobile: full width, 16:9 aspect ratio

**Files changed:** 1 (`FireworksHero.tsx`)

**Persona Lens:**
- Tanya: Video immediately visible on page load, no configuration needed. Countdown still above it.
- Jordan: Clean editorial stacked layout, video well-framed at 900px max.
- Makoonsii: No change to play button (already ≥48px).

**Compliance:** Clean. No PII, no new Firestore surface, no age gate change, no autoplay. `youtube-nocookie.com` already in use.

**Trade-offs:**
- ✅ Simplest. Video appears immediately on deploy with zero Firestore setup.
- ✅ Single file change.
- ✅ Always shows regardless of Firestore document existence.
- ❌ Video ID is hardcoded — changing it requires a code deploy.
- ❌ Bypasses the E102 `useHeroMedia` system for the video ID.

**Estimated Scope:** Small · 1 file

---

### Strategy B — Pure Firestore Config + Layout Fix

**Approach:** No video ID hardcoding. Use the existing E102 Firestore infrastructure (`useHeroMedia` → `shopInfo.heroData.fireworks`). Instructions: admin writes `{ mediaType: 'youtube', youtubeId: '8rmpm3ZOn50' }` to `config/shopInfo.heroData.fireworks` via Firebase console. Layout fix in `FireworksHero.tsx` to move video outside the narrow content div.

**Architecture:**
- `FireworksHero.tsx`: Move video section outside the centered content div, into a separate full-width row within the hero section. Same max-width 900px, centered, 16:9 aspect ratio.
- No constant added — video is still gated on `heroMedia?.mediaType === 'youtube'`.
- Admin console write required: `config/shopInfo.heroData.fireworks = { mediaType: 'youtube', youtubeId: '8rmpm3ZOn50' }`

**Files changed:** 1 (`FireworksHero.tsx`)

**Persona Lens:**
- Tanya: Video appears after admin configures Firestore. If Firestore doc is missing, no video (graceful degradation).
- Jordan: Layout improved, but dependent on admin action to see it.

**Compliance:** Clean. Fully consistent with E102 design intent.

**Trade-offs:**
- ✅ Consistent with E102 Firestore-driven architecture.
- ✅ Staff can change video without code deploy.
- ✅ Single file change.
- ❌ Video doesn't appear until `config/shopInfo` is written with the correct value.
- ❌ If `config/shopInfo` doc doesn't exist in dev/prod, video never shows.
- ❌ More friction: two-step (code deploy + Firestore write) to see the video.

**Estimated Scope:** Small · 1 file + Firebase console action

---

### Strategy C — Default Constant + Firestore Override + Responsive Layout ⭐ RECOMMENDED

**Approach:** `FireworksHero.tsx` uses `8rmpm3ZOn50` as a baked-in default. `useHeroMedia('fireworks')` is still honoured — if Firestore returns `mediaType: 'youtube'` with a different ID, that takes precedence; if Firestore returns `mediaType: 'none'`, the video is suppressed; if Firestore is unconfigured (null), the default plays. Layout restructured to a responsive design: full-width video section below the content on all viewports, max 900px on desktop.

**Architecture:**

```typescript
// In FireworksHero.tsx
const DEFAULT_VIDEO_ID = '8rmpm3ZOn50'

// Resolve video ID: Firestore > default > suppressed
const videoId: string | null = (() => {
  if (!heroMedia) return DEFAULT_VIDEO_ID          // no Firestore config → use default
  if (heroMedia.mediaType === 'none') return null  // explicit suppression
  if (heroMedia.mediaType === 'youtube' && heroMedia.youtubeId) return heroMedia.youtubeId
  return DEFAULT_VIDEO_ID                          // carousel or unknown → still show default
})()
```

**Layout (all viewports — stacked, clean):**
- Top: text copy + countdown in centered content div
- Bottom: video container `width: 100%`, `max-width: 900px`, `margin: 0 auto`, `border-radius: var(--radius-md)`, 16:9 aspect ratio
- Mobile (375px): Full width, 16:9 — looks great natively
- Desktop (1280px): 900px wide centered — editorial width, not too cramped, not edge-to-edge

```
375px (mobile):
┌───────────────┐
│ THE PAWN SHOP │
│  FIREWORKS    │
│  Celebrate... │
│  [Countdown]  │
│               │
│ ┌───────────┐ │
│ │  Video    │ │
│ │  16:9     │ │
│ └───────────┘ │
└───────────────┘

1280px (desktop):
┌─────────────────────────────────────────────────────┐
│        THE PAWN SHOP                                │
│        FIREWORKS                                    │
│        Celebrate the moment properly.               │
│        [Countdown Timer]                            │
│                                                     │
│   ┌─────────────────────────────────────────┐       │
│   │        YouTube Facade (900px max)       │       │
│   └─────────────────────────────────────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Files changed:** 1 (`FireworksHero.tsx`)

**Persona Lens:**
- Tanya: Video always visible. No setup dependency. Countdown still above. Clear seasonal excitement above the fold.
- Jordan: 900px centered video looks editorial and intentional. Not edge-to-edge, not cramped.
- Makoonsii: Accessible play button ≥48px already in place. No changes needed.

**Compliance:** Clean. `youtube-nocookie.com`, no autoplay, no PII, no age gate change.

**Trade-offs:**
- ✅ Video appears immediately on deploy, zero Firestore setup required.
- ✅ Staff can override or suppress via Firestore without code deploy (E102 system respected).
- ✅ Graceful: `mediaType: 'none'` allows staff to turn off the video if needed.
- ✅ Single file change.
- ✅ Responsive naturally (stacked layout requires no media query).
- ⚠ Default video ID in code — future video swap requires either Firestore config or code deploy.

**Estimated Scope:** Small · 1 file

---

## Recommendation

**Strategy C.** The default constant gives immediate results (video appears on deploy, no Firestore setup needed), while fully preserving the E102 Firestore override system for future changes. The stacked layout is the simplest responsive solution — 16:9 aspect ratio is inherently responsive, and 900px max-width on desktop gives editorial framing without requiring a CSS media query. Single file change, zero schema impact, zero compliance risk.

---

## Anti-Regression Checklist

| Check | Notes |
|---|---|
| No hardcoded hex values | Video container uses `var(--radius-md)`, `var(--space-*)` only |
| No hardcoded px font sizes | Not applicable (no new text) |
| No hardcoded spacing | `var(--space-*)` tokens only |
| No JS conditionals for view theming | Not applicable |
| No autoplay | `YouTubeFacade` is static until user clicks |
| No new Firestore fields | `heroData.fireworks.youtubeId` already in schema |
| Age gate remains at router level | No regression — hero renders post-gate |
| Play button ≥48px | Already enforced in `.youtube-facade__play` CSS |
| `youtube-nocookie.com` embed | Already in `YouTubeFacade` component |

---

*The Pawn Shop · docs/plans/E103_FIREWORKS_HERO_VIDEO_PLAN.md · Awaiting strategy approval*
