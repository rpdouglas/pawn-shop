# QA Report — FIX · Seed Item Visibility (Admin Inventory Hidden Items)
**Date:** 2026-06-10 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — `built in 4.40s` |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` type casts introduced | ✅ PASS — single-line limit change only |
| No unused imports/variables | ✅ PASS |
| No new dependencies added | ✅ PASS |

---

## Part 2 — Root Cause Verification

| Check | Result |
|-------|--------|
| Root cause identified: `limit(50)` on admin query excludes oldest items | ✅ CONFIRMED |
| Seed script (`seed-inventory.mjs`) confirmed as origin of fake items | ✅ CONFIRMED — batch timestamp `2026-05-18T00:02:27.744Z` |
| 36 seed items identified via `find-seed-items.mjs` fingerprint query | ✅ CONFIRMED |
| All 36 matched: picsum.photos image + template description + seed title | ✅ CONFIRMED |
| 24 items not matched = previously edited by staff (legitimate) | ✅ CONFIRMED |

---

## Part 3 — Persona Smoke Tests

### Staff (Primary)
- [x] Admin inventory page now loads all items up to 500 (no hard cutoff at 50)
- [x] Seed items visible in admin grid view under their respective viewTag groups
- [x] Status filter chips (All / Active / Draft / Reserved / Sold / Recycle Bin) continue to operate correctly on the full dataset
- [x] Search field filters across all loaded items
- [x] Grid/Table toggle unaffected
- [x] Archive, Delete, Restore actions unaffected

### Dale (Trust signal — public view unaffected)
- [x] Public `useItems` and `useItemSearch` hooks unchanged — no regression to storefront queries
- [x] `limit(20)` per viewTag on public pages unchanged

---

## Part 4 — Compliance Audit

| Item | Status |
|------|--------|
| Admin route auth gate (`ProtectedRoute staffOnly`) | ✅ PASS — unchanged |
| `limit(500)` is bounded — no unbounded collection reads | ✅ PASS |
| No new Firestore fields introduced | ✅ PASS — schema unchanged |
| No Firestore rule changes required | ✅ PASS |
| `find-seed-items.mjs` is read-only — no writes to production | ✅ PASS |
| No PII in identification script output | ✅ PASS — outputs item ID, title, viewTag, status, price, timestamp only |
| Seed item list provided to staff for manual validation before deletion | ✅ PASS |

---

## Part 5 — Design System Verification

- [x] Single-line change to query limit — no UI components modified
- [x] No new hardcoded hex, px, or ms values introduced
- [x] No motion or animation changes

---

## Part 6 — Seed Item Inventory (36 Items Pending Staff Review)

| viewTag | Count | Active | Reserved | Sold |
|---------|-------|--------|----------|------|
| pawn | 9 | 0 | 7 | 2 |
| cannabis | 13 | 5 | 3 | 5 |
| fireworks | 14 | 8 | 2 | 4 |
| **Total** | **36** | **13** | **12** | **11** |

The 13 **active** items are currently visible on public storefront pages. Staff should validate the full list and move confirmed seed items to the Recycle Bin via the admin inventory view.

---

## Sign-Off

**QA PASSED.** Fix: FIX_SEED_ITEM_VISIBILITY. Persona: Staff. Build: clean. Root cause: confirmed. Compliance: verified. Seed item list: delivered. Decision 0015 logged.

Ready for TICKET_CLOSE.

---

*The Pawn Shop · docs/reports/FIX_SEED_ITEM_VISIBILITY_QA_REPORT.md · 2026-06-10*
