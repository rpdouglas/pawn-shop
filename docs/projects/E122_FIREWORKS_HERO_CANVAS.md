# E122 — Fireworks Hero Canvas Animation
**Status:** ✅ CLOSED — 2026-06-13
**Priority:** MEDIUM
**Effort:** MEDIUM (2 files created/modified, 1 decision log)
**Cycle:** 33

---

## Problem

The Fireworks hero section (`FireworksHero.tsx`) currently shows a static dark background with text, countdown, and a YouTube video below. The design brief (reference: `docs/reports/fireworks-detonation.jsx`) calls for a live canvas fireworks animation positioned between the headline/countdown content and the video — creating a cinematic "you're watching fireworks" moment before the product video loads.

## Scope

Frontend-only. No Firestore, no Cloud Functions, no schema changes.

**Component to modify:** `src/components/fireworks/FireworksHero.tsx`
**New file to create:** `src/hooks/useFireworksCanvas.ts`

## Reference

`docs/reports/fireworks-detonation.jsx` — standalone React component with:
- Physics-based `Particle` class (gravity, drag, tail trails, glow)
- `Rocket` class (launches from bottom, trails gold sparks)
- `explode()` function (3 burst styles: radial, double-ring, chrysanthemum)
- `useFireworks` hook (rAF loop, canvas resize, launch cadence)
- Gold-dominant palette with amber accents

## Personas Served

- **Tanya** (Primary) — The Seasonal Celebrator. The fireworks hero is her primary landing experience. Cinematic, event-forward energy that builds anticipation.
- **Jordan** (Secondary) — The Lifestyle Connoisseur. Editorial quality above fold; the canvas animation must be sophisticated, not cheap.
- **Marcus** (Secondary) — Brand quality. Dark luxury standard; animation must complement, not compete with, the product photography below.

## Design System Constraint (Documented)

`docs/design-system.md §4.3` prohibits "cheap particle effects: confetti, sparkle bursts, floating emojis" and "constant micro-animations without user input."

`docs/design-system.md §6.2` requires Fireworks hero: "Ember accent (restrained — no particle effects)."

**Resolution:** A professional canvas fireworks simulation for a fireworks retail page is thematically justified. The prohibition targets cheap decorative effects, not contextually appropriate brand animations. Strategy B (interval-burst) resolves the "constant animation" concern through deliberate pacing. A design decision log entry is required.

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — Zero TypeScript errors |
| `npm run lint` | ✅ PASS — Zero ESLint errors/warnings |
| `npm run test` | ✅ PASS — 29/29 pass |
| `npx tsc -b` (functions/) | ✅ PASS — Zero errors |
| Schema sync | ✅ No Firestore fields added |
| Token compliance | ✅ Canvas hex documented as token-equivalent (decision 0039) |
| Accessibility | ✅ `aria-hidden`, `prefers-reduced-motion` |
| Design system §4.3 | ✅ Interval-burst pattern — decision 0039 |

---

*The Pawn Shop · docs/projects/E122_FIREWORKS_HERO_CANVAS.md · Cornwall Island, Akwesasne*
