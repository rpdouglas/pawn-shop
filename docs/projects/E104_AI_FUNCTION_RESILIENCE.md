# E104 — AI Function Resilience
**Status:** ✅ CLOSED — 2026-06-09
**Priority:** P0
**Effort:** Small — 1 file
**Cycle:** 32

---

## Problem

`generateAIDescription` and `suggestAiPrice` (and their batch equivalents) fail whenever `gemini-2.5-pro` returns any error other than HTTP 429 or 503. The fallback chain is never triggered — the function throws immediately with `HttpsError('internal', 'Failed to generate AI description.')`.

The same bug was fixed in `extractIntakeData` this session (catch ALL errors, not just 429/503), but the fix was not propagated to the other four functions.

## Root Causes

### Bug 1 — [CRITICAL] Narrow fallback condition (4 locations)

```typescript
// All four functions have this pattern:
if (err?.message?.includes('429') || err?.status === 429 ||
    err?.message?.includes('503') || err?.status === 503) {
  // fallback
} else {
  throw err  // ← skips Flash/Lite entirely for ANY other error
}
```

Common Gemini errors that bypass the fallback:
- HTTP 500 (model internal error — happens frequently under load)
- HTTP 400 (bad request — can occur with complex schemas or large prompts)
- Network errors (no `.status` property at all — condition never matches)
- `RESOURCE_EXHAUSTED` errors with non-429 status
- `DEADLINE_EXCEEDED` from Cloud Function timeout

**Affected:** `generateAIDescription` (line 106), `suggestAiPrice` (line 230), `generateDescriptionForItem` (line 410), `suggestPriceForItem` (line 470).

**Fixed in:** `extractIntakeData` (lines 768-779) — catches all errors unconditionally.

### Bug 2 — [MEDIUM] Duplicated fallback logic (5+ copy-paste instances)

The same try/catch fallback pattern is copy-pasted across `generateAIDescription`, `suggestAiPrice`, `suggestAiTags`, `generateDescriptionForItem`, and `suggestPriceForItem`. This is why the `extractIntakeData` fix was not propagated — there was no single place to fix.

### Bug 3 — [LOW] `auditLogs` always hardcodes `model: 'gemini-2.5-pro'`

Lines 144 and 443 log `{ model: 'gemini-2.5-pro' }` regardless of which fallback model actually ran. This hides whether Flash or Lite was used, making production debugging significantly harder.

### Bug 4 — [LOW] No function timeout configuration

`generateAIDescription` and `suggestAiPrice` do not set `timeoutSeconds` in the `onCall` options. The Cloud Functions v2 default is 60s. Requests with images + complex schemas can approach this limit under load.

## Personas Served

| Persona | Relevance |
|---|---|
| **Staff** (primary) | AI description and price suggestion must not fail silently on production inventory |
| **Jordan** | AI draft quality depends on models being tried in order — Lite descriptions are lower quality |

## Out of Scope

- Changing model IDs (confirmed valid in `docs/AI_MODELS.md`)
- Changes to `extractIntakeData` (already fixed)
- Schema changes

---

## Gate Results

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — built in 3.77s |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` types introduced | ✅ PASS — `callWithFallback` uses `unknown` with explicit cast |
| No schema changes | ✅ PASS — `auditLogs.details` is a flexible map; `model` key within existing definition |
| No AI keys on client | ✅ PASS — all calls remain in Cloud Functions |
| `extractIntakeData` untouched | ✅ PASS — graceful-degradation semantics preserved |
| `suggestAiTags` untouched | ✅ PASS — inverted cascade (Lite primary) left as-is |
| Decision logged | ✅ PASS — `docs/decisions/0012-ai-callwithfallback-helper.md` |
