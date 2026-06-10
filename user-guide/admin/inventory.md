# Inventory Management

The **Inventory Management** page (`/admin/inventory`) is the central hub for overseeing every item across The Pawn Shop's four storefronts. All items — across every status and vertical — load into a single view. Your last layout (view mode, group, filter, collapsed sections) is remembered automatically between sessions.

![Admin Inventory List](/screenshots/admin-inventory-list.png)

---

## Toolbar

At the top of the page you'll find the core controls, all on one row:

- **Search** — A full-width field filters by item title in real time.
- **Status filter chips** — All · Active · Draft · Reserved · Sold · Recycle Bin. Tap any chip to narrow the list.
- **Group by** — Organise items into collapsible sections by **View Tag** (Pawn / Cannabis / Fireworks / Other), **Category** (alphabetical), **Status** (workflow order), or **None** (flat list).
- **⊞ Grid / ☰ Table** — Toggle between Grid and Table view. Your choice is remembered for next time.
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

### Card Actions

Each card has a row of action buttons at the bottom (all ≥48px for comfortable tapping on mobile):

| Button | What it does |
|--------|-------------|
| **Full Edit** | Opens the full intake form (`/admin/mobile-intake/edit/:id`) for fields not available inline (images, markdown config, provenance, etc.) |
| **Archive** | Sets `status: archived` — hides the item from public listings without moving it to the Recycle Bin |
| **Delete** | Moves the item to the Recycle Bin (`status: deleted`) |
| **Restore** | Visible on deleted items only — returns the item to Draft status |

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
