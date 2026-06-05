# Intake Process

The Pawn Shop offers two intake paths — choose the one that fits your situation.

| Path | Best for | Route |
|---|---|---|
| **Desktop Intake** (this guide) | Desk-based receiving, high-detail items | `/admin/intake` |
| **[Mobile Intake Wizard](/inventory/mobile-intake)** | Shop-floor receiving on a phone, camera-first | `/admin/mobile-intake` |

Both paths produce the same draft item and publish to the same storefront. Use Mobile Intake when speed and camera access matter most; use the Desktop form when you need the full AI Assistant or eBay push controls at the same time.

![Admin Intake Form](/screenshots/admin-intake-form.png)

---

## Step 1: Photo & Auto-Draft

The fastest and most efficient way to start intake on desktop is the **Photo-First Workflow**. 

Simply select your target **View** (Pawn, Cannabis, or Fireworks) and immediately drag-and-drop a photo into the upload zone. This instantly triggers the **AI Assistant** (see below) to automatically create a draft and begin extracting data.

*(Note: You can still manually create a draft by typing in a Title and Category first, but dropping a photo immediately bypasses manual entry.)*

## Step 2: Details and Media

Once a draft is created, staff can add more detailed information:
- **Description:** A plain-language description for customers.
- **Condition:** Select the appropriate grade.
- **Price:** Enter the sale value in CAD.
- **Cost Price (optional):** Your purchase cost in CAD. Staff-only — never shown to customers. Used for internal margin tracking. Stored separately from the item's public record.
- **Initial Stock:** How many units you have on hand. Defaults to `1`. Can be adjusted at any time from the Inventory Management page.
- **Photos:** Upload at least one high-quality photo.

### Automated Image Processing & AI Extraction
Our AI Intake utilizes a powerful **3-stage pipeline** designed to keep staff in full control:

1. **Stage 1: Image Processing & Baseline Extraction**
   - The system adds a "The Pawn Shop" watermark, compresses the image to a WebP for fast loading, and saves it.
   - Gemini Vision analyzes the image to extract baseline details (Title, Category, Brand, Format) and populates the initial draft.
   - *Cannabis View Exception:* Runs a 2-pass extraction. First, it identifies the strain name from the package; then it queries our internal database to securely auto-populate known botanical properties (like terpenes, lineage, and effects).
2. **Stage 2: Description Generation (Staff-in-the-Loop)**
   - You can trigger "Generate AI Description" to draft a high-quality, persona-driven sales description optimized for eBay and our storefront.
   - **Crucial Policy:** This description is saved as an *internal draft*. A staff member must review and explicitly click **Promote** to apply it to the live item, enforcing our "Staff-in-the-Loop" quality standard.
3. **Stage 3: Pricing Analysis**
   - You can trigger "Suggest AI Price" to execute a deep-dive market analysis. The AI calculates recommended pricing ranges (e.g., Regular, Pawn Value) based on market data, which you can review and accept.

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
