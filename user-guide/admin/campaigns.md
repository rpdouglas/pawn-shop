# Seasonal Campaigns

The Campaign Scheduler allows The Pawn Shop to coordinate promotional events and seasonal launches (like Fireworks season or Canada Day) across all views — complete with real-time countdown timers, discount rules, and automated SMS reminders.

Navigate to **`/admin/campaigns`** to manage all campaigns.

---

## Creating a Campaign

Click **New campaign** to open the create form.

| Field | Notes |
|-------|-------|
| **Title** | Internal reference name (e.g. "Canada Day Fireworks 2026") |
| **View** | Scope: Pawn / Cannabis / Fireworks / All views |
| **Start date** | When the campaign becomes eligible to activate |
| **End date** | When the campaign expires (countdown counts to 11:59 PM this day) |
| **Banner copy** | Text shown in the storefront announcement bar (max 160 chars). Brand voice only — no "SALE", "BUY NOW", or manufactured urgency. |
| **Discount** | Optional percentage or fixed-amount (CAD cents) off |
| **Countdown timer** | When checked, a live countdown appears on the fireworks page above the video. Uses the real end date — Tanya's trust rule. |

A newly created campaign starts **inactive** and will auto-activate when its start date arrives (see Activation below).

---

## Activation

Every campaign card has an **Activate** / **Deactivate** button in the action row.

- **Activate** — goes live immediately. Use this to launch a campaign right now without waiting for the scheduler.
- **Deactivate** — takes the campaign offline immediately (banner hidden, countdown removed, discounts off).

The automated scheduler also runs every 5 minutes:
- **Auto-Activation:** transitions `active → true` when `startDate` is reached.
- **Auto-Deactivation:** transitions `active → false` when `endDate` has passed.

> The Deactivate button is the fastest way to take down a campaign in an emergency — no Firestore console access required.

---

## Editing a Campaign

Click **Edit** on any campaign card to open the inline edit form. You can update the title, view, start and end dates, banner copy, discount rule, and countdown toggle without deleting and recreating the campaign.

- The campaign's **active state** is not changed by the Edit form — use the Activate / Deactivate button separately.
- Changes save immediately to Firestore on "Save changes." The storefront reflects updates within seconds.
- Click **Cancel** to discard without saving.

---

## Countdown Timers

When **Show countdown timer** is enabled on a Fireworks campaign and the campaign is active, a live days/hours/minutes/seconds countdown appears on the Fireworks storefront **above the video**. It counts down to the campaign's end date.

Once the end date passes, the countdown shows "Event ended" until the campaign is deactivated (or the scheduler auto-deactivates it).

---

## Automated Reminder Batch

When a campaign with a **Fireworks** or **All** view tag is active and has not yet sent a reminder, the system automatically dispatches a one-time SMS to every opted-in customer.

- **When it fires:** The scheduler checks hourly. The batch runs on the first check after the campaign becomes active, provided `reminderSentAt` is not yet set.
- **What customers receive:** A message using "The Pawn Shop Update" language — no category words appear. This satisfies the Marie Discretion Test for all CRM communications.
- **Idempotency:** Once the batch has run, the campaign record displays **"Reminder sent: [date]"** in the Campaign list. The batch will not fire again for the same campaign. Do not delete and recreate a campaign to re-trigger the reminder — create a new campaign instead.
- **Zero-send behaviour:** If no opted-in customers have a phone number on file at the time of the run, `reminderSentAt` is still set to prevent retry flooding. The `auditLogs` entry will show `recipientCount: 0`.
- **Audit trail:** Every batch writes a `seasonal_reminder_sent` entry to Audit Logs with the campaign ID, view tag, and recipient count — no PII.

> **Staff note:** The "Reminder: not yet sent" / "Reminder sent: [date]" indicator in the campaign list is the canonical signal. If it shows a date, the batch already ran for that campaign.

---

## Audit Logging

Every campaign activation, deactivation, and reminder batch is recorded in the **Audit Logs**, noting the event type, campaign ID, and (for batches) the number of recipients reached. Manual activations via the button are not separately logged — the `updatedAt` timestamp on the campaign record captures when the toggle occurred.

---

*Primary Personas: Tanya & Marie*
*Cornwall Island · Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
