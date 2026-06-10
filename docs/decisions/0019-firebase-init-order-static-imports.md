# Decision 0019 — Firebase Init Order: Explicit Module Dependency

**Date:** 2026-06-10
**Epic:** FIX · Firebase Init Order — Site Down After E73 Static Import Conversion
**Status:** Closed

## Problem

After E73 converted dynamic `import(...)` calls to static top-level imports in `analytics.ts`,
`ConsentBanner.tsx`, and `ViewContext.tsx`, the site failed to load entirely with:

```
FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created — call initializeApp() first (app/no-app).
```

## Root Cause

Two Firebase initialisation files coexist:

- `src/lib/firebase-core.ts` — calls `initializeApp()`, exports `app`, `auth`, `functions`
- `src/lib/firebase.ts` — calls `getApp()` at module evaluation time, exports `db`, `storage`, `analytics`, `remoteConfig`

`firebase.ts` depended on `firebase-core.ts` having run first, but expressed that dependency only
via a code comment, not via the ES module graph. With dynamic imports, this was safe: the modules
loaded lazily after `AuthContext` (which statically imports `firebase-core`) had already
initialised the app. With static imports, the bundler evaluated `App.tsx` → `ViewContext.tsx` →
`firebase.ts` before `AuthContext.tsx` → `firebase-core.ts`, so `getApp()` threw.

## Decision

Replace the implicit ordering assumption with an explicit module graph edge.

**Before:**
```ts
import { getApp } from 'firebase/app'
const app = getApp()  // fails if firebase-core hasn't run yet
```

**After:**
```ts
import { app } from './firebase-core'  // module graph guarantees firebase-core runs first
```

This is the canonical ES module pattern: if module B depends on module A having initialised a
shared singleton, B must import from A — not rely on ambient state set by A.

## Alternatives Rejected

| Alternative | Reason rejected |
|---|---|
| Add `import './lib/firebase-core'` side-effect import to `main.tsx` | Fixes the symptom but doesn't encode the dependency at the source; breaks again if `firebase.ts` is used in a context that doesn't go through `main.tsx` |
| Merge both files into one | Over-broad blast radius; `firebase-core` is intentionally slim so `AuthContext` can import only `auth`/`functions` without pulling in Firestore/Storage/Analytics |
| Revert E73 static-import conversion | Throws away the performance gains and re-introduces `INEFFECTIVE_DYNAMIC_IMPORT` warnings |

## Gate Results

| Gate | Result |
|---|---|
| `npm run build` | ✅ PASS — zero warnings, zero errors |
| `npm run lint` | ✅ PASS — zero violations |
| `npm run test` | ✅ PASS — 29/29 |
