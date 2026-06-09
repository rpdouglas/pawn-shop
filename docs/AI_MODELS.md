# Active AI Models (As of June 2026 — verified 2026-06-09 via `scripts/list-gemini-models.mjs`)

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
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro — confirmed in API as of 2026-06-09, preview only. |
| `gemini-3.1-pro-preview-customtools` | Variant of 3.1 Pro preview with extended tool support. |
| `gemini-3.1-flash-lite-preview` | Preview variant of `gemini-3.1-flash-lite`. |
| `gemini-3-pro-preview` | Gemini 3 Pro — early preview, not GA. |
| `gemini-3-flash-preview` | Gemini 3 Flash — early preview, not GA. |
| `gemini-3.5-pro` | **Not yet in API** as of 2026-06-09. Listed in docs speculatively; do not use. |

### Deprecated / Shut Down — never use

| Model ID | Shut Down | Notes |
|---|---|---|
| `gemini-2.0-flash` | June 1, 2026 | Still returned by API but shut down for production use |
| `gemini-2.0-flash-001` | June 1, 2026 | Pinned version of above — same status |
| `gemini-2.0-flash-lite` | June 1, 2026 | Still returned by API but shut down for production use |
| `gemini-2.0-flash-lite-001` | June 1, 2026 | Pinned version of above — same status |
| `gemini-1.5-flash-8b` | September 24, 2025 | |
| `gemini-3.1-pro` | — | **Never existed** — invalid ID that caused production 500s |

### Alias Pointers — do NOT use in production

These IDs resolve to the current latest model but will silently change when Google promotes a new version. Unpredictable in production.

| Model ID | Points To |
|---|---|
| `gemini-flash-latest` | Current latest Flash GA (resolves to `gemini-3.5-flash` as of 2026-06-09) |
| `gemini-flash-lite-latest` | Current latest Flash Lite GA |
| `gemini-pro-latest` | Current latest Pro GA |

### Specialized Models — not applicable to this project

These models are returned by the API but serve use cases outside inventory management. Do not add to the fallback chain.

| Model ID | Specialization |
|---|---|
| `gemini-2.5-flash-image`, `gemini-3-pro-image(-preview)`, `gemini-3.1-flash-image(-preview)` | Image generation (not extraction) |
| `gemini-2.5-flash-preview-tts`, `gemini-2.5-pro-preview-tts`, `gemini-3.1-flash-tts-preview` | Text-to-speech |
| `gemini-robotics-er-1.5-preview`, `gemini-robotics-er-1.6-preview` | Robotics |
| `gemini-2.5-computer-use-preview-10-2025` | Desktop computer use |
| `deep-research-*`, `deep-research-pro-preview-12-2025` | Long-form research |
| `lyria-3-clip-preview`, `lyria-3-pro-preview` | Music/audio generation |
| `gemma-4-26b-a4b-it`, `gemma-4-31b-it` | Open-weight Gemma models |
| `nano-banana-pro-preview`, `antigravity-preview-05-2026` | Internal/experimental — not for production |

---

## Rules

- Never use a model ID that does not appear in the Stable GA table above.
- Never use a Preview model in a deployed Cloud Function.
- Never use Alias Pointers (`gemini-flash-latest` etc.) — they silently change the underlying model.
- When Google releases new models, update this document first, then update the code.
- Fallback chains must only use models from the Stable GA table.
- Right-size: do not use a Pro model for tasks `flash-lite` can handle accurately.
- Re-run `node scripts/list-gemini-models.mjs` before any AI model change to verify current availability.
