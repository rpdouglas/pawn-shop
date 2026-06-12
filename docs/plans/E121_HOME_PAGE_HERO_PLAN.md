# E121 Plan — Home Page Hero Redesign
**Status:** Awaiting approval
**Date:** 2026-06-12

---

## Context

**Current state:**
- `src/pages/HomePage.tsx` — wraps `PortalLayout` (logo + title + subtitle header) + 4 `PortalCard` links in a single column
- `src/components/layout/PortalLayout.tsx` — renders `.portal-hero` (logo, h1, p) + `.portal-list` nav
- `src/components/layout/PortalCard.tsx` — horizontal link card: icon | title+description | chevron
- `hero.png` available at `public/branding/hero.png`
- `logo.webp` available at `public/branding/logo.webp`
- Homepage sits at route `/` — `ViewContext.deriveView('/')` returns `'pawn'` → gold palette

**Personas served:**
- **Jordan** — brand narrative quality; hero must read as editorial, not generic SaaS
- **Sandra** — first-impression visual discovery driver; masonry/grid over lists
- **Marcus** — photography standard; `hero.png` must be used cinematically
- **Makoonsii** — 48px touch targets; plain language; no untested Kanien'kéha

**Schema audit:** No Firestore fields read or written. No schema changes required.

**Anti-regression check (all strategies):**
- No hardcoded hex — `var(--color-primary)` only
- No hardcoded px font sizes — `var(--text-*)` tokens only
- No hardcoded spacing — `var(--space-*)` tokens only
- No JS conditionals for theming
- No age gates at component level
- No motion patterns outside approved list (slow fade, cinematic reveal, smooth hover)
- No PII in any output

---

## Strategy A — Cinematic Hero Upgrade (Column Preserved)

**What changes:**
Replace the plain `.portal-hero` with a full-viewport atmospheric hero section using `hero.png` as a background. The 4 vertical cards keep their current horizontal list layout but are visually elevated with larger spacing and bolder typography.

**Architecture:**
- Modify `PortalLayout.tsx`: add `heroImage?` prop, render a `.portal-hero-cinematic` wrapper that sets `background-image` via inline style when provided
- Add `.portal-hero-cinematic` CSS to `index.css`: `min-height: 70vh`, dark overlay via `::before` pseudo-element, centered content, cinematic reveal animation
- `HomePage.tsx` passes `heroImage="/branding/hero.png"` to `PortalLayout`

**Files:**
| File | Change |
|------|--------|
| `src/components/layout/PortalLayout.tsx` | Add `heroImage?` prop + conditional wrapper |
| `src/pages/HomePage.tsx` | Pass `heroImage` prop |
| `src/index.css` | Add `.portal-hero-cinematic` + overlay CSS |

**Persona lens:**
- Jordan: improved; the hero.png is used atmospherically. Cards remain editorial but still feel like a list.
- Sandra: improved; hero draws the eye, but cards stay in column format — less scannable than a grid.
- Makoonsii: unchanged; accessible, plain language preserved.

**Compliance:** ✅ All checks pass. No motion violations. No new tokens.

**Trade-offs:**
- ✅ Lowest risk — minimal component surface changed
- ✅ Most stable — existing `PortalCard` CSS untouched
- ❌ Column card layout is not what the user asked about (they mentioned a 2×2 grid)
- ❌ Cards still feel like a nav list, not a visual grid

**Estimated Scope:** Small — 3 files, ~50 lines

---

## Strategy B — Split Hero + Responsive 2×2 Grid *(Recommended)*

**What changes:**
Extract the hero into a standalone `HomeHero.tsx` component (≥80vh atmospheric section with `hero.png`, brand statement, tagline). Replace the vertical card list with a 2-column CSS grid on desktop, collapsing to 1 column on mobile. Each vertical card is redesigned for the grid: centered layout, larger icon, view name prominent, short brand-voice description.

**Architecture:**
- New `src/components/home/HomeHero.tsx`: self-contained atmospheric hero, `hero.png` background, dark overlay, centered logo + `--text-hero` brand name + location line + 1-sentence identity statement. No state, no Firestore.
- Modify `src/pages/HomePage.tsx`: render `<HomeHero />` above a new `.home-grid` nav. Remove `PortalLayout` import (or keep for other use).
- Modify `src/components/layout/PortalCard.tsx`: add `variant?: 'list' | 'grid'` prop. Grid variant: centered icon + title + description (no chevron, more vertical padding, ≥48px targets).
- CSS additions to `index.css`: `.home-grid` (`display: grid; grid-template-columns: repeat(2, 1fr)` at ≥768px, `1fr` below), `.portal-card.grid-variant` centered styles, `.home-hero` atmospheric styles.

**Files:**
| File | Change |
|------|--------|
| `src/components/home/HomeHero.tsx` | New file — cinematic hero section |
| `src/pages/HomePage.tsx` | Replace PortalLayout with HomeHero + grid nav |
| `src/components/layout/PortalCard.tsx` | Add `variant` prop for grid display |
| `src/index.css` | `.home-hero`, `.home-grid`, grid card variant CSS |

**Persona lens:**
- Jordan: ✅ Editorial hero section with `hero.png` atmospheric usage, brand statement above the fold
- Sandra: ✅ 2×2 grid is visually scannable; immediately sees all 4 verticals at once
- Marcus: ✅ `hero.png` used cinematically with controlled dark overlay
- Makoonsii: ✅ Plain language, 48px grid card targets, semantic `<nav>` preserved

**Compliance:** ✅ All checks pass. Motion: cinematic reveal on hero (approved). Hover: smooth scale (approved).

**Trade-offs:**
- ✅ Directly matches user's stated preference ("4 verticals in a 2×2 grid")
- ✅ Clean component separation — hero is self-contained
- ✅ Responsive: 2×2 on desktop, 1 column on mobile
- ✅ `PortalCard` still reusable elsewhere with `variant="list"` (default)
- ❌ One more file to maintain vs. Strategy A
- ❌ PortalCard changes require re-testing existing usages

**Estimated Scope:** Medium — 4 files, ~120 lines

---

## Strategy C — Full-Bleed Immersive Editorial (Magazine Landing)

**What changes:**
The hero extends to 100vh and `hero.png` fills the full viewport. Brand name and tagline overlay the image. Below, each vertical gets a full-width "chapter" card: a large branded accent bar in `var(--color-primary)` (gold, since homepage is always `view-pawn`), editorial headline using `--font-display`, multi-sentence brand voice description, and a distinct destination CTA button.

**Architecture:**
- New `src/components/home/HomeHero.tsx`: full 100vh hero, `hero.png` background-cover, centered text scrim
- New `src/components/home/VerticalChapterCard.tsx`: horizontal editorial chapter layout per vertical. Gold rule accent, icon cluster, editorial headline, description paragraph, CTA link
- Modify `src/pages/HomePage.tsx`: `<HomeHero />` + 4 `<VerticalChapterCard />` entries
- CSS: `.home-hero` (100vh), `.vertical-chapter` layout, accent rule styling

**Files:**
| File | Change |
|------|--------|
| `src/components/home/HomeHero.tsx` | New — 100vh hero |
| `src/components/home/VerticalChapterCard.tsx` | New — editorial chapter card |
| `src/pages/HomePage.tsx` | New composition |
| `src/index.css` | New section CSS |

**Persona lens:**
- Jordan: ✅ Most editorially ambitious; magazine feel; strong brand narrative
- Marcus: ✅ Full-bleed photo usage is strongest of the three
- Sandra: ❌ Each vertical takes a full viewport scroll — less scannable at a glance; impulse discovery is slower
- Dale / Tanya: ❌ Deeper scroll to reach the vertical they want; higher friction for intent-driven visitors
- Makoonsii: Neutral — depends on copy clarity

**Compliance:** ✅ All checks pass. Motion: slow fade on hero (approved).

**Trade-offs:**
- ✅ Most dramatic brand statement; stands apart from generic portal pages
- ✅ Room for extended brand copy per vertical
- ❌ Each vertical requires a scroll; less efficient for returning users who know what they want
- ❌ Largest scope and most new components
- ❌ Gold accent rule is the same for all 4 chapters (homepage is always `view-pawn`; per-vertical colours would require inline style or CSS variable override — adds complexity)

**Estimated Scope:** Large — 4 files, ~200 lines

---

## Recommendation

**Strategy B.** It directly addresses the user's stated preference (2×2 grid), is the right balance of brand upgrade and usability, and keeps the component architecture clean. The hero upgrade (using `hero.png` cinematically) satisfies Jordan and Marcus; the grid layout satisfies Sandra's visual-discovery instinct; 48px touch targets on grid cards satisfy Makoonsii. Strategy A is safer but doesn't deliver the grid; Strategy C is more editorial but creates friction for intent-driven visitors.

---

*The Pawn Shop · docs/plans/E121_HOME_PAGE_HERO_PLAN.md · 2026-06-12*
