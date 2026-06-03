# AI Product Process & Model Review

**Date:** June 3, 2026
**Reviewer:** Principal Architect (Antigravity)
**Target File:** `functions/src/ai.ts`

## 1. Current AI Product Process Overview
The application currently initializes two tiers of Gemini models via the `getModels()` function:
- **`model` (`gemini-pro-latest`)**: The heavy-lifter, used for reasoning and content generation.
- **`flashModel` (`gemini-flash-latest`)**: The speed-optimized model, used for quick tasks.

These models power four distinct AI features in the product flow:

1. **`generateAIDescription` (Uses Pro)**
   - **Task**: Generates a 150-250 word draft for a product description.
   - **Context**: Must strictly follow the "dapper, precise, editorial" brand voice of The Pawn Shop and adhere to strict cultural and tone guardrails (no Kanien'kéha generation, no scarcity language unless justified).

2. **`suggestAiPrice` (Uses Pro)**
   - **Task**: Acts as a pricing analyst to suggest a CAD price range (low/high) based on condition, category, and notes.

3. **`suggestAiTags` (Uses Flash)**
   - **Task**: Categorizes items and suggests specific approved merchandising tags (e.g., `just-arrived`, `rare-find`).

4. **`extractIntakeData` (Uses Pro)**
   - **Task**: Multimodal vision task that takes an uploaded image and extracts item fields (title, category, condition) and estimates market pricing for the intake form.

---

## 2. Model Recommendation: Flash vs. Latest (Pro)

You mentioned having access to the Gemini Flash tier (likely referring to the latest Flash capabilities, such as Gemini 1.5 Flash). Gemini Flash is exceptionally fast and cost-effective, but Pro retains an edge in complex reasoning and strict tonal adherence.

Here is the architectural recommendation for model selection across our AI features:

### A. Intake Data Extraction (`extractIntakeData`) 
**Recommendation: Switch to Flash**
- **Why**: Flash is built specifically with multimodal speed in mind. During item intake, staff are actively waiting for the form to populate from a photo. The lower latency of Flash directly reduces staff friction. Flash's vision capabilities are more than capable of extracting basic product details and estimating standard pricing parameters. 

### B. AI Description Generation (`generateAIDescription`)
**Recommendation: Keep Pro (Latest)**
- **Why**: This prompt has strict, complex system instructions ("quiet confidence", "editorially precise", avoiding specific language/cultural traps). Pro models are significantly better at adhering strictly to negative constraints and complex personas. Flash might occasionally lose the "dapper" tone and output generic retail copy. 

### C. AI Pricing Suggestion (`suggestAiPrice`)
**Recommendation: Switch to Flash (with monitoring) OR Keep Pro**
- **Why**: Flash can easily format JSON and output ranges. However, if the reasoning required to price an item based on nuanced `staffNotes` or `provenanceNotes` is high, Pro might provide more accurate market estimates. We recommend testing this with Flash to see if the quality holds up, as the latency/cost savings would be beneficial.

### D. AI Tag Suggestion (`suggestAiTags`)
**Recommendation: Keep Flash (Already implemented)**
- **Why**: Simple categorization and picking from an approved list is exactly what Flash excels at.

---

## 3. Implementation Next Steps

If approved, the next steps for a surgical update would be:
1. Update `extractIntakeData` to use `flashModel` instead of `model` to speed up the staff intake process.
2. (Optional) Run a test on `suggestAiPrice` using `flashModel` to determine if the guidance quality remains acceptable.
3. Ensure the underlying `gemini-pro-latest` and `gemini-flash-latest` aliases are mapping to the correct underlying model versions in our GCP environment.
