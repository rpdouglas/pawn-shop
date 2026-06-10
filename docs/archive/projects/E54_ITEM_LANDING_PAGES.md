# E54 Project Spec: Dedicated Item Landing Pages

**Status:** Done — 2026-06-02

## Overview
Currently, items are viewed via modals (`ItemQuickView`, `PreorderModal`) overlaid on top of the storefronts. Our SMS notifications and new Native Share buttons generate links in the format `/item/:id`. Clicking these links currently results in a 404 because there is no dedicated route to handle them. We need to build a landing page for individual items.

## Requirements
1. **Routing:** Implement an `/item/:id` route in `main.tsx`.
2. **Contextual Branding:** The page must detect the item's `viewTag` and apply the correct `ViewContext` (Pawn, Cannabis, Fireworks, Tobacco) so the styling matches the appropriate storefront.
3. **Age Gating:** If the item belongs to an age-restricted category, the user MUST pass the appropriate age gate before viewing the item.
4. **SEO Best Practices:** Implement dynamic document `<title>` and `<meta>` description tags based on the item's title and description.
5. **UI/UX:** Present the item in a premium, full-page layout (not just a modal) with all existing CTAs (Reserve, Favourite, Share, Enquire).

## Persona Impact
- **Sandra / Dale:** Can receive a link from a friend and land directly on a beautiful product page.
- **Kevin:** SMS alerts link directly to the item, allowing him to reserve it instantly without digging through the storefront.
- **Marie:** Cannabis links safely age-gate the recipient before displaying any product data.

## Compliance
- **Strict Age Gating:** Cannot be bypassed. Router-level or component-level interception is required.
- **Police Holds:** If an item is on `policeHold`, it must return a 404 or "Item not available" for non-staff users.
