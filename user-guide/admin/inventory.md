# Inventory Management

The **Inventory Management** page (`/admin/inventory`) is the central hub for overseeing every item across The Pawn Shop's four storefronts. All items — across every status and vertical — load into a single view. Your last layout (view mode, group, filter, collapsed sections) is remembered automatically between sessions.

![Admin Inventory List](/screenshots/admin-inventory-list.png)

---

## Stat Strip

Directly below the page header, a four-cell horizontal bar gives you an instant count of your catalogue:

| Cell | What it counts |
|------|----------------|
| **ACTIVE** | Items live on the storefront (green when non-zero) |
| **RESERVED** | Items held for a customer (blue when non-zero) |
| **DRAFT** | Unpublished items (muted when zero) |
| **TOTAL** | All non-deleted items (gold when non-zero) |

These counts always reflect the full dataset — they do not change when you apply filters below.

---

## Toolbar

Below the stat strip you'll find the core controls:

- **Search** — A full-width field (🔍 icon prefix) filters by item title in real time.
- **Status filter chips** — All · Active · Draft · Reserved · Sold · Recycle Bin. Tap any chip to narrow the list. The active chip shows a gold border and text.
- **Group by** — Organise items into collapsible sections by **View Tag** (Pawn / Cannabis / Fireworks / Other), **Category** (alphabetical), **Status** (workflow order), or **None** (flat list).
- **⊞ Grid / ☰ Table** — Toggle between Grid and Table view. Your choice is remembered for next time.
- **↓ Export CSV** — Downloads a CSV snapshot of every active item (items with `status: Active` and no police hold). The file opens in Excel or Google Sheets and contains 22 columns including title, category, condition, price in CAD dollars, serial number, merchandising tags, and provenance notes. The filename is stamped with the export date — for example, `inventory-active-2026-06-18.csv`. The button is disabled when there are no active items.
- **Empty Recycle Bin** — Visible to Admins only when the Recycle Bin filter is active. Permanently and irreversibly removes every deleted item.

---

## Grid View

The Grid view presents items as cards — ideal for visual inventory checks and quick field edits without leaving the page.

### Collapsible Group Sections

When **Group by** is set to anything other than None, items are gathered into labelled sections. Each section header shows the group name, an item count badge, and a collapse chevron. Click the header to fold or unfold a section. Collapsed sections are remembered across sessions — fold the groups you don't need and they stay out of the way.

### Inline Editing on Cards

Every card supports editing the most common fields directly without navigating to the full intake form:

| Field | How to edit |
|-------|------------|
| **Title** | Click the title text — a text input appears. Press **Enter** or click away to save, **Escape** to cancel. |
| **Status** | Click the status badge — a dropdown appears. |
| **Condition** | Click the condition badge — a dropdown appears. |
| **Price** | Click the price — a number input appears (enter dollars; stored as CAD cents). |

Changes save to Firestore the moment you confirm or blur the field.

### Section Accent Bar

Just above the item list (whether grid or table), a thin gold rule and an uppercase label shows you exactly what you're looking at — for example, `ACTIVE · 14 items`. This updates live as you change filters or search.

### Card Actions

Each card has a row of action buttons at the bottom (all ≥48px for comfortable tapping on mobile):

| Button | What it does |
|--------|-------------|
| **EDIT** | Opens the dedicated Edit Item page (`/admin/item/:id/edit`) — a single-page form with photo management (add, delete, promote to cover), all item fields, condition dropdown, and cannabis/fireworks profiles. Identical experience on mobile and desktop. |
| **ARCHIVE** | Sets `status: archived` — hides the item from public listings without moving it to the Recycle Bin |
| **DELETE** | Moves the item to the Recycle Bin (`status: deleted`) |
| **RESTORE** | Visible on deleted items only — returns the item to Draft status |

Click the item **thumbnail** to open the **AI Assistant Drawer** for that item without navigating away.

### Stock Controls

If a stock count has been set on an item, **−** and **+** buttons appear on the card. See [Stock Management](/admin/stock-management) for details.

---

## Table View

The Table view is a spreadsheet-style grid — the best mode for bulk operations and column-by-column data sweeps.

### Grouping

Select a **Group by** dimension in the toolbar and the table body splits into collapsible group sections, matching the same Group Display Order used by Grid mode.

### Inline Editing

Click any cell to edit it in place. Press **Tab** to advance to the next editable cell, **Shift+Tab** to go back. Changes save instantly to Firestore on blur.

### Sorting & Column Visibility

Click any column header to sort ascending or descending. Use the **Columns ▾** menu (top-right of the table) to show or hide columns — useful for narrowing to just the fields you need.

### Row Selection & Batch Actions

Tick the checkbox in the first column to select individual rows. Tick the header checkbox to select all visible rows. The moment you select a row, a **Selection Banner** slides in directly below the search and filter toolbar — right where your eye already is.

The banner has two zones separated by a divider:

**Left zone — count & dismiss**

| Element | What it does |
|---------|-------------|
| **Count badge** | Shows how many rows are selected (e.g. `4`) |
| **× button** | Clears the selection without taking any action |

**Right zone — grouped actions**

| Button | Group | What it does |
|--------|-------|-------------|
| **✨ Descriptions** | AI | Dispatches the Gemini AI pipeline for all selected items |
| **$ Prices** | AI | Runs the AI price-suggestion model for all selected items |
| **Delete** | CRUD | Moves all selected items to the Recycle Bin (requires confirmation) |
| **Restore** | CRUD | Restores all selected Recycle Bin items to Draft status (appears only under the Recycle Bin filter) |

If a batch AI job partially fails, an error band appears below the banner with a description of what failed. Dismiss it with the × button.

### Per-Row AI

Every row has a **✨** (description) and **$** (price) button in the AI column for single-item dispatch. Clicking either opens the AI Assistant drawer for that item.

---

## Recycle Bin

Filter by **Recycle Bin** to view soft-deleted items. From here:

- **Restore** individual cards (Grid mode) or use **Restore** in the batch bar (Table mode) to return items to Draft.
- **Empty Recycle Bin** (Admin only) permanently deletes everything in the bin. This cannot be undone.

---

## Key Rules

- **Sold Items:** Items marked as `Sold` automatically appear in the "Recently Sold" strip on the public storefronts.
- **Reserved Items:** Reserved items are hidden from public search but visible in the admin view until the reservation expires or is completed.
- **Out of Stock:** A zero quantity shows an **Out of Stock** label in the admin view. The item stays `Active` on the storefront — archive or mark it sold to remove it from public listings.
- **Police Hold:** Items flagged with a police hold (`policeHold: true`) are immediately hidden from all public views. Only Admins can set or clear this flag — available in Table view via the Police Hold cell.

---

*Primary Personas: Staff (inventory_staff / manager / admin)*
*Cornwall Island · Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
