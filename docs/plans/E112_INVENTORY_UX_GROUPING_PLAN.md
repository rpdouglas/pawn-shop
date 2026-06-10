# E112 — Inventory UX: Grouping, Collapsible Sections & Grid Inline Edit
## Plan — Three-Strategy Proposal
**Date:** 2026-06-10 · **Cycle:** 33 · **Author:** Claude (Planning Gate)

---

## Current State Audit

### What exists

| Mode | Grouping | Collapsible | Inline Edit | Mobile |
|------|----------|-------------|-------------|--------|
| Grid | By viewTag (pawn/cannabis/fireworks/other) — hardcoded | ❌ No | ❌ No (links to /edit) | Basic — small buttons |
| Table | None — flat, sortable | ❌ No | ✅ Yes (TanStack Table v8, CellEditors) | Scroll-only |

**Grid view code path:** `InventoryPage.tsx` lines 342–486. Sections are `{['pawn','cannabis','fireworks','other'].map(...)}` — hardcoded, always expanded. Card action buttons (Edit, Archive, Delete) navigate to separate page.

**Table view code path:** `InventoryTable.tsx` + `InventoryTable/columns.tsx`. Uses TanStack `getCoreRowModel` + `getSortedRowModel`. No `getGroupedRowModel`. Column visibility panel, floating batch action bar.

**Cell editors:** `TextCellEditor`, `SelectCellEditor`, `PriceCellEditor`, `TagCellEditor`, `PoliceHoldCell` all exist in `InventoryTable/CellEditors.tsx`. They can be re-used in a grid card context.

### Gaps vs best-practice inventory systems

| Best Practice (Shopify/Airtable/Linnworks) | Our Gap |
|--------------------------------------------|---------|
| Group table rows by any dimension with collapse | Table has no grouping |
| Collapse individual sections to focus | Neither mode collapses |
| Inline edit fields from card/row without navigating away | Grid cards navigate to full edit page |
| Persist last view/filter/group state | No persistence — resets on page reload |
| Mobile cards with ≥48px tap targets on primary actions | Grid card buttons are too small |
| "Group by" selector in toolbar | Not present |

---

## Persona Gate

**Primary persona: Staff** (`inventory_staff`, `manager`, `admin`)
- This is the admin InventoryPage — no customer-facing code is touched.
- All new controls must have ≥44px touch targets (Makoonsii touch standard applies to staff tools too).
- No PII may be logged.
- `policeHold` field remains admin-only write — no change.
- `rare-find` / `limited-edition` / `staff-pick` remain staff-set only — no change.

**Indirect beneficiaries:**
- **Dale** — accurate status updates flow from better staff workflows
- **Kevin** — faster transitions to `active` status mean 60s alert SLA is easier to hit
- **Marcus** — improved image visibility in grid view makes photography review faster

---

## Schema Audit

No new Firestore fields are required. This feature reads only existing `items/{id}` fields:
- `viewTag` — used for grouping
- `category` — used for grouping
- `status` — used for grouping and inline edit (already writable)
- `title`, `price`, `condition`, `serialNumber`, `merchandisingTags`, `policeHold` — inline edit (already writable)

All field names confirmed in `docs/firestore-schema.md`. No schema updates needed.

---

## Anti-Regression Checklist (for all strategies)

- ✅ No hardcoded hex values — all colours via `var(--color-*)` tokens
- ✅ No new Firestore fields invented
- ✅ No AI API keys on client
- ✅ No auto-apply of `rare-find` / `limited-edition` / `staff-pick` tags
- ✅ No PII in logs, console, or analytics
- ✅ Age gates not touched (admin-only page, no gate needed)
- ✅ No unapproved motion (collapse transitions use `var(--motion-speed-base)` opacity + height, no bounce/particle)

---

## Three-Strategy Proposal

---

### Strategy A — Table Grouping Only (Targeted Fix)

**Summary:** Add `getGroupedRowModel()` and a "Group by" dropdown to the existing TanStack Table. Grid view gets collapsible section headers (state only — no inline edit). View state persisted to localStorage.

#### Architecture

- **`InventoryTable.tsx`**: Add `grouping` state (`GroupingState`), wire `getGroupedRowModel()` and `getExpandedRowModel()`. Add expand/collapse toggle on group header rows. Pass `groupBy` prop from page.
- **`InventoryPage.tsx`**: Add `groupBy` dropdown control (`'none' | 'viewTag' | 'category' | 'status'`). Grid section `isCollapsed` state per group, persisted in localStorage. No new files.
- **`columns.tsx`**: Add group header row rendering (item count badge, collapse chevron).
- **Firestore ops:** Zero new reads/writes — purely presentational.
- **Cloud Functions:** None.
- **Security rules:** No change.

#### Persona Lens

- **Staff**: Group by Status to review all `draft` items at once; group by Category to do a focused pricing sweep. Collapse `sold` group to reduce noise. Persistent state means their last layout survives navigation.
- **Secondary**: Faster status transitions (less scrolling to find items) benefits Dale and Kevin indirectly.

#### Compliance

- No age gates, PII, or AI keys touched.
- `policeHold` editing already admin-gated in existing CellEditors.

#### Trade-offs

| Pro | Con |
|-----|-----|
| Minimal scope — 3 files, ~150 LOC | Grid cards still send staff to /edit for any change |
| TanStack grouping is battle-tested | Grid mode improvements are cosmetic only (collapse, no inline edit) |
| Fast to ship and test | Doesn't close the "mobile card editing" gap |
| Zero new dependencies | |

#### Estimated Scope

**Small** — 3 files, ~150 LOC net change, ~4h dev time.

---

### Strategy B — Grouped Table + Grid Card Inline Edit (Recommended)

**Summary:** Strategy A plus: new `InventoryCard` component with inline-editable fields (reusing existing CellEditors), collapsible grid groups, and full localStorage persistence. This closes the primary gap: staff can edit from either mode.

#### Architecture

- **`InventoryPage.tsx`**: `groupBy` dropdown, `collapsedGroups` state (Set\<string\>), localStorage persistence for `viewMode`, `groupBy`, `collapsedGroups`, `statusFilter`. Renders `InventoryCard` in grid mode.
- **`InventoryTable.tsx`**: Strategy A changes (grouping + collapse).
- **`columns.tsx`**: Group header rows.
- **New `InventoryCard.tsx`** (`src/components/admin/InventoryCard.tsx`):
  - 80px thumbnail, inline-editable title (click to edit), status badge (click to cycle), price (click to edit cents), condition badge, quantity adjust control.
  - Reuses `TextCellEditor`, `SelectCellEditor`, `PriceCellEditor` from `InventoryTable/CellEditors.tsx`.
  - Direct `updateDoc` on save — same pattern as `InventoryTable.onCellSave`.
  - Action buttons (Edit full form link, Archive, Delete/Restore) with ≥48px touch targets.
  - AI drawer trigger (opens same drawer as table mode).
  - Hover state: subtle `var(--color-surface)` lift.
- **Mobile improvements**: Grid card action row uses `min-height: 48px` throughout. Cards stack 1-col on screens <640px.
- **Firestore ops:** Inline `updateDoc` calls on card save — same as existing table pattern. No new Cloud Function calls.
- **Security rules:** No change.

#### Persona Lens

- **Staff (primary)**: Edit title, status, price, condition directly on the grid card — no round-trip to /mobile-intake/edit. Workflow improvement is significant for bulk review sessions.
- **Makoonsii standard applied to staff tools**: ≥48px action buttons, plain-language labels ("Archive" not "Soft Delete"), high contrast.
- **Marcus (indirect)**: Grid card shows 80px thumbnail prominently — faster photography review pass.

#### Compliance

- Inline `updateDoc` writes are the same pattern as the existing table. No compliance scope changes.
- `policeHold` write is gated behind `isAdmin` in `PoliceHoldCell` — imported as-is into `InventoryCard`.
- `merchandisingTags` write uses `TagCellEditor` — staff-only allowed tags enforced in that component.

#### Trade-offs

| Pro | Con |
|-----|-----|
| Closes the primary UX gap (inline edit on cards) | New `InventoryCard.tsx` component adds maintenance surface |
| Reuses existing CellEditors — no new logic | Grid card is a new abstraction to keep in sync with table |
| localStorage persistence removes friction every session | No virtual scrolling — 500 items still fully rendered |
| ≥48px touch targets on card actions (Makoonsii standard) | |
| No new dependencies | |

#### Estimated Scope

**Medium** — 4 files (1 new), ~300 LOC net change, ~1 developer-day.

---

### Strategy C — Multi-View Inventory Hub (Full Build)

**Summary:** Strategy B plus a third Kanban view (columns by status), virtual scrolling, an advanced filter panel (multi-field), and a "saved views" system. This is the full Shopify/Airtable experience.

#### Architecture

- Everything in Strategy B plus:
- **Kanban view** (`src/components/admin/InventoryKanban.tsx`): Drag-and-drop status columns (draft → active → reserved → sold). Each card is a mini `InventoryCard`. Status change via `updateDoc`. Uses `@dnd-kit/core` for accessible drag-and-drop.
- **Advanced filter panel** (`src/components/admin/InventoryFilterPanel.tsx`): Multi-select viewTag chips, category multi-select, condition checkboxes, price range slider, "has images" toggle. All client-side against loaded items array.
- **Virtual scrolling**: Replace grid `items.map()` with `@tanstack/react-virtual` (already in project via TanStack Table). Renders only visible items.
- **Saved views**: localStorage object of named filter+group+view combos. Dropdown to load/save/delete.
- **`InventoryPage.tsx`**: View mode expanded to `'grid' | 'table' | 'kanban'`. Filter panel state. Saved views dropdown.
- **New files**: `InventoryKanban.tsx`, `InventoryFilterPanel.tsx`, `useInventoryViews.ts` hook.
- **Dependencies**: `@dnd-kit/core` (drag-and-drop for Kanban) — new dependency.
- **Firestore ops:** Kanban drag writes `updateDoc` on status field — same as inline edit. No new Cloud Functions.
- **Security rules:** No change.

#### Persona Lens

- **Staff (primary)**: Full inventory command centre. Kanban gives at-a-glance status pipeline visibility. Advanced filters enable surgical queries ("all pawn items in 'good' condition under $200"). Saved views let each staff member set up their preferred workspace.
- **Marcus (indirect)**: Kanban "draft" column makes it easy to see all un-published items awaiting photography review.

#### Compliance

- Drag-and-drop Kanban moves items between status columns — must not be able to drag directly to `deleted` (that would bypass the soft-delete audit trail). `deleted` column must be excluded or read-only.
- `@dnd-kit/core` is an accessible drag library (ARIA roles, keyboard support) — meets Makoonsii standard.

#### Trade-offs

| Pro | Con |
|-----|-----|
| Full best-practice inventory management surface | Largest scope — ~2 developer-days |
| Kanban view is genuinely novel for a pawn shop admin | New `@dnd-kit/core` dependency to maintain |
| Advanced filters expose capabilities staff don't currently have | Virtual scrolling adds complexity to layout |
| Saved views eliminate repetitive filter-setting | Risk of scope creep during implementation |

#### Estimated Scope

**Large** — 7 files (3 new), ~600 LOC net change, ~2 developer-days.

---

## Comparison Matrix

| Dimension | Strategy A | Strategy B ⭐ | Strategy C |
|-----------|-----------|--------------|-----------|
| Scope | Small | Medium | Large |
| Risk | Low | Low | Medium |
| Grid inline edit | ❌ | ✅ | ✅ |
| Table grouping + collapse | ✅ | ✅ | ✅ |
| Mobile card improvements | Partial | ✅ | ✅ |
| Kanban view | ❌ | ❌ | ✅ |
| Virtual scrolling | ❌ | ❌ | ✅ |
| New dependencies | None | None | @dnd-kit |
| Dev time | ~4h | ~8h | ~16h |

**Recommendation: Strategy B.** It closes the most impactful gap (grid inline edit) without the complexity of a new Kanban mode. Strategy A leaves the grid mode still sending staff to the full edit form. Strategy C is the right long-term vision but carries dependency and scope risk during an active sprint. Strategy B is the right next step — Strategy C can follow once B is stable.

---

## File Change Summary (Strategy B)

| File | Change Type |
|------|------------|
| `src/pages/admin/InventoryPage.tsx` | Modify — add groupBy, collapsedGroups, localStorage persistence, render InventoryCard |
| `src/components/admin/InventoryTable.tsx` | Modify — add getGroupedRowModel, groupBy prop, expand/collapse |
| `src/components/admin/InventoryTable/columns.tsx` | Modify — group header row rendering |
| `src/components/admin/InventoryCard.tsx` | New — inline-editable grid card with reused CellEditors |

---

*The Pawn Shop · docs/plans/E112_INVENTORY_UX_GROUPING_PLAN.md · 2026-06-10*
