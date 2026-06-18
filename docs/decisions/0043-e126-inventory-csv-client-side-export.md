# Decision 0043 — E126 Inventory CSV Export: Client-Side via Blob API (Strategy A)

**Date:** 2026-06-18
**Epic:** E126 · Inventory CSV Export
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

Staff needed a way to export active inventory to a flat file for accounting, purchasing,
and external reporting. Three strategies were evaluated:

- **A:** Client-side export from existing `InventoryPage` state — Blob download, no server
- **B:** Cloud Function `exportInventoryCSV` — includes `internal/staff.cost`, no item limit
- **C:** Configurable export modal — field selector, hybrid A/B dispatch

---

## Decision

**Strategy A: Client-side CSV export via browser Blob API.**

---

## Rationale

1. **Data already in memory.** `InventoryPage.tsx` loads up to 500 items into React state
   via a live `onSnapshot` listener. Building a CSV from that array requires zero additional
   Firestore reads and no server round-trip.

2. **No new dependencies.** The Blob + `URL.createObjectURL()` pattern is standard DOM API,
   supported in all target browsers. No npm package required.

3. **No CF deploy.** Strategy B would require a new Cloud Function, a CF deploy step, cold
   start latency (~2–3s), and N+1 subcollection reads for `internal/staff`. The stated
   requirement ("export active inventory") does not mention cost/margin data.

4. **500-item cap is not a practical constraint.** The shop operates from a single Cornwall
   Island location. Reaching 500 simultaneous active items is well above current operational
   scale.

5. **Instant, offline-capable.** Once the page has loaded, the export works even without
   an active network connection. Staff on the shop floor benefit from this reliability.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy B (Cloud Function) | Adds CF deploy + cold start; cost data not in scope; over-engineered for stated requirement |
| Strategy C (configurable modal) | Overkill; hybrid dispatch logic; adds a new component with no incremental user value vs. A |

---

## Compliance Notes

- `policeHold: true` items are **excluded** from the export — they remain invisible.
- `publishedBy` is a UID string, not a display name — not PII in the analytics/log sense.
- No `auditLog` entry added — read-only export of data already accessible in the admin session.
- No AI API keys involved.
- No new Firestore fields, collections, or security rule changes.
- CSV format is RFC 4180-compliant (double-quote escaping, CRLF line endings).

---

## CSV Format

- Prices converted from CAD cents to CAD dollars (÷ 100, 2 decimal places).
- Arrays (`merchandisingTags`) joined with `|` delimiter.
- Timestamps formatted as `YYYY-MM-DD` (ISO 8601 date).
- Filename: `inventory-active-YYYY-MM-DD.csv` (stamped at download time).
- 22 columns — see `docs/plans/E126_INVENTORY_CSV_EXPORT_PLAN.md` for full column spec.

---

## Files Changed

- `src/pages/admin/InventoryPage.tsx` — `csvCell()` helper, `exportActiveToCsv()` function,
  "↓ Export CSV" button in toolbar

---

*The Pawn Shop · docs/decisions/0043-e126-inventory-csv-client-side-export.md · 2026-06-18*
