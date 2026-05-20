# Reservations Inbox

The **Reservations Inbox** is the central dashboard for managing active Click & Collect holds placed by customers.

## Getting There

Navigate to `/admin/reservations` from the Admin Desktop Portal sidebar under the **Customer** group.

## Understanding a Reservation

When a customer places a hold on an `Active` item, its status transitions to `Reserved`. The item is hidden from public discovery but remains visible in the admin view.

Each reservation card displays:
- **Customer name and contact details**
- **Item title, condition, and price**
- **Hold expiry time** — reservations automatically expire after 48 hours if not actioned

## Managing the Queue

### Completing a Reservation

When the customer arrives in-store and collects their item:

1. Locate the reservation in the inbox.
2. Confirm the customer's identity and collect payment.
3. Mark the reservation as **Collected**. The item status transitions to `Sold` and is immediately removed from all storefronts.

### Releasing a Hold

If a customer cannot collect within their window, or requests a cancellation:

1. Locate the reservation in the inbox.
2. Click **Release Hold**.
3. The item status reverts to `Active` and becomes discoverable again. Any customers (**Kevin**) with a matching saved search will receive an alert within 60 seconds of the restock.

### Expired Holds

The system automatically checks for expired reservations every 30 minutes. When a hold expires without action, the item reverts to `Active` automatically — no manual step is required. Expired reservations remain in the inbox for reference until manually dismissed.

## Key Rules

- **Police Hold Override:** If an item has an active `Police Hold`, it cannot be released back to `Active` via the reservations workflow. Resolve the hold status first via the [Police Holds](/admin/police-holds) tool.
- **Audit Trail:** Every hold placement, release, and completion is recorded in the immutable [Audit Logs](/admin/audit-logs).

---

*Primary Personas: Kevin (Click & Collect), Tanya (Pre-Order pickup)*

*The Pawn Shop · Cornwall Island, Akwesasne*
