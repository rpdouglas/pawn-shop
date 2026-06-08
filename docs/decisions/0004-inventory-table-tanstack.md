# Decision 0004 — E94 Inventory Table Mode: TanStack Table v8 (Strategy B)

**Date:** 2026-06-08
**Epic:** E94 · Inventory Table Mode — Inline Spreadsheet Grid
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

The admin InventoryPage needed an inline-editable data grid to replace the card view for desktop inventory management. Three strategies were evaluated:

- **A:** Enhanced Drawer Table (no inline edit; every field edit opens a drawer)
- **B:** TanStack Table v8 headless (click-to-edit per cell; TanStack ecosystem)
- **C:** react-data-grid (native spreadsheet clipboard; second grid library)

---

## Decision

**Strategy B: TanStack Table v8 (`@tanstack/react-table` v8.21.3).**

---

## Rationale

1. **Headless = full design system control.** `@tanstack/react-table` imposes zero CSS. Every cell, header, and row is styled entirely with the project's `var(--color-*)`, `var(--space-*)`, and `var(--text-*)` tokens. No override wars.

2. **TanStack ecosystem consistency.** `@tanstack/react-query` is already a core dependency. Sharing the TanStack ecosystem avoids adding a second, unrelated grid library.

3. **TypeScript-first.** TanStack Table v8 is rewritten in TypeScript with full generic support. The `TableMeta` augmentation pattern allows typing the `meta` object precisely — no `any` casts for callbacks or state.

4. **Reuse of existing infrastructure.** The column cell renderers reuse every existing editor component (`TextCellEditor`, `SelectCellEditor`, etc.) and AI integration (`generateAIDescription`, `suggestAiPrice`, `AiAssistantPanel`). No duplication.

5. **Copy/paste is custom, not library-dependent.** The `useGridClipboard` hook handles Ctrl+C (copy focused cell value) and Ctrl+V (enter edit mode on focused cell). This avoids the black-box clipboard behaviour of react-data-grid and gives full control over the copy format for both single cells and future multi-row scenarios.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy A (drawer table) | Does not fulfil inline edit or copy/paste requirements — staff must open a drawer for every single field change |
| Strategy C (react-data-grid) | CSS conflict with Tailwind v4 + design tokens requires heavy overrides; adds a second grid-adjacent dependency; native clipboard format is opaque for custom cell types |

---

## Compliance Notes

- All Firestore writes go through `updateDoc()` on blur — no batch writes until Firestore confirms.
- `policeHold` write gated to `isAdmin` check at the cell level (PoliceHoldCell renders toggle only for admins).
- `rare-find`/`limited-edition` merchandising tags excluded from `TagCellEditor` for non-admin roles via `RESTRICTED_TAGS` filter.
- `batchProcessItems` CF enforces `assertStaff()` auth check + 20-item hard cap server-side.
- All AI results written to `items/{id}/internal/ai` — staff-promote gate preserved via AiAssistantPanel.
- `auditLogs` entries created by `batchProcessItems` contain only `uid`, `targetId`, model name, and `batch: true` flag — no PII.

---

## New Dependency Added

| Package | Version | Notes |
|---------|---------|-------|
| `@tanstack/react-table` | `^8.21.3` | Headless table; same ecosystem as `@tanstack/react-query` |

---

## Files Introduced

- `src/components/admin/InventoryTable.tsx`
- `src/components/admin/InventoryTable/columns.tsx`
- `src/components/admin/InventoryTable/CellEditors.tsx`
- `src/components/admin/InventoryTable/CellEditorOptions.ts`
- `src/hooks/useGridClipboard.ts`
- `functions/src/lib/audit.ts` (also fixes pre-existing missing import in `loanTickets.ts`)

---

*The Pawn Shop · docs/decisions/0004-inventory-table-tanstack.md · 2026-06-08*
