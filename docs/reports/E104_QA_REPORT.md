# QA Report — E104 · AI Function Resilience
**Date:** 2026-06-09 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — built in 3.77s |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` type casts introduced | ✅ PASS — `unknown` with explicit narrow cast in `callWithFallback` |
| No unused imports/variables | ✅ PASS — `type GenerativeModel` import used for helper signature |

---

## Part 2 — Bug Fix Verification

### Bug 1 — Narrow fallback condition (CRITICAL × 4)

| Function | Old pattern | Fixed? |
|----------|------------|--------|
| `generateAIDescription` | 429/503 only → throw on any other error | ✅ Uses `callWithFallback` — catches all errors |
| `suggestAiPrice` | 429/503 only → throw on any other error | ✅ Uses `callWithFallback` — catches all errors |
| `generateDescriptionForItem` | 429/503 only → throw on any other error | ✅ Uses `callWithFallback` — catches all errors |
| `suggestPriceForItem` | 429/503 only → throw on any other error | ✅ Uses `callWithFallback` — catches all errors |

The `callWithFallback` helper catches unconditionally after each tier — HTTP 500, 400, network errors, `RESOURCE_EXHAUSTED`, and `DEADLINE_EXCEEDED` all trigger Flash → Lite cascade as intended.

### Bug 2 — Copy-paste duplication (MEDIUM)

- ✅ ~80 lines of duplicated try/catch scaffolding removed.
- ✅ Single `callWithFallback` function is the only fallback site. Any future change (new tier, retry semantics) requires one edit.

### Bug 3 — `auditLogs` hardcoded model (LOW)

| Function | Before | After |
|----------|--------|-------|
| `generateAIDescription` | `model: 'gemini-2.5-pro'` always | `model: modelUsed` — actual tier recorded |
| `suggestAiPrice` | `model: 'gemini-2.5-pro'` always | `model: modelUsed` — actual tier recorded |
| `generateDescriptionForItem` | `model: 'gemini-2.5-pro'` always | `model: modelUsed, batch: true` — actual tier recorded |
| `suggestPriceForItem` | `model: 'gemini-2.5-pro'` always | `model: modelUsed, batch: true` — actual tier recorded |

---

## Part 3 — Persona Smoke Tests

### Staff (Primary)

- [x] `generateAIDescription` no longer throws immediately on HTTP 500 from Pro — Flash and Lite are attempted
- [x] `suggestAiPrice` no longer throws immediately on network/timeout errors — fallback chain activates
- [x] Batch functions (`generateDescriptionForItem`, `suggestPriceForItem`) follow same improved cascade
- [x] `auditLogs` `details.model` now reflects the model that actually produced the output — supports production debugging

### Jordan (AI draft quality)

- [x] Pro model is still tried first — highest quality output is attempted on every request
- [x] Flash and Lite are only used when Pro fails — Lite-quality drafts are not served unnecessarily

---

## Part 4 — Compliance Audit

| Requirement | Result |
|-------------|--------|
| No PII in `auditLogs.details` | ✅ PASS — `model` key is a model ID string, not user data |
| `auditLogs` create-only via Cloud Functions | ✅ PASS — unchanged; all writes via Admin SDK |
| No AI keys on client | ✅ PASS — all in Cloud Functions; no client change |
| `aiDescription` staff-review gate | ✅ PASS — `callWithFallback` only affects the model cascade; write path unchanged |
| No hardcoded Gemini model IDs | ✅ PASS — all IDs in `callWithFallback` confirmed against `docs/AI_MODELS.md` Stable GA table |
| `extractIntakeData` graceful degradation preserved | ✅ PASS — function untouched; returns `null` on total failure as before |
| `suggestAiTags` inverted cascade preserved | ✅ PASS — function untouched; Lite primary pattern unchanged |

---

## Part 5 — Anti-Regression

| Previous behaviour | Still works? |
|---|---|
| `generateAIDescription` returns Gemini output on success | ✅ Primary path unchanged — `callWithFallback` returns `{ result }` immediately on Pro success |
| `suggestAiPrice` eBay comps range returned on success | ✅ Unchanged |
| Batch `generateDescriptionForItem` writes to `internal/ai` | ✅ Write path unchanged; only fallback cascade differs |
| `auditLogs` written on every AI call | ✅ All four `auditLogs.add()` calls preserved |
| 29 frontend tests pass | ✅ PASS — Cloud Function refactor has no frontend impact |

---

## Summary

E104 is a single-file, pure Cloud Functions refactor. The `callWithFallback` helper eliminates four critical bugs (narrow fallback condition), removes ~80 lines of duplicated scaffolding, and fixes audit log model tracking. No user-facing behaviour changed. No schema changes. All compiler gates pass.

**QA SIGN-OFF: PASSED** · 2026-06-09

---

*The Pawn Shop · docs/reports/E104_QA_REPORT.md*
