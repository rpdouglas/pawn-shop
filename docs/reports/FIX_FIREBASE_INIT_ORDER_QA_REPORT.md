# QA Report — FIX · Firebase Init Order (Site Down After E73 Static Import Conversion)
**Date:** 2026-06-10 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — `built in 5.88s`, zero warnings |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` type casts introduced | ✅ PASS — single import-line change only |
| No unused imports/variables | ✅ PASS |
| No new dependencies added | ✅ PASS |

---

## Part 2 — Root Cause Verification

| Check | Result |
|-------|--------|
| Root cause: `firebase.ts` called `getApp()` before `firebase-core.ts` ran `initializeApp()` | ✅ CONFIRMED |
| Trigger: E73 static import conversion changed ES module evaluation order | ✅ CONFIRMED |
| Fix: `import { app } from './firebase-core'` creates an explicit module graph edge | ✅ CONFIRMED |
| E73 performance gains (static imports, `manualChunks`) remain intact | ✅ CONFIRMED — no regression |
| `firebase-core.ts` unchanged — still exports `app`, `auth`, `functions` | ✅ CONFIRMED |
| `firebase.ts` still exports `db`, `storage`, `analytics`, `remoteConfig` — API unchanged | ✅ CONFIRMED |

---

## Part 3 — Persona Smoke Tests

### All Personas (P0 — Site was fully unloadable)
- [x] App loads without console errors in production build
- [x] Firebase initialisation sequence: `firebase-core.ts` → `firebase.ts` — guaranteed by module graph
- [x] `db`, `analytics`, `remoteConfig`, `storage` all available at first render
- [x] `AuthContext` continues to function — still imports from `firebase-core` directly
- [x] `ConsentBanner`, `ViewContext`, analytics calls all resolve without error

### Regression — E73 features still work
- [x] No `INEFFECTIVE_DYNAMIC_IMPORT` warnings — static imports retained
- [x] `manualChunks` vendor splitting still active — `vendor-firebase` chunk = 439 kB gzip: 132 kB
- [x] `useItems` `withConverter` pattern unchanged

---

## Part 4 — Compliance Audit

| Item | Status |
|------|--------|
| No new Firestore collections introduced | ✅ PASS |
| No Firestore rule changes | ✅ PASS |
| No PII changes | ✅ PASS |
| `auditLogs` unaffected | ✅ PASS |
| No Cloud Function changes | ✅ PASS |

---

## Part 5 — Design System Verification

- [x] No UI components modified — fix is entirely in a module import line
- [x] No hardcoded hex, px, or ms values introduced
- [x] No motion or animation changes

---

## Sign-Off

**QA PASSED.** Fix: FIX_FIREBASE_INIT_ORDER. Persona: All. Build: clean. Root cause: confirmed and resolved. E73 gains preserved. Compliance: verified. Decision 0019 logged.

Ready for TICKET_CLOSE.

---

*The Pawn Shop · docs/reports/FIX_FIREBASE_INIT_ORDER_QA_REPORT.md · 2026-06-10*
