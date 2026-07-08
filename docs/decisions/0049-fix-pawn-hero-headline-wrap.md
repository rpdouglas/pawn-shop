# Decision 0049 — FIX: Pawn Hero Headline Line-Wrap

**Date:** 2026-07-08
**Epic:** E102 · Vertical Hero Sections (follow-up to Decision 0048)
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

Decision 0048 (same day) replaced the `PawnHero.tsx` headline with **"Clear Freight. Direct Trade."** (29 characters). That copy change surfaced a pre-existing layout defect: the `h1` sat inside a content column capped at `maxWidth: 720px` with `font-size: clamp(var(--text-heading) /*32px*/, 6vw, var(--text-hero) /*72px*/)`. Once viewport width exceeds ~1200px, `6vw` clears the 72px ceiling and the clamp locks there regardless of the 720px column — at 72px Playfair Display Bold this phrase needs roughly 1100–1200px of width, so it wrapped to two lines on every normal desktop screen. At the 375px mobile baseline, the clamp's 32px floor was still too large for the ~311px column (viewport minus `--space-8` horizontal padding on each side), so it wrapped there too.

## Decision

1. Removed the `maxWidth: 720px` cap from the `.pawn-hero-content` wrapper in `PawnHero.tsx`. The lead paragraph and CTA row already carry their own narrower `maxWidth` (540px / 380px respectively), so this only frees up width for the `h1`.
2. Replaced the font-size clamp with `clamp(1.375rem, 5vw, 3.75rem)` (22px–60px), tuned empirically against the real rendered text rather than derived from the existing `--text-heading` / `--text-hero` tokens, since those tokens' fixed values do not fit this specific phrase length at either end of the viewport range.
3. Left default text wrapping in place (no `white-space: nowrap`) as a safety net — an edge case narrower than the 375px baseline degrades to a wrap instead of clipping or causing horizontal scroll.

## Rationale

- **Empirical over formulaic sizing.** The project's `--text-*` scale is a fixed set of tokens (32px, 72px, etc.) designed for general use, not calibrated to any one headline's character count. Forcing this specific phrase to fit required a bespoke clamp; reusing the token boundaries directly would have reproduced the same wrap bug.
- **Verified across the full breakpoint range.** Confirmed one-line rendering with zero horizontal overflow at 375, 414, 768, 1024, 1280, 1440, and 1920px via a headless Chromium (Playwright) pass against the running dev server — not estimated from font-metric math alone.
- **No copy change.** Per product direction, the headline text itself was kept exactly as Decision 0048 shipped it; only the typography was adjusted.

## Compliance Notes

- **Zero hardcoded styles:** `color`, `font-family`, and `--space-*` tokens on sibling elements are untouched; only the `h1`'s own `fontSize` (a bespoke `clamp()`, not a raw px value) and the wrapper's `maxWidth` changed.
- **No Firestore fields, Cloud Functions, or auth changes.**
- **No motion changes** — the existing `.pawn-hero-content` cinematic fade-up (`§4.2`) animation is untouched.

## Files Changed

| File | Change |
|------|--------|
| `src/components/pawn/PawnHero.tsx` | Removed `maxWidth: '720px'` from content wrapper; retuned `h1` `fontSize` clamp from `clamp(var(--text-heading), 6vw, var(--text-hero))` to `clamp(1.375rem, 5vw, 3.75rem)` |

---

*The Pawn Shop · docs/decisions/0049-fix-pawn-hero-headline-wrap.md · 2026-07-08*
