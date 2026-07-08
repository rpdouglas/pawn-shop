# FIX — Pawn Hero Dead Space Above Text and Below CTA Buttons
**Status:** ✅ CLOSED — 2026-07-08
**Priority:** MEDIUM
**Effort:** Small (1 file, 1 line)
**Cycle:** 33

---

## Problem

On `/pawn`, large empty gaps appeared above the "Cornwall Island · Akwesasne" eyebrow text and below the "Browse Liquidations" / "Pawn or Sell" CTA buttons, immediately before the Brother POS "Liquidation Items" embed. Confirmed via user-supplied mobile screenshot.

## Root Cause

`PawnHero.tsx`'s outer `<section>` carried `minHeight: '80vh'` with `justifyContent: 'center'` — a layout designed under E102 for a hero that centers text above an optional image carousel or video (`useHeroMedia`), which fills out the remaining height. Since E127 replaced the Firestore-driven discovery grid with the Brother POS embed, and no `heroData.pawn` is currently configured in Firestore, `useHeroMedia` resolves to `null` and the media block never renders. With no media to fill the box, flexbox centers the short text-only content inside the artificial 80vh floor, producing large symmetric empty gaps above and below it.

## Solution

Removed `minHeight: '80vh'` from the section style. The hero now sizes to its actual content — padding plus text plus buttons — instead of a fixed viewport-height floor. `justifyContent: 'center'` was left in place; it's a no-op once box height equals content height, and keeps things centered if hero media is configured later. No other files needed changes — the ~48px section padding and ~32px page-wrapper spacing before the next section are intentional and were left untouched.

Decision 0050 logged.

## Files Changed

| File | Change |
|------|--------|
| `src/components/pawn/PawnHero.tsx` | Removed `minHeight: '80vh'` from the outer `<section>` style |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (tsc -b + vite build) | ✅ PASS — zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero ESLint errors/warnings |
| `npm run test` | ✅ PASS — 29/29 tests |
| `npx tsc -b` (functions/) | N/A — functions not touched by this fix |
| Gap above eyebrow / below CTA buttons matches intentional padding only, at 412px and 1440px | ✅ PASS — verified via headless Chromium (Playwright) against the running dev server |
| Decision 0050 logged | ✅ |

---

*The Pawn Shop · docs/projects/FIX_PAWN_HERO_DEAD_SPACE.md · Cornwall Island, Akwesasne*
