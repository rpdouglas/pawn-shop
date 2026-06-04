# Inventory Management

The **Inventory Management** page (`/admin/inventory`) is the central hub for overseeing all items across The Pawn Shop's four storefronts. The layout adapts to your device — cards on mobile, a full table on desktop.

---

## Mobile View

On viewports under 768px, items appear as a scrollable card list.

- **Search:** A full-width search field at the top filters by item title in real time.
- **Status filter chips:** Tap Any, Active, Draft, Reserved, or Sold to narrow the list.
- **Item cards:** Each card shows the item thumbnail, title, status badge, view tag, and listed price.
- **Card Actions:** Every card has an **Archive** button and a **Delete** button. Archiving hides the item; Deleting permanently wipes the item and its photos from the system (requires Manager/Admin privileges).
- **Stock controls:** If a stock count has been set, `−` and `+` buttons appear on the card. See [Stock Management](/admin/stock-management).
- **Add Item:** A **+** button fixed to the bottom-right corner opens the [Mobile Intake Wizard](/inventory/mobile-intake).

---

## Desktop View

On viewports 768px and wider, the inventory transforms into a visual grid layout, grouped intuitively by store section (`Pawn`, `Cannabis`, `Fireworks`, `Tobacco`). 

- **Grouped Categories:** Items are separated into distinct sections so you can see your stock for a particular vertical all at once.
- **Card Actions:** Provides quick access to **Archive** and **Delete** actions on each grid card.
- **AI Assistant Drawer:** Click any item card to open the **AI Assistant Toolkit** in a slide-out drawer. From here you can:
  1. **Generate Metadata:** Use Gemini to create editorial drafts and tag suggestions.
  2. **Verify Status:** Monitor items on **Police Hold** (marked with a red label).
  3. **Cross-Platform Sync:** Track items pushed to eBay via their listing IDs.

---

## Key Rules

- **Sold Items:** Items marked as `Sold` automatically appear in the "Recently Sold" strip on the storefronts to build trust with customers like **Dale**.
- **Reserved Items:** Reserved items are hidden from public search but remain visible in the admin view until the reservation expires or is completed.
- **Out of Stock:** A zero quantity displays an **Out of Stock** label in the admin view. The item remains `Active` on the storefront — archive or mark it sold to remove it from public listings.

---

*Primary Personas: Staff (inventory_staff / manager)*
*Cornwall Island · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
