# Managing the Pawn Inbox

The **Pawn Inbox** is the central dashboard for staff to review and manage customer pawn enquiries.

## Workflow

1. **Review:** New enquiries appear with a `Pending` status. Click **Review** on any row to expand the full detail panel.
2. **Blacklist Status:** Always check the "Blacklist Hit" indicator. If flagged (Red Badge), follow the standard security protocol before responding.
3. **Communication:** Review the item description and photos to determine a preliminary quote.
4. **Update Status:**
   - **Reviewed:** You have looked at the enquiry and are assessing it.
   - **Quoted:** You have provided a price range to the customer.
   - **Declined:** The item is not suitable for our inventory.
   - **Completed:** Set automatically when a loan ticket is issued.
5. **Save Changes:** Click **Save changes** to apply the new status and any staff notes. All status changes are logged to the audit trail.

## Issuing a Loan Ticket

Once an enquiry is in **Quoted** status and the customer has accepted the offer:

1. Expand the enquiry row by clicking **Review**.
2. An **Issue Loan** button appears (only visible when status is `Quoted` and no loan has been issued yet).
3. Click **Issue Loan** to open the loan issuance form.
4. Enter the **Loan Amount** (CAD $), **Loan Term** (days), and **Interest Rate** (%).
5. Click **Issue Loan** to create the ticket. The loan ID is displayed on success.
6. The pawn request status automatically advances to **Completed** and a "Loan issued" badge replaces the button.

A loan can only be issued once per enquiry — the button is hidden if `pawnLoanId` is already set on the record.

## Internal Notes

Use the **Staff Notes** field to record internal observations or valuation research. These notes are never visible to the customer.
