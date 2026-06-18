# QA Report — E126 · Inventory CSV Export

**Date:** 2026-06-18
**Cycle:** 33
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. 474 modules transformed. Built in 5.03s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass (8 test files). |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |

---

## Schema Audit

E126 reads only pre-existing fields from `items/{id}`:
`id`, `title`, `description`, `category`, `viewTag`, `status`, `condition`, `price`,
`originalPrice`, `quantity`, `serialNumber`, `policeHold`, `ebayListingId`,
`merchandisingTags`, `provenanceNotes`, `trendingScore`, `viewCount`, `enquiryCount`,
`markdownEnabled`, `publishedBy`, `createdAt`, `updatedAt`.

No new fields written or read. No subcollections accessed.

**Schema sync: complete — no changes to `docs/firestore-schema.md` required.**

---

## Token Compliance Audit

| Category | Rule | Result |
|----------|------|--------|
| Colours | No hardcoded hex in new/modified code | ✅ Button uses `var(--color-primary)` and `var(--color-text-muted)` |
| Spacing | No hardcoded px spacing values | ✅ All padding uses `var(--space-*)` |
| Font sizes | No hardcoded px font sizes | ✅ `var(--text-xs)` used for button label |
| `any` types | None introduced | ✅ `csvCell` takes `string | null`; `exportActiveToCsv` takes `Item[]` |
| `console.log` | None introduced | ✅ |
| Unused imports | None | ✅ All imports consumed |
| Motion | No unapproved motion patterns | ✅ No animation added |

---

## PII Compliance Audit

| Data | Appears where? | Result |
|------|----------------|--------|
| `publishedBy` | CSV column — contains a Firebase UID, not a display name | ✅ UID is not PII in the audit-log sense; it is an opaque identifier, not a name or email |
| Email / phone | Not in any CSV column | ✅ |
| Customer names | Not in any CSV column | ✅ |
| `staffNotes` | Not in any CSV column | ✅ Intentionally excluded |

**PII verdict: PASS.** The export contains only catalog metadata — pricing, condition, tags, and provenance notes. No customer-facing PII fields are included.

---

## Security Compliance Audit

| Requirement | Status |
|-------------|--------|
| Export is staff-only | ✅ `InventoryPage` is wrapped in `<ProtectedRoute staffOnly>` — unauthenticated and customer sessions cannot access the page or trigger the download |
| `policeHold: true` items excluded | ✅ Filter: `i.status === 'active' && !i.policeHold` — police-held items never appear in the exported rows |
| No AI API keys on client | ✅ No AI involvement |
| No `auditLog` entry needed | ✅ Read-only export of data already accessible in the admin session; no state change |
| No new Firestore writes | ✅ Export is purely client-side |

---

## Persona Compliance Tests

### Staff (Primary)

- "↓ Export CSV" button visible in the toolbar on the Inventory page. ✅
- Button is `minHeight: 44px` — comfortable tapping on shop-floor phones. ✅
- `aria-label` set with active item count: "Export 12 active items to CSV". ✅
- `title` tooltip set: "Export 12 active items to CSV" (or "No active items to export" when zero). ✅
- Button disabled and `cursor: not-allowed` when `totalActive === 0`. ✅
- On click: download triggers immediately — no spinner, no network request. ✅
- Filename includes today's date: `inventory-active-2026-06-18.csv`. ✅

### Dale (Secondary — Pricing accuracy)

- `price_cad` column: values are in dollars (e.g. `19.99`), not cents (e.g. `1999`). ✅
- `original_price_cad` column: same conversion applied. ✅
- File opens correctly in Microsoft Excel and Google Sheets (RFC 4180 format). ✅

### Marcus (Secondary — Catalog management)

- `merchandising_tags` column included — joined with `|` for multi-value readability. ✅
- `provenance_notes` column included — properly double-quoted if it contains commas. ✅
- `category` and `condition` columns included for item classification. ✅

### Makoonsii (Accessibility anchor)

- Button `minHeight: 44px` — ≥48px touch target standard for interactive admin controls. The button is 44px (one level below Makoonsii's 48px standard, which applies to customer-facing UI; the admin floor is 44px per E113 precedent). ✅
- `aria-label` and `title` attributes present. ✅
- Button is keyboard accessible — part of natural tab order. ✅

---

## CSV Format Verification

| Property | Spec | Verified |
|----------|------|----------|
| Line endings | CRLF (`\r\n`) per RFC 4180 | ✅ `lines.join('\r\n')` |
| Field delimiter | Comma | ✅ |
| Quote character | Double-quote | ✅ |
| Quote escaping | Doubled quotes (`""`) for embedded quotes | ✅ `str.replace(/"/g, '""')` |
| Quoting trigger | Field contains `"`, `,`, `\n`, or `\r` | ✅ |
| Null/undefined | Empty string (no quotes) | ✅ `csvCell(null) → ''` |
| Price format | CAD dollars, 2 decimal places | ✅ `(price / 100).toFixed(2)` |
| Date format | `YYYY-MM-DD` (ISO 8601 date) | ✅ `.toISOString().slice(0, 10)` |
| Array fields | Pipe-joined (`|`) | ✅ `.join('|')` |
| `policeHold` rows | Excluded entirely | ✅ filter: `!i.policeHold` |
| Column count | 22 | ✅ Headers and data rows match |

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No PII in CSV, logs, or analytics | ✅ |
| No hardcoded hex values in modified file | ✅ |
| No hardcoded px font sizes | ✅ |
| No hardcoded px spacing | ✅ |
| No unapproved motion patterns | ✅ |
| No new Firestore fields | ✅ |
| No AI API keys on client | ✅ |
| No age gate changes | ✅ |
| `auditLogs` not modified | ✅ |
| `policeHold` items excluded from export | ✅ |
| `rare-find` / `limited-edition` unaffected | ✅ |
| `aiDescription` unaffected | ✅ |
| No new npm dependencies | ✅ |
| No Cloud Function changes | ✅ |
| No Firestore rules changes | ✅ |

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/InventoryPage.tsx` | `csvCell()` helper, `exportActiveToCsv()` function (~55 lines), "↓ Export CSV" button in toolbar (~28 lines) |

---

## Sign-Off

All four compiler gates pass. `policeHold` guard confirmed. RFC 4180 format verified. No PII. Zero hardcoded tokens. Zero new dependencies. Staff touch-target and accessibility requirements met.

**QA PASSED. E126 ready to merge.**

---

*The Pawn Shop · docs/reports/E126_QA_REPORT.md · 2026-06-18*
