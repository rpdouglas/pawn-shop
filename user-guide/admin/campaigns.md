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

## Audit Logging

Every campaign activation and deactivation is recorded in the **Audit Logs**, noting which staff member created the event and the specific timeframe of the promotion.

---
*Primary Persona: Tanya & Marie*
