# Seasonal Campaigns

The Campaign Scheduler allows The Pawn Shop to coordinate promotional events and seasonal launches (like Fireworks season) across all views.

## Creating a Campaign

Navigate to `/admin/campaigns` to draft a new event.
- **Visibility:** Campaigns can be assigned to a specific view (e.g., Fireworks) or applied to the entire store ("All").
- **Discount Rules:** You can set a global discount (Percentage or Fixed Amount) that applies to items within the campaign's scope.
- **Banner Copy:** This text will appear in the site-wide announcement bar when the campaign is active.

## Activation & Scheduling

The system uses an automated scheduler that runs every 5 minutes.
- **Auto-Activation:** When the `startDate` is reached, the campaign status automatically transitions to `Active`.
- **Auto-Deactivation:** Once the `endDate` passes, the campaign is disabled, and any active discounts or banners are removed.
- **Countdown Timers:** If enabled, a real-time countdown will appear on the relevant storefront to build anticipation (respecting the **Tanya** requirement for real, non-manufactured dates).

## Automated Reminder Batch

When a campaign with a **Fireworks** or **All** view tag is active and has not yet sent a reminder, the system automatically dispatches a one-time SMS to every opted-in customer.

- **When it fires:** The scheduler checks hourly. The batch runs on the first check after the campaign becomes active, provided `reminderSentAt` is not yet set.
- **What customers receive:** A message using "The Pawn Shop Update" language — no category words appear. This satisfies the Marie Discretion Test for all CRM communications.
- **Idempotency:** Once the batch has run, the campaign record displays **"Reminder sent: [date]"** in the Campaign Admin page. The batch will not fire again for the same campaign. Do not delete and recreate a campaign to re-trigger the reminder — create a new campaign instead.
- **Zero-send behaviour:** If no opted-in customers have a phone number on file at the time of the run, `reminderSentAt` is still set to prevent retry flooding. The `auditLogs` entry will show `recipientCount: 0`.
- **Audit trail:** Every batch writes a `seasonal_reminder_sent` entry to Audit Logs with the campaign ID, view tag, and recipient count — no PII.

> **Staff note:** The "Reminder: not yet sent" / "Reminder sent: [date]" indicator in the campaign list is the canonical signal. If it shows a date, the batch already ran for that campaign.

## Audit Logging

Every campaign activation, deactivation, and reminder batch is recorded in the **Audit Logs**, noting the event type, campaign ID, and (for batches) the number of recipients reached.

---
*Primary Personas: Tanya & Marie*
