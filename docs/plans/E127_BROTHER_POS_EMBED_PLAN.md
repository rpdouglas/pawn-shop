# E127 — Brother POS Inventory Embed · Plan

**Status:** AWAITING STRATEGY APPROVAL  
**Feature:** Replace/sync pawn page inventory view with Brother POS data  
**Spec:** `docs/projects/E127_BROTHER_POS_EMBED.md`  
**Author:** Claude Code · 2026-06-23  

---

## Step 1 — State Read Summary

### Current Pawn Page Inventory Flow
`PawnPage.tsx` → `useItemSearch('pawn')` → Firestore `items` collection (prefix-token search) → `MasonryGrid` | `LuxuryProductCard` (layout toggle: masonry / grid3 / list)

Key hooks & components affected:
- `useItemSearch` + `useItems` (Firestore real-time listener)
- `MasonryGrid.tsx`, `LuxuryProductCard.tsx`, `LayoutToggle.tsx`
- `ItemQuickView.tsx` (modal), `ClickCollectModal.tsx`
- `SaveSearchButton.tsx` (Firestore saved searches)
- `Analytics.viewItemList` / `Analytics.selectItem` (GA4 events)

### Brother POS Critical Findings

| Finding | Impact |
|---|---|
| `embed.js` → HTTP **404** | Strategies A & B blocked until Brother POS activates the feature |
| CSP `frame-ancestors: '*.brotherpos.ca ...'` | Direct `<iframe>` impossible on our domain |
| `x-frame-options: SAMEORIGIN` on admin routes | Admin area cannot be embedded |
| Brother POS server: nginx + Rails stack | REST API likely available; webhook already stubbed |
| `receivePosWebhook` CF stub exists (E42) | HMAC-verified skeleton ready to extend |
| Schema fields exist: `posId`, `posSyncStatus`, `posLastSyncAt` | No schema changes needed |

### `data-mode="menu"` Attribute Analysis
The `data-mode="menu"` attribute tells Brother POS's embed script to render a product catalog/menu widget (as opposed to cart, checkout, etc.). When/if activated, the script would:
1. Inject a `<div>` or `<iframe>` into the page at runtime
2. Render POS inventory using their own styling
3. Handle add-to-cart / enquiry flows entirely within their widget

Since the script is 404 we cannot inspect its actual runtime behaviour. The `menu` mode is standard for POS embed systems and operates as a client-rendered storefront widget.

---

## Step 2 — Persona Gate

| Persona | Test | Strategy A | Strategy B | Strategy C |
|---|---|---|---|---|
| **Dale** | Price visible without click-through | ✅ POS shows price | ✅ Fallback available | ✅ Firestore renders price |
| **Sandra** | Masonry grid discovery; quick-view <200ms | ❌ Replaced by POS widget | ⚠️ POS mode only | ✅ Preserved |
| **Kevin** | Saved search alerts within 60s | ❌ Alerts don't match POS items | ⚠️ Firestore mode only | ✅ Works if posId synced |
| **Jordan** | Design token compliance; brand quality | ❌ Widget ignores tokens | ⚠️ Degraded in POS mode | ✅ Full compliance |
| **Marcus** | Photography standard on dark bg | ❌ POS controls images | ⚠️ POS controls images | ✅ Staff can replace POS images |

---

## Step 3 — Schema Audit

**No new fields required.** All POS integration fields already exist:

```
items/{id}
  posId           string   — Brother POS external identifier
  posSyncStatus   string   — 'not_synced' | 'synced' | 'pending' | 'error'
  posLastSyncAt   timestamp
```

No `firestore-schema.md` update needed before implementation.

---

## Step 4 — Three Strategies

---

### Strategy A: Direct Script Widget Embed ("Drop-In Replace")

**Scope:** Small · ~2 files  
**Blocked by:** embed.js HTTP 404 (must be resolved by Brother POS support first)

#### Architecture

Replace the entire "Discover" section in `PawnPage.tsx` with a container div and a dynamically injected `<script>` tag:

```tsx
// In PawnPage.tsx — replace MasonryGrid + LayoutToggle section
useEffect(() => {
  const el = document.getElementById('brotherpos-embed')
  if (!el) return
  const script = document.createElement('script')
  script.src = 'https://thepawnshop.brotherpos.ca/shop/embed.js'
  script.dataset.mode = 'menu'
  script.async = true
  document.body.appendChild(script)
  return () => { document.body.removeChild(script) }
}, [])

// JSX
<div id="brotherpos-embed" />
```

`firebase.json` — add `X-Frame-Options` and extend CSP to allow `thepawnshop.brotherpos.ca` as a script source and connect source:
```json
{
  "headers": [{
    "source": "/**",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "script-src 'self' 'unsafe-inline' thepawnshop.brotherpos.ca ..."
    }]
  }]
}
```

Remove/deprecate: `useItemSearch`, `MasonryGrid`, `LayoutToggle`, `SaveSearchButton`, `ItemQuickView`, `ClickCollectModal` from PawnPage (or leave as dead code pending full cutover).

#### Persona Lens
- **Dale:** POS is authoritative source — prices match what's actually in stock ✅
- **Sandra:** Discovery experience shifts to POS widget UI — MasonryGrid removed ❌
- **Kevin:** Saved search alerts cannot match POS items (no Firestore `posId` mapping) ❌
- **Jordan:** Brand design tokens not applied to POS widget output ❌

#### Compliance Audit
| Check | Status |
|---|---|
| Hardcoded hex values | ✅ None introduced |
| Firestore field invention | ✅ None — not touching Firestore |
| AI keys on client | ✅ None |
| Age gates at component level | ✅ No age gate on pawn view |
| PII in logs | ✅ None introduced |
| **policeHold enforcement** | ❌ **FAIL** — POS widget has no knowledge of `policeHold: true`. An admin-flagged item could still appear in the POS widget. This is a non-negotiable guardrail violation per CLAUDE.md. |
| GA4 analytics | ⚠️ `viewItemList`/`selectItem`/`search` events stop firing for POS items |
| `auditLogs` for view events | ⚠️ No inventory view events logged |

#### Trade-offs
**Benefits:** Fastest path to live POS data; single source of truth; zero data sync complexity.  
**Costs:** policeHold guardrail violated; brand tokens lost; analytics dark; embed.js is 404 today; third-party script has unrestricted page access (XSS risk if their CDN is compromised).

---

### Strategy B: Feature-Flagged Hybrid ("Controlled Migration")

**Scope:** Medium · ~4 files  
**Blocked by:** embed.js HTTP 404 (codebase ready, but feature inactive until Brother POS enables it)

#### Architecture

Add `showBrotherPosEmbed` to Remote Config and the `FeatureFlags` interface. `PawnPage.tsx` conditionally renders either the POS widget div or the existing Firestore inventory.

```ts
// featureFlags.ts — add to FeatureFlags interface
export interface FeatureFlags {
  showStaffPicks: boolean
  showRelatedItems: boolean
  pawnFormEnabled: boolean
  showBrotherPosEmbed: boolean   // NEW
}

function readFlags(): FeatureFlags {
  return {
    // ...existing...
    showBrotherPosEmbed: getValue(remoteConfig, 'show_brother_pos_embed').asBoolean(),
  }
}
```

```tsx
// PawnPage.tsx — Discover section becomes conditional
const { ..., showBrotherPosEmbed } = useFeatureFlags()

// In the Discover section:
{showBrotherPosEmbed ? (
  <BrotherPosWidget />           // new thin component, injects script
) : (
  // existing MasonryGrid + LayoutToggle code unchanged
)}
```

Staff toggles from `false` → `true` in Firebase Remote Config when ready to cut over.

#### Persona Lens
- **Dale:** Firestore mode: current experience. POS mode: authoritative live POS data ✅
- **Sandra:** Firestore mode: MasonryGrid preserved ✅. POS mode: widget replaces it ⚠️
- **Jordan:** Firestore mode: full design token compliance ✅. POS mode: degraded ⚠️

#### Compliance Audit
| Check | Status |
|---|---|
| Hardcoded hex values | ✅ None |
| policeHold enforcement | ✅ Firestore mode: enforced. ⚠️ POS mode: same gap as Strategy A |
| GA4 analytics | ✅ Firestore mode. ⚠️ POS mode: dark |
| Remote Config flag | ✅ Existing infrastructure |

#### Trade-offs
**Benefits:** Rollback in 30 seconds via Remote Config; validates POS widget before full cutover; preserves existing flow during transition; codebase is ready while waiting for 404 resolution.  
**Costs:** Dual inventory systems maintained temporarily; policeHold gap persists in POS mode; widget UI still diverges from our brand; same embed.js 404 blocking issue.

---

### Strategy C: POS Webhook Sync + Native Render — RECOMMENDED

**Scope:** Large · ~6 files  
**Blocked by:** Brother POS must configure webhooks to POST to our CF URL + share payload schema

#### Architecture

Extend the existing `receivePosWebhook` CF stub (`functions/operations/src/pos.ts`) to fully process Brother POS inventory events and write them into our `items` collection. Zero frontend changes required.

**CF Extension (`pos.ts`):**
```ts
// Map Brother POS event types → Firestore writes
// item.created / item.updated → upsert items/{id} by posId
// item.deleted → set status: 'archived' (soft delete)
// item.sold     → set status: 'sold', soldAt: serverTimestamp()

const payload = req.body as PoSWebhookPayload  // typed interface (see types.ts)
const { event, item } = payload

if (event === 'item.created' || event === 'item.updated') {
  // Map POS fields to our schema
  const firestoreData: Partial<Item> = {
    title: item.name,
    description: item.description,
    price: Math.round(item.price_cents),   // already cents
    status: 'active',
    viewTag: 'pawn',
    posId: item.id,
    posSyncStatus: 'synced',
    posLastSyncAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    images: item.images?.map(img => img.url) ?? [],
    searchTokens: buildSearchTokens(item.name, item.category),
  }
  // Upsert by posId
  const existingSnap = await db.collection('items')
    .where('posId', '==', item.id).limit(1).get()
  if (!existingSnap.empty) {
    await existingSnap.docs[0].ref.update(firestoreData)
  } else {
    await db.collection('items').add({
      ...firestoreData,
      createdAt: FieldValue.serverTimestamp(),
      viewTags: ['pawn'],
    })
  }
}
```

**Types (`src/lib/types.ts`):**  
Add `PoSWebhookPayload` and `PoSItem` interfaces to type the webhook body.

**No frontend changes.** `PawnPage.tsx` already renders all `status: active, policeHold !== true, viewTag: pawn` items from Firestore. POS inventory flows in through the webhook and appears natively.

**Required from Brother POS:**
1. Share webhook payload schema (field names, data types, event names)
2. Register our CF URL: `https://us-central1-nats-rack.cloudfunctions.net/receivePosWebhook`
3. Share HMAC secret for `BROTHER_POS_HMAC_SECRET`

#### Persona Lens
- **Dale:** Authoritative POS pricing in Firestore; price visible without click-through ✅
- **Sandra:** MasonryGrid and full discovery experience preserved ✅ Quick-view <200ms ✅
- **Kevin:** Saved search alerts match POS-synced items (posId indexed) ✅
- **Jordan:** Full design token compliance; brand identity unchanged ✅
- **Marcus:** Staff can replace POS images with watermarked photos using existing `reorderItemImages` CF ✅

#### Compliance Audit
| Check | Status |
|---|---|
| Hardcoded hex values | ✅ None |
| policeHold enforcement | ✅ Admin can set policeHold on any POS-synced item immediately |
| AI keys on client | ✅ None — CF only |
| PII in logs | ✅ Logging only `posId` and `event` type |
| GA4 analytics | ✅ All existing analytics events fire unchanged |
| `auditLogs` | ✅ Can add `pos_sync_received` audit log on each webhook |
| `buildSearchTokens` | ✅ Generates `searchTokens[]` for Kevin's saved search alerts |
| Design tokens | ✅ Preserved — same rendering components |
| `rare-find` / `staff-pick` auto-tagging | ✅ Not applied — no algorithmic scarcity |

#### Trade-offs
**Benefits:** Full compliance with all non-negotiable guardrails; design tokens preserved; analytics intact; policeHold enforced; Sandra/Kevin/Jordan/Marcus personas fully served; E42 stub is already 50% built.  
**Costs:** External dependency (Brother POS webhook setup + payload schema documentation); sync latency (near-real-time but not instant); CF development required; need to handle webhook replay / deduplication.

**Sync Latency Note:** Webhook events arrive within seconds of POS changes. For the `item.sold` event, the 60-second alert SLA for Kevin still applies to restocked items.

---

## Step 5 — Anti-Regression Check

| Guardrail | A | B | C |
|---|---|---|---|
| Hardcoded hex values | ✅ | ✅ | ✅ |
| Invented Firestore fields | ✅ | ✅ | ✅ |
| AI API keys on client | ✅ | ✅ | ✅ |
| Age gate at component level | ✅ (no gate needed on pawn) | ✅ | ✅ |
| PII in logs | ✅ | ✅ | ✅ |
| `policeHold` enforcement | ❌ FAIL | ❌ FAIL in POS mode | ✅ |
| Unapproved motion patterns | ✅ | ✅ | ✅ |
| `rare-find`/`staff-pick` auto-tagging | ✅ | ✅ | ✅ |

**Strategy A and B both fail the policeHold guardrail in their POS-rendered mode.** This is a non-negotiable per CLAUDE.md.

---

## Recommendation

**Strategy C — Webhook Sync + Native Render** is the only strategy that passes all non-negotiable compliance guardrails. It is also the only strategy that preserves Sandra's MasonryGrid experience, Jordan's design token system, and Kevin's saved search alert pipeline.

**Immediate next step for all strategies:** Contact Brother POS support to:
1. Request activation of the embed widget feature (resolves 404, unblocks A/B for evaluation)
2. Request webhook payload schema documentation (unblocks C)
3. Share HMAC secret for `BROTHER_POS_HMAC_SECRET`

**Phased recommendation:**
- **Now:** Contact Brother POS — no code can ship until they provide either embed activation or webhook schema
- **Short-term:** Implement Strategy B as a code-ready shell (no user impact until Remote Config flag is flipped)
- **Long-term:** Implement Strategy C as the production architecture — retire the feature flag

---

## Implementation Sequence (if Strategy C approved)

1. Get Brother POS webhook payload schema → create `PoSWebhookPayload` interface in `types.ts`
2. Extend `functions/operations/src/pos.ts` — full event processing (created / updated / deleted / sold)
3. Add `buildSearchTokens` call + `viewTag: 'pawn'` default on new POS items
4. Add `pos_sync_received` audit log entry (no PII — only `posId` + `event`)
5. Deploy CF to `nats-rack` — register URL with Brother POS
6. Test with webhook replay from Brother POS dev console
7. Verify items appear in admin inventory with `posSyncStatus: 'synced'`
8. Verify policeHold hides synced POS item from public pawn page

No `firestore-schema.md` or `DECISIONS.md` updates required (all fields pre-exist). Decision log entry in `docs/decisions/` required at close.

---

*The Pawn Shop · docs/plans/E127_BROTHER_POS_EMBED_PLAN.md · 2026-06-23*
