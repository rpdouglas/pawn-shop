# FIX · Firebase Init Order — Site Down After E73 Static Import Conversion

**Status:** ✅ CLOSED — 2026-06-10
**Type:** Hotfix (P0)
**Cycle:** 32
**Personas served:** All (site was entirely unloadable)

---

## Problem

The site failed to load at all after the E73 Architecture Modernization Quick Wins commit
(`f47cf0f`). Every page returned a blank screen with this console error:

```
vendor-firebase-CQvaXcbQ.js:1 Uncaught FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created - call initializeApp() first (app/no-app).
    at an (vendor-firebase-CQvaXcbQ.js:1:23719)
    at firebase-DgEaF6tF.js:1:92
```

---

## Root Cause

`src/lib/firebase.ts` calls `getApp()` at module evaluation time. This works only if
`src/lib/firebase-core.ts` (which calls `initializeApp()`) has already executed.

Before E73, the dependency was safe: `analytics.ts`, `ConsentBanner.tsx`, and `ViewContext.tsx`
loaded `firebase.ts` via dynamic `import(...)`, which deferred execution until after
`AuthContext.tsx` had statically loaded `firebase-core.ts` and initialised the app.

E73 converted those dynamic imports to static top-level imports to eliminate
`INEFFECTIVE_DYNAMIC_IMPORT` build warnings. This changed the ES module evaluation order:

1. `main.tsx` line 21 imports `App.tsx`
2. `App.tsx` imports `ViewContext.tsx` → statically imports `firebase.ts` → `getApp()` fires
3. `main.tsx` line 24 imports `AuthContext.tsx` → imports `firebase-core.ts` → `initializeApp()` fires ← **too late**

The dependency was expressed only in a code comment, not in the module graph.

---

## Fix Applied

Replaced `import { getApp } from 'firebase/app'` + `const app = getApp()` with
`import { app } from './firebase-core'` in `src/lib/firebase.ts`.

This makes the dependency explicit in the ES module graph. The bundler now guarantees
`firebase-core.ts` evaluates before `firebase.ts` in all contexts, regardless of consumer
import order.

Decision logged at `docs/decisions/0019-firebase-init-order-static-imports.md`.

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (tsc + Vite) | ✅ PASS — `built in 5.88s`, zero warnings |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 |
| No new Firestore fields | ✅ PASS — schema unchanged |
| No new dependencies | ✅ PASS |
| No Firestore rules changes | ✅ PASS |

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/firebase.ts` | Replaced `getApp()` with `import { app } from './firebase-core'` |
| `docs/decisions/0019-firebase-init-order-static-imports.md` | New |

---

*The Pawn Shop · docs/projects/FIX_FIREBASE_INIT_ORDER.md · 2026-06-10*
