# E103 — Fireworks Hero Video
**Status:** ✅ CLOSED — 2026-06-09
**Priority:** HIGH
**Effort:** Small — 1-2 files
**Cycle:** 32

---

## Problem

The Fireworks hero (built in E102) conditionally renders `YouTubeFacade` only when Firestore `config/shopInfo.heroData.fireworks` is configured with `mediaType: 'youtube'`. No Firestore document has been written yet, so the video never appears. The specific video to feature is `8rmpm3ZOn50`. Additionally, the current layout places the video inside the narrow centered text column, which is suboptimal on desktop — the video is constrained to 640px and sits awkwardly below the countdown.

## Solution

Wire video ID `8rmpm3ZOn50` into the Fireworks hero with a responsive layout that looks polished on both desktop (wide) and mobile (stacked).

## Personas Served

| Persona | Relevance |
|---|---|
| **Tanya** (primary) | Seasonal visual engagement — video should be prominently placed, countdown must remain visible |
| **Jordan** (primary) | Editorial quality — the video embed should look intentional and well-framed |
| **Makoonsii** | Play button ≥48px touch target, video has accessible title attribute |

## Compliance Gates

- [ ] `youtube-nocookie.com` embed domain (no autoplay until user clicks — already `YouTubeFacade` behavior)
- [ ] No autoplay — user-initiated play only
- [ ] Play button ≥48px touch target (already enforced in `YouTubeFacade` CSS)
- [ ] No hardcoded hex, px font sizes, or spacing values
- [ ] Age gate remains at router level — no regression

## Schema Audit

No new schema fields. `heroData.fireworks.youtubeId` is already documented in `docs/firestore-schema.md` (added in E102).

## Gate Results

| Gate | Result |
|---|---|
| `npm run build` (TypeScript + Vite) | ✅ Zero errors |
| `npm run lint` (ESLint) | ✅ Zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ 29/29 passed |
| `npx tsc -b` (functions) | ✅ Zero errors |
| No hardcoded hex / px / spacing | ✅ Verified — `var(--radius-md)`, `var(--space-*)` only |
| No autoplay | ✅ `YouTubeFacade` static until user click |
| Play button ≥48px | ✅ `.youtube-facade__play` enforces `min-width: 68px; min-height: 48px` |
| `youtube-nocookie.com` embed | ✅ Enforced in `YouTubeFacade` |
| Age gate not regressed | ✅ Hero renders post-gate — no component-level gate introduced |
| Firestore override preserved | ✅ `useHeroMedia` resolution order: explicit none → explicit youtube ID → default |

## Out of Scope

- Changing any other hero (pawn, cannabis)
- Admin UI for video management
- Auto-play or background video behavior
