# Gemini AI Assistant

The **Gemini AI Assistant** is a staff-only toolkit designed to enhance inventory metadata quality while maintaining absolute editorial control.

## The AI Toolkit

The assistant is accessible two ways:

- **Grid view:** select an item card, and the AI Assistant panel slides open on the right.
- **Table view (Inventory Table Mode):** each row has a ✨ button (title, description & tags) and a $ button (price comps) — click either to open the assistant drawer for that item. You may also select multiple rows and use the batch action bar to run AI across several items at once.

---

## Step 1 — Generate Title, Description & Tags

Click **✨ Generate Title, Description & Tags** to have Gemini analyse the item's product image and metadata, then produce a full set of draft fields:

- **Suggested Title:** A concise, accurate title based on what the AI sees in the photo (max 80 characters). Useful when an item was added with a placeholder title.
- **Suggested Category:** A specific product category (e.g. *Electric Guitar*, *Vintage Watch*, *Pre-Roll Pack*) derived from the image and item data.
- **Draft Description:** A 150–250 word editorial draft in the Pawn Shop brand voice — dapper, precise, provenance-heavy.
- **Suggested Tags:** Merchandising tags (`rare-find`, `just-arrived`, `limited-edition`) based on item characteristics.

> **Image analysis:** If the item has product photos, Gemini analyses the first image alongside the metadata. Items with photos produce significantly richer and more accurate output.

**To publish any of these drafts**, you must explicitly promote each field:

| AI Output | Promote Action |
|-----------|---------------|
| Suggested Title | **Apply Title** |
| Suggested Category | **Apply Category** |
| Draft Description | **Promote to Description** |
| Suggested Tags | **Apply Tags** |

---

## Step 2 — Pricing Comps

Click **$ Suggest Price** to receive a pricing range based on eBay sold comparables.

- **Context-aware:** If you have already generated a description in the same session, the pricing function uses that description as additional context — producing more accurate comps.
- **Guidance Only:** These ranges are for reference. The final price is always set by a staff member.
- **Confidence Level:** The assistant provides a confidence score (High/Medium/Low) based on available market data.

To set the price, click **Apply Midpoint** — this writes the midpoint of the AI range to the item's price field. You can then adjust it further.

---

## The Staff Review Gate (Crucial)

**No AI-generated content is ever visible to customers automatically.**

1. **Draft Stage:** All AI output is saved to a secure, staff-only area (`internal/ai`).
2. **Review:** Read and verify every suggested field before promoting it.
3. **Promotion:** Click the relevant **Apply** or **Promote** button for each field you accept. Fields you don't promote are discarded when you close the panel.

---

## Hard Constraints
- **Mohawk Language:** The AI is strictly forbidden from generating Kanien'kéha. Any cultural content must be reviewed and added manually by staff.
- **Discretion:** For cannabis items, the AI uses boutique wellness language only — never casual or slang terms.
- **Scarcity Tags:** `rare-find` and `limited-edition` are suggestions only. Apply them only when they are genuinely accurate — manufactured scarcity destroys brand trust.

---

*Cornwall Island · Akwesasne*  
*Dapper. Debonair. Distinctly Akwesasne.*
