# Active AI Models (As of June 2026)

This document tracks the active Google Gemini models we are using in the platform.

### Current Models in Use

*   **`gemini-3.1-pro`**: Flagship model used for advanced drafting, complex taxonomy mapping, and tasks requiring deep reasoning. (Currently implemented in `generateAIDescription` and `suggestAiPrice` fallbacks).
*   **`gemini-3.5-flash`** (or `gemini-2.5-flash` for legacy fallbacks): High-performance model used for general fast reasoning and fallback from Pro.
*   **`gemini-3.1-flash-lite`**: The most cost-efficient and lowest-latency model. This is the target model for all simple extraction, tagging, and formatting tasks where reasoning depth is not required.
*   **`gemini-3.1-flash-image`** (GA): The current model for multimodal native visual understanding.

### Deprecation Notice
*   **`gemini-1.5-flash-8b`** was officially discontinued by Google on **September 24, 2025**. It is no longer available and must not be referenced in new code or architecture plans. Any existing 1.5 references should be migrated to the 3.1 generation.

### Best Practices for this Codebase
- Do not use 1.5 models.
- Always implement robust fallbacks (e.g., if `3.1-pro` quota limits are hit, fall back to `3.5-flash`).
- Right-size models: Do not use `3.1-pro` for a task that `3.1-flash-lite` can handle with high accuracy.
