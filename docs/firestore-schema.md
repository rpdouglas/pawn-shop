# Firestore Schema

> **The only source of truth for field names.**
> No developer or AI assistant may add, rename, or remove a field without updating this file first.
> Schema changes require a one-liner in `DECISIONS.md`.

---

## `items/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Display title |
| `description` | string | Staff-written, customer-visible |
| `category` | string | e.g. `electronics`, `jewellery`, `cannabis-flower` |
| `viewTag` | string | Primary view: `pawn` \| `cannabis` \| `fireworks` |
| `viewTags` | array\<string\> | Multi-view items |
| `status` | string | `active` \| `reserved` \| `sold` \| `archived` |
| `price` | number | CAD cents (e.g. 1999 = $19.99) |
| `condition` | string | `new` \| `like-new` \| `good` \| `fair` \| `poor` |
| `images` | array\<string\> | Firebase Storage URLs (WebP/AVIF, watermarked) |
| `videoUrl` | string | Optional. Cannabis/Fireworks item pages |
| `searchTokens` | array\<string\> | Prefix tokens from title + category |
| `serialNumber` | string | Optional |
| `serialBlacklistFlag` | boolean | Admin-only write |
| `policeHold` | boolean | Admin-only write. Hides from public immediately |
| `holdExpiresAt` | timestamp | Set when status = `reserved` |
| `locationId` | string | For future multi-location |
| `isSeasonalItem` | boolean | Ties to campaign scheduler |
| `bundleIds` | array\<string\> | Related `items/{id}` for bundles |
| `merchandisingTags` | array\<string\> | `just-arrived` \| `rare-find` \| `limited-edition` \| `staff-pick` |
| `provenanceNotes` | string | Cultural/historical context for high-value items |
| `trendingScore` | number | Computed by Cloud Function |
| `viewCount` | number | Incremented server-side |
| `ebayListingId` | string | Set when pushed to eBay |
| `createdAt` | timestamp | Server timestamp |
| `updatedAt` | timestamp | Server timestamp |
| `publishedBy` | string | UID of staff who published |

---

## `items/{id}/internal/ai` — staff-only subcollection

> Firestore rules are document-level. Fields that must never reach customers are stored here, not on the parent document. Read/write restricted to staff custom claims.

| Field | Type | Notes |
|-------|------|-------|
| `aiDescription` | string | Gemini draft — staff must promote to `items/{id}.description` before publishing |
| `aiPriceSuggestion` | map | `{ low: number, high: number, source: string }` — guidance only, never a published price |

---

## `pawnRequests/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | Customer UID (null for guest) |
| `name` | string | |
| `email` | string | |
| `phone` | string | Optional |
| `itemDescription` | string | |
| `serialNumber` | string | Optional |
| `images` | array\<string\> | Storage URLs |
| `status` | string | `pending` \| `reviewed` \| `quoted` \| `declined` \| `completed` |
| `staffNotes` | string | Internal — never show to customer |
| `serialBlacklistHit` | boolean | Set by Cloud Function on create |
| `createdAt` | timestamp | |

---

## `reservations/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | Customer UID |
| `itemId` | string | Reference to `items/{id}` |
| `status` | string | `pending` \| `confirmed` \| `declined` \| `completed` |
| `pickupWindow` | string | e.g. `"2026-06-01 14:00-16:00"` |
| `staffNotes` | string | Internal |
| `createdAt` | timestamp | |

---

## `users/{uid}`

| Field | Type | Notes |
|-------|------|-------|
| `email` | string | |
| `displayName` | string | |
| `role` | string | Mirrors custom claim. Admin-only write |
| `mfaEnrolled` | boolean | |
| `lastLoginAt` | timestamp | |
| `lastLoginIp` | string | Hashed — not plain text |
| `purchaseHistory` | array\<string\> | `items/{id}` references |
| `inquiryHistory` | array\<string\> | `pawnRequests/{id}` references |
| `lifetimeValue` | number | CAD cents |
| `segments` | array\<string\> | e.g. `['vip', 'collector']` |
| `vipFlag` | boolean | Staff-set only |
| `resellerTier` | string | `bronze` \| `silver` \| `gold` |
| `alertMethod` | string | `sms` \| `email` \| `none` |
| `alertOptIn` | boolean | CASL — must be true before sending alerts |
| `crossViewFlag` | boolean | Browsed multiple views in one session |
| `createdAt` | timestamp | |

---

## `auditLogs/{id}` — immutable, no delete ever

| Field | Type | Notes |
|-------|------|-------|
| `eventType` | string | `login` `logout` `role_change` `mfa_enrolled` `age_gate_pass` `age_gate_fail` `police_hold_set` `item_published` `price_override` |
| `uid` | string | Actor UID |
| `targetId` | string | Optional — item/user being acted on |
| `details` | map | Context. **Never include PII** |
| `createdAt` | timestamp | Server timestamp |

---

## `serialBlacklist/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `serialNumber` | string | The flagged serial |
| `reason` | string | e.g. `"Reported stolen — case #12345"` |
| `addedBy` | string | Admin UID |
| `createdAt` | timestamp | |

---

## `campaigns/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | |
| `viewTag` | string | `pawn` \| `cannabis` \| `fireworks` \| `all` |
| `startDate` | timestamp | |
| `endDate` | timestamp | |
| `active` | boolean | Managed by Cloud Function |
| `discountRule` | map | `{ type: 'percent'\|'fixed', value: number }` |
| `bannerCopy` | string | |
| `countdownEnabled` | boolean | |
| `createdAt` | timestamp | |

---

## `savedSearches/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | |
| `query` | string | |
| `viewTag` | string | |
| `category` | string | Optional |
| `active` | boolean | Must be true to receive alerts |
| `alertMethod` | string | `sms` \| `email` |
| `createdAt` | timestamp | |

---

## `disputes/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | |
| `itemId` | string | |
| `type` | string | `return` \| `dispute` |
| `status` | string | `open` \| `investigating` \| `resolved` |
| `description` | string | Customer-written |
| `refundAmount` | number | CAD cents |
| `refundMethod` | string | `cash` \| `etransfer` \| `store-credit` |
| `staffNotes` | string | Internal — never surface to customer |
| `ebayDisputeId` | string | If sourced from eBay |
| `createdAt` | timestamp | |
| `resolvedAt` | timestamp | |

---

## `articles/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | |
| `slug` | string | URL-safe, unique |
| `body` | string | Rich text |
| `viewTag` | string | |
| `status` | string | `draft` \| `published` |
| `seoMeta` | map | `{ title: string, description: string }` |
| `publishedAt` | timestamp | |
| `authorUid` | string | |
| `indigenousLanguageReviewed` | boolean | Must be true before publishing Kanien'keha content |

---

## `preorders/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | |
| `itemId` | string | |
| `status` | string | `pending` \| `confirmed` \| `ready` \| `collected` \| `cancelled` |
| `quantity` | number | |
| `staffNotes` | string | |
| `createdAt` | timestamp | |
