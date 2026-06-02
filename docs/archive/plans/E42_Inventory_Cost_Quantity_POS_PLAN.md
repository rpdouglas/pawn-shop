# E42 · Inventory Cost, Quantity & POS Integration — Strategy Proposal

> **Status:** Awaiting approval. Do not begin implementation until `/approve <strategy>` is run.
> **Spec:** `docs/projects/E42_Inventory_Cost_Quantity_POS.md`
> **Date:** 2026-05-22

---

## Pre-Flight State Read

| Document | Key finding |
|---|---|
| `docs/ACTIVE_CYCLE.md` | Cycle 29 open. Current goal is E21 (Vitest), but E42 is the user's stated priority. |
| `docs/EPICS.md` | E42 added under Phase 10. All E41 tasks closed. |
| `docs/firestore-schema.md` | `items/{id}` has no `cost` or `quantity` field. `items/{id}/internal/ai` subcollection exists (staff-only pattern). No POS fields. |
| `docs/DECISIONS.md` | Processing-state upload bridge (E41, 2026-05-22) most recent entry. |
| `functions/src/inventory.ts` | `publishItem` CF validates 7 fields — `quantity` not required to publish. `createDraftItem` returns `itemId` immediately. |
| `src/lib/types.ts` | `Item` interface does not include `quantity`, `cost`, or POS fields. |
| `src/pages/admin/InventoryPage.tsx` | Mobile card layout + desktop table both exist. Cards have title, status, price, condition. No quantity display. |
| `src/pages/admin/MobileIntakePage.tsx` | 3-step wizard: Step 1 photo, Step 2 details (title/view/category/description/price/condition), Step 3 review. No quantity or cost fields. |
| `src/components/admin/IntakeForm.tsx` | Desktop form has pricing section. No quantity or cost fields. |
| `firestore.rules` | `items/{id}/internal/ai` staff-only rule exists. Pattern is established for adding `items/{id}/internal/staff`. |

---

## The Three Strategies

---

### Strategy A — Schema + Direct Client Writes (No New CFs)

**Summary:** Add all new fields to the schema and update the UI. Quantity adjustments are direct `updateDoc` calls from the client, protected by the existing `ProtectedRoute staffOnly` guard. No new Cloud Functions. POS groundwork is schema fields only.

**What ships:**
- Schema: `quantity` on `items/{id}`; `cost` on `items/{id}/internal/staff`; `posId`, `posSyncStatus`, `posLastSyncAt` on `items/{id}`
- Firestore rules: `items/{id}/internal/staff` staff-only rule
- `InventoryPage.tsx`: inline `−` / `+` buttons calling `updateDoc` directly from the client
- `MobileIntakePage.tsx` + `IntakeForm.tsx`: Cost and Quantity fields
- No new Cloud Functions

**Why this is tempting:** Smallest scope. Fastest to ship. The auth guard already prevents customer writes. No new CF cold-start latency for a simple integer update.

**Why it falls short:**
- **No audit trail.** Direct `updateDoc` produces no `auditLogs` entry for quantity adjustments. For a pawn shop tracking stock on items that have regulatory (cannabis, fireworks) or police-hold implications, being unable to answer "who changed this quantity and when?" is a governance gap.
- **No validation.** A client write cannot prevent `quantity < 0`. A CF can validate before writing.
- **POS sync groundwork is incomplete.** When Brother POS is ready to connect, there is no CF surface to wire the webhook into. The work will be redone.

**Verdict:** Viable short-term but accumulates tech debt that will bite at E28 (markdown engine depends on accurate quantity) and POS integration.

---

### Strategy B — CF-Gated Adjustments + POS Webhook Stub *(Recommended)*

**Summary:** Add all new schema fields. Quantity adjustments go through a new `adjustInventory` callable CF that validates the delta, writes the new quantity, and creates an `inventory_quantity_adjusted` audit log entry. A second HTTP CF (`receivePosWebhook`) is implemented as a verified stub — it validates the Brother POS HMAC signature and parses the payload, but does no live processing until credentials are supplied. Cost is written directly from the client to the `items/{id}/internal/staff` subcollection (staff role enforced by Firestore rule; cost is set once on creation, not frequently adjusted — audit logging for cost changes is a Phase 2 concern).

**What ships:**
- Schema: all new fields as above
- Firestore rules: `items/{id}/internal/staff` staff-only rule
- `adjustInventory` callable CF: `assertStaff()` → validate delta → `quantity >= 0` guard → `updateDoc` via Admin SDK → `inventory_quantity_adjusted` auditLog
- `receivePosWebhook` HTTP CF stub: HMAC-SHA256 header verification → parse payload → log event → set `posSyncStatus: 'pending'` → return 200
- `QuantityAdjustControl.tsx`: `−` / `+` buttons (≥48px), calls `adjustInventory`; shows optimistic update while CF resolves
- `MobileIntakePage.tsx` Step 2: Cost (CAD cents) + Quantity (default 1) fields
- `IntakeForm.tsx`: matching Cost + Quantity fields in pricing section
- `InventoryPage.tsx`: `QuantityAdjustControl` on cards (mobile) and table rows (desktop); "Out of Stock" badge when `quantity === 0`

**Why this is the right call:**
- Audit trail is a first-class feature, not an afterthought. Pawn shops track inventory provenance by necessity.
- CF validates `quantity >= 0` — prevents stock going negative from concurrent adjustments.
- The POS webhook stub costs ~40 lines and delivers the full integration surface (HMAC verification, payload parsing, error handling pattern) without requiring live Brother POS credentials. When credentials arrive, the processing logic drops in behind an already-verified endpoint.
- Follows existing CF patterns (`assertStaff`, `auditLogs` write via Admin SDK) — no new architectural decisions.
- Cost is set once at intake (not a high-frequency operation), so direct subcollection write is appropriate. Cost adjustment auditing can be added in a future cycle if needed.

**Tradeoff:** Two new CFs add a build/deploy step. Cold-start adds ~300ms to the first quantity adjustment in a session. Acceptable for a staff-only admin operation.

---

### Strategy C — Full Bidirectional POS Sync

**Summary:** Implement Strategy B in full, and additionally build a live bidirectional sync between Firestore and Brother POS: item publish → push to POS via Brother POS REST API; POS sale event → update Firestore `status: 'sold'` and decrement `quantity`. Includes a `posSyncQueue` CF for retry/error handling and exponential backoff.

**What ships over Strategy B:**
- `pushItemToPos` callable CF: on staff request, POST item data to Brother POS REST API; set `posId` + `posSyncStatus: 'synced'`
- `receivePosWebhook` fully implemented: POS "item sold" event → `status: 'sold'` in Firestore + `quantity--`; POS "stock update" event → update `quantity`
- `posSyncQueue` subcollection for retry handling: failed sync attempts queued and retried via scheduled CF

**Why this is premature:**
- **Brother POS API documentation has not been reviewed.** Endpoint paths, auth scheme, payload format, rate limits, and webhook delivery guarantees are unknown. Building against an undocumented API produces code that will likely require full rewrite on first contact with real credentials.
- **External dependency gate.** The eBay webhook (E06-QA) is still deferred for the same reason — no credentials. Committing to a second unverified external integration before the first one is resolved compounds risk.
- **Scope creep beyond the brief.** The user asked for "groundwork for integration" — Strategy B delivers that. Full implementation is Phase 3+ work.

**Verdict:** Plan it when Brother POS API documentation is in hand. Not now.

---

## Recommendation

**Approve Strategy B.**

It delivers everything the user described: cost field (staff-only, subcollection-isolated), quantity with initial set and adjustment, full audit trail for quantity changes, and POS integration groundwork via a verified webhook stub. It follows every existing pattern in the codebase and avoids the governance gap of Strategy A and the spec risk of Strategy C.

---

## File Surface (Strategy B)

| File | Action |
|---|---|
| `docs/firestore-schema.md` | Add `quantity`, `posId`, `posSyncStatus`, `posLastSyncAt` to `items/{id}`; add `items/{id}/internal/staff` subcollection with `cost` |
| `docs/DECISIONS.md` | Log new fields + `cost` subcollection decision |
| `firestore.rules` | Add `items/{id}/internal/staff` staff-only rule |
| `src/lib/types.ts` | Extend `Item`; add `StaffInternalDoc`, `PosSyncStatus`, `AdjustInventoryPayload` |
| `functions/src/inventory.ts` | Add `adjustInventory` callable CF |
| `functions/src/pos.ts` | New file: `receivePosWebhook` HTTP CF stub |
| `functions/src/index.ts` | Export new CFs |
| `src/components/admin/QuantityAdjustControl.tsx` | New component |
| `src/pages/admin/MobileIntakePage.tsx` | Add Cost + Quantity fields to Step 2 |
| `src/components/admin/IntakeForm.tsx` | Add Cost + Quantity fields to pricing section |
| `src/pages/admin/InventoryPage.tsx` | Render `QuantityAdjustControl`; "Out of Stock" badge |

**Estimated scope:** ~450 lines net new. No external dependencies. No schema migrations (additive only).

---

*The Pawn Shop · docs/plans/E42_Inventory_Cost_Quantity_POS_PLAN.md · 2026-05-22*
