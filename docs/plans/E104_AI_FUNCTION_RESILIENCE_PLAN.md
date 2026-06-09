# E104 — AI Function Resilience · Plan
**Epic:** E104 · **Status:** AWAITING APPROVAL · **Cycle:** 32

---

## Confirmed Bug Inventory

| # | Severity | Location | Description |
|---|---|---|---|
| 1 | **CRITICAL** | `generateAIDescription` line 106 | Fallback only triggers on 429/503 — any other Gemini error skips Flash/Lite entirely |
| 2 | **CRITICAL** | `suggestAiPrice` line 230 | Same narrow fallback condition |
| 3 | **CRITICAL** | `generateDescriptionForItem` line 410 | Same — batch description helper |
| 4 | **CRITICAL** | `suggestPriceForItem` line 470 | Same — batch price helper |
| 5 | **MEDIUM** | All 5 fallback sites | Copy-paste duplication — fix in one place doesn't propagate |
| 6 | **LOW** | Lines 144, 443 | `auditLogs` always records `model: 'gemini-2.5-pro'` regardless of actual model used |
| 7 | **LOW** | `generateAIDescription`, `suggestAiPrice` | No `timeoutSeconds` configured — 60s default may be tight with images |

**Root cause in one sentence:** The `extractIntakeData` fix (catch all errors) was applied in isolation to one function; the identical bug in four other functions was not noticed because the logic is copy-pasted five times.

---

## Schema Audit

No Firestore schema changes. `auditLogs` already supports arbitrary `details` map — adding a `modelActuallyUsed` key is within existing schema.

---

## Three Strategies

---

### Strategy A — Surgical Fix: Widen Catch Conditions Only

**Approach:** Minimal change. Replace the 429/503 condition check with unconditional catch in all four affected functions, exactly matching the working `extractIntakeData` pattern. Touch nothing else.

**Architecture:**
Change this pattern in 4 places:
```typescript
// BEFORE (broken)
if (err?.message?.includes('429') || err?.status === 429 || ...) {
  // fallback
} else {
  throw err  // skips fallback for all other errors
}

// AFTER (fixed — matches extractIntakeData pattern)
console.warn(`[generateAIDescription] Pro failed (${err?.status ?? err?.message}), falling back to Flash`)
try {
  result = await flashModel.generateContent(promptParts)
} catch (flashError: unknown) {
  const fe = flashError as { message?: string; status?: number }
  console.warn(`[generateAIDescription] Flash failed (${fe?.status ?? fe?.message}), falling back to Lite`)
  result = await liteModel.generateContent(promptParts)
}
```

**Files changed:** 1 (`functions/operations/src/ai.ts`)

**Trade-offs:**
- ✅ Smallest possible diff. Fastest to ship.
- ✅ No structural change — easy to review.
- ❌ Leaves 5 copy-paste instances intact. Next bug fix will again require 5 separate edits.
- ❌ Does not fix the `auditLogs` model tracking issue.
- ❌ Does not address timeout risk.

**Estimated Scope:** Small · 1 file · ~20 line change

---

### Strategy B — Shared Fallback Helper + Fix ⭐ RECOMMENDED

**Approach:** Extract the model cascade into a single reusable `callWithFallback` function. Fix the catch condition once in the helper. All four broken functions switch to it. `extractIntakeData` remains unchanged (it has different needs: graceful degradation return vs. throw). Add model tracking to `auditLogs`.

**Architecture:**

```typescript
// New internal helper — single place for all fallback logic
async function callWithFallback(
  models: { primary: GenerativeModel; flash: GenerativeModel; lite: GenerativeModel },
  promptParts: (string | Part)[],
  label: string,
): Promise<{ result: GenerateContentResult; modelUsed: string }> {
  // Try primary (Pro)
  try {
    const result = await models.primary.generateContent(promptParts)
    return { result, modelUsed: 'gemini-2.5-pro' }
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    console.warn(`[${label}] Pro failed (${e?.status ?? e?.message}), falling back to Flash`)
  }
  // Try Flash
  try {
    const result = await models.flash.generateContent(promptParts)
    return { result, modelUsed: 'gemini-3.5-flash' }
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    console.warn(`[${label}] Flash failed (${e?.status ?? e?.message}), falling back to Lite`)
  }
  // Try Lite — throw if this fails too
  const result = await models.lite.generateContent(promptParts)
  return { result, modelUsed: 'gemini-3.1-flash-lite' }
}
```

Each function then becomes:
```typescript
const { result, modelUsed } = await callWithFallback(
  { primary: model, flash: flashModel, lite: liteModel },
  promptParts,
  'generateAIDescription'
)
// ... use result.response.text() as before
// In auditLogs: details: { model: modelUsed }  ← accurate tracking
```

**Benefits:**
- One function → one bug fix site for all future model/fallback changes
- `auditLogs.details.model` reflects the model that actually ran
- Removes ~80 lines of duplicated try/catch scaffolding
- The `extractIntakeData` function (graceful degradation semantics) remains unchanged

**Files changed:** 1 (`functions/operations/src/ai.ts`)

**Trade-offs:**
- ✅ Fixes all 4 critical bugs in one place.
- ✅ Eliminates duplication — prevents the same class of bug from recurring.
- ✅ `auditLogs` now accurately records which model ran — better observability.
- ✅ Slightly larger diff, but all in one file and easy to review.
- ⚠ Refactor of live AI functions — needs careful review + full compiler gate.
- ❌ Does not address timeout risk (separate concern, low severity).

**Estimated Scope:** Small-Medium · 1 file · ~100 line net reduction

---

### Strategy C — Full Resilience Overhaul: Helper + Timeouts + Structured Logging

**Approach:** Strategy B's shared helper + explicit `timeoutSeconds` on both callable functions + structured error logging with request context (item ID, model attempted, error status).

**Additional changes beyond Strategy B:**
```typescript
// Add timeoutSeconds to both callables
export const generateAIDescription = onCall(
  { secrets: [geminiApiKey], timeoutSeconds: 120 },  // ← 2 min for image+schema
  async (request) => { ... }
)

export const suggestAiPrice = onCall(
  { secrets: [geminiApiKey], timeoutSeconds: 90 },   // ← 1.5 min; no image
  async (request) => { ... }
)

// Structured error context in catch blocks
console.error('[generateAIDescription] all models failed', {
  itemId,
  finalError: err instanceof Error ? err.message : String(err),
  modelsAttempted: ['gemini-2.5-pro', 'gemini-3.5-flash', 'gemini-3.1-flash-lite']
})
```

**Files changed:** 1 (`functions/operations/src/ai.ts`)

**Trade-offs:**
- ✅ Fixes all 4 bugs + eliminates duplication + accurate model logging + timeout protection.
- ✅ Firebase Cloud Logging captures structured `console.error` objects — each key becomes a searchable field. `itemId` in the log makes it trivial to trace a failing item.
- ✅ 120s timeout on description CF gives image fetch + Pro model call + JSON parse enough headroom.
- ⚠ Largest diff, but still one file.
- ❌ `timeoutSeconds` changes require a functions redeploy to take effect.

**Estimated Scope:** Small-Medium · 1 file · ~110 line net reduction + timeout config

---

## Recommendation

**Strategy B.** The shared `callWithFallback` helper is the minimum change that eliminates all 4 critical bugs AND removes the root structural cause (copy-paste duplication) that prevented the `extractIntakeData` fix from propagating. Strategy A is faster to write but leaves the duplication that caused the incident — the next model change will require 5 separate edits again. Strategy C's timeout fix is legitimate but can be a follow-up in a single-line PR once the critical bug is resolved.

---

## Anti-Regression Checklist

| Check | Notes |
|---|---|
| `extractIntakeData` untouched | Its graceful degradation return pattern differs — leave it as-is |
| `suggestAiTags` fallback | Already inverted (Lite primary → Pro fallback); `callWithFallback` does not apply — leave as-is |
| All model IDs unchanged | Confirmed against `docs/AI_MODELS.md` Stable GA table |
| `auditLogs` write structure | Changing `model: 'gemini-2.5-pro'` → `model: modelUsed` — no schema impact |
| No AI keys on client | Not applicable — all in Cloud Functions |
| `npx tsc -b` gate | Must pass before deployment |

---

*The Pawn Shop · docs/plans/E104_AI_FUNCTION_RESILIENCE_PLAN.md · Awaiting strategy approval*
