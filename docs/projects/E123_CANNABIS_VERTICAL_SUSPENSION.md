# E123 — Cannabis Vertical Suspension (Legal Hold)
**Status:** ✅ CLOSED — 2026-06-13
**Priority:** P0 — Legal requirement
**Effort:** Small (3–4 files)
**Cycle:** 33

---

## Problem

Legal counsel has placed the Cannabis vertical on hold pending regulatory review. The `/cannabis` route, the Cannabis card on the homepage, and the Cannabis link in the navigation drawer must be removed from public access immediately. The suspension must be reversible — re-enabling the vertical should require a one-line change, not a full feature rebuild.

## Personas

**Primary:** Jordan (brand quality — the homepage and nav must remain coherent with Cannabis removed), Marie (Compliance — the vertical must not be reachable until legal clearance)
**Secondary:** Makoonsii (accessibility — nav and homepage must remain usable with one fewer card), Staff (operational clarity — removal must be complete and consistent)

## Scope

- No Firestore reads or writes beyond existing patterns
- No new schema fields
- No Cloud Functions changes
- No AI API calls
- Affects: `src/main.tsx`, `src/pages/HomePage.tsx`, `src/components/ui/NavigationDrawer.tsx`
- All Cannabis source files (`CannabisPage.tsx`, `MoodCollectionPage.tsx`, `CinematicHero.tsx`, etc.) are preserved untouched

## Gate Results

| Gate | Result |
|---|---|
| `npm run build` | ✅ PASS — zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero ESLint errors, zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests |
| `npx tsc -b` (functions/) | ✅ PASS — zero errors |
| Schema sync | ✅ No new fields — no changes to `firestore-schema.md` |
| Firestore rules | ✅ No new collections or query patterns |
| Compliance | ✅ All items verified — see QA report |

## Solution Plan

See `docs/plans/E123_CANNABIS_VERTICAL_SUSPENSION_PLAN.md`
