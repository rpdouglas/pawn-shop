# Admin Dashboard

The Admin Dashboard provides a real-time overview of The Pawn Shop's operational health and market trends. It is designed to help Managers and Admins make data-driven decisions about inventory and staffing.

## Key Metrics

The dashboard surfaces critical data points:
- **Inventory Counts:** Breakdown of items by status (Active, Draft, Sold, Reserved).
- **View Performance:** Analysis of traffic across the Pawn, Cannabis, and Fireworks views.
- **Pawn Volume:** Tracking the number of incoming pawn enquiries and their conversion status.

## Trending Items

The "Top Trending" section displays items with the highest engagement scores.
- **Scoring Logic:** Scores are calculated based on `viewCount` and `enquiryCount`.
- **Actionable Insights:** Use this list to identify high-demand categories or items that deserve a "Staff Pick" endorsement.

## Quick Actions

From the dashboard, you can quickly jump to:
- **Police Hold Manager:** Search by Firestore ID to immediately secure an item.
- **Inventory Overview:** View the complete list of items in the collection.

## Live Activity Feed

The storefronts feature a "Live Activity" stream to show real-time browsing intent.
- **Privacy Safeguards:** To protect our customers (and satisfy the **Marie Discretion Test**), the feed only displays city-level data ("Someone in Cornwall Island is browsing..."). 
- **Data Integrity:** No UIDs, names, or specific item IDs are ever written to the public activity collection.
- **Auto-Purge:** Activity data is automatically purged after 24 hours to ensure the system remains lean and ephemeral.

---
*Primary Persona: Marie (Manager)*
