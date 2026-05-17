# Intake Process

The intake process is the primary workflow for adding new items to The Pawn Shop inventory. It is designed to ensure data quality and visual consistency.

## Step 1: Create a Draft

Staff members begin by entering the basic details:
- **Title:** A clear, concise name for the item.
- **View:** Select where the item should appear (Pawn, Cannabis, or Fireworks).
- **Category:** The specific type of item (e.g., Watches, Flower, Roman Candles).

Saving these details creates a **Draft** in the system.

## Step 2: Details and Media

Once a draft is created, staff can add more detailed information:
- **Description:** A plain-language description for customers.
- **Condition:** Select the appropriate grade.
- **Price:** Enter the value in CAD.
- **Photos:** Upload at least one high-quality photo.

### Automated Image Processing
When you upload a photo:
1.  The system adds a "The Pawn Shop" watermark.
2.  The image is converted to WebP for fast loading.
3.  The original file is deleted to save space.

## Step 3: Publication

Before an item can go live, it must pass a validation check. The following are **mandatory**:
- Title, Category, and View
- Description
- Condition
- Valid Price
- At least one processed image

Clicking **Publish** generates search tokens and makes the item `Active` on the selected storefront.

## Step 4: Post-Publication Actions

### QR Labels
After publishing, the system generates a unique QR label. Staff can print this label and attach it to the physical item in the store. Scanning this label allows staff or customers to quickly view the item's digital listing.

### eBay Integration
High-value items in the `Pawn` view can be pushed to eBay with a single click, allowing for cross-platform selling while maintaining synchronized inventory status.
