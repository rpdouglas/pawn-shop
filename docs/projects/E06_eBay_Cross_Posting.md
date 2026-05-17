# Project E06: eBay Cross-Posting

**Status:** Done — 2026-05-17
**Epic:** E06 — eBay Cross-Posting
**Phase:** Phase 3 — Discovery & Merchandising
**Primary Persona:** Dale — The Cross-Border Bargain Hunter
**Secondary Personas:** Kevin (alert accuracy — no alerts for eBay-moving items), Staff (admin push workflow)
**AI Involvement:** Neither (no Gemini runtime, no Claude-generated content)

**Objective:** Allow staff to push pawn items to eBay via a Cloud Function (eBay API key never on client), store `ebayListingId` on the item, and sync `status: 'sold'` in Firestore immediately when an item sells on eBay — so Dale never arrives at the store for an item that sold online.

---

## 1. User Story

> As **Dale**, I want The Pawn Shop's Firestore inventory to reflect eBay sold status immediately so that I never drive across the border for an item that was sold on eBay hours ago.

> As **staff**, I want to push an active pawn item to eBay from the admin panel so that I don't have to re-enter listing details manually in two systems.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Dale

> *"`status: 'sold'` must remove item from public listings immediately — no lag."*
> (docs/PERSONAS.md §3, Persona 2, UX Constraints)

Test: Create an eBay sold notification webhook payload for a known `ebayListingId`. Fire it against the `ebayWebhook` Cloud Function in the emulator. Confirm `items/{id}.status` is `'sold'` within 5 seconds. Confirm the item no longer appears in a public `useItemSearch` query.

### Makoonsii Trust Test

- [ ] This is a staff-facing admin feature. No customer-facing UI changes. Trust test passes trivially — no copy, no touch targets, no navigation.
- [ ] No Kanien'kéha introduced.

### Marie Discretion Test

- [ ] Cannabis items are blocked from eBay push at the Cloud Function level. No cannabis category disclosure risk to eBay platform.
- [ ] No CRM communication triggered by this feature.

### Marcus Photography Test

- [ ] No customer-facing item display changes in this epic. N/A.

### Kevin Speed Test

- [ ] Once `ebayListingId` is set on an item, that item's sync state is accurate. Kevin's saved search alerts already require `status == 'active'` — when eBay sync sets `status: 'sold'`, Kevin correctly receives no further alerts for that item. No new alert logic required in E06.

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — this is an admin-only Cloud Function. No customer-facing routes involved.
- [ ] **`auditLogs` events required?**
  - `ebay_push` — written by `pushToEbay` CF on successful listing creation. Details: `{ itemId, ebayListingId, viewTag }`.
  - `ebay_sync_sold` — written by `ebayWebhook` CF when sold status is synced. Details: `{ itemId, ebayListingId }`.
- [ ] **PII exclusion** — `auditLogs.details` contains only `{ itemId, ebayListingId, viewTag }`. No staff name, email, or customer data.
- [ ] **`policeHold` respected** — `pushToEbay` CF must validate `policeHold != true` before calling eBay API. A held item must never be listed publicly on eBay.
- [ ] **`aiDescription` draft-only** — `pushToEbay` uses `items/{id}.description` (staff-written, customer-visible field) for the eBay listing body. `aiDescription` subcollection is never read in this flow.
- [ ] **AI API security** — No AI calls in E06. The eBay API key follows the same rule as AI keys: stored as a Cloud Function environment secret, never on the client.
- [ ] **CASL compliance** — No customer alerts triggered by E06. N/A.
- [ ] **Scarcity integrity** — E06 does not touch `merchandisingTags`. No `rare-find` or `limited-edition` logic. N/A.
- [ ] **Cannabis/Fireworks eBay block** — `pushToEbay` validates `viewTag == 'pawn'` before proceeding. Cannabis listings are prohibited on eBay. Fireworks are prohibited or heavily restricted. Enforcement is server-side (CF), not UI-only.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read:  title, description, category, viewTag, status, price,
              condition, images[0], policeHold, ebayListingId
Fields written: ebayListingId (string — set by pushToEbay on success)
                status (string — set to 'sold' by ebayWebhook on sync)

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types:    ebay_push    — { itemId, ebayListingId, viewTag }
                ebay_sync_sold — { itemId, ebayListingId }
```

### New Fields Required

```
NEW FIELDS: NONE
- items/{id}.ebayListingId already exists in firestore-schema.md
- auditLogs eventType values ebay_push and ebay_sync_sold added to
  firestore-schema.md and logged in DECISIONS.md (2026-05-17)
```

### TypeScript Interfaces

```typescript
// Item — src/lib/types.ts
// Fields used: id, title, description, category, viewTag, status,
//              price, condition, images, policeHold, ebayListingId

// AuditLog — src/lib/types.ts
// Fields used: eventType, uid, targetId, details, createdAt
```

### eBay Category Mapping

Basic mapping by `viewTag` (pawn only). Within pawn, map `category` to eBay category ID:

| `category` value | eBay Category ID | eBay Category Name |
|---|---|---|
| `electronics` | 293 | Consumer Electronics |
| `jewellery` | 281 | Jewellery & Watches |
| `tools` | 631 | Hand Tools |
| `collectibles` | 1 | Collectibles |
| `clothing` | 11450 | Clothing, Shoes & Accessories |
| *(default / unmatched)* | 99 | Everything Else |
| `cannabis-*` | — | **BLOCKED — eBay prohibited** |
| fireworks items | — | **BLOCKED — eBay prohibited/restricted** |

Category map stored as a constant in the Cloud Function — not in Firestore. Staff cannot override it in E06; full category management is E18+ scope.

### Security Rules Required

```javascript
// No new rules required.
// pushToEbay and ebayWebhook are Cloud Functions using Admin SDK —
// they bypass Firestore rules by design.
// The ebayWebhook HTTP function must validate the eBay notification
// signature in the function body (not via Firestore rules).
// Existing rule: auditLogs — allow create: isSignedIn()
// CF Admin SDK writes bypass this; rule remains correct for client paths.
```

---

## 5. AI Involvement Detail

### Claude (development)

- Prompts that apply: `PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md`
- Guardrails: `pushToEbay` uses `items/{id}.description` only — never `aiDescription`. No content generation in this epic.

### Gemini E18 (runtime)

- Not involved in E06.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules

- [x] `docs/firestore-schema.md` — `ebayListingId` already present; `ebay_push` and `ebay_sync_sold` event types added
- [x] `docs/DECISIONS.md` — cannabis/fireworks eBay block and new event types logged
- [ ] Confirm no new Firestore indexes required (`ebayListingId` lookups are by document ID, not query)

### Phase 2 — Cloud Functions

**`pushToEbay`**
- [ ] Trigger: callable (staff auth required — verify `admin` or `manager` custom claim)
- [ ] Input: `{ itemId: string }`
- [ ] Guards: `status == 'active'`, `policeHold != true`, `viewTag == 'pawn'`, `ebayListingId` not already set
- [ ] Reads `items/{id}` fields: `title`, `description`, `price`, `condition`, `images[0]`, `category`, `viewTag`
- [ ] Maps `category` → eBay category ID using the constant map
- [ ] Calls eBay Sell Inventory API (REST) — API key from Cloud Function environment secret
- [ ] On success: writes `ebayListingId` to `items/{id}`, writes `auditLogs` event `ebay_push`
- [ ] On failure: returns structured error to client (does not write `ebayListingId`); no partial state
- [ ] Error handling: eBay API rate limit (429), auth failure (401), invalid item state

**`ebayWebhook`**
- [ ] Trigger: HTTP (public endpoint — registered with eBay Marketplace Account Deletion / Notification API)
- [ ] Validates eBay notification signature (HMAC verification using eBay verification token from env secret)
- [ ] On `MARKETPLACE_ACCOUNT_DELETION` or `ITEM_SOLD` notification type: looks up `items` by `ebayListingId`, sets `status: 'sold'`, writes `auditLogs` event `ebay_sync_sold`
- [ ] Returns HTTP 200 immediately (eBay requires acknowledgment within 3 seconds); status write is async after response
- [ ] Idempotent: if `status` is already `'sold'`, skip write, return 200

### Phase 3 — Admin UI

- [ ] "Push to eBay" button on `ItemDetailAdmin` component (admin item detail page)
  - Visible only when: `status == 'active'` AND `viewTag == 'pawn'` AND `ebayListingId` is empty
  - Disabled state while CF call is in flight (loading spinner)
  - On success: shows `ebayListingId` as a read-only badge ("Listed on eBay · [ID]")
  - On error: shows inline error message (no toast — staff needs to read the reason)
- [ ] CSS: `.view-pawn` class context, `var(--color-primary)` for button, `--text-body` size, `--space-*` tokens only
- [ ] No new route required — extends existing admin item detail page

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- **Dale smoke test:** Webhook payload → `status: 'sold'` within 5s → item absent from public listing query
- **Kevin smoke test:** After `status: 'sold'` sync, confirm no saved-search alert fires for that item
- **Staff smoke test:** Push button visible for active pawn item, hidden for cannabis/fireworks/draft/reserved items
- **Compliance:** `policeHold: true` item — push button must not appear; CF must reject even if called directly
- **Compliance:** `auditLogs` — verify `ebay_push` and `ebay_sync_sold` events written correctly with no PII
- **Compliance:** `ebayWebhook` — invalid signature returns 403, no Firestore write occurs

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: Dale sold-sync test passes in emulator (≤5s)
- [ ] Compliance gate: all applicable items verified
- [ ] `pushToEbay` CF: callable, staff-auth-gated, rejects cannabis/fireworks/policeHold items
- [ ] `ebayWebhook` CF: signature-verified, idempotent, sets `status: 'sold'` on matched item
- [ ] Admin UI: push button correct visibility/disabled states; `ebayListingId` badge on success
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `docs/EPICS.md` E06 tasks ticked
- [ ] `docs/firestore-schema.md` current (already updated)
- [ ] `docs/DECISIONS.md` current (already updated)
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/E06_eBay_Cross_Posting.md · v1.0*
