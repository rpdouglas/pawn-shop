# Epic 78: AI Pipeline Precision & Reliability

## Overview
A backend optimization epic aimed at hardening the AI extraction pipeline. This focuses on preventing JSON parsing crashes, injecting real market comp data into pricing algorithms, enabling multimodal image context for generation, and aggressively reducing latency and cloud costs by right-sizing models.

## Personas & Constraints
- **Staff:** Eliminates intake parsing crashes. Provides real-time, non-hallucinated eBay market pricing to support accurate pawn loan quotes and retail pricing.
- **Jordan (Operations):** Lowers cloud expenditure by downgrading lightweight text tasks to `gemini-3.1-flash-lite` and utilizes strict `responseSchema` for API predictability.

## Technical Scope
1. **Native JSON Structured Outputs:** Refactor `@google/generative-ai` calls to use `responseMimeType: "application/json"` and `responseSchema` to eliminate parsing failures.
2. **eBay API Injection:** Integrate the `ebay.ts` Search API into `suggestAiPrice` to pull real "Sold" comps and inject them into the Gemini prompt.
3. **Multimodal Descriptions:** Pass actual uploaded image buffers into `generateAIDescription` so the AI can describe visual wear and condition.
4. **Model Right-Sizing:** Downgrade simple, low-reasoning tasks (like basic tagging or extraction) to `gemini-3.1-flash-lite` to optimize speed and cost.
5. **Cannabis Strain Fuzzy Matching:** Implement tokenized or fuzzy searching against the `cannabisStrains` database to prevent AI misspellings from breaking botanical data retrieval.

## Success Criteria
- 0 JSON parsing crashes during AI Intake.
- AI pricing suggestions reflect actual recent eBay Sold data.
- AI descriptions explicitly reference visual features present in the uploaded images.
- Decreased latency for simple classification tasks.
