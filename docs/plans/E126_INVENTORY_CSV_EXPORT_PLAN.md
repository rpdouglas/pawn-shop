# E126 — Inventory CSV Export · Plan

**Feature:** Export all active inventory items to a CSV file  
**Epic:** E126  
**Cycle:** 33  
**Personas:** Staff (primary), Dale (secondary), Marcus (secondary)

---

## Context

The `InventoryPage.tsx` already loads up to 500 items into browser state via a live
Firestore `onSnapshot` listener. No new data fetching is required for a client-side export.
Active items are `status === 'active'` — already computed as `totalActive` in the component.
The `policeHold: true` guard must be respected in the export.

**Firestore fields read (all exist in `docs/firestore-schema.md`):**
`id`, `title`, `description`, `category`, `viewTag`, `status`, `condition`, `price`,
`originalPrice`, `quantity`, `serialNumber`, `policeHold`, `ebayListingId`,
`merchandisingTags`, `provenanceNotes`, `trendingScore`, `viewCount`, `enquiryCount`,
`publishedBy`, `markdownEnabled`, `createdAt`, `updatedAt`

**No new Firestore fields. No schema changes.**

---

## Strategy A — Client-Side Export from InventoryPage State (Recommended)

### Architecture

- Add `exportActiveToCsv()` helper inside `InventoryPage.tsx`.
- Filters loaded `items` array: `status === 'active'` **and** `policeHold !== true`.
- Builds a RFC 4180-compliant CSV string (double-quote escaping for fields containing commas,
  newlines, or double-quotes).
- Converts prices from CAD cents to CAD dollars (÷ 100, 2 decimal places).
- Joins array fields (`merchandisingTags`, `viewTags`) with `|`.
- Formats timestamps as `YYYY-MM-DD` strings.
- Triggers download via `Blob` + `URL.createObjectURL()` — no server round trip.
- Filename: `inventory-active-YYYY-MM-DD.csv`.
- "Export CSV" button added to the existing toolbar row in `InventoryPage.tsx`,
  right of the Group By control. Disabled + tooltip when `totalActive === 0`.

### Persona Lens

- **Staff:** One click, instant download, works offline after page load.
- **Dale:** Price columns in CAD dollars, not cents — ready for Excel/Sheets.
- **Marcus:** `provenanceNotes` and `merchandisingTags` columns included.

### Compliance

- No AI API keys involved.
- No PII: `publishedBy` is a UID (not a display name) — acceptable.
- `policeHold: true` items are **excluded** — they remain invisible in the export.
- No `auditLog` entry required (read-only export of already-authorized data in the admin session).
- No new Firestore fields. No age gate interaction.
- No hardcoded hex values or spacing — button styled with existing GMC tokens.

### Trade-offs

| Benefit | Cost |
|---------|------|
| Zero new files — ~70 lines added to one file | Limited to 500-item query cap in `InventoryPage` |
| Instant download, no server latency | Does NOT include `cost` from `internal/staff` subcollection |
| No CF deploy required | Export always reflects current page load, not a point-in-time snapshot |
| Zero dependencies | |

### Estimated Scope

**Small** — 1 file modified (`InventoryPage.tsx`), ~70 lines.

---

## Strategy B — Cloud Function `exportInventoryCSV` with Cost Data

### Architecture

- New callable CF `exportInventoryCSV` in `functions/operations/src/export.ts`.
- CF queries all `active` items server-side (Admin SDK, no 500-item limit).
- For each item, reads `items/{id}/internal/staff` for `cost` field (staff-only).
- Returns CSV string as CF response data.
- Client triggers download from the returned string.
- New auditLog eventType `inventory_csv_exported` — requires `docs/firestore-schema.md` update.
- Admin UI: "Export CSV" button in `InventoryPage.tsx` calls the CF.

### Persona Lens

- **Staff:** Includes cost/margin data — useful for P&L and purchasing decisions.
- **Dale / Marcus:** Same as Strategy A.

### Compliance

- CF enforces `isStaff()` check before any data is returned.
- `cost` field access is server-side only (Admin SDK bypasses public rules correctly).
- `inventory_csv_exported` auditLog with no PII — requires schema doc update first.
- No AI API keys involved.

### Trade-offs

| Benefit | Cost |
|---------|------|
| Includes `cost` from `internal/staff` | Requires new CF + CF deploy |
| No 500-item limit | Cold start latency (~2–3s) |
| Server-side snapshot (point-in-time) | Schema doc update (`auditLogs.eventType`) required |
| | N+1 subcollection reads unless batched |

### Estimated Scope

**Medium** — 1 new CF file, 1 schema doc update, 1 UI change (3 files).

---

## Strategy C — Configurable Export Modal

### Architecture

- New `ExportModal.tsx` with multi-select field checkboxes and optional status filter.
- Internally delegates to Strategy A (client-side) or Strategy B (CF) based on whether
  `cost` is selected.
- Persists last-used field selection to localStorage.

### Persona Lens

- **Staff (advanced):** Staff can tailor exports to specific reporting needs
  (e.g., cost-only, or tags-only for merchandising).

### Compliance

- Same as Strategy A/B depending on execution path.

### Trade-offs

| Benefit | Cost |
|---------|------|
| Maximum flexibility | Overkill for stated requirement |
| Reusable for future export needs | 1 new component + hybrid logic |
| | Highest complexity |

### Estimated Scope

**Large** — 1 new component, 1 CF, 1 schema update, 1 UI change (4+ files).

---

## Anti-Regression Check

All three strategies:
- No hardcoded hex values — button uses `var(--gmc-gold)` / existing GMC token classes.
- No new Firestore fields (Strategy A); new `eventType` string only (Strategies B/C).
- No AI API keys on the client.
- `rare-find` / `limited-edition` not auto-applied.
- No PII in logs, analytics, or console output.
- Age gates unaffected — export is admin-only, no public route interaction.
- No unapproved motion patterns.

---

## Recommendation

**Strategy A.** The data is already loaded in the page. The feature is simple. Staff on
Cornwall Island likely have far fewer than 500 active items, so the query cap is not a
practical constraint. Cost data (Strategy B) can be added later if a specific accounting
integration requires it.

---

## CSV Column Spec (Strategy A)

| Column | Source field | Transformation |
|--------|-------------|----------------|
| `id` | document ID | None |
| `title` | `title` | None |
| `description` | `description` | Quote-escaped |
| `category` | `category` | None |
| `view_tag` | `viewTag` | None |
| `status` | `status` | None |
| `condition` | `condition` | None |
| `price_cad` | `price` | ÷ 100, 2 dp |
| `original_price_cad` | `originalPrice` | ÷ 100, 2 dp (blank if absent) |
| `quantity` | `quantity` | None |
| `serial_number` | `serialNumber` | None |
| `police_hold` | `policeHold` | `true`/`false`/blank |
| `ebay_listing_id` | `ebayListingId` | None |
| `merchandising_tags` | `merchandisingTags` | Join with `\|` |
| `provenance_notes` | `provenanceNotes` | Quote-escaped |
| `trending_score` | `trendingScore` | None |
| `view_count` | `viewCount` | None |
| `enquiry_count` | `enquiryCount` | None |
| `markdown_enabled` | `markdownEnabled` | `true`/`false`/blank |
| `published_by` | `publishedBy` | UID string |
| `created_at` | `createdAt` | ISO date string |
| `updated_at` | `updatedAt` | ISO date string |

---

*The Pawn Shop · docs/plans/E126_INVENTORY_CSV_EXPORT_PLAN.md · 2026-06-18*
