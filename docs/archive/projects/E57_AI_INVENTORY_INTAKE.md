# E57 Project Spec: AI-First Inventory Intake Flow
**Status**: Closed

## Overview
The current inventory intake flow requires manual data entry before photo capture and AI evaluation. This project reverses that funnel: staff will first select the storefront (Pawn, Cannabis, Tobacco, Fireworks), then upload a photo. An AI Cloud Function (via Gemini Vision) will analyse the photo to automatically populate the required inventory fields specific to that storefront. Furthermore, the AI will perform a pricing deep-dive, retrieving the Average Regular Price, Average Sale Price, and Average Refurbished/Open-Box Price in CAD.

## Requirements
1. **Flow Reversal:** Update both desktop (`IntakeForm.tsx`) and mobile (`MobileIntakePage.tsx`) flows.
   - Step 1: Select Storefront.
   - Step 2: Upload Photo.
   - Step 3: AI extraction and form pre-fill.
2. **AI Extractor:** Expand `functions/src/ai.ts` to include a new callable function that receives the image and the storefront type, returning structured JSON with the applicable fields.
3. **Pricing Deep Dive:** The AI must query or estimate (using Gemini 1.5 Pro capabilities) the CAD pricing metrics (Regular, Sale, Refurb).
4. **Staff Review:** The AI output must populate the form as a *draft*. Staff must review, edit, and approve the data before saving it to Firestore.

## Persona Impact
- **Staff (Marie/Admin):** Drastically reduces data entry fatigue. Ensures consistent classification and robust initial data for pricing decisions.
- **Dale:** Accurate and competitive pricing out-of-the-gate based on deep-dive market data.

## Compliance
- Gemini API key must never touch the client. The image analysis must occur securely in a Cloud Function.
- The AI pricing data is an *estimate* and must not automatically set the final sale price without explicit staff validation.
