# Managing Pawn Loans

The Pawn Shop staff dashboard provides a central interface for managing active pawn loan tickets, tracking due dates, processing redemptions, and handling item forfeiture.

## Accessing the Loan Dashboard

1. Sign in to your staff account.
2. Navigate to **Admin > Loans** in the sidebar.
3. The dashboard displays all active pawn loans with details including:
   - Item description
   - Loan amount
   - Due date
   - Current status (e.g., Active, Redeemed, Forfeited)

## Issuing a Loan Ticket

When a customer accepts a pawn offer:
1. Approve the pawn request.
2. Enter the **Principal Amount** and **Term**.
3. A loan ticket will be generated automatically, calculating the due date and interest based on the term.

## Processing Loan Redemptions

When a customer wants to retrieve their pawned item:
1. Locate the active loan ticket in the dashboard.
2. Click **Redeem**.
3. The system will calculate the total redemption amount (principal + interest).
4. Once payment is processed, the system will update the loan status to **Redeemed** and the item status will be set back to active so the customer can pick it up.

## Manual Forfeiture

If a loan passes its due date without payment:
1. The system will send SMS reminders 3 days before the due date.
2. Once the due date has passed, the loan becomes eligible for forfeiture.
3. Click the **Forfeit** button next to the expired loan.
4. Review any local jurisdiction compliance rules before confirming (e.g., mandatory grace periods or final notices).
5. Confirm forfeiture. The loan status updates to **Forfeited**, and ownership of the item officially transfers to the shop for resale.

All status changes and communications are logged securely in the `auditLogs` for compliance.
