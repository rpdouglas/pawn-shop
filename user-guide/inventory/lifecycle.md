# Item Lifecycle

Items move through a series of statuses as they are evaluated, listed, and eventually sold.

## Status Definitions

| Status | Description |
|--------|-------------|
| **Draft** | The initial state. Only visible to staff. Used for gathering details and photos before going live. |
| **Active** | The item is live on the storefront and searchable by customers. |
| **Reserved** | A customer has placed a hold on the item. It is hidden from general discovery but visible to the holding customer. |
| **Sold** | The item has been purchased and is no longer available. |
| **Archived** | The item has been removed from the storefront for administrative reasons. |

## The Hold System

Customers can place a **48-hour hold** on `Active` items.

1.  **Placement:** When a customer places a hold, the status changes to `Reserved`.
2.  **Expiration:** The system automatically checks for expired holds every 30 minutes.
3.  **Reversion:** If a hold expires without a purchase, the item status is automatically reverted to `Active` and made available to other customers.

## Security Controls

### Police Hold
At any point, staff can set a `Police Hold` on an item. This flag acts as a "master kill switch," immediately removing the item from all public views and search results, regardless of its current status. This is used for items reported stolen or under investigation.

## Engagement & Trending

The system dynamically evaluates item performance to aid discovery.
- **View Counts:** Every unique visitor opening an item detail page increments its `viewCount`.
- **Enquiry Counts:** Successful Click & Collect requests or Pawn Enquiries increment the `enquiryCount`.
- **Trending Score:** A background process calculates a score based on these engagement metrics, surfacing popular items in the "Trending" sections of the store.
