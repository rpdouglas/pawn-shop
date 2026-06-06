# E82: Cannabis Storefront Hybrid Rebuild Plan

## Overview
Rebuild the Cannabis Storefront (`CannabisPage.tsx`) to integrate the design philosophy of the American-import HTML prototype while maintaining our React infrastructure and globally unified CSS theme.

## Selected Strategy: Strategy B (The Hybrid Rebuild)
We will adopt the "American Craft, Canadian Prices" messaging and structural layout of the prototype (Hero, Marquee, Categories, Story Strip) and integrate it with our existing `LuxuryProductCard` and unified design tokens.

### Persona Impact Statement
- **Marie (Wellness Seeker):** Discovers a more straightforward navigation system (Flower, Vapes, Edibles) instead of the abstract "Moods" which better aligns with typical dispensary shopping. The dark luxury aesthetic is maintained.
- **Dale (Bargain Hunter):** The USD vs CAD price comparison on the product cards immediately proves the value proposition of the store, validating his cross-border trip.

### Compliance Checklist
- [x] Ensure category navigation (Flower, Vapes) does not bleed into CRM logs or email subject lines (must retain generic "Wellness Profile").
- [x] Ensure the 19+ age gate remains active on the `/cannabis` route.
- [x] All copy adjustments adhere to Akwesasne brand voice constraints.

### Schema Audit
- **Current Schema:** `items/{id}.category` currently stores moods (`relax`, `focus`, `social`, `ceremony`) for cannabis items.
- **Required Update:** We must update `docs/firestore-schema.md` to indicate that `category` for cannabis items will now use standard terminology: `flower`, `vapes`, `prerolls`, `edibles`, `concentrates`, `tinctures`.
- **Note:** Existing items in Firestore matching the old mood categories will need their categories updated if we expect them to populate the new tabs. (For implementation, we will map standard categories). The `CannabisProfile` already handles THC/CBD limits and terpene data.

## Implementation Steps
1. **Schema Update:** Update `docs/firestore-schema.md` to reflect the new category enumerations for Cannabis.
2. **Component Creation:**
   - Build `CannabisMarqueeStrip.tsx` (the gold scrolling marquee).
   - Build `StoryStrip.tsx` (the 3-column "Why Here" footer).
3. **Card Enhancement:**
   - Update `LuxuryProductCard.tsx` (or create a cannabis-specific variant) to include the THC/CBD progress bar UI and the USD vs CAD comparison logic (calculated by adding a `usdPriceCompare` prop or dynamically calculating a 1.37x exchange rate proxy if `cost` is not exposed).
4. **Page Refactor:**
   - Rewrite `CannabisPage.tsx` to remove `MoodCard` and `MoodPillStrip`.
   - Implement standard category tabs (All, Flower, Vapes, Edibles, Pre-Rolls, Concentrates, Tinctures).
   - Update `CinematicHero` with the prototype's copy ("American Craft. Canadian Prices.").
   - Add the new components.
