# E73 — Architecture Modernization & Optimization

**Status:** ✅ CLOSED — 2026-06-10 (Quick Wins / Strategy A)
**Priority:** MEDIUM-HIGH
**Effort:** 2–4 developer-days (depending on strategy)
**Cycle:** 32
**Epic:** Phase 19 — Architecture Modernization & DX

---

## Problem

Three concrete DX / performance issues confirmed via `npm run build`:

### 1. Ineffective Dynamic Imports (3 warnings)
`ConsentBanner.tsx`, `ViewContext.tsx`, and `analytics.ts` use `import(...)` to lazy-load `firebase.ts`,
`firebase/firestore`, and `firebase/analytics` — but dozens of other files already import these
statically, so the dynamic import has no effect. Rolldown cannot split them into a separate chunk.
These show as `[INEFFECTIVE_DYNAMIC_IMPORT]` build warnings.

### 2. Main Bundle ≥ 1 MB (chunk size warning)
`index-BRBCqxH4.js` = **1,019.62 kB** (gzip: 308 KB). No `manualChunks` configuration exists.
Firebase SDK, React DOM, and TanStack Query are all colocated in one enormous entry bundle,
blocking first paint on mobile (Jordan PWA standard: Lighthouse ≥ 90 performance, deferred to E37 SSR
but preventable progress now).

### 3. No Firestore `withConverter` on `useItems.ts`
`docToItem()` casts every field via `as Type` — TypeScript cannot catch field name drift at compile
time. A `withConverter` moves the cast into a typed, tested converter that Firestore validates on
every read.

### 4. IntakeForm.tsx render thrashing (medium-term)
`IntakeForm.tsx` is 817 lines with:
- 3 concurrent `onSnapshot` listeners (`items/{id}`, `internal/ai`, initial fetch)
- 20+ `useState` fields updated individually (one state update per field → re-render per keystroke)
- Domain sub-components already exist (`CannabisFields`, `FireworksFields`) but core form state
  still lives entirely in the parent

---

## Personas Served

| Persona | How |
|---|---|
| **Jordan (primary)** | Bundle split improves mobile FCP; `withConverter` lifts TypeScript quality bar |
| **Staff (secondary)** | Sub-component decomposition or `react-hook-form` cuts IntakeForm re-renders |
| **Makoonsii (indirect)** | Smaller initial bundle helps low-bandwidth mobile load times |

---

## Scope

This spec covers only the tasks listed in EPICS.md Phase 19 E73. Long-term items
(TanStack Query onSnapshot migration, Zod schema validation) are deferred and tracked separately.

---

## Files in Scope

| File | Issue |
|---|---|
| `src/components/ConsentBanner.tsx` | Ineffective dynamic imports |
| `src/context/ViewContext.tsx` | Ineffective dynamic imports |
| `src/lib/analytics.ts` | Ineffective dynamic import |
| `vite.config.ts` | No manualChunks |
| `src/hooks/useItems.ts` | No withConverter |
| `src/components/admin/IntakeForm.tsx` | Render thrashing (medium-term) |

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — zero warnings, zero errors; main bundle 1,019 kB → 43.69 kB |
| `npm run lint` | ✅ PASS — zero violations |
| `npm run test` | ✅ PASS — 29/29 |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| No hardcoded hex/px values | ✅ PASS |
| No new Firestore fields (schema guard) | ✅ Confirmed — no schema changes |

---

*The Pawn Shop · docs/projects/E73_ARCHITECTURE_MODERNIZATION.md · 2026-06-10*
