# Inventory Overview

The Pawn Shop's inventory system is designed to manage diverse product lines across three distinct storefronts while maintaining strict compliance and luxury standards.

## The Four Views

Every item in the system is assigned to a primary **View**, which determines which storefront it appears in:

- **Pawn:** Traditional and high-value items (Jewellery, Watches, Electronics). Uses an "Art Deco" discovery aesthetic.
- **Cannabis:** Premium wellness products. Requires an age gate (19+) and prioritizes discretion.
- **Fireworks:** Event-based products. Requires an age gate (18+) and emphasizes seasonal urgency.
- **Tobacco:** Premium domestic and reserve tobacco products. Requires an age gate (19+).

## Key Item Attributes

- **Price:** All prices are stored and managed in CAD cents to ensure precision.
- **Condition:** Every item is graded from `New` to `Poor`.
- **Quantity:** The stock count for each item. Set at intake (default: 1) and adjustable from the Inventory Management page using the `−` / `+` controls. Displays **Out of Stock** in the admin view when it reaches zero.
- **Cost Price:** The purchase cost paid by the shop — stored in a staff-only subcollection separate from the public item record. Used for internal margin tracking; never visible to customers.
- **Images:** High-quality photography is required. All images are automatically watermarked and converted to WebP for performance.
- **Merchandising Tags:** Staff can apply tags like `Just Arrived` or `Staff Pick` to highlight items.
- **Police Hold:** A critical safety feature that allows staff to immediately hide an item from public view for legal or security reasons.

## Management Tools

- **Intake Dashboard:** Where staff receive new items and generate descriptions.
- **Inventory Overview:** A comprehensive list of all items in the collection, accessible at `/admin/inventory`. This view allows staff to see all items across every status (Active, Draft, Sold, Reserved) in a single sortable table.

---
*The Pawn Shop · Inventory Overview*
