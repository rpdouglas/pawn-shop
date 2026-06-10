# E113 — Inventory Batch Action Bar Redesign
## Plan — Three-Strategy Proposal
**Date:** 2026-06-10 · **Cycle:** 33 · **Author:** Claude (Planning Gate)

---

## Industry Analysis

Before proposing strategies, a brief audit of how leading inventory and productivity tools handle row selection:

| Product | Pattern | Key Insight |
|---------|---------|-------------|
| **Shopify Admin** | Full-width sticky banner below the filter row; appears when rows are selected; "X items selected" count left-aligned, actions right-aligned; overflow into `Actions ▾` menu | User's eye is already at the top — this is the industry reference for e-commerce admin |
| **Airtable** | Context-sensitive toolbar at the top of the grid view; limited to 3–4 icon+label buttons; overflow via `⋯` | Keeps the selection UI integrated with the data, not disconnected at the bottom |
| **Linear** | Full-width fixed bottom bar (like ours), but structured: left = count+dismiss, right = grouped icon-button actions with labels, overflow `⋯` menu | Bottom position works in Linear because the viewport is tall and the list is short — not valid for a 500-item inventory table |
| **GitHub Issues** | Checkbox header cell transforms to show count + 3 inline action icons; no floating bar | Extremely clean; actions never leave the table header |
| **Notion** | Popover anchored to the first selected block | Block-level UX; not applicable to row grids |
| **Google Drive** | Top toolbar transforms: replaces breadcrumb with count + action icons when items are selected | Teaches that "toolbar transformation" is preferred to "extra floating element" |
| **Figma** | Selection shows in Properties panel (right rail) | Panel-based; not applicable |

### Key Takeaways
1. **Top wins over bottom** — every best-in-class inventory tool puts selection context near the filter/toolbar, not at the bottom of the viewport.
2. **Full-width wins over pill** — a pill with 5+ items overflows. Full-width banners scale gracefully.
3. **Grouped actions win over flat list** — separating AI enrichment from destructive CRUD reduces accidental deletes and cognitive load.
4. **Overflow menus are table stakes** — any bar with 4+ actions needs an overflow pattern for future extensibility.

---

## Current State

```
[N selected] [✨ Generate Descriptions] [$ Suggest Prices] [Restore / Delete] [Clear]
```
- Position: `fixed`, `bottom: var(--space-6)`, `left: 50%`, `transform: translateX(-50%)`
- Shape: pill via `borderRadius: var(--radius-lg)`
- Width: unconstrained (shrinks to content)
- All 5 items in one row, all the same visual weight
- `whiteSpace: nowrap` — no wrapping possible
- No grouping between AI actions and CRUD actions
- Conflicts with `AdminMobileNav` bottom tab bar on mobile

---

## Persona Gate

**Primary: Staff** (admin / inventory_staff / manager)
- This is an admin-only UI element. No customer-facing code is touched.
- All interactive elements must meet ≥44px touch targets (Makoonsii admin standard).
- No PII in any UI element.

**Indirect: Makoonsii** — touch target standard applies to admin tools.
**Indirect: Jordan** — the "Dapper. Debonair." brand voice applies to staff UIs. An overcrowded pill undermines the editorial quality signal.

---

## Schema Audit

No Firestore reads or writes are changed. This epic is purely presentational — it reshapes the JSX/CSS for the existing batch action bar. All underlying logic (`runBatchAi`, `handleBulkCrud`, `table.resetRowSelection`, `onBulkDelete`, `onBulkRestore`) is unchanged.

**No schema updates required.**

---

## Anti-Regression Checklist (all strategies)

- ✅ No hardcoded hex — all `var(--color-*)` tokens
- ✅ No new Firestore fields
- ✅ No AI API keys on client (no change to CF calls)
- ✅ No `rare-find`/`limited-edition` auto-application
- ✅ No PII in any element
- ✅ No component-level age gates (admin page — none needed)
- ✅ No unapproved motion (slide-in uses `var(--motion-speed-fast)` opacity + transform only)

---

## Three-Strategy Proposal

---

### Strategy A — Top-Anchored Context Banner (Shopify Admin Pattern) ⭐ Recommended

**Summary:** Replace the floating bottom pill with a full-width banner that slides in directly below the table toolbar when rows are selected. The banner uses a two-zone layout: left zone (count + clear), right zone (grouped actions: AI enrichment | separator | destructive). No floating, no overflow on standard viewports.

#### Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✓ 4 selected  [×]          [✨ Descriptions]  [$ Prices]  │  [Delete]     │
└─────────────────────────────────────────────────────────────────────────────┘
     Left zone                   AI group          Separator   CRUD group
```

#### Architecture

- **Single file:** `src/components/admin/InventoryTable.tsx`
- Move the batch action bar from `position: fixed` (viewport-relative) to `position: sticky; top: 0` (table-scroll-relative), so it stays in view as the user scrolls the table.
- Bar slides in with a `max-height` + `opacity` transition when `selectedCount > 0`.
- Left zone: count badge + `×` dismiss button (clears selection). Replaces the verbose "Clear" button.
- Right zone: two groups separated by a `1px` vertical divider:
  - **AI group:** ✨ Descriptions · $ Prices (same calls, different label style)
  - **CRUD group:** Delete or Restore (context-sensitive as today)
- All buttons: `minHeight: 44px`, icon + label on ≥768px, icon-only on ≤480px (via CSS)
- `batchError` moves to a dismissible inline error under the bar, not inside it
- No overflow menu needed at current action count (4 actions fit comfortably)

#### Compliance

- No age gates, PII, or AI key routing changes.
- `policeHold` editing unchanged.
- All existing `confirm()` dialogs on Delete/Restore preserved.

#### Trade-offs

| Pro | Con |
|-----|-----|
| Eliminates the bottom-of-viewport attention split | `position: sticky` on a table inside a scrollable container requires care — the bar must be placed *outside* the `<div style={{ overflowX: 'auto' }}>` wrapper to stick correctly |
| Full-width scales gracefully — no overflow risk | Slightly more complex layout than current flat bar |
| Grouping makes AI vs. CRUD visually distinct | |
| Consistent with Shopify Admin (the reference product for e-commerce admin) | |
| ×1 clear button is more intuitive than a "Clear" text button | |
| `position: sticky` keeps the bar in view while scrolling the table | |

#### Estimated Scope

**Small** — 1 file, ~60 LOC change (replace batch bar JSX + styles), ~2h dev time.

---

### Strategy B — Structured Full-Width Fixed Bottom Bar (Linear Pattern)

**Summary:** Keep the `position: fixed; bottom` placement but replace the pill shape with a structured full-width bar. Three zones: left (count + dismiss), centre (AI group), right (CRUD group). Full viewport width, rectangular (no pill radius), with a subtle top border and backdrop blur for depth.

#### Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✓ 4 selected  [×]  │  [✨ Descriptions]  [$ Prices]  │  [Delete]  [×]    │
└─────────────────────────────────────────────────────────────────────────────┘
     Left                    AI group                     CRUD group
```

#### Architecture

- **Single file:** `src/components/admin/InventoryTable.tsx`
- Change `borderRadius` from `var(--radius-lg)` to `0` (or `var(--radius-sm)` on top corners only)
- Change `left: '50%', transform: 'translateX(-50%)'` to `left: 0, right: 0`
- Add `backdropFilter: 'blur(8px)'` for depth
- Add `zIndex: 600` (above AdminMobileNav's `zIndex: 500` — check mobile)
- Structure into flex zones with internal dividers
- `batchError` rendered below/inside the bar (unchanged position)
- Conflicts with `AdminMobileNav` bottom bar on mobile: bar must add `paddingBottom: 'calc(var(--space-4) + 56px)'` when `isTabletOrBelow` — requires checking viewport

#### Compliance

Same as Strategy A — no schema, PII, or AI key changes.

#### Trade-offs

| Pro | Con |
|-----|-----|
| Minimal positional change — bottom placement is already muscle-memory for staff | Still competes for attention at the bottom while eyes are at the top of the table |
| `backdropFilter: blur` gives depth without hardcoded colours | `backdropFilter` not supported in all browsers (OK for admin Chrome) |
| Easier to implement than sticky (no container hierarchy concerns) | Conflicts with `AdminMobileNav` on mobile require explicit z-index and padding management |
| Full-width eliminates overflow | Bottom position means 500-item tables require significant scroll to see the actions |

#### Estimated Scope

**Small** — 1 file, ~40 LOC change (reshape existing bar), ~1.5h dev time.

---

### Strategy C — Inline Header Transformation (GitHub / Google Drive Pattern)

**Summary:** Eliminate the floating bar entirely. When rows are selected, the table `<thead>` row transforms: the checkbox header cell displays the selection count, and 3–4 icon buttons appear inline in the header row right-aligned. Actions are always visible because they live in the table header — no separate element, no z-index conflicts, no mobile issues.

#### Visual Layout

```
Before selection:
┌───┬──────────────────────────┬────────────┬──────────┬────────────────┐
│ ☐ │ Title ↕                  │ Status ↕   │ Price ↕  │ Condition ↕   │
└───┴──────────────────────────┴────────────┴──────────┴────────────────┘

After selection (4 rows selected):
┌───┬──────────────────────────┬───────────────────────────────────────┐
│ ✓ │ 4 selected  [✨] [$] │ [🗑]  [×]                               │
└───┴──────────────────────────┴───────────────────────────────────────┘
     ↑ colspan=all or absolute overlay on the header row
```

#### Architecture

- **Single file:** `src/components/admin/InventoryTable.tsx`
- When `selectedCount > 0`: render an overlay `<tr>` above or in place of the normal header `<tr>`.
- The overlay spans all columns via `colSpan={colCount}`.
- Left: selected count badge + selection state icon.
- Right: icon buttons with `aria-label` and `title` for tooltips. Icon-only on all sizes (action labels via tooltip on hover).
- This requires the overlay `<tr>` to visually replace the column header — tricky with TanStack Table because `table.getHeaderGroups()` drives the header render. An alternative: conditional swap of the entire `<thead>` content.
- `batchError`: toast notification (fixed, top-right) rather than inline.

#### Compliance

Same as A and B. One additional consideration: keyboard navigation — the header row buttons must be reachable via Tab from any cell in the table.

#### Trade-offs

| Pro | Con |
|-----|-----|
| Cleanest UI — zero floating elements, zero z-index conflicts | Most complex to implement — requires conditional thead render, careful accessibility |
| No mobile conflicts (header is always visible) | Header transformation loses column sort controls while selection is active — staff must deselect to re-sort |
| Actions always immediately visible without scrolling | Icon-only buttons require good tooltips for discoverability |
| Linear with the "toolbar transformation" best practice | TanStack Table's `getHeaderGroups()` API makes conditional thead harder |
| No additional elements to worry about in the DOM | Needs a toast system for `batchError` (doesn't exist yet) |

#### Estimated Scope

**Medium** — 1–2 files, ~90 LOC change + possible toast infrastructure, ~4h dev time.

---

## Comparison Matrix

| Dimension | Strategy A ⭐ | Strategy B | Strategy C |
|-----------|--------------|-----------|-----------|
| Scope | Small | Small | Medium |
| Position | Top-anchored sticky | Bottom fixed (full-width) | Header row transformation |
| Attention alignment | ✅ Top (where eyes are) | ❌ Bottom (eyes are at top) | ✅ Top (always in view) |
| Overflow risk | None | None | None |
| Mobile conflicts | None | Requires AdminMobileNav z-index care | None |
| Grouping (AI vs CRUD) | ✅ Divider zones | ✅ Divider zones | Icon-only (less visible grouping) |
| Implementation complexity | Low | Lowest | High |
| Loses sort while selected | No | No | Yes |
| Design system alignment | Full tokens | Full tokens | Full tokens + needs toast |

**Recommendation: Strategy A.** Top-anchored sticky banner is the pattern used by Shopify Admin (the reference tool for e-commerce staff), eliminates the bottom-of-viewport attention split, and is the smallest scope change that fully closes all three identified gaps. Strategy B is the easiest implementation but perpetuates the primary problem (bottom position). Strategy C is the cleanest long-term vision but sacrifices column sorting while selection is active — a real staff workflow regression.

---

## File Change Summary (Strategy A)

| File | Change Type |
|------|------------|
| `src/components/admin/InventoryTable.tsx` | Modify — replace batch action bar position, shape, and grouping |

---

*The Pawn Shop · docs/plans/E113_BATCH_ACTION_BAR_REDESIGN_PLAN.md · 2026-06-10*
