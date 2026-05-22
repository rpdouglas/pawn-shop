# Serial Blacklist

The **Serial Blacklist** (`/admin/serial-blacklist`) is a staff-maintained database of serial numbers linked to reported stolen or flagged items. Every pawn enquiry submitted by a customer is automatically screened against this list before staff see it.

## How It Works

When a customer submits a pawn enquiry with a serial number:
1. The system compares it against the blacklist in real time.
2. If a match is found, the enquiry is flagged as a **Blacklist Hit** and a red badge appears in the Pawn Inbox.
3. Staff see the flag immediately — no item reaches the shop floor unchecked.

A `serial_blacklist_hit` event is written to the **Audit Logs** for every match. This record is immutable and cannot be deleted.

---

## Adding an Entry

Access is restricted to **Admins**.

1. Navigate to `/admin/serial-blacklist`.
2. Enter the serial number in the input field.
3. Click **Add to Blacklist**.

The entry is live immediately. Any future enquiry containing that serial will be flagged.

> Only serial numbers are stored — no customer name, no item description, no PII. The record contains the serial string, the UID of the staff member who added it, and a timestamp.

---

## Removing an Entry

If a flagged item is cleared (e.g., ownership confirmed, police release issued):

1. Locate the entry in the blacklist table.
2. Click **Remove**.

A `serial_blacklist_remove` event is written to the Audit Logs. The audit record of the original addition is preserved — entries can be removed, but the history of their addition cannot be erased.

---

## Responding to a Blacklist Hit

When the Pawn Inbox displays a red **Blacklist Hit** badge on an enquiry:

1. Do not proceed with the valuation.
2. Note the serial number and the customer's contact details from the enquiry.
3. Follow your store's standard protocol for flagged items (typically: contact the relevant authority and decline the enquiry via the inbox).

Declining the enquiry changes its status to `declined` and notifies the customer that their request cannot be processed at this time — without disclosing the reason.

---

*Primary Persona: Admin / Manager*
*The Pawn Shop · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
