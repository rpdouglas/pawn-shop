# E126 — Inventory CSV Export
**Status:** ✅ CLOSED — 2026-06-18
**Priority:** MEDIUM
**Effort:** 0.25 developer-days (actual)
**Cycle:** 33

---

## Problem

Staff had no way to extract a flat-file snapshot of active inventory for use in
accounting, purchasing, or external reporting tools. All inventory data lived in
Firestore, with no export path outside the Firebase console.

## Solution Delivered

"↓ Export CSV" button added to the `InventoryPage.tsx` toolbar (right of the Group By
control). One click downloads a RFC 4180-compliant CSV of all `status === 'active'`,
`policeHold !== true` items. No server round-trip — built from the page's existing
in-memory snapshot.

**22 CSV columns:**
`id`, `title`, `description`, `category`, `view_tag`, `status`, `condition`,
`price_cad`, `original_price_cad`, `quantity`, `serial_number`, `police_hold`,
`ebay_listing_id`, `merchandising_tags`, `provenance_notes`, `trending_score`,
`view_count`, `enquiry_count`, `markdown_enabled`, `published_by`,
`created_at`, `updated_at`

**Transformations:**
- Prices divided by 100 and formatted to 2 decimal places (CAD dollars)
- Arrays joined with `|` delimiter
- Timestamps formatted as `YYYY-MM-DD`
- String cells with commas, newlines, or quotes properly double-quote wrapped (RFC 4180)

**Filename:** `inventory-active-YYYY-MM-DD.csv` (stamped at download time)

**Button state:** Disabled (with tooltip) when `totalActive === 0`.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/InventoryPage.tsx` | Added `csvCell()` helper, `exportActiveToCsv()` function, "↓ Export CSV" button in toolbar |

## Docs Updated

| Doc | Change |
|-----|--------|
| `docs/EPICS.md` | All tasks ticked; E126 CLOSED entry added |
| `docs/ACTIVE_CYCLE.md` | E126 row in Completed table; footer timestamp updated |
| `docs/decisions/0043-e126-inventory-csv-client-side-export.md` | Decision log created |
| `docs/plans/E126_INVENTORY_CSV_EXPORT_PLAN.md` | Plan file |
| `docs/reports/E126_QA_REPORT.md` | QA sign-off |
| `user-guide/admin/inventory.md` | Export CSV button documented in Toolbar section |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — zero TypeScript errors, built in 5.03s |
| `npm run lint` | ✅ PASS — zero ESLint errors and zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests pass (8 test files) |
| `npx tsc -b` (functions/) | ✅ PASS — zero errors |
| Hardcoded hex audit | ✅ PASS — none introduced |
| PII in logs/analytics audit | ✅ PASS — none |
| `policeHold` exclusion | ✅ PASS — filter confirmed: `!i.policeHold` |
| No new Firestore fields | ✅ PASS — reads only existing schema fields |
| No new dependencies | ✅ PASS — Blob + DOM API only |

---

*The Pawn Shop · docs/projects/E126_INVENTORY_CSV_EXPORT.md · 2026-06-18*
