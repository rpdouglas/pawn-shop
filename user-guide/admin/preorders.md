# Seasonal Pre-Orders

Seasonal items, such as Fireworks, use a dedicated Pre-Order system to manage high-volume demand and ensure smooth pickups.

## Pre-Order Lifecycle

Pre-orders move through several stages of validation:

1.  **Pending:** The customer has submitted their request. Staff review the item availability and quantity.
2.  **Confirmed:** Staff have accepted the order. The customer receives an immediate confirmation via SMS.
3.  **Ready:** The order is prepared for pickup. A specific **Pickup Window** is assigned, and the customer is notified via SMS.
4.  **Collected:** The customer has picked up and paid for their order at the store.
5.  **Cancelled:** The order was retracted by the customer or staff.

## Managing the Inbox

Navigate to `/admin/preorders` to manage the queue.
- **SLA Requirement:** To satisfy the **Tanya Speed Test**, SMS confirmations must be sent within 60 seconds of a status change. The system handles this automatically when you update the status in the dashboard.
- **Discretion:** Following the **Marie Discretion Test**, SMS messages are branded as "The Pawn Shop Update" and do not disclose specific product categories in the notification preview.

## Pickup Windows

Assigning a specific pickup window is mandatory before marking an order as **Ready**. This prevents store congestion and ensures staff are ready to assist the customer immediately upon arrival.

---
*Primary Persona: Tanya (Seasonal Celebrator)*
