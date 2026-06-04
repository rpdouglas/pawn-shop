# AI Intake Deep Dive: Description and Price Generation

**Role/Persona:** Principal Architect  
**Purpose:** Audit and deep dive into the AI Intake pipeline for The Pawn Shop, detailing how initial data extraction, descriptions, and pricing guidance are generated.

---

## 1. The Intake Pipeline Overview

The AI Intake process acts as a multi-stage pipeline, deeply integrated with Firebase Cloud Functions and the Google Generative AI (Gemini) SDK. The design cleanly separates raw data extraction from polished generation, and enforces a strict Staff-in-the-Loop policy for all customer-facing content.

The primary document structure utilized is the `items/{id}/internal/ai` subcollection. As defined in `docs/firestore-schema.md`, this is a staff-only restricted document. No AI-generated content or pricing guidance is ever surfaced directly to the customer.

## 2. Stage 1: Initial Image Extraction (`extractIntakeData`)

The intake begins when staff use the `MobileIntakePage` to snap a photo and upload it. 
- **Trigger:** The client calls the `processUploadedImage` Cloud Function.
- **Image Handling:** The uploaded image is pulled from temporary Firebase Storage, watermarked using the `sharp` library, and then converted to WebP. 
- **AI Processing:** The `extractIntakeData` function is invoked, utilizing Gemini Vision capabilities (attempting `gemini-flash-latest` first for speed, falling back to `gemini-pro-latest` on rate limits).
- **Extraction Goal:** The prompt instructs the AI to behave as an expert receiving an item for the specified store section (`viewTag`). It extracts two primary JSON structures:
  1. `suggestedFields`: Generates a baseline title, category, description, condition, brand, and format.
  2. `marketPricing`: Runs a preliminary market deep dive to estimate `avgRegularPriceCents`, `avgSalePriceCents`, and `avgRefurbPriceCents`.
- **Storage:** The result is saved into `items/{id}/internal/ai` under the `intakeExtraction` map.

## 3. Stage 2: Description Generation (`generateAIDescription`)

Once basic item data is verified, staff can trigger the description generation. 

- **Trigger:** Callable Cloud Function `generateAIDescription`.
- **Model:** Defaults to `gemini-pro-latest` for higher reasoning quality, falling back to Flash if quota limits are hit.
- **The Prompt Constraints (Brand Guardrails):**
  - **Persona:** Expert product copywriter for The Pawn Shop.
  - **Voice:** "dapper, precise, editorial. The description should be 150–250 words."
  - **Strict Rules:**
    - Never generate Kanien'kéha language (flag cultural context for staff).
    - Use Canadian English spelling.
    - Never invent condition grades or specifications.
    - Never use scarcity language without data backing.
    - For Cannabis items: Use "boutique wellness framing only. No slang."
- **Inputs:** The AI receives the Item's Title, Category, ViewTag, Condition, Provenance Notes, Serial Number, and any Staff Notes.
- **Output:** Returns a draft description, suggested merchandising tags, and optional cultural notes. 
- **Storage:** The draft is saved as `aiDescription` in the `items/{id}/internal/ai` document. **Staff must explicitly promote this draft** to `items/{id}.description` before it is visible to customers.

## 4. Stage 3: Pricing Analysis (`suggestAiPrice`)

Pricing generation is designed to act strictly as guidance, leaving the final decision to the staff.

- **Trigger:** Callable Cloud Function `suggestAiPrice`.
- **The Prompt Constraints:**
  - **Persona:** Pricing Analyst.
  - **Task:** Analyze eBay sold listings (simulated based on the AI's training data) to provide a price range.
  - **Rules:** 
    - Always frame output as a range (`low` and `high`), never a single absolute price.
    - Always state the basis for the recommendation.
    - Calculate in CAD cents (integers).
    - Never frame the suggestion as "correct" or "recommended".
- **Inputs:** The AI evaluates Title, Category, Condition, Brand/Model, and Staff Notes.
- **Output:** Returns a JSON object containing the `low`, `high`, `source` (rationale), `confidenceLevel`, and a hardcoded `note: "Guidance only."`
- **Storage:** Saved to `items/{id}/internal/ai` under the `aiPriceSuggestion` map. Staff use this internally to set the final `cost` (internal) and `price` (public) fields.

## 5. Security & Auditing

- **Audit Logging:** Every AI generation action (Description generation, Pricing generation) writes a tamper-proof entry to the `auditLogs` collection (e.g., `ai_description_generated`, `ai_price_suggested`), logging the actor UID, the item ID, and the generated details.
- **Data Isolation:** `items/{id}/internal/ai` is strictly gated by Firestore security rules. Even if a bug occurred on the frontend, standard users and unauthenticated guests mathematically cannot read the AI pricing data or drafts.
