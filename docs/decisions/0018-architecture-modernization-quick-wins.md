# Decision 0018 — E73 Architecture Modernization Quick Wins

**Date:** 2026-06-10
**Epic:** E73 — Architecture Modernization & Optimization (Phase 19)
**Status:** Closed

## Decision

Execute Strategy A (Quick Wins only) for E73. Defer Strategy C (`react-hook-form` migration) to backlog.

## Changes Made

### 1. Static Import Conversion (INEFFECTIVE_DYNAMIC_IMPORT)

`ConsentBanner.tsx`, `ViewContext.tsx`, and `analytics.ts` used dynamic `import(...)` calls on
`firebase.ts`, `firebase/firestore`, and `firebase/analytics` with the intent of splitting them
into async chunks. Because the majority of the application imports these statically, Rolldown
cannot move them — the dynamic calls generated 3 `INEFFECTIVE_DYNAMIC_IMPORT` build warnings
with no actual benefit.

**Fix:** Converted all dynamic imports to top-level static imports. Identical runtime behaviour;
warnings eliminated.

### 2. `manualChunks` in `vite.config.ts`

No chunk-splitting configuration existed. The entire vendor graph (Firebase SDK, React DOM,
TanStack Query) was bundled into a single `index.js` = **1,019.62 kB** (gzip: 308 kB),
exceeding Vite's 500 kB warning threshold.

**Fix:** Added `manualChunks` function splitting into three stable vendor chunks:
- `vendor-react` (React, React DOM, React Router) = 399.30 kB gzip: 124.65 kB
- `vendor-firebase` (all firebase/* packages) = 439.02 kB gzip: 132.67 kB
- `vendor-tanstack` (react-query, react-table) = 82.38 kB gzip: 22.29 kB

**Result:** Main `index.js` = **43.69 kB** (gzip: 11.65 kB) — 96% reduction.
Vendor chunks are content-addressable and cached indefinitely by the browser/CDN.

### 3. Firestore `withConverter` on `useItems.ts`

`docToItem()` cast every Firestore field via `as Type`. Added an `itemConverter` wrapping
`docToItem` as the `fromFirestore` function. `useItems` now queries via
`collection(db, 'items').withConverter(itemConverter)` and maps `snap.docs.map(d => d.data())`
instead of `snap.docs.map(docToItem)`. The exported `docToItem` function is unchanged and
continues to be used by 8 other call sites.

Updated `useItems.test.tsx` mock: `collection` now returns `{ withConverter: vi.fn().mockReturnThis() }`.

## Deferred — Strategy C

`react-hook-form` migration of `IntakeForm.tsx` was planned (Strategy C) but deferred to
backlog. Rationale: IntakeForm render thrash is not a P0; the form functions correctly today.
The migration requires rewiring 3 concurrent `onSnapshot` listeners, 6+ `Controller` wrappers,
and updating 7 unit tests — high-risk for a cycle without dedicated QA time. Tracked in
`docs/plans/E73_ARCHITECTURE_MODERNIZATION_PLAN.md` Strategy C section.

## Gate Results

| Gate | Result |
|---|---|
| `npm run build` | ✅ PASS — zero warnings, zero errors |
| `npm run lint` | ✅ PASS — zero violations |
| `npm run test` | ✅ PASS — 29/29 |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
