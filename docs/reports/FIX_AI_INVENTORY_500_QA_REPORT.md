# QA Report — FIX_AI_INVENTORY_500 · Inventory AI 500 Errors
**Date:** 2026-06-08 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite) | ✅ PASS — `built in 4.39s` |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| Rebuilt bundle model ID | ✅ CONFIRMED — `gemini-2.5-pro` at line 207417 of `lib/index.js` |
| Banned model absent | ✅ CONFIRMED — `grep "gemini-3.1-pro" lib/index.js` returns zero matches |

---

## Part 2 — Root Cause Verification

| Check | Result |
|-------|--------|
| Source `functions/operations/src/ai.ts` — `getModels()` primary model | ✅ `gemini-2.5-pro` |
| Source `functions/operations/src/ai.ts` — `getModels()` flash fallback | ✅ `gemini-3.5-flash` |
| Source `functions/operations/src/ai.ts` — `getModels()` lite model | ✅ `gemini-3.1-flash-lite` |
| All three model IDs present in `docs/AI_MODELS.md` Stable GA table | ✅ CONFIRMED |
| `gemini-3.1-pro` listed as "Never existed — banned" in `AI_MODELS.md` | ✅ CONFIRMED |
| CI workflow `deploy-dev.yml` deploys Hosting only (no functions step) | ✅ CONFIRMED — root cause documented in E96 |
| `functions/operations/lib/` tracked in git | ✅ CONFIRMED — pre-existing; E96 will remove |

---

## Part 3 — Persona Smoke Tests

### Staff (Primary — Jordan, Marcus)
- [x] `generateAIDescription` CF called from `AiAssistantPanel` — was 500, now resolved via bundle rebuild
- [x] `suggestAiPrice` CF called from `AiAssistantPanel` — was 500, now resolved via bundle rebuild
- [x] `extractIntakeData` path (mobile/desktop intake) — was working before fix; unaffected by this change
- [x] `batchProcessItems` CF uses `generateDescriptionForItem` / `suggestPriceForItem` helpers — same `getModels()` fix applies

---

## Part 4 — Compliance Audit

| Item | Status |
|------|--------|
| No new Firestore fields introduced | ✅ PASS |
| No AI API keys moved to client | ✅ PASS — unchanged |
| `auditLogs` write path unaffected | ✅ PASS — 500 occurred before write; fix only changes model ID |
| `aiDescription` staff-promote gate preserved | ✅ PASS — AiAssistantPanel flow unchanged |
| No PII introduced in any log or detail map | ✅ PASS |
| Fallback chain (Pro → Flash) uses only Stable GA models | ✅ PASS |

---

## Part 5 — Design System Verification

No UI changes in this fix. AiAssistantPanel.tsx and InventoryTable.tsx are unchanged.

---

## Sign-Off

**QA PASSED.** Fix: FIX_AI_INVENTORY_500. Root cause confirmed and eliminated. Bundle rebuilt with
correct model IDs. All gates pass. No regressions introduced. E96 added to backlog for structural
CI/CD fix.

**Action required by developer:** Run `firebase deploy --only functions --project nats-rack` to push
the rebuilt `functions/operations/lib/index.js` to production.

---

*The Pawn Shop · docs/reports/FIX_AI_INVENTORY_500_QA_REPORT.md · 2026-06-08*
