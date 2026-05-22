# Mobile Intake

The **Mobile Intake Wizard** (`/admin/mobile-intake`) is the camera-first workflow for receiving new items on the shop floor. It is purpose-built for a single hand and a phone — no desktop required.

## Getting There

On mobile, open the **Inventory** page (`/admin/inventory`). Tap the **+** button fixed to the bottom-right corner of the screen. This launches the wizard directly.

On desktop, use the standard [Intake Process](/inventory/intake) instead.

---

## Step 1 — Photo

The first thing the wizard asks for is a photo.

- **Camera:** Tap **Take Photo** to open your device camera. The back (environment-facing) lens is selected by default for product shots.
- **Gallery:** Tap **Choose from Gallery** to select an existing image.

A thumbnail preview appears once an image is selected. You can proceed without a photo — it will be required before publishing.

### What happens to the image

Once the item is saved in Step 2, your photo is sent to the processing pipeline:
1. A "The Pawn Shop" watermark is applied.
2. The image is converted to WebP for fast loading.
3. The original file is deleted.

The processed image appears in your draft within a few seconds.

---

## Step 2 — Details

Fill in the item's core attributes. Fields marked with an asterisk are required to proceed; the rest can be completed now or updated later from the desktop inventory view.

| Field | Required | Notes |
|---|---|---|
| **Title** | Yes | Clear, concise name — e.g. "Seiko 5 Automatic" |
| **View** | Yes | Which storefront this item belongs to (Pawn, Cannabis, Fireworks, Tobacco) |
| **Category** | Yes | e.g. Watches, Flower, Roman Candles |
| **Description** | Yes | Plain-language description for customers |
| **Price (CAD $)** | Yes | Sale price — enter as dollars (e.g. `49.99`) |
| **Cost Price (optional)** | No | Your purchase cost in CAD. Staff-only — never shown to customers. Used for margin tracking. |
| **Initial Stock** | Yes | How many units you have. Defaults to `1`. |
| **Condition** | Yes | New / Like New / Good / Fair / Poor |
| **Serial Number** | No | Recommended for electronics and jewellery — triggers automatic blacklist check |

Tapping **Next** validates the required fields and creates a draft item in the system.

---

## Step 3 — Review & Publish

The review screen shows a summary of all entered details before going live:

- Title, View, Category
- Sale Price and Cost Price (or — if blank)
- Initial Stock count
- Condition and Description

Review each field. Tap **Back** to correct anything, or tap **Publish** to make the item live on the selected storefront.

### After publishing

Once published, the item's status is set to `Active` and it is immediately visible on the storefront. The wizard shows a confirmation screen. From there you can:

- **Add Another Item** — clears the wizard and returns to Step 1.

To print a QR label or push the item to eBay, open it from the desktop **Inventory Management** page.

---

## Adjusting Stock After Publication

The `−` and `+` buttons on each inventory card let you correct the stock count at any time without returning to the wizard. See [Stock Management](/admin/stock-management) for details.

---

*Primary Persona: Staff (inventory_staff)*
*The Pawn Shop · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
