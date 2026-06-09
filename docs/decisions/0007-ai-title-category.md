# Decision 0007 — AI Inventory Enrichment: Title + Category Generation + Image Pass-Through

**Date:** 2026-06-09
**Epic:** E97 · AI Inventory Assistant — Vision-First Enrichment
**Cycle:** 32
**Status:** Implemented

---

## Context

The inventory AI assistant (`generateAIDescription` CF) was generating descriptions without access
to the product image, and its output never included a suggested title or category. Staff had no
way to use AI to improve title/category from the inventory view. The pricing CF (`suggestAiPrice`)
operated on thin metadata only — it received no description context. Four gaps were found:

1. Images not passed from `AiAssistantPanel` or `InventoryTable.triggerAi`
2. `generateAIDescription` schema included no `title` or `category` output
3. `suggestAiPrice` received no description context
4. `batchProcessItems` not deployed (separate — tracked as E98)

---

## Decision

### 1. `generateAIDescription` output expanded
The CF output schema is extended to include `title` (max 80 chars) and `category`. Both are
saved to `items/{id}/internal/ai` as `aiTitle` and `aiCategory`. These are draft-only — staff
must explicitly click "Apply Title" / "Apply Category" to promote to the public item document.

### 2. Images passed from client to CF
`AiAssistantPanel` and `InventoryTable.triggerAi` now include `images: item.images` in the
`generateAIDescription` payload when the item has at least one image URL. The CF already
accepted optional images — only the client was failing to send them.

### 3. `suggestAiPrice` receives description context
An optional `aiDescription` field is added to the `suggestAiPrice` payload. When present, it is
appended to the pricing prompt so Gemini has richer item context when reasoning about eBay comps.

### 4. New schema fields in `items/{id}/internal/ai`
`aiTitle` (string) and `aiCategory` (string) added to `firestore-schema.md` and the Firestore
rules already cover the `internal/ai` document with staff-only access — no rules change needed.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Auto-apply AI title/category without staff review | Violates the staff-review gate; `aiDescription` pattern already established |
| Single "Analyze Item" button replacing two buttons | User explicitly wants separate description and pricing steps |
| Two-pass vision pipeline (Strategy C) | Extra Gemini call per item doubles API cost; current SDK handles images in a single call |

---

## Compliance Notes

- `aiTitle` and `aiCategory` stored in `internal/ai` — Firestore rules already restrict to staff custom claims
- Staff must promote each field explicitly — no auto-write to public `items/{id}` document
- All Gemini API calls remain exclusively in Cloud Functions
- No PII introduced in any log or detail map
- `auditLogs` write path unchanged

---

*The Pawn Shop · docs/decisions/0007-ai-title-category.md · 2026-06-09*
