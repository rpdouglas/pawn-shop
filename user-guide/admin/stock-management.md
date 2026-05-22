# Stock Management

The Pawn Shop tracks a **stock quantity** for every inventory item. This gives staff a live count of how many units are on hand and surfaces an "Out of Stock" signal in the admin view when a product runs out.

---

## The Quantity Field

Every item has a `quantity` field — a whole-number count of available units. It is set when the item is first created (via either the desktop or mobile intake form) and can be adjusted at any time from the Inventory page.

- **Default:** `1` when creating a new item.
- **Zero:** Displays an **Out of Stock** label alongside the count in the inventory view. The item remains `Active` on the storefront — removing it requires a status change to `archived` or `sold`.
- **Customer visibility:** The stock count itself is not shown on the public product pages in the current release. The Out of Stock label is currently staff-facing only.

---

## Adjusting Stock

The `−` and `+` buttons appear on every item row in the inventory view — both the mobile card layout and the desktop table Stock column.

**To reduce stock by 1:** Tap `−`.  
**To increase stock by 1:** Tap `+`.

Each tap calls the `adjustInventory` Cloud Function, which:
1. Validates that you have a staff role.
2. Confirms the adjustment would not push the count below zero (the `−` button is disabled at zero).
3. Applies the change and records an `inventory_quantity_adjusted` entry in the **Audit Logs**.

The count updates immediately — you will see it change before the Cloud Function responds. If the adjustment fails (e.g., a network error), the display reverts and an error message appears beneath the control.

> Adjustments are permanent and individually logged. There is no bulk-reset option. For large stock corrections, apply adjustments in sequence or update the quantity directly via the intake form when creating a new batch.

---

## Cost Price

When receiving an item, staff can record the **purchase cost** (what the shop paid for it) alongside the sale price. This is used internally for margin tracking.

| Property | Detail |
|---|---|
| Field name | `cost` |
| Storage | `items/{id}/internal/staff` subcollection — not on the main item document |
| Visibility | Staff only. Firestore rules prevent any customer-facing query from reading this subcollection. |
| Format | CAD cents (entered as dollars in the form, e.g. `12.50`) |
| Required | No — leave blank if not tracking margin on a given item |

Cost Price is entered in Step 2 of the [Mobile Intake Wizard](/inventory/mobile-intake) and in the Condition & Pricing section of the [Desktop Intake Form](/inventory/intake). It is not editable from the Inventory Management page after creation — use the intake form when receiving new stock to capture cost at point of entry.

---

## Audit Trail

Every quantity adjustment writes an immutable `inventory_quantity_adjusted` entry to the **Audit Logs**. Each record contains:

- The item ID
- The signed delta (e.g. `−1` or `+3`)
- The resulting new quantity
- The UID of the staff member who made the adjustment
- A server-generated timestamp

Audit log entries cannot be modified or deleted. See [Audit Logs](/admin/audit-logs) for how to query them.

---

*Primary Personas: Staff (inventory_staff / manager)*
*The Pawn Shop · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
