# Inventory Management

The **Inventory Management** page (`/admin/inventory`) is the central hub for overseeing all items across The Pawn Shop's four storefronts. Every item in the database — across all statuses and all verticals — loads into the admin view on arrival. The layout adapts to your device — cards on mobile, a full table on desktop.

![Admin Inventory List](/screenshots/admin-inventory-list.png)

---

## Mobile View

On viewports under 768px, items appear as a scrollable card list.

- **Search:** A full-width search field at the top filters by item title in real time.
- **Status filter chips:** Tap Any, Active, Draft, Reserved, or Sold to narrow the list.
- **Item cards:** Each card shows the item thumbnail, title, status badge, view tag, and listed price.
- **Card Actions:** Every card has an **Edit**, **Archive**, and **Delete** button. Archiving hides the item from public listings without removing it; Delete moves the item to the Recycle Bin.
- **Stock controls:** If a stock count has been set, `−` and `+` buttons appear on the card. See [Stock Management](/admin/stock-management).
- **Add Item:** A **+** button fixed to the bottom-right corner opens the [Mobile Intake Wizard](/inventory/mobile-intake).

---

## Desktop — Grid View

On viewports 768px and wider, switch to **Grid** mode (⊞ Grid toggle, top-right) for a visual overview grouped by store section (`Pawn`, `Cannabis`, `Fireworks`).

- **Grouped Categories:** Items separated into distinct sections so you can review stock by vertical at a glance.
- **Card Actions:** Each grid card has an **Edit** link, an **Archive** button, and a **Delete** button. Deleted items move to the Recycle Bin; restore them by switching the filter to **Recycle Bin**.
- **AI Assistant Drawer:** Click any item card to open the **AI Assistant Toolkit** in a slide-out drawer. From here you can:
  1. **Generate Metadata:** Use Gemini to create editorial drafts and tag suggestions.
  2. **Verify Status:** Monitor items on **Police Hold** (marked with a red label).
  3. **Cross-Platform Sync:** Track items pushed to eBay via their listing IDs.

---

## Desktop — Table View

Switch to **Table** mode (☰ Table toggle, top-right) for a spreadsheet-style grid built for bulk operations and fast inline edits.

### Inline Editing

Click any cell to edit it in place. Press **Tab** to advance to the next editable cell, **Shift+Tab** to go back. Changes save instantly to Firestore on blur.

### Sorting & Column Visibility

Click any column header to sort ascending or descending. Use the **Columns ▾** menu (top-right of the table) to show or hide columns — useful for narrowing to just the fields you need.

### Selecting Rows

Tick the checkbox in the first column to select individual rows. Tick the header checkbox to select all visible rows at once. The count of selected rows appears in the floating **Batch Actions** bar at the bottom of the screen.

### Batch Actions

When one or more rows are selected, the **Batch Actions** bar floats at the bottom centre of the screen. Available actions:

| Button | What it does |
|--------|-------------|
| **✨ Generate Descriptions** | Dispatches the Gemini AI pipeline for all selected items — generates editorial descriptions in the background |
| **$ Suggest Prices** | Runs the AI price-suggestion model for all selected items |
| **Delete** | Moves all selected items to the Recycle Bin (requires confirmation) |
| **Restore** | Restores all selected Recycle Bin items to Draft status (appears only when the Recycle Bin filter is active) |
| **Clear** | Deselects all rows without taking any action |

> **Delete vs Restore:** The **Delete** button appears when you are viewing any filter other than Recycle Bin. Switch to the **Recycle Bin** filter and the button becomes **Restore** — so you can recover items in the same fluid workflow.

### Per-Row AI

Every row has a **✨** (description) and **$** (price) button in the AI column for single-item dispatch. Clicking either opens the AI Assistant drawer for that item.

---

## Recycle Bin

Filter by **Recycle Bin** to view soft-deleted items. From here:

- **Restore** individual cards (grid) or use **Restore** in the batch bar (table) to return items to Draft.
- **Empty Recycle Bin** (Admin only, top-right) permanently and irreversibly removes all items in the bin.

---

## Key Rules

- **Sold Items:** Items marked as `Sold` automatically appear in the "Recently Sold" strip on the storefronts to build trust with customers like **Dale**.
- **Reserved Items:** Reserved items are hidden from public search but remain visible in the admin view until the reservation expires or is completed.
- **Out of Stock:** A zero quantity displays an **Out of Stock** label in the admin view. The item remains `Active` on the storefront — archive or mark it sold to remove it from public listings.
- **Police Hold:** Items flagged with a police hold (`policeHold: true`) are immediately hidden from public view. Only Admins can set or clear this flag.

---

*Primary Personas: Staff (inventory_staff / manager)*
*Cornwall Island · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
