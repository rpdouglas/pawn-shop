# E94 — Inventory Table Mode: Inline Spreadsheet Grid
**Status:** ✅ CLOSED — 2026-06-08
**Priority:** HIGH
**Effort:** 3 developer-days (actual)
**Cycle:** 32

---

## Problem

The admin InventoryPage renders all items as a card grid. Staff cannot:
- Compare attributes across items without opening each card individually
- Edit multiple rows efficiently (each edit requires a modal/drawer)
- Copy values between cells
- Invoke AI functions in bulk across selected items

This creates friction in high-volume intake sessions and makes bulk price/status reviews slow.

---

## Solution Delivered

A desktop "Table" toggle mode added to the existing `/admin/inventory` route:

- **Grid | Table toggle** — accessible button group in the InventoryPage header
- **14-column TanStack Table v8 (headless)** — full design system CSS token control
- **Click-to-edit cells** — TextCellEditor, SelectCellEditor, PriceCellEditor, TagCellEditor, PoliceHoldCell; Tab/Enter/Escape/blur save model
- **Optimistic Firestore saves** — `updateDoc()` on blur; Firestore `onSnapshot` confirms within ~200ms
- **Ctrl+C / Ctrl+V** — copies focused cell value; Ctrl+V enters edit mode for the focused cell
- **Column visibility toggle** — hidden-by-default columns (category, viewTag, serialNumber, policeHold, merchandisingTags, eBayID, posSyncStatus, createdAt, trendingScore) toggled via a popover panel
- **Row selection** — checkbox column; floating batch action bar appears when ≥1 rows selected
- **Per-row AI column** — ✨ (description) and $ (price) icon buttons; spinner → ✓/✗ status; opens AiAssistantPanel drawer for staff review
- **Batch AI** — `batchProcessItems` callable CF; sequential, rate-limited (400ms/item), max 20 items
- **Access control** — `policeHold` column edit-gated to admin only; `rare-find`/`limited-edition` tags hidden from inventory_staff

---

## Files Created

| File | Purpose |
|------|---------|
| `src/components/admin/InventoryTable.tsx` | Main table component with full state, sorting, AI drawer |
| `src/components/admin/InventoryTable/columns.tsx` | 14-column TanStack column definitions + `CellWrapper` |
| `src/components/admin/InventoryTable/CellEditors.tsx` | Cell editor components (Text, Select, Price, Tag, Toggle) |
| `src/components/admin/InventoryTable/CellEditorOptions.ts` | Exported option arrays for select editors |
| `src/hooks/useGridClipboard.ts` | Clipboard read/write hook with `execCommand` fallback |
| `functions/src/lib/audit.ts` | `writeAuditLog` helper (fixes pre-existing missing module in loanTickets) |

## Files Modified

| File | Change |
|------|--------|
| `src/pages/admin/InventoryPage.tsx` | `viewMode` state, Grid/Table toggle, conditional render of InventoryTable |
| `functions/src/ai.ts` | Added `generateDescriptionForItem`, `suggestPriceForItem` internal helpers + `batchProcessItems` CF |

## Docs Created / Updated

| Doc | Change |
|-----|--------|
| `docs/projects/E94_INVENTORY_TABLE_MODE.md` | This file |
| `docs/plans/E94_INVENTORY_TABLE_PLAN.md` | 3-strategy plan |
| `docs/decisions/0004-inventory-table-tanstack.md` | Decision log — TanStack Table v8 choice |
| `docs/EPICS.md` | E94 entry added and closed |
| `docs/ACTIVE_CYCLE.md` | E94 added to Completed table; footer updated |

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (frontend) | ✅ PASS — `built in 4.19s` |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend) | ✅ PASS — 29/29 tests |
| Hardcoded hex audit | ✅ PASS — none introduced |
| PII in logs audit | ✅ PASS — `auditLogs` contain no PII |
| `aiDescription` firewall | ✅ PASS — AI column opens AiAssistantPanel; never auto-publishes |
| `policeHold` admin gate | ✅ PASS — `PoliceHoldCell` renders toggle for admin, read-only span otherwise |
| Scarcity tag gate | ✅ PASS — `rare-find`/`limited-edition` excluded from non-admin TagCellEditor |
| AI keys on client | ✅ PASS — all AI calls routed via Cloud Functions |

---

*The Pawn Shop · docs/projects/E94_INVENTORY_TABLE_MODE.md · 2026-06-08*
