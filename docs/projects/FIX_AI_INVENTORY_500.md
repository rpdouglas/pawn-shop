# BUGFIX — Inventory AI 500 Errors (generateAIDescription / suggestAiPrice)
**Status:** ✅ CLOSED — 2026-06-08
**Priority:** HIGH
**Effort:** Small (< 1 dev-hour)
**Cycle:** 32

---

## Problem

`generateAIDescription` and `suggestAiPrice` Cloud Functions return HTTP 500 when triggered from
the Inventory page (`AiAssistantPanel`, `InventoryTable`). The error originates from Gemini API
rejecting the model ID `gemini-3.1-pro`, which is an **invalid model** (never existed).

## Root Cause

`functions/operations/lib/index.js` (the deployed bundle) is **stale**. It was last built at
commit `b758cb7` (Algorithmic Markdown Engine). The source file `functions/operations/src/ai.ts`
was subsequently updated in commit `bd3ae16` to replace `gemini-3.1-pro` → `gemini-2.5-pro`,
but the bundle was **never rebuilt and redeployed**.

**Evidence:**
- Source `src/ai.ts` line 14: `model: 'gemini-2.5-pro'` (correct)
- Bundle `lib/index.js` line 207417: `model: "gemini-3.1-pro"` (banned — never existed)
- `functions/operations/lib/` is tracked in git (`.gitignore` only covers `functions/lib/`, not
  `functions/operations/lib/`)
- CI/CD pipeline (`deploy-dev.yml`) deploys **Hosting only** — functions are deployed manually

## Compliance

- No Firestore schema changes
- No new AI keys on client
- No PII exposure
- Audit logs unaffected (the 500 occurs before any write)

## Files Affected

| File | Change |
|------|--------|
| `functions/operations/lib/index.js` | Rebuilt from source — `gemini-3.1-pro` → `gemini-2.5-pro` |
| `docs/projects/FIX_AI_INVENTORY_500.md` | This file |
| `docs/plans/FIX_AI_INVENTORY_500_PLAN.md` | Three-strategy plan |
| `docs/decisions/0006-ai-inventory-model-fix.md` | Decision log |
| `docs/EPICS.md` | E96 backlog entry added |
| `docs/ACTIVE_CYCLE.md` | Completion row added |

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (Vite frontend) | ✅ PASS — `built in 4.39s` |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| Model ID in rebuilt bundle | ✅ CONFIRMED — `gemini-2.5-pro` (line 207417) |
| `gemini-3.1-pro` absent from bundle | ✅ CONFIRMED — grep returns zero matches |

---

## Next Step

Run `firebase deploy --only functions --project nats-rack` to push the rebuilt bundle to production.
E96 tracked on backlog to permanently fix the stale bundle structural issue.
