# Project E42: Inventory Cost, Quantity & POS Integration

**Status:** Done — 2026-05-22
**Epic:** E42 — Inventory Cost, Quantity & POS Integration
**Phase:** Phase 10 — Inventory Intelligence
**Primary Persona:** Staff (inventory_staff / manager / admin)
**Secondary Personas:** Dale (accurate stock-level trust), Kevin (alerts fire only when truly in stock)
**AI Involvement:** Claude (dev)

**Objective:** Add `cost` (margin-tracking) and `quantity` (stock level) fields to the inventory schema, allow initial quantity to be set on item creation, provide staff-facing quantity adjustment from the inventory view, and lay the schema and CF groundwork for a future Brother POS bidirectional sync — without requiring live POS credentials now.

---

## 1. User Story

> As **inventory staff**, I want to record the cost price and stock quantity of each item and adjust those levels from my phone or desktop so that I can track margins and know at a glance whether an item is in stock — and so the system is ready to sync with our Brother POS when we connect it.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Staff

> *"Staff can record cost and set initial quantity during item creation, and adjust quantity from the inventory list — all without a desktop."*

Test: On a 375px viewport, navigate to `/admin/mobile-intake`, complete the 3-step wizard including cost and initial quantity fields, publish the item, then navigate to `/admin/inventory`, find the item card, and tap the quantity adjustment control to increment or decrement stock — without a desktop.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px) — quantity adjustment controls, cost inputs, any new form fields
- [ ] All copy uses plain language — no retail jargon (e.g. "Stock Level" not "SKU Quantity")
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Feature is navigable by a low-tech mobile user in under 3 taps from the admin home

### Marie Discretion Test

- [ ] N/A — admin-only feature; no CRM or notification copy in this epic

### Marcus Photography Test

- [ ] N/A — no customer-facing item display changes in this epic

### Kevin Speed Test

- [ ] Alert fires within 60s of `status: 'active'` — existing `publishItem` CF unchanged, SLA unaffected
- [ ] CASL `alertOptIn: true` verified before every send — existing behaviour preserved

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — admin-only routes, staff authenticated via `ProtectedRoute` + MFA
- [ ] **`auditLogs` events required?** Yes — `inventory_quantity_adjusted` (eventType) whenever staff changes `quantity` via the adjust CF. Fields: `{ uid, targetId: itemId, details: { delta, newQuantity, reason } }`
- [ ] **PII exclusion** — no PII in adjustment details; `uid` of the adjusting staff member is the only identity field, consistent with existing audit log pattern
- [ ] **`policeHold` respected** — no change to existing rule; quantity adjustment does not affect hold status
- [ ] **`aiDescription` draft-only** — unchanged; `cost` is staff-only but unrelated to AI drafts
- [ ] **AI API security** — no AI API calls in this epic
- [ ] **CASL compliance** — no new notifications
- [ ] **Scarcity integrity** — `quantity` field is a real stock count, staff-set only. No algorithmic `rare-find` or `limited-edition` based on quantity level
- [ ] **`cost` visibility** — `cost` stores financial margin data. Firestore rules must prevent customer read. `cost` must live in `items/{id}/internal/staff` subcollection (not on parent document — parent is publicly readable for active items)

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read: status, title, category, viewTag, price, condition, images, policeHold
Fields written: quantity (new), posId (new), posSyncStatus (new), posLastSyncAt (new)

Collection: items/{id}/internal/staff  ← new subcollection
Fields written: cost (new)

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: inventory_quantity_adjusted
```

### New Fields Required

Update `docs/firestore-schema.md` before any implementation begins. Log in `DECISIONS.md`.

```
NEW FIELDS:
- items/{id} / quantity        — number  — Stock count integer (0 = out of stock). Staff-set. Customer-visible (safe — it is stock level, not cost).
- items/{id} / posId           — string  — Brother POS external identifier. Null until synced.
- items/{id} / posSyncStatus   — string  — 'not_synced' | 'synced' | 'pending' | 'error'
- items/{id} / posLastSyncAt   — timestamp — Last successful POS sync. Null until synced.

NEW SUBCOLLECTION:
- items/{id}/internal/staff / cost — number — Purchase cost in CAD cents. Staff-only. Never customer-readable (subcollection, rules block public access).
```

### TypeScript Interfaces

```typescript
// Extend: Item (src/lib/types.ts) — add quantity, posId, posSyncStatus, posLastSyncAt
// New: StaffInternalDoc { cost: number } — for items/{id}/internal/staff
// New: PosSyncStatus = 'not_synced' | 'synced' | 'pending' | 'error'
// New: AdjustInventoryPayload { itemId: string; delta: number; reason?: string }
```

### Security Rules Required

```javascript
// items/{id}/internal/staff — new subcollection rules:
// Allow read/write only when request.auth != null && (request.auth.token.admin == true
//   || request.auth.token.manager == true || request.auth.token.inventory_staff == true)
// Block all customer and public reads
```

---

## 5. AI Involvement Detail

### Claude (development):
- `docs/prompts/PLANNING.md` — this planning phase
- `docs/prompts/TESTING.md` — QA phase
- `docs/prompts/TICKET_CLOSE.md` — close phase

### Gemini E18 (runtime):
- Not involved.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules

- [ ] `docs/firestore-schema.md` — add `quantity`, `posId`, `posSyncStatus`, `posLastSyncAt` to `items/{id}`; add `items/{id}/internal/staff` subcollection with `cost`
- [ ] `docs/DECISIONS.md` — log all new fields and the `cost` subcollection placement decision
- [ ] `firestore.rules` — add staff-only rule for `items/{id}/internal/staff`
- [ ] `src/lib/types.ts` — extend `Item` interface; add `StaffInternalDoc`, `PosSyncStatus`, `AdjustInventoryPayload`

### Phase 2 — Cloud Functions

- [ ] `adjustInventory` callable CF (`functions/src/inventory.ts`):
  - Auth: `assertStaff()` (inventory_staff, manager, admin)
  - Input: `{ itemId, delta, reason? }` — delta is signed integer (positive = add stock, negative = remove)
  - Validates: item exists, `newQuantity = existing + delta` is ≥ 0
  - Writes: `items/{id}.quantity` via Admin SDK
  - Audit: `inventory_quantity_adjusted` log entry with `{ delta, newQuantity, reason }`
- [ ] `receivePosWebhook` HTTP CF stub (`functions/src/pos.ts`):
  - HMAC-SHA256 verification of `X-Brother-POS-Signature` header (key stored in Secret Manager)
  - Parses Brother POS event payload (item sold / stock update)
  - Stub: logs event, sets `posSyncStatus: 'pending'`, returns 200 — no live processing until POS credentials available
- [ ] Export both CFs from `functions/src/index.ts`

### Phase 3 — UI Components

- [ ] `QuantityAdjustControl.tsx` — mobile-friendly inline control:
  - `−` / `+` buttons (≥48px targets) and optional manual entry
  - Calls `adjustInventory` CF; shows spinner during call
  - Renders on each item card in mobile inventory view and on item row in desktop table
- [ ] `MobileIntakePage.tsx` — add Cost and Quantity fields to Step 2 (Details):
  - Cost: numeric input (`CAD $` prefix label), stored as cents integer
  - Quantity: numeric input (default 1)
  - Writes to `items/{id}` (quantity) and `items/{id}/internal/staff` (cost) separately
- [ ] `IntakeForm.tsx` (desktop) — add Cost and Quantity fields to the existing form:
  - Same pattern as mobile — two additional fields in the pricing section
  - Cost visible to staff roles only (gated by `isStaff` check — not rendered for `customer` role)
- [ ] `InventoryPage.tsx` — render `QuantityAdjustControl` on each card (mobile) and table row (desktop):
  - Show current stock count; quantity 0 = "Out of Stock" badge
  - POS sync status badge if `posId` is set
- [ ] Token-only styling: all new UI uses `--space-*`, `--text-*`, `--color-*` tokens

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Staff smoke test: set cost + initial quantity on mobile intake; adjust quantity from inventory view on 375px
- Makoonsii: 48px touch targets on quantity controls; plain language copy
- Dale: verify customer-facing item pages do NOT expose cost field (subcollection isolation)
- Kevin: confirm `adjustInventory` audit log fires; `publishItem` SLA unaffected
- Desktop regression: confirm existing table, AI panel, and full IntakeForm unaffected

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: Staff mobile gate, Makoonsii, Dale (cost isolation), Kevin — all passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] E42 tasks in `docs/EPICS.md` all ticked
- [ ] `docs/firestore-schema.md` updated with all new fields
- [ ] `docs/DECISIONS.md` updated with new field and subcollection decisions
- [ ] `firestore.rules` updated with `items/{id}/internal/staff` staff-only rule
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/E42_Inventory_Cost_Quantity_POS.md · v1.0*
