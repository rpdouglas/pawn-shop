# Epic 28: Algorithmic Markdown Engine (Dutch Auction)
**Status:** COMPLETED

## Overview
Phase 20 of the Retail Operations & Inventory Deepening roadmap introduces the Algorithmic Markdown Engine. This system creates a "Dutch Auction" dynamic for aging inventory. Instead of static prices, items on the showroom and webfront will automatically drop in price according to a staff-configured cadence until they hit a hard floor. 

## Personas & Constraints
- **Dale (Authenticity Test):** Price drops must be real. The drops must be based strictly on staff-configured `markdownRate` and `floorPrice`. No manufactured urgency or fake sales. High-value tags like `rare-find` and `limited-edition` are immune and exempt from automated markdown scheduling.
- **Kevin (Alert Accuracy):** Price-drop notifications must respect CASL `alertOptIn` rules. Notifications must fire within 60s of the database write, matching the existing SLA for item alerts.
- **Sandra (Visual Merchandising):** The "Price Dropped" badge must organically surface in the masonry grid via the existing `MerchandisingBadge` component. No bouncy or distracting particle animations are permitted.

## Technical Scope

### 1. Schema & Data Modeling
Update the `items/{id}` document schema in `docs/firestore-schema.md` to include markdown parameters:
- `floorPrice` (number): The absolute minimum price the item can be dropped to.
- `markdownRate` (number): The percentage or fixed dollar amount to drop per cycle.
- `markdownPeriodDays` (number): How many days between each drop cycle.
- `markdownEnabled` (boolean): Master toggle for the item.
- `lastMarkdownAt` (timestamp): Tracking for the next scheduled drop.
- `originalPrice` (number): Tracks the starting price prior to any markdowns, used to calculate the discount badge.

### 2. Cloud Functions & Backend Execution
*Note: Functions will be built in the `operations` module per the recent E34 Modular Refactor.*
- **Scheduled Cron Job:** Create `applyMarkdownDrops` in `functions/operations/src/markdownEngine.ts`. This cron will run daily at 03:00 UTC to batch-process all eligible items, drop their prices, and log `price_override` to the `auditLogs` collection.
- **Callable Configurations:** Create `enableMarkdown` and `disableMarkdown` callable functions. These must include a manager+ authorization gate.
- **Alert Triggers:** Update `functions/operations/src/notifications.ts` with a new `sendMarkdownAlert` helper. This matches saved customer searches to price drops and dispatches generic SMS/Email notifications (excluding exact pricing in the copy to pass Marie's Discretion Test).

### 3. Frontend / UI (Admin)
- Build a Markdown Configuration Panel in `src/pages/admin/InventoryPage.tsx`. This allows managers to toggle the feature and set the floor and cadence per item.

### 4. Frontend / UI (Customer)
- Enhance `src/components/ui/Card.tsx` and `src/components/pawn/MasonryGrid.tsx` to conditionally render a `MerchandisingBadge` reading "Price Dropped" when an item's current `price` is less than its `originalPrice`.

## Success Criteria
- Daily cron job safely modifies prices without manual intervention.
- Hard limits (`floorPrice`) are never breached.
- Manager-only Role-Based Access Control (RBAC) securely guards configuration endpoints.
- Storefront natively renders accurate price drop UI badges.
- CASL compliance is strictly respected for outgoing notifications.
