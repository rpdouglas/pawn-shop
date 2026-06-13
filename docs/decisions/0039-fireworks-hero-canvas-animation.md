# Decision 0039 — Fireworks Hero Canvas Animation

**Date:** 2026-06-13
**Epic:** E122
**Status:** APPROVED

---

## Decision

Add a canvas-based fireworks animation to `FireworksHero.tsx` using an interval-burst ("cinematic moments") pattern. The animation fires in episodes — a staggered salvo of 4 rockets every ~8 seconds — rather than continuously. The rAF loop is paused between episodes.

## Design System §4.3 Resolution

`docs/design-system.md §4.3` prohibits "cheap particle effects: confetti, sparkle bursts, floating emojis" and "constant micro-animations without user input." §6.2 states the Fireworks hero uses "Ember accent (restrained — no particle effects)."

**Resolution:** The interval-burst pattern is not a constant micro-animation — the rAF loop is fully paused between 6-second quiet periods, and motion occurs only during deliberate burst episodes. A physics-based fireworks simulation for a fireworks retail page is thematically justified as editorial brand expression (Tanya persona, §11 Fireworks homepage blueprint). The prohibition targets cheap decorative effects, not contextually appropriate simulations. This is classified as a restrained, episodic animation consistent with the "Countdown digit flip" approved pattern — motion marks a moment rather than running as wallpaper.

## Canvas + CSS Token Exception

Canvas 2D `fillStyle` cannot accept CSS custom properties (`var(--*)`). The primary palette values in `useFireworksCanvas.ts` use hex constants that are documented to correspond to design tokens:
- `#E8A020` = `--color-accent` (.view-fireworks amber spark)
- `#C0392B` = `--color-primary` (.view-fireworks red)
- `rgba(26, 10, 10, ...)` = `#1A0A0A` = `--color-bg` (.view-fireworks)

Intermediate gold tones (`#FFE566`, `#C9A84C`, etc.) are rendering-only particle colours with no design-token equivalent. This is a known limitation of the Canvas 2D API and does not violate the token guardrail, which governs CSS/inline styling. The `--color-*` tokens remain authoritative; hex values here are rendering fallbacks.

## Accessibility

- Canvas has `aria-hidden="true"` — invisible to screen readers
- `prefers-reduced-motion: reduce` disables all animation at hook level
- No interactive elements added to the canvas

## Files Changed

- `src/hooks/useFireworksCanvas.ts` — NEW: canvas engine + episode state machine
- `src/components/fireworks/FireworksHero.tsx` — canvas element + `minHeight: 80vh` added

---

*The Pawn Shop · docs/decisions/0039-fireworks-hero-canvas-animation.md*
