# Managing the Pawn Inbox

The **Pawn Inbox** is the central dashboard for staff to review customer pawn enquiries and issue loans — both for customers who submitted an online enquiry and for walk-in customers at the counter.

## Two Ways to Start a Loan

| Path | When to use |
|---|---|
| **Online enquiry** | Customer submitted the pawn form on the website. Their request appears in the inbox automatically. |
| **Walk-in intake** | Customer arrived at the counter without submitting online. Use the **+ New Walk-in Pawn** button. |

Both paths lead into the same three-step loan issuance flow — loan terms, customer signature, and print ticket.

## Handling Online Enquiries

1. **Review:** New enquiries appear with a `Pending` status. Click **Review** on any row to expand the full detail panel.
2. **Blacklist Status:** Always check the "Blacklist Hit" indicator. If flagged (Red Badge), follow the standard security protocol before responding.
3. **Communication:** Review the item description and photos to determine a preliminary quote.
4. **Update Status:**
   - **Reviewed:** You have looked at the enquiry and are assessing it.
   - **Quoted:** You have provided a price range to the customer.
   - **Declined:** The item is not suitable for our inventory.
   - **Completed:** Set automatically when a loan ticket is issued.
5. **Save Changes:** Click **Save changes** to apply the new status and any staff notes. All status changes are logged to the audit trail.

## Walk-in Pawn Intake

When a customer arrives at the counter without having submitted an online enquiry:

1. Click the **+ New Walk-in Pawn** button at the top right of the Pawn Inbox page.
2. Fill in the customer's details — **Customer Name** is required; Phone and Email are optional but useful for SMS loan reminders.
3. Fill in the **Item Details** section. The more detail recorded, the stronger your documentation if there is ever a dispute about the item:

   | Field | Required | Purpose |
   |-------|----------|---------|
   | Item Description | Yes | Plain-language description of the item |
   | Category | Recommended | Classifies the item for records |
   | Make / Brand | Recommended | Manufacturer name (e.g. DeWalt, Apple) |
   | Model | Recommended | Model name or number |
   | Colour | Recommended | Primary colour or finish |
   | Serial Number | Recommended | Used for stolen-property blacklist check and printed on the ticket |
   | Condition | Recommended | Excellent / Good / Fair / Poor |
   | Notable Markings | If present | Engravings, scratches, stickers, damage |
   | Amount Requested | Optional | How much the customer is asking for (staff reference only) |

4. Fill in the **Identity Verification** section:
   - Select the **ID Type** from the dropdown (Driver's Licence, Status Card, Passport, or Other Government ID).
   - Check the **Government-issued photo ID verified** checkbox to confirm you have physically examined the ID.

5. Click **Continue to Loan**.

The system runs a serial blacklist check automatically. If the serial number matches a flagged item:
- The intake modal closes and the record appears in the inbox with a **Flagged** indicator.
- **Do not issue a loan** until the flag has been reviewed and cleared per the standard protocol.

If the check passes, the Loan Terms form opens immediately — continue to the steps below.

> Walk-in records appear in the Pawn Inbox with a **Walk-in** badge so they are easy to distinguish from online enquiries.

## Issuing a Loan Ticket

Once an enquiry is in **Quoted** status (or immediately after a walk-in intake), the full issuance flow runs in three steps — all within the admin dashboard.

### Step 1 — Loan Terms

1. Expand the enquiry row by clicking **Review**.
2. An **Issue Loan** button appears (only visible when status is `Quoted` and no loan has been issued yet).
3. Click **Issue Loan** to open the loan issuance form.
4. Enter the **Loan Amount** (CAD $) and **Loan Term** (days).
5. The **Interest Rate** field auto-fills to the legal maximum for this loan once both amount and term are entered. The cap is shown beneath the field — for example: *"Max for this loan: 3.95% (48% APR)"*. You may enter a lower rate; you cannot go above the displayed cap.
6. Enter the **Agreed Item Value** — the appraisal value agreed upon with the customer. This is required and printed on the ticket.
7. Select the **ID Type** from the dropdown (if not already recorded at walk-in intake).
8. Check both confirmation boxes before submitting:
   - **I have verified the customer's government-issued photo ID**
   - **The item is physically in the shop's possession**
9. Click **Issue Loan** to create the ticket. A human-readable ticket number (e.g. `PLT-20260610-A3F2`) is generated automatically.

> **Interest rate caps (Akwesasne — Ontario side):** Loans under $1,000 CAD — maximum 48% APR. Loans $1,000 CAD and over — maximum 35% APR. The system converts these annual rates to a per-period flat rate based on the loan term and blocks submission if the entered rate exceeds the cap.

### Step 2 — Customer Signature

After the loan is created, the agreement signing step opens automatically.

1. Review the **Loan Summary** with the customer — amount, rate, term, due date, agreed item value, and redemption total.
2. Read the declaration text aloud with the customer: they confirm they are 18 or older, the lawful owner of the item, and not under the influence of alcohol or drugs.
3. Ask the customer to enter their **full name** in the field provided.
4. Hand the tablet to the customer. They sign directly on screen using their finger or stylus.
5. If they make a mistake, tap **Clear signature** to start again.
6. Click **Submit Signature** — the signature is saved securely to Firebase Storage and linked to the loan ticket.

> The Submit Signature button remains disabled until both the signature canvas and the customer name field are filled in.

### Step 3 — Print the Ticket

After signing, a confirmation screen shows the ticket number and a **Print Ticket** button.

1. Click **Print Ticket** to open the browser print dialog.
2. Select the connected printer and print. The ticket is a **two-page document**:
   - **Page 1** — Shop logo, ticket number, date, issuing staff member's name; full item block (description, category, make/model, colour, serial number, condition, notable markings, agreed item value); loan amount, interest rate (per period), term, due date, redemption total, and **Annual Percentage Rate (APR)**
   - **Page 2** — Legal terms (sole-recourse clause, police hold clause, extension terms), age and ownership declaration above the customer's signature, and record retention notice
3. Hand the printed ticket to the customer. They must keep it — photo ID plus this ticket is required to redeem their item.

A loan can only be issued once per enquiry — the button is hidden if `pawnLoanId` is already set on the record.

## Internal Notes

Use the **Staff Notes** field to record internal observations or valuation research. These notes are never visible to the customer.
