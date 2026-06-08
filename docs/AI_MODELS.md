# Active AI Models (As of June 2026)

This document is the **single source of truth** for Gemini model IDs used in Cloud Functions.
**Read this before touching any file in `/functions` that calls the Gemini API.**
Never change a model ID without verifying it against this document and the official [Gemini API model list](https://ai.google.dev/gemini-api/docs/models).

---

## Models in Use — `functions/operations/src/ai.ts`

| Role | Model ID | Status | Used For |
|---|---|---|---|
| `model` (primary) | `gemini-2.5-pro` | Stable GA | `generateAIDescription`, `suggestAiPrice` primary path |
| `flashModel` (fallback) | `gemini-3.5-flash` | Stable GA | Quota/503 fallback; `extractIntakeData` primary |
| `liteModel` (budget) | `gemini-3.1-flash-lite` | Stable GA | `suggestAiTags`, high-volume simple tasks |

## Models in Use — `functions/src/ai.ts`

| Role | Model ID | Status | Used For |
|---|---|---|---|
| `model` (primary) | `gemini-2.5-pro` | Stable GA | Description and pricing generation |
| `flashModel` (fallback) | `gemini-2.5-flash` | Stable GA | Quota/503 fallback |

---

## Full 2026 Model Reference

### Stable GA — safe for production

| Model ID | Notes |
|---|---|
| `gemini-2.5-pro` | Mature, stable reasoning. No surprise deprecations. |
| `gemini-2.5-flash` | Reliable low-latency. Proven in production. |
| `gemini-2.5-flash-lite` | Budget/high-volume. |
| `gemini-3.5-flash` | Latest stable Flash. Best agentic + coding performance. |
| `gemini-3.1-flash-lite` | Current stable lite model. Low-cost extraction + tagging. |

### Preview — do NOT use in production Cloud Functions

| Model ID | Notes |
|---|---|
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro — preview only, not GA as of June 2026. |
| `gemini-3.5-pro` | Not yet released. |

### Deprecated / Shut Down — never use

| Model ID | Shut Down |
|---|---|
| `gemini-2.0-flash` | June 1, 2026 |
| `gemini-2.0-flash-lite` | June 1, 2026 |
| `gemini-1.5-flash-8b` | September 24, 2025 |
| `gemini-3.1-pro` | **Never existed** — invalid ID that caused production 500s |

---

## Rules

- Never use a model ID that does not appear in the Stable GA table above.
- Never use a Preview model in a deployed Cloud Function.
- When Google releases new models, update this document first, then update the code.
- Fallback chains must only use models from the Stable GA table.
- Right-size: do not use a Pro model for tasks `flash-lite` can handle accurately.
