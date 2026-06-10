# FIX_PRINT_TICKET_BUGS QA Report

**Date:** 2026-06-10
**Fix:** Print Ticket — Invalid Date & Missing Signature Image
**Status:** QA PASSED

---

## Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` | ✅ PASS | 0 TypeScript errors, 0 warnings |
| `npm run lint` | ✅ PASS | 0 ESLint errors, 0 warnings |
| `npm run test` | ✅ PASS | 29/29 tests |

---

## Bug Verification

### Bug 1 — Invalid Date

| Check | Result |
|-------|--------|
| `result.dueDate` present (post-E110 CF): uses `new Date(result.dueDate)` | ✅ |
| `result.dueDate` absent (pre-E110 CF): falls back to `new Date(Date.now() + days * 24 * 60 * 60 * 1000)` | ✅ |
| No `Invalid Date` string reachable on printed ticket | ✅ |

### Bug 2 — Missing Signature Image

| Check | Result |
|-------|--------|
| `window.print()` no longer called before image loads | ✅ — moved to `img.onload` |
| Signature URL preloaded into browser cache before print dialog | ✅ |
| `img.onerror` fallback ensures print fires even on network failure | ✅ |
| No new dependencies introduced | ✅ — native `window.Image()` only |

---

## Code Quality

| Check | Result |
|-------|--------|
| Blast radius | ✅ Minimal — 2 files, 2 lines changed |
| No refactoring beyond fix scope | ✅ |
| No new dependencies | ✅ |
| No `any` types | ✅ |

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/IssueLoanModal.tsx` | Defensive fallback for absent `result.dueDate` |
| `src/components/admin/PrintableTicket.tsx` | Image preload before `window.print()` |
| `docs/decisions/0026-...` | Decision logged |

---

**QA PASSED.** FIX_PRINT_TICKET_BUGS ready to ship.

*The Pawn Shop · docs/reports/FIX_PRINT_TICKET_BUGS_QA_REPORT.md · 2026-06-10*
