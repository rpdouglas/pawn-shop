# Plan — E97 · AI Inventory Assistant: Vision-First Enrichment
**Date:** 2026-06-09  
**Status:** AWAITING APPROVAL  
**Cycle:** 32

---

## 1. Investigation Findings

### What staff expect
From the inventory view, clicking ✨ should:
1. Analyze the item's product image
2. Generate a title, a category, and an editorial description
3. Allow staff to promote each field independently

Clicking $ should:
4. Take the item's current attributes — including any AI-generated description — and run a pricing exercise (eBay comps + AI reasoning)

### What actually happens (gaps)

| # | Gap | Location | Impact |
|---|-----|----------|--------|
| 1 | Images never passed to `generateAIDescription` | `AiAssistantPanel.tsx:54–63`, `InventoryTable.tsx:141–150` | AI writes blind — no image analysis |
| 2 | CF only generates description, NOT title or category | `functions/operations/src/ai.ts:64–73` | User requirement unmet |
| 3 | `suggestAiPrice` receives no description context | `AiAssistantPanel.tsx:71–88`, `functions/operations/src/ai.ts:162–218` | Pricing comps are thin metadata only |
| 4 | `batchProcessItems` not deployed | `functions/src/ai.ts:562` (old monolith) | Batch ✨/$$ buttons always fail |

Gap 4 is tracked as **E98** — not in scope for this epic.

---

## 2. Persona Gate

| Persona | Test | This Epic |
|---------|------|-----------|
| **Marcus** | Primary image analyzed to dark luxury standard before description drafted | ✅ Images now passed; CF analyzes photo |
| **Jordan** | AI draft maintains editorial brand voice; title/category accurate | ✅ Vision-informed title + category + description |
| **Staff** | Workflow is coherent: image → description → pricing in sequence | ✅ Description feeds pricing context |

---

## 3. Schema Audit

### Existing fields used (no change needed)
Collection: `items/{id}/internal/ai`  
Fields: `aiDescription`, `aiPriceSuggestion`, `aiTagSuggestions`, `intakeExtraction` — all in `firestore-schema.md`

### New fields required
**These must be added to `firestore-schema.md` before any code is written.**

| Field | Type | Notes |
|-------|------|-------|
| `aiTitle` | string | Gemini-suggested title draft — staff must promote to `items/{id}.title` before it is customer-visible |
| `aiCategory` | string | Gemini-suggested category draft — staff must promote to `items/{id}.category` |

No other schema changes. No new collections.

---

## 4. Three Strategies

---

### Strategy A — Image Pass-Through Only (Small)

**Architecture:**
- Pass `item.images[0]` (if present) to `generateAIDescription` from both `AiAssistantPanel` and `InventoryTable.triggerAi`.
- No CF changes needed — the operations CF already supports an optional `images` field.
- No schema changes.

**Files changed:** 2
- `src/components/admin/AiAssistantPanel.tsx` — add `images: item.images` to the CF payload
- `src/components/admin/InventoryTable.tsx` — add `images: item.images` to `triggerAi`

**Persona Lens:**
- Marcus: ✅ AI now sees product photos
- Jordan: Partial — description quality improves; still no title/category suggestion
- Staff: Partial — pricing still uses thin context

**Compliance:** All pass. No schema changes. No new AI keys on client.

**Trade-offs:**
- Pro: 30-minute fix, zero risk
- Con: Doesn't fulfill the stated requirement (title + category generation). Doesn't improve pricing context. User will need to ask for more.

**Estimated Scope:** Small — 2 files, no CF changes, no bundle rebuild required

---

### Strategy B — Full Feature: Vision + Title/Category + Pricing Context (Medium) ← RECOMMENDED

**Architecture:**
1. **Schema (pre-flight gate):** Add `aiTitle` and `aiCategory` to `docs/firestore-schema.md` and create `docs/decisions/0007-ai-title-category.md`.
2. **CF operations `generateAIDescription`:** Expand output schema to generate `title` and `category` alongside the existing draft/tags. Save `aiTitle` and `aiCategory` to `items/{id}/internal/ai`. Accept and use `images` when passed.
3. **CF operations `suggestAiPrice`:** Add optional `aiDescription` parameter to the pricing prompt. If provided, include it as context for the eBay comps analysis.
4. **UI `AiAssistantPanel`:** Pass `item.images` to the description CF. Add `aiTitle`/`aiCategory` display and "Apply Title" / "Apply Category" promote buttons. When calling `suggestAiPrice`, read the current `aiData.aiDescription` from state and include it in the payload.
5. **UI `InventoryTable.triggerAi`:** Pass `item.images` to the description CF.
6. **UI `InventoryPage`:** Add `handleApplyTitle` and `handleApplyCategory` Firestore update handlers. Pass them as new props to `AiAssistantPanel`.

**Files changed:** 7
| File | Change |
|------|--------|
| `docs/firestore-schema.md` | Add `aiTitle`, `aiCategory` to `items/{id}/internal/ai` table |
| `docs/decisions/0007-ai-title-category.md` | Decision log |
| `functions/operations/src/ai.ts` | `generateAIDescription`: add `title`/`category` to output schema, pass images; `suggestAiPrice`: add `aiDescription` param |
| `src/components/admin/AiAssistantPanel.tsx` | New props `onApplyTitle`, `onApplyCategory`; pass images; show/promote aiTitle/aiCategory; feed description to price CF |
| `src/components/admin/InventoryTable.tsx` | Pass `item.images` in `triggerAi` |
| `src/pages/admin/InventoryPage.tsx` | Add `handleApplyTitle`, `handleApplyCategory`, pass to `AiAssistantPanel` |

**Persona Lens:**
- Marcus: ✅ AI sees image, vision informs both title and description
- Jordan: ✅ Accurate title + category + editorial description at scale
- Staff: ✅ Full workflow: image → title/category/description → pricing with context

**Compliance:**
- `aiTitle` and `aiCategory` stored in `internal/ai` — never customer-readable without explicit staff promotion
- Staff must click "Apply Title" / "Apply Category" — no auto-apply
- All Gemini calls remain in Cloud Functions
- `auditLogs` writes unchanged

**Trade-offs:**
- Pro: Fulfills the stated user requirement completely. Coherent workflow end to end.
- Con: Requires CF rebuild and manual `firebase deploy`. ~7 files to touch.

**Estimated Scope:** Medium — 5 source files + 1 schema doc + 1 decision doc

---

### Strategy C — Full Feature + Batch Migration (Large)

Everything in Strategy B, plus:

**Additional Architecture:**
- Migrate `batchProcessItems` from `functions/src/ai.ts` (old monolith, not deployed) to `functions/operations/src/ai.ts`
- The batch helper `generateDescriptionForItem` reads `images` from Firestore during the batch run and passes to the CF
- Export `batchProcessItems` from `functions/operations/src/index.ts`
- This fixes the silent batch failure (Gap 4 / E98)

**Additional files changed:** +2
| File | Change |
|------|--------|
| `functions/operations/src/ai.ts` | Migrate + update `batchProcessItems` + `generateDescriptionForItem` + `suggestPriceForItem` helpers |
| `functions/operations/src/index.ts` | Export `batchProcessItems` |

**Total files changed:** 9

**Trade-offs:**
- Pro: Fixes both per-item AND batch workflows in one cycle. Eliminates the E98 backlog item.
- Con: Larger blast radius. Batch migration requires reading from Firestore items to get images — adds complexity. Risk of introducing regression in the batch path if helpers differ subtly from the per-item path.

**Estimated Scope:** Large — 7 source files + 1 schema doc + 1 decision doc

---

## 5. Anti-Regression Check

All three strategies pass:
- No hardcoded hex values — CSS tokens only
- No invented Firestore fields — schema update is pre-flight gate
- AI keys remain in Cloud Functions
- `rare-find` / `limited-edition` / `staff-pick` — AI suggestions are drafts, not auto-applied
- No PII in logs — `auditLogs` entries unchanged
- Age gates at router level — unaffected
- No motion changes

---

## 6. Recommendation

**Strategy B** — complete the stated user requirement with minimal blast radius. Strategy A is insufficient (doesn't generate title/category). Strategy C is worth doing but the batch migration adds risk; it should ship as E98 after B is stable.

---

## 7. Execution Gate (after approval)

1. Update `docs/firestore-schema.md` (pre-flight — blocked until done)
2. Create `docs/decisions/0007-ai-title-category.md`
3. Edit `functions/operations/src/ai.ts`
4. Edit `src/components/admin/AiAssistantPanel.tsx`
5. Edit `src/components/admin/InventoryTable.tsx`
6. Edit `src/pages/admin/InventoryPage.tsx`
7. Rebuild operations bundle: `npm --prefix functions/operations run build`
8. Run gates: `npm run build` · `npm run lint` · `npm run test` · `npx tsc -b`
9. Report: **All gates PASS**
10. User runs: `firebase deploy --only functions --project nats-rack`

---

*The Pawn Shop · docs/plans/E97_AI_INVENTORY_ENRICHMENT_PLAN.md · 2026-06-09*
