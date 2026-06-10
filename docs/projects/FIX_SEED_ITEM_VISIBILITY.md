# FIX · Seed Item Visibility — Admin Inventory Hidden Items

**Status:** ✅ CLOSED — 2026-06-10
**Type:** Hotfix
**Cycle:** 32
**Personas served:** Staff (inventory_staff / manager / admin)

---

## Problem

Fake seed items added by `scripts/seed-inventory.mjs` (batch-written 2026-05-18) were not appearing in the admin inventory view (`/admin/inventory`) but were visible on the public storefront pages (`/pawn`, `/cannabis`, `/fireworks`).

---

## Root Cause

The admin `InventoryPage` Firestore query used `orderBy('createdAt', 'desc'), limit(50)`. The seed items, written in a single batch, hold the oldest `createdAt` timestamps in the database. As real items were added after that date, the seed items fell past position 50 and were excluded from the admin query.

Public pages (`useItems`, `useItemSearch`) query per `viewTag` with independent `limit(20)` buckets. Each vertical had fewer than 20 real items at the time, so the seed items appeared within the per-viewTag result window even though they were outside the global top-50.

---

## Fix Applied

Changed `limit(50)` to `limit(500)` in `src/pages/admin/InventoryPage.tsx:142`.

Decision logged at `docs/decisions/0015-admin-inventory-query-limit.md`.

---

## Seed Item Identification

Created `scripts/find-seed-items.mjs` — a read-only Node script that queries Firestore for items matching all three seed fingerprints:

1. Image URL contains `picsum.photos`
2. Description matches `"A premium [X] from our [Y] collection. Professionally inspected and verified."`
3. Title is in the predefined `SEED_TITLES` list from the seed script

**Result:** 36 items identified (of 60 seeded — 24 were partially edited by staff and are considered legitimate). All 36 share `createdAt = 2026-05-18T00:02:27.744Z`.

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (tsc + Vite) | ✅ PASS |
| `npm run lint` (ESLint) | ✅ PASS — zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 |
| No new Firestore fields | ✅ PASS — schema unchanged |
| No new dependencies | ✅ PASS |
| Admin route still auth-gated | ✅ PASS — `ProtectedRoute staffOnly` unchanged |

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/InventoryPage.tsx` | `limit(50)` → `limit(500)` |
| `scripts/find-seed-items.mjs` | New — read-only identification script |
| `docs/decisions/0015-admin-inventory-query-limit.md` | New |

---

*The Pawn Shop · docs/projects/FIX_SEED_ITEM_VISIBILITY.md · 2026-06-10*
