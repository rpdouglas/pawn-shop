# Plan: E78 — AI Pipeline Precision & Reliability

## Persona Impact Statement
- **Staff:** Dramatically improves the reliability of the AI Intake flow. JSON parsing errors currently require manual retries; utilizing native `responseSchema` ensures 100% schema compliance from the model. Injecting eBay sold data into `suggestAiPrice` transforms it from a hallucination risk into a highly trustworthy baseline for quoting pawn loans.
- **Jordan (Operations):** Implementing `gemini-3.1-flash-lite` for basic extraction tasks drops latency significantly and reduces token costs for the business while maintaining accuracy for simple tasks.

## Compliance Checklist
- [ ] Ensure AI output structure updates do not expose or leak any PII.
- [ ] Maintain the `auditLogs` for all AI generation events (`ai_description_generated`, `ai_price_suggested`).
- [ ] Ensure `ebay.ts` integration relies securely on Secret Manager for any external API credentials.
- [ ] No direct client-side calls to Gemini or eBay APIs; all traffic remains tightly controlled through the Cloud Functions `onCall` pattern.

## Schema Audit
No new top-level collections are needed. The internal AI subcollection document (`items/{id}/internal/ai`) will continue to store the results of `generateAIDescription`.
- `items/{id}/internal/ai` — Schema remains unchanged.
- `items/{id}` — Adding or updating tags based on AI suggestions remains unchanged.

---

## Strategy A: Minimal (JSON Fixes Only)
Focus strictly on the reliability of the existing pipeline without expanding its capabilities.
- Implement `responseMimeType: "application/json"` and `responseSchema` on all existing Gemini calls to stop parsing errors.
- Keep the models as they are currently (`gemini-1.5-pro` and `gemini-1.5-flash`).
- Do not implement multimodal image processing or eBay integration.
*Pros:* Quickest to implement, fixes the immediate crashing issue.
*Cons:* Leaves pricing prone to hallucination and misses the cost-saving opportunities of `flash-lite`.

## Strategy B: Recommended (Full Precision & Right-Sizing)
Execute the complete scope of E78 for a hardened, cost-effective pipeline.
- **Native JSON:** Roll out `responseSchema` to `generateAIDescription`, `suggestAiPrice`, and `processUploadedImage`.
- **eBay Integration:** Call the `ebay.ts` Search API from within `suggestAiPrice`, retrieve the top 3 recent "Sold" listings, and inject their titles and prices into the Gemini prompt as factual grounding context.
- **Multimodal Context:** In `generateAIDescription`, fetch the first image from Firebase Storage as a buffer and pass it to the Gemini prompt along with the text metadata.
- **Right-Sizing:** Switch simple extraction tools to `gemini-3.1-flash-lite` and keep complex drafting on `gemini-3.1-pro`.
- **Fuzzy Matching:** Use a lightweight string distance library (or simple tokenized regex) to match AI-extracted cannabis strain names against the internal `cannabisStrains` database.
*Pros:* Solves both reliability and accuracy issues while actively reducing cloud costs.
*Cons:* Takes slightly longer to implement the eBay API logic and Storage buffer retrieval.

## Strategy C: Robust (Agentic Verification)
Implement Strategy B, but add an automated self-healing/verification layer.
- After Gemini generates a price or description, a separate lightweight `flash-lite` validation chain reviews the output to ensure it adhered to the brand voice and didn't hallucinate features not visible in the image.
- If the output fails the internal validation, the function automatically retries before returning to the client.
*Pros:* Extremely high output quality, near-zero chance of brand voice deviations.
*Cons:* Doubles the latency and cost of the function calls due to the chained validation step.

---

**Recommendation:** Proceed with **Strategy B**. It hits all the high-value targets (reliability, real market data, cost reduction via `flash-lite`) without introducing the heavy latency overhead of chained validation loops.
