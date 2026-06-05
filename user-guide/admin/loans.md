# Managing Pawn Loans

The Pawn Shop staff dashboard provides a central interface for managing active pawn loan tickets, tracking due dates, and processing extension requests.

## Accessing the Loan Dashboard

1. Sign in to your staff account.
2. Navigate to **Admin > Loans** in the sidebar.
3. The dashboard displays all active pawn loans with details including:
   - Item description
   - Loan amount
   - Due date
   - Current status (e.g., Active, Extension Requested)

## Processing Extension Requests

When a customer requests an extension on their pawn loan, its status will change to **Extension Requested** and a **Review** button will appear next to it.

1. Click the **Review** button next to the loan.
2. Review the loan details, including the item and current due date.
3. If approving the extension, enter the **New Due Date**. Note: Customers are typically required to pay the interest fee in-store before an extension is finalized.
4. Click **Approve** to update the loan's due date, or **Decline** if the extension cannot be granted.

## Automated Forfeiture Alerts

The system runs a daily background check on all active loans. If a loan is within 48 hours of its due date, the system will automatically dispatch an SMS reminder to the customer (if they have opted in).

All status changes and communications are logged securely in the `auditLogs` for compliance.
