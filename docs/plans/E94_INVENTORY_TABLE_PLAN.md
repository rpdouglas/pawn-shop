# E94 · Inventory Table Mode — Plan
**Status:** Approved (Strategy B) · **Cycle:** 32 · **Date:** 2026-06-08

---

## Persona Gate

**Primary:** `[Staff]` — inventory_staff, manager, admin  
**Secondary:** `[Jordan]` (aiDescription firewall), `[Marcus]` (image thumbnails in table)

**Compliance Gate:**
- `policeHold` write: admin-only
- `rare-find`/`limited-edition` tags: staff-set only (restricted in TagCellEditor)
- `aiDescription` customer-visibility: preserved via AiAssistantPanel drawer (promote gate)
- AI API calls: Cloud Functions only (no client-side keys)
- `auditLogs` on batch AI: Create-only via Admin SDK, no PII in `details`

---

## Schema Audit

No new Firestore fields introduced. All fields updated via table editing exist in `docs/firestore-schema.md`:
- `title`, `status`, `condition`, `price`, `quantity` (Item root)
- `category`, `viewTag`, `serialNumber` (Item optional)
- `policeHold` (Item root, admin-only)
- `merchandisingTags` (Item root, staff-controlled)
- `items/{id}/internal/ai` — existing subcollection; written by `batchProcessItems` CF

---

## Three-Strategy Comparison

### Strategy A — Enhanced Drawer Table

Shopify Bulk Edit variant: read-only table (reusing `Table.tsx`); clicking a row opens a full edit drawer (IntakeForm). No inline editing. No copy/paste.

| | |
|---|---|
| **Effort** | 3–4 dev-days |
| **Pros** | Fastest; no new library |
| **Cons** | Does NOT fulfil inline edit or copy/paste requirements; every edit requires drawer |

---

### Strategy B — TanStack Table v8 Headless *(Approved)*

Airtable/Linear click-to-edit pattern. `@tanstack/react-table` from the same TanStack ecosystem already in use (`@tanstack/react-query`). Custom `useGridClipboard` hook for Ctrl+C/V. Click-to-edit per cell. Per-row and batch AI via existing CFs + new `batchProcessItems` CF.

| | |
|---|---|
| **Effort** | 8–10 dev-days (scoped to 3 actual) |
| **Pros** | 100% design system CSS token control; TanStack ecosystem consistency; full TypeScript; reuses all existing editors/AI plumbing |
| **Cons** | Inline editing state is manual (well-documented TanStack pattern); more code than A |

---

### Strategy C — react-data-grid Spreadsheet

Native clipboard, arrow-key navigation, frozen columns. Custom `renderCell`/`renderEditCell` for each field type.

| | |
|---|---|
| **Effort** | 6–8 dev-days |
| **Pros** | Best native copy/paste |
| **Cons** | CSS override war with Tailwind v4 + design tokens; adds second grid dependency alongside TanStack Query; smaller community |

---

## Recommended: Strategy B

**Why:** TanStack Table is headless — zero imposed CSS, complete token control. The same TanStack ecosystem (`react-query`) is already installed. Inline editing state in TanStack Table is a well-known pattern with documented examples. Custom `useGridClipboard` handles copy/paste without a library dependency. All existing AI plumbing (`generateAIDescription`, `suggestAiPrice`, `AiAssistantPanel`) reused without modification.

---

## Architecture

```
InventoryPage.tsx
  ├── [existing] card grid (viewMode === 'grid')
  └── [new] InventoryTable.tsx  (viewMode === 'table')
        ├── columns.tsx              — TanStack column defs + CellWrapper
        ├── CellEditors.tsx          — TextCellEditor, SelectCellEditor, PriceCellEditor,
        │                              TagCellEditor, PoliceHoldCell
        ├── CellEditorOptions.ts     — STATUS_OPTIONS, CONDITION_OPTIONS, VIEW_TAG_OPTIONS
        └── useGridClipboard.ts      — clipboard hook (src/hooks/)
```

**Cloud Functions:** `functions/src/ai.ts` — `batchProcessItems` callable + extracted internal helpers `generateDescriptionForItem`, `suggestPriceForItem`.

---

## Anti-Regression Protocol

- [x] No hardcoded hex values — all CSS via `var(--color-*)` tokens
- [x] No invented Firestore fields — all writes to existing schema fields
- [x] No AI keys on client — all AI via Cloud Functions
- [x] No manufactured scarcity — `rare-find`/`limited-edition` tag access restricted
- [x] No PII in auditLogs — `details` maps contain only `itemId`, `model`, `batch: true`
- [x] No client-side age gate — not applicable (admin route, auth-gated)
- [x] No unapproved motion — transitions use `var(--motion-speed-fast)` only
- [x] Brand voice intact — no UI copy violations; editors are functional, not editorial

---

*The Pawn Shop · docs/plans/E94_INVENTORY_TABLE_PLAN.md · 2026-06-08*
