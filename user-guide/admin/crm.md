# CRM & Retention

The **CRM Dashboard** is the primary tool for Managers to track customer engagement, reward loyalty, and manage long-term relationships across all three storefronts.

## The Customer Directory

Access the directory at `/admin/crm`. This view provides a high-level list of all registered customers, including their current engagement score and VIP status.

### Customer Profiles

Each customer has a dedicated profile page (`/admin/crm/:uid`) containing:
1.  **Lifetime Value (LTV):** The total value of all completed reservations and purchases (stored in CAD cents).
2.  **Purchase History:** A complete log of every item they have successfully collected.
3.  **Inquiry History:** A record of every pawn enquiry submitted.
4.  **Cross-View Flag:** Indicates if the customer has browsed multiple storefronts (Pawn, Cannabis, or Fireworks) in a single session.

## Rewarding Loyalty

We cater to the **Kevin** and **Marcus** personas through structured loyalty tiers.

### VIP Flag
The **VIP Flag** is a manual toggle set by staff. VIPs receive early access to "Finds of the Week" and priority response times for pawn enquiries.

### Reseller Tiers
For our high-volume reseller partners (like Kevin), we maintain three tiers:
- **Bronze:** Standard reseller status.
- **Silver:** Increased loan-to-value (LTV) ratios.
- **Gold:** Dedicated account manager and custom notifications.

## Automated Retention

The system automatically handles routine follow-ups to ensure no deal goes cold:
- **48h Staff Reminder:** If a pawn request remains pending for 48 hours, the system fires a reminder to the staff inbox.
- **72h Customer Follow-up:** If a quote has been issued but not accepted, the system sends an SMS reminder to the customer (if they have opted into alerts).

---

*Cornwall Island · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
