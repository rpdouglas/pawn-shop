# Admin Dashboard

The Admin Dashboard provides a real-time overview of The Pawn Shop's operational health and market trends. It is designed to help Managers and Admins make data-driven decisions about inventory and staffing.

## Getting There

Tap the navigation menu (☰) in the top-left corner of any page. **Admin Dashboard** appears at the foot of the drawer, below a separator — visible only to accounts with a staff role. Select it to open the dashboard.

If the link is absent, your account has not been granted a staff role. Contact your Admin to request access.

## Key Metrics

The dashboard surfaces critical data points:
- **Inventory Counts:** Breakdown of items by status (Active, Draft, Sold, Reserved).
- **View Performance:** Traffic analysis across Pawn, Fireworks, and Tobacco views — powered by GA4 via Firebase Analytics. Full ecommerce funnel data (browse → select → enquire → convert) flows into GA4 standard reports once `VITE_FIREBASE_MEASUREMENT_ID` is configured.
- **Pawn Volume:** Tracking the number of incoming pawn enquiries and their conversion status.

## Trending Items

The "Top Trending" section displays items with the highest engagement scores.
- **Scoring Logic:** Scores are calculated based on `viewCount` and `enquiryCount`.
- **Actionable Insights:** Use this list to identify high-demand categories or items that deserve a "Staff Pick" endorsement.

## Quick Actions

From the dashboard, you can quickly jump to:
- **Customers Dashboard:** Manage high-value customer profiles and reseller tiers.
- **Police Hold Manager:** Search by Firestore ID to immediately secure an item.
- **Inventory Overview:** View the complete list of items in the collection.

## Live Activity Feed

The storefronts feature a "Live Activity" stream to show real-time browsing intent.
- **Privacy Safeguards:** To protect our customers (and satisfy the **Marie Discretion Test**), the feed only displays city-level data ("Someone in Cornwall Island is browsing..."). 
- **Data Integrity:** No UIDs, names, or specific item IDs are ever written to the public activity collection.
- **Auto-Purge:** Activity data is automatically purged after 24 hours to ensure the system remains lean and ephemeral.

---
*Primary Persona: Marie (Manager)*
