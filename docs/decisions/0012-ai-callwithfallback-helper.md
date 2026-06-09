# Decision 0012 — E104 AI Function Resilience: `callWithFallback` Helper (Strategy B)

**Date:** 2026-06-09
**Epic:** E104 · AI Function Resilience
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

Four Cloud Functions (`generateAIDescription`, `suggestAiPrice`, `generateDescriptionForItem`, `suggestPriceForItem`) used a copy-pasted try/catch pattern that only triggered the Gemini fallback chain on HTTP 429 or 503. Any other error (500, 400, network errors, `RESOURCE_EXHAUSTED`, `DEADLINE_EXCEEDED`) caused immediate throw — skipping Flash and Lite entirely.

The same bug had been fixed in `extractIntakeData` in a prior session (catch ALL errors unconditionally), but because the fallback logic was copy-pasted five times, the fix was not propagated to the other four functions.

Three strategies were evaluated:

- **A:** Surgical fix — widen catch condition in all four functions individually
- **B:** Shared `callWithFallback` helper — single canonical fallback site, wire all four functions to it
- **C:** Full overhaul — helper + `timeoutSeconds` config + structured error logging

---

## Decision

**Strategy B: Shared `callWithFallback` helper.**

---

## Rationale

1. **Eliminates the structural cause, not just the symptom.** Strategy A fixes the four broken functions but leaves five copy-paste instances in place. The next model change requires five separate edits again — the same root cause that allowed the bug to persist.

2. **Single canonical fallback site.** Any future change to the cascade order (e.g., adding a new fallback tier, adjusting retry semantics) requires editing exactly one function.

3. **Accurate `auditLogs` model tracking.** The helper returns `{ result, modelUsed }` — each function now records the model that actually ran (`gemini-2.5-pro`, `gemini-3.5-flash`, or `gemini-3.1-flash-lite`) rather than hardcoding `'gemini-2.5-pro'` regardless of which fallback tier ran.

4. **`extractIntakeData` unchanged.** That function uses a graceful-degradation return (returns `null` on total failure) rather than throw semantics. `callWithFallback` throws on total failure — the two patterns serve different call sites. Leaving `extractIntakeData` as-is avoids unintended behaviour change.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy A (surgical fix only) | Fixes the immediate bug but perpetuates the copy-paste structure — next change still requires 5 edits |
| Strategy C (full overhaul + timeouts) | `timeoutSeconds` is a legitimate follow-up but is not a critical blocker — kept out of scope to minimise P0 diff surface |

---

## Compliance Notes

- `callWithFallback` catches all errors unconditionally — Flash and Lite are always attempted before throwing.
- `auditLogs.details.model` now records the actual model used — no PII introduced.
- All Gemini model IDs confirmed against `docs/AI_MODELS.md` Stable GA table before implementation.
- `suggestAiTags` left unchanged — it uses an inverted cascade (Lite primary → Pro fallback) and does not fit the `callWithFallback` signature.

---

## Files Changed

- `functions/operations/src/ai.ts` — added `callWithFallback` helper; refactored `generateAIDescription`, `suggestAiPrice`, `generateDescriptionForItem`, `suggestPriceForItem`

---

*The Pawn Shop · docs/decisions/0012-ai-callwithfallback-helper.md · 2026-06-09*
