# Decision 0038 — E121 Home Page Hero: Standalone HomeHero + CSS Grid Layout

**Date:** 2026-06-12
**Epic:** E121 · Home Page Hero Redesign
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

The homepage (`/`) used a single `PortalLayout` component that rendered both the header section (logo + title + subtitle) and the four vertical navigation cards in a flex column. The hero had no atmospheric character — plain text on a dark background, no use of the available `hero.png` branding asset. The card layout was a vertical list, not the 2×2 grid the user requested.

Three strategies were evaluated:

- **A:** Cinematic Hero Upgrade — enhance `PortalLayout`'s hero section in place; keep vertical card list
- **B:** Split Hero + 2×2 Grid — extract hero into `HomeHero.tsx`; CSS grid for cards *(chosen)*
- **C:** Full-Bleed Immersive Editorial — 100vh hero with per-vertical "chapter" cards

---

## Decision

**Strategy B: Standalone `HomeHero.tsx` + responsive CSS grid layout.**

---

## Rationale

1. **Component separation.** `PortalLayout` is also used by `TobaccoPage.tsx`. Extracting the cinematic hero into a dedicated `HomeHero.tsx` avoids coupling a page-specific visual treatment to a shared layout component.

2. **Grid over list.** A `display: grid` with `repeat(2, 1fr)` at ≥768px surfaces all four verticals in a single visual scan. The previous flex-column list required reading four rows sequentially — more cognitive load for Sandra's impulse-discovery browsing pattern.

3. **`hero.png` used cinematically.** The `hero.png` branding asset was unused. `HomeHero.tsx` renders it as a `background-image: cover` with a `rgba(0,0,0)` gradient overlay and a `heroReveal` cinematic entrance animation (`translateY(20px)→0 + opacity 0→1`) — an approved motion pattern.

4. **`PortalCard` extended via `variant` prop.** Adding `variant?: 'list' | 'grid'` with `'list'` as the default keeps `TobaccoPage.tsx` unchanged. The grid variant centers icon + title + description and removes the horizontal chevron — appropriate for a card that fills its grid cell.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy A (enhanced PortalLayout) | Doesn't deliver the 2×2 grid; column layout is less visually scannable |
| Strategy C (magazine editorial) | Each vertical requires a full viewport scroll — adds friction for intent-driven visitors (Dale, Tanya) who already know their destination |

---

## Compliance Notes

- No Firestore reads or writes. No new schema fields.
- No age gates at component level — `HomeHero` is purely presentational.
- All typography uses `var(--text-*)` tokens. All spacing uses `var(--space-*)` tokens. No hardcoded hex.
- `heroReveal` animation suppressed by the global `prefers-reduced-motion: reduce` rule already in `index.css`.
- Hero logo `width: 220px` — an image-sizing constraint, not a spacing token usage. Consistent with existing `portal-logo-wrap: width: 340px` precedent.

---

## Files Introduced / Modified

| File | Change |
|------|--------|
| `src/components/home/HomeHero.tsx` | New — cinematic hero section |
| `src/pages/HomePage.tsx` | Replaced PortalLayout + column cards with HomeHero + grid nav |
| `src/components/layout/PortalCard.tsx` | Added `variant?: 'list' \| 'grid'` prop |
| `src/index.css` | Added `.home-hero`, `.home-grid`, `.portal-card--grid` CSS sections |

---

*The Pawn Shop · docs/decisions/0038-e121-home-hero-split-component.md · 2026-06-12*
