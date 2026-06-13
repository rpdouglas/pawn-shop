# Fireworks Storefront Overview

Welcome to the Fireworks storefront — full-screen seasonal theatre, built for celebration. This section covers the hero experience, seasonal countdowns, and streamlined pre-ordering.

## Access & Age Verification

Access to the Fireworks vertical is age-gated:
- **Requirement:** Users must confirm they are **18 years of age or older**.
- **Enforcement:** An age gate is presented before accessing the storefront. Every pass and fail is logged to the audit trail.

## The Hero

The Fireworks vertical opens with a full-screen cinematic hero:

- **Canvas fireworks:** A physics-based fireworks animation plays in the hero background — rockets launch, burst, and fade in deliberate episodes separated by quiet intervals. This is the theatre before the products. The animation respects `prefers-reduced-motion` and is invisible to screen readers.
- **Featured video:** A YouTube video plays front-and-centre — stopped by default. Customers press play when ready; nothing autoplays.
- **Countdown timer:** When a staff-configured campaign is active, a live countdown appears above the video, building anticipation for the next event.
- **Staff override:** The featured video can be updated without a code deploy. Set `heroData.fireworks.youtubeId` in `config/shopInfo` via the Firebase console to swap the video. Set `mediaType: 'none'` to suppress it entirely.

## Seasonal Campaigns & Pre-Orders

The Fireworks experience is deeply seasonal:
- **Campaigns:** Real, staff-configured countdowns drive awareness (e.g., Canada Day, Victoria Day). These are authentic deadlines, not manufactured urgency.
- **Pre-Ordering:** Customers reserve holiday bundles directly from the storefront.
- **Collection SLAs:** Pre-order confirmation and pickup details are sent via SMS within 60 seconds of confirmation.

---
*Primary Persona: Tanya*
