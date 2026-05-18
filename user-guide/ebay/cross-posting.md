# eBay Integration & Sync

The Pawn Shop leverages eBay for global reach on high-value items. Our integration is designed to be "One-Click" while maintaining perfect inventory synchronization.

## Cross-Posting a Listing
For items in the **Pawn** storefront, staff can push the listing to eBay directly from the item's detail page in the Admin panel.

### The One-Click Flow
1.  **Optimization:** Click "Optimize for eBay" to have Gemini suggest high-SEO titles.
2.  **Push:** Clicking the **Push to eBay** button triggers a 3-step Cloud Function:
    - Creates an Inventory Item on eBay.
    - Creates a Fixed-Price Offer.
    - Publishes the Offer live.

## Automated Sold-Sync (Webhooks)
To prevent double-selling (overselling), we use real-time **Webhooks**.

- **External Sale:** If an item sells on eBay, eBay sends a secure notification to our server.
- **Auto-Update:** Our system verifies the signature and immediately updates the item's status to `Sold` in our database.
- **UI Refresh:** The item is instantly removed from the public storefront discovery grid.
