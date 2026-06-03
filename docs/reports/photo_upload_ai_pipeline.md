# Photo Upload and AI Engine Pipeline Deep Dive

This report provides a detailed breakdown of how the photo upload process and the Gemini AI engine work together to automatically populate item data during the intake process at The Pawn Shop.

## 1. Client-Side Upload & Draft Flow
The upload process starts in either the desktop interface (`ImageUploadZone.tsx`) or the mobile UI (`MobileIntakePage.tsx`).

1. **Item Draft Creation**: Before any photo can be uploaded, an empty "draft" item is created via the `createDraftItem` Cloud Function. This establishes the `itemId` that will be used for both Firebase Storage paths and Firestore documents.
2. **Client-Side Compression**: Selected photos (via camera or gallery) are compressed locally in the browser using the `browser-image-compression` library to reduce size before uploading (e.g., max 0.5MB and 1920px dimensions for mobile).
3. **Storage Upload**: The compressed image is uploaded to a temporary Firebase Storage path: `items/{itemId}/uploads/{timestamp}-{filename}`.
4. **Triggering Processing**: Once the upload completes, the client manually invokes the `processUploadedImage` Cloud Function, passing the `filePath`, `viewTag`, and an `extractData` flag (which is `true` for mobile intake).

## 2. Server-Side Image Processing (`processUploadedImage`)
Located in `functions/src/inventory.ts`, this callable Cloud Function handles the heavy lifting of image transformation and triggers the AI pipeline.

1. **Watermarking & Conversion**: The function downloads the uploaded image into memory and uses the `sharp` library to:
   - Apply a dynamic SVG watermark ("© The Pawn Shop") to the bottom-right corner.
   - Convert the image to the highly efficient `.webp` format with 85% quality.
2. **Storage and Cleanup**: The final watermarked `.webp` image is saved to a permanent public bucket path (`items/{itemId}/images/`). The temporary upload is then deleted.
3. **Database Update**: The public URL of the processed image is appended to the item's `images` array in Firestore via `FieldValue.arrayUnion`.
4. **AI Trigger**: If `extractData` is true, the function reads the image buffer and passes it to the `extractIntakeData` AI function.

## 3. AI Data Extraction (`extractIntakeData`)
Located in `functions/src/ai.ts`, this function leverages the **Gemini 1.5 Pro** multimodal capabilities to analyze the image.

- **Prompt Engineering**: The system prompt instructs Gemini that it is an expert AI receiving an image for a specific section of the store (defined by the `viewTag`).
- **Structured Output**: Gemini is forced to return a strict JSON payload containing:
  - **Suggested Fields**: `title`, `category`, `description` (1-2 sentences), `condition`, and optional cannabis fields (`brand`, `format`).
  - **Market Pricing**: Estimates for Average Regular Price, Sale Price, and Refurbished Price in CAD cents.
- **Data Storage**: The parsed JSON result is saved to a secure internal subcollection: `items/{itemId}/internal/ai` under the `intakeExtraction` map.

## 4. Real-Time UI Hydration
The user experience is seamless because the client doesn't block while waiting for the AI.

- **Firestore Listeners**: The `MobileIntakePage.tsx` sets up an `onSnapshot` real-time listener on the `items/{itemId}/internal/ai` document.
- **Auto-Population**: As soon as the Cloud Function writes the `intakeExtraction` data to Firestore, the client automatically receives the update and populates the form state (`title`, `category`, `description`, `condition`, pricing).
- **Auto-Advance**: If the user is on the initial capture step, receiving this AI data automatically advances them to the "Details" step so they can review and tweak the AI's suggestions.

## 5. Auxiliary AI Workflows
Beyond the initial visual intake, the system also supports iterative AI assistance via the `AiAssistantPanel.tsx` and specific Cloud Functions in `ai.ts`:

- **Description Generation (`generateAIDescription`)**: Uses Gemini 1.5 Pro to turn raw item data into a "dapper, precise, editorial" description draft matching the brand voice, while strictly avoiding Kanien'kéha generation and hallucinated specs.
- **Pricing Analyst (`suggestAiPrice`)**: Instructs Gemini 1.5 Pro to act as a pricing analyst by evaluating eBay comps, outputting a price range and confidence level.
- **Tag Suggestion (`suggestAiTags`)**: Uses the faster Gemini 1.5 Flash to suggest predefined merchandising tags (e.g., `rare-find`, `just-arrived`).

## Summary
The pipeline effectively decouples the client from long-running AI tasks. By uploading to a temporary location and using Cloud Functions to process the image and query Gemini, the architecture ensures that API keys are kept secure. The use of real-time Firestore listeners creates a "magic" experience where the mobile app form fills itself out a few seconds after snapping a picture.
