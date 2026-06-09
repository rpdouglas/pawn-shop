# E97 — AI Inventory Assistant: Vision-First Enrichment
**Status:** ✅ CLOSED — 2026-06-09
**Priority:** HIGH
**Effort:** Medium (~0.5 developer-days actual)
**Cycle:** 32

---

## Problem

When staff fire the AI assistant from the Inventory view (grid or table), the experience is
incomplete in four distinct ways:

1. **Images never reach the AI.** `AiAssistantPanel` and `InventoryTable.triggerAi` both call
   `generateAIDescription` without passing `item.images`. The CF accepts an optional `images`
   field but the client never sends it. The AI writes descriptions blind — it cannot see the product.

2. **No title or category generation.** `generateAIDescription` only outputs `draft` (description),
   `suggestedTags`, `provenanceFlag`, and `culturalNote`. Staff cannot use AI to generate or
   refine a title or category from the inventory view.

3. **Pricing context is thin.** `suggestAiPrice` is called with raw `title` / `category` /
   `condition` only — it never receives the richer AI draft description that was just generated.
   Pricing comps are done against minimal metadata.

4. **`batchProcessItems` is not deployed.** The function exists in `functions/src/ai.ts` (the
   pre-E34 monolith) but was never migrated to `functions/operations/src/`. Neither the core nor
   the operations bundle exports it. The batch AI buttons in `InventoryTable` always fail.

## Scope of This Epic

This epic fixes gaps 1–3 (per-item AI workflow). Gap 4 (batch migration) is tracked as E98.

## Compliance

- No Firestore schema changes in this epic that are not pre-approved in `firestore-schema.md`
- No AI API keys on client — all Gemini calls remain in Cloud Functions
- `aiDescription`, `aiTitle`, `aiCategory` are stored in `items/{id}/internal/ai` — never
  customer-readable until staff explicitly promotes
- `auditLogs` writes unchanged

## Files Changed

| File | Change |
|------|--------|
| `docs/firestore-schema.md` | Added `aiTitle`, `aiCategory` to `items/{id}/internal/ai` table |
| `docs/decisions/0007-ai-title-category.md` | Decision log created |
| `functions/operations/src/ai.ts` | `generateAIDescription`: added `title`/`category` to output schema and Firestore write; `suggestAiPrice`: added `aiDescription` param to prompt |
| `functions/operations/lib/index.js` | Rebuilt from updated source |
| `src/components/admin/AiAssistantPanel.tsx` | New `onApplyTitle`/`onApplyCategory` props; passes images; shows/promotes aiTitle/aiCategory; feeds description to price CF |
| `src/components/admin/InventoryTable.tsx` | Added `onApplyTitle`/`onApplyCategory` props; passes `item.images` in `triggerAi` |
| `src/pages/admin/InventoryPage.tsx` | Added `handleApplyTitle`, `handleApplyCategory` handlers; passed to both `AiAssistantPanel` and `InventoryTable` |
| `user-guide/admin/ai-assistant.md` | Updated to document new title/category generation workflow |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (Vite frontend) | ✅ PASS — `built in 5.10s` |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| Operations bundle rebuild | ✅ PASS — `7.9mb` rebuilt |
| Hardcoded hex audit | ✅ PASS — none introduced |
| AI keys on client | ✅ PASS — all calls via `httpsCallable` to Cloud Functions |
| New Firestore fields in schema | ✅ PASS — `aiTitle`, `aiCategory` added pre-flight |
| Auto-applied scarcity tags | ✅ PASS — none; staff promote gate unchanged |

---

*The Pawn Shop · docs/projects/E97_AI_INVENTORY_ENRICHMENT.md · 2026-06-09*
