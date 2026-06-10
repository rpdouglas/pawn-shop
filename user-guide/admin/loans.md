# Managing Pawn Loans

The Pawn Shop staff dashboard provides a central interface for managing active pawn loan tickets, tracking due dates, processing redemptions, and handling item forfeiture.

## Accessing the Loan Dashboard

1. Sign in to your staff account.
2. Navigate to **Admin > Loans** in the sidebar.
3. The dashboard displays all pawn loans with details including:
   - Item description
   - Loan amount
   - Due date
   - Current status (Active, Extension Requested, Redeemed, Forfeited)
   - Signed / Unsigned badge — whether the customer has signed the agreement

## Issuing a Loan Ticket

Loan tickets are issued from the **Pawn Inbox**, not from the Loans dashboard. This applies whether the customer submitted an online enquiry or walked in at the counter — the [Pawn Inbox guide](pawn-inbox.md) covers both paths. The full three-step flow is identical in both cases: Loan Terms → Customer Signature → Print Ticket.

## Printing a Signed Ticket

If a loan ticket has been signed (green **Signed** badge), you can reprint the ticket at any time from the Loans dashboard:

1. Locate the loan ticket in the list.
2. Click the **Print** button in the row actions.
3. The browser print dialog opens. Select your printer and print.

Unsigned tickets do not have a Print button — the signature must be captured first.

## Processing Loan Redemptions

When a customer wants to retrieve their pawned item:

1. Locate the active loan ticket in the dashboard.
2. Click **Redeem**.
3. The system displays the total redemption amount (principal + interest).
4. Click **Confirm Redemption** to mark the loan as **Redeemed**. The redemption amount is recorded for the audit trail.

> **Note:** Full Stripe payment capture is coming in E79. Until then, redemptions are confirmed manually after cash or in-store payment is collected.

## Reviewing Extension Requests

When a customer requests a loan extension, the ticket status changes to **Extension Requested**:

1. Locate tickets with **Extension Requested** status and click **Review**.
2. To **approve**: enter a new due date and click **Approve**. The loan returns to Active with the updated date.
3. To **decline**: click **Decline**. The loan returns to Active with the original due date. The decline is recorded in the audit trail.

## Manual Forfeiture

If a loan passes its due date without payment:

1. The system sends an SMS reminder 48 hours before the due date (CASL opt-in required).
2. The daily scheduled job auto-forfeits overdue active loans overnight — the linked item transitions to **Active** (shop-owned for resale).
3. For earlier manual forfeiture, click the **Forfeit** button next to the active loan.
4. Review any local jurisdiction compliance rules before confirming (e.g., mandatory grace periods or final notices).
5. Confirm forfeiture. The loan status updates to **Forfeited** and the item is immediately available for resale.

All status changes and communications are logged securely in the `auditLogs` for compliance.
