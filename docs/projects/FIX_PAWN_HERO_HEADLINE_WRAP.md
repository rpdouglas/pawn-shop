# FIX — Pawn Hero Headline Wraps to Two Lines
**Status:** ✅ CLOSED — 2026-07-08
**Priority:** MEDIUM
**Effort:** Small (1 file, ~2 lines)
**Cycle:** 33

---

## Problem

The `PawnHero.tsx` headline "Clear Freight. Direct Trade." (shipped in Decision 0048) wraps to two lines on desktop, and also wraps on mobile at the project's 375px baseline. A hero headline that wraps unevenly reads as unpolished and undercuts the "I could find something here" first impression the section exists to create (Sandra, Jordan).

## Root Cause

The `h1` sat inside a content wrapper capped at `maxWidth: 720px`, with `font-size: clamp(var(--text-heading) /*32px*/, 6vw, var(--text-hero) /*72px*/)`.

- **Desktop:** past ~1200px viewport width, `6vw` exceeds the 72px ceiling and the clamp locks there regardless of the 720px column. At 72px Playfair Display Bold, the 29-character phrase needs roughly 1100–1200px — well over the 720px column — so it wrapped on every normal desktop screen.
- **Mobile:** at the 375px baseline, the clamp bottoms out at its 32px floor, but the available column (viewport minus `--space-8` horizontal section padding on each side, ≈311px) only fits ~19–20px type for this phrase, so it wrapped there too.

The project's `--text-heading` / `--text-hero` tokens are general-purpose scale values — they were never calibrated to this specific headline's character count, so reusing them directly reproduces the wrap.

## Solution

1. Removed `maxWidth: 720px` from the `.pawn-hero-content` wrapper. The lead paragraph (`maxWidth: 540px`) and CTA row (`maxWidth: 380px`) already carry their own narrower widths, so this only frees up room for the `h1`.
2. Replaced the `h1` font-size clamp with `clamp(1.375rem, 5vw, 3.75rem)` (22px–60px), tuned empirically against the actual rendered text via a headless Chromium pass rather than derived from the fixed token scale.
3. Left default wrapping behavior in place (no `white-space: nowrap`) so an extreme edge case (browser zoom, a sub-375px device) degrades to a wrap instead of clipping or causing horizontal scroll.

Decision 0049 logged.

## Files Changed

| File | Change |
|------|--------|
| `src/components/pawn/PawnHero.tsx` | Removed `maxWidth: '720px'` from `.pawn-hero-content`; retuned `h1` `fontSize` from `clamp(var(--text-heading), 6vw, var(--text-hero))` to `clamp(1.375rem, 5vw, 3.75rem)` |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (tsc -b + vite build) | ✅ PASS — zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero ESLint errors/warnings |
| `npm run test` | ✅ PASS — 29/29 tests |
| `npx tsc -b` (functions/) | N/A — functions not touched by this fix |
| Single-line render, no horizontal overflow, at 375/414/768/1024/1280/1440/1920px | ✅ PASS — verified via headless Chromium (Playwright) against the running dev server |
| Decision 0049 logged | ✅ |

---

*The Pawn Shop · docs/projects/FIX_PAWN_HERO_HEADLINE_WRAP.md · Cornwall Island, Akwesasne*
