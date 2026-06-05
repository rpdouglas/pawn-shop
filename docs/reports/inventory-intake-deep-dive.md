# Inventory Intake & AI Integration Deep Dive

This report outlines the architecture and workflows for the inventory intake process across all three verticals (Pawn, Cannabis, Fireworks), along with how AI is leveraged for product descriptions and pricing guidance.

## 1. Inventory Intake Workflow (All Verticals)

The inventory intake process is designed to be highly automated, utilizing real-time Firestore listeners and Gemini Vision capabilities to extract details directly from uploaded images.

### The Pipeline
1. **Image Upload:** Staff upload an image via the `IntakeForm` component on the frontend. The image is uploaded to a temporary Firebase Storage bucket.
2. **Processing Trigger:** The frontend invokes the `processUploadedImage` Cloud Function, passing the `filePath`, a boolean `extractData=true`, and the specific `viewTag` (`pawn`, `cannabis`, or `fireworks`).
3. **Watermarking & Saving:** The function downloads the image, watermarks it using `sharp`, and saves it as a webp to the final item image path.
4. **AI Extraction:** If `extractData` is true, it passes the image buffer to the `extractIntakeData` function in `functions/operations/src/ai.ts` which handles vertical-specific logic.
5. **Real-Time Hydration:** The AI's extraction results are saved to the item's `internal/ai` Firestore document. The frontend `IntakeForm` listens to this document in real-time and auto-hydrates the UI with the suggested title, description, market pricing, and specific vertical profiles.

---

## 2. Vertical-Specific Intake Logic (`extractIntakeData`)

The `extractIntakeData` function processes the image through Gemini (defaulting to the `gemini-flash-latest` model for speed, with a fallback to `gemini-pro-latest` on quota errors).

### A. Cannabis Intake
Cannabis intake uses a two-pass AI strategy to merge visual data with an internal database:
1. **Pass 1 (Strain Identification):** The AI extracts only the strain name from the package image.
2. **Database Query:** The system queries the `cannabisStrains` Firestore collection for that strain.
3. **Pass 2 (Contextual Merge):** The retrieved reference data (terpenes, genetic lineage, effect profile, THC/CBD ranges) is passed back to Gemini in the main prompt. Gemini is instructed to intelligently merge the database reference with what it sees on the package, giving visual data precedence if there is a contradiction (e.g., THC %).
4. **Output Schema:** Extracts a `cannabisProfile` containing fields like `thcMin/Max`, `cbdMin/Max`, `terpenes`, `geneticLineage`, `effectProfile`, and `strainType`.

### B. Fireworks Intake
1. **Single Pass:** The image is analyzed using a specialized prompt with "CRITICAL FIREWORKS INSTRUCTIONS".
2. **Output Schema:** Extracts a `fireworksProfile` that captures properties from the packaging, including `explosiveWeight`, `classificationClass`, `effectType`, `shots`, `duration`, and `noiseLevel`.

### C. Pawn Intake (Default)
1. **Single Pass:** Uses a default system prompt to extract general information without a specialized profile.
2. **Output Schema:** Returns `suggestedFields` including title, category, description, condition, brand, and format.

---

## 3. AI Description Generation

Separate from the initial intake extraction, staff can request a polished, premium product description. 

- **Function:** `generateAIDescription` (Callable Cloud Function in `ai.ts`)
- **Model:** Defaults to `gemini-pro-latest`.
- **Workflow:** Takes the extracted details (title, category, condition, provenance, staff notes) and generates a 150-250 word editorial draft.
- **Guardrails (System Prompt):**
  - Brand Voice: "quiet confidence, editorial precision, occasionally witty. Never shout. Curate."
  - Cultural Safety: Never generate Kanien'kéha language; flag cultural context for staff.
  - Cannabis Rule: "boutique wellness framing only. No slang."
- **Visibility:** The result is saved to the `internal/ai` document as `aiDescription` and is **never** shown to customers. It is strictly a draft for staff review.

---

## 4. AI Pricing & Market Analysis

Pricing is generated through two distinct AI functions, neither of which actually query a live external pricing API (like eBay). Instead, they rely on Gemini's training data to provide "guidance".

### A. Initial Intake Market Pricing
During the `extractIntakeData` image processing, Gemini is prompted to estimate:
- `avgRegularPriceCents`
- `avgSalePriceCents`
- `avgRefurbPriceCents`

### B. Dedicated Pricing Analysis
Staff can also trigger a deeper pricing analysis via the `suggestAiPrice` Cloud Function:
- **Model Role:** Gemini is told, *"You are a pricing analyst for a pawn shop. Analyse eBay sold listings to provide a price range recommendation. This is GUIDANCE ONLY — it is never a final price."*
- **Mechanism:** It does not make an HTTP request to eBay. It hallucinates/extrapolates a price range based on its trained knowledge of the item's title, category, condition, and brand.
- **Format:** Always returns a low/high range, confidence level, and the "source" or reasoning behind the recommendation.

### *(Note on eBay Integration)*
While the pricing functions do not call eBay APIs, there is a separate `pushToEbay` function (`ebay.ts`) that publishes approved **Pawn** items directly to the eBay Marketplace using the eBay Sell Inventory API (`POST /sell/inventory/v1/offer`). Cannabis and Fireworks items are strictly prohibited and explicitly blocked from this push in the code.

---

## Summary of Key API Calls / Functions

| Function Name | Location | Purpose | External APIs Used |
|---|---|---|---|
| `processUploadedImage` | `inventory.ts` | Watermarks image and triggers extraction | Firebase Storage |
| `extractIntakeData` | `ai.ts` | Extracts item details and vertical profiles | Gemini Flash / Pro |
| `generateAIDescription` | `ai.ts` | Writes a premium 150-250 word draft description | Gemini Pro / Flash |
| `suggestAiPrice` | `ai.ts` | Provides estimated pricing ranges | Gemini Pro / Flash |
| `pushToEbay` | `ebay.ts` | Publishes active pawn items to eBay | eBay Sell Inventory API |
