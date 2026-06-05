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
| `viewTag` | string | Primary view: `pawn` \| `cannabis` \| `fireworks` \| `tobacco` |
| `viewTags` | array\<string\> | Multi-view items |
| `status` | string | `draft` \| `active` \| `reserved` \| `sold` \| `archived` \| `deleted` |
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
| `enquiryCount` | number | Incremented by `createReservation` CF. Input to `calculateTrendingScore`. Default 0. |
| `staffPickNote` | string | Staff-written curator note (max 280 chars). Customer-visible on Staff Picks display. Staff-only write via `updateMerchandisingTags` CF. |
| `ebayListingId` | string | Set when pushed to eBay |
| `soldAt` | timestamp | Set by `completeReservation` and `ebayWebhook` CFs when status transitions to `'sold'`. Null until sold. |
| `createdAt` | timestamp | Server timestamp |
| `updatedAt` | timestamp | Server timestamp |
| `deletedAt` | timestamp | Server timestamp (set when status = `deleted`) |
| `publishedBy` | string | UID of staff who published |
| `quantity` | number | Stock count integer. 0 = out of stock. Staff-set. Customer-readable (safe — it is stock level, not cost). |
| `posId` | string | Brother POS external identifier. Null until synced. |
| `posSyncStatus` | string | `'not_synced'` \| `'synced'` \| `'pending'` \| `'error'` |
| `posLastSyncAt` | timestamp | Last successful POS sync. Null until first sync. |
| `cannabisProfile` | map | specialized data. `{ thcMin, thcMax, cbdMin, cbdMax, terpenes[], geneticLineage, effectProfile[], brand, format, weight, lotNumber, packagedDate, subCategory, servings, weightPerServing, strainType, cannabinoidUnit }` |
| `fireworksProfile` | map | specialized data. `{ explosiveWeight, classificationClass, effectType, shots, duration, noiseLevel }` |

---

## `items/{id}/internal/staff` — staff-only subcollection (E42)

> Stores financial fields that must never be readable by customers. Firestore rules match `/internal/{doc}` — the wildcard covers both `ai` and `staff` documents.

| Field | Type | Notes |
|-------|------|-------|
| `cost` | number | Purchase cost in CAD cents. Staff-only. Never exposed to customers via any public query. |

---

## `items/{id}/internal/ai` — staff-only subcollection

> Firestore rules are document-level. Fields that must never reach customers are stored here, not on the parent document. Read/write restricted to staff custom claims.

| Field | Type | Notes |
|-------|------|-------|
| `aiDescription` | string | Gemini draft — staff must promote to `items/{id}.description` before publishing |
| `aiPriceSuggestion` | map | `{ low: number, high: number, source: string }` — guidance only, never a published price |
| `aiTagSuggestions` | array\<string\> | Gemini suggested tags (e.g. `rare-find`, `just-arrived`). Staff reviewed. |
| `intakeExtraction` | map | `{ suggestedFields: map, marketPricing: { avgRegularPriceCents: number, avgSalePriceCents: number, avgRefurbPriceCents: number, currency: string, retrievedAt: timestamp } }` |

---

## `cannabisStrains/{id}`

> Reference database of cannabis strains seeded from an open dataset. Read access for staff only via Cloud Functions.

| Field | Type | Notes |
|-------|------|-------|
| `strainName` | string | Normalized strain name |
| `brand` | string | Optional |
| `terpenes` | array\<string\> | e.g. `["Myrcene", "Pinene"]` |
| `geneticLineage` | string | e.g. `Og Kush x Sour Diesel` |
| `effectProfile` | array\<string\> | e.g. `["Relaxed", "Happy"]` |
| `thcMin` | number | Reference minimum THC % |
| `thcMax` | number | Reference maximum THC % |
| `cbdMin` | number | Reference minimum CBD % |
| `cbdMax` | number | Reference maximum CBD % |
| `cannabinoidUnit` | string | e.g. `%` or `mg/g` |
| `strainType` | string | `sativa` \| `indica` \| `hybrid` |
| `createdAt` | timestamp | |

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
| `pawnLoanId` | string | Link to `loanTickets/{id}` if a loan is issued |
| `createdAt` | timestamp | |

---

## `loanTickets/{id}`

> Tracks active and historical pawn loans. Status changes must route through Cloud Functions.

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | Customer UID |
| `pawnRequestId` | string | Reference to `pawnRequests/{id}` |
| `itemDescription` | string | Description of the pawned item |
| `loanAmount` | number | CAD cents |
| `interestRate` | number | e.g. 0.05 for 5% |
| `periodDays` | number | Standard loan period in days |
| `dueDate` | timestamp | Current due date for the loan |
| `status` | string | `active` \| `extension_requested` \| `forfeited` \| `redeemed` |
| `extensionCount` | number | Number of times extended |
| `staffNotes` | string | Internal — never shown to customer |
| `createdAt` | timestamp | Server timestamp |
| `updatedAt` | timestamp | Server timestamp |

---

## `reservations/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | Customer UID |
| `itemId` | string | Reference to `items/{id}` |
| `status` | string | `pending` \| `confirmed` \| `declined` \| `completed` |
| `pickupWindow` | string | Format: `"YYYY-MM-DD HH:MM–HH:MM"` e.g. `"2026-07-01 14:00–14:30"` |
| `customerName` | string | Display name for staff inbox — never in `auditLogs` |
| `customerPhone` | string | Phone number for Twilio SMS — never in `auditLogs` |
| `viewTag` | string | `pawn` \| `fireworks` — determines SMS language guard |
| `smsDeliveredAt` | timestamp | Set by CF after Twilio API call; null if delivery failed |
| `pickupReminderSentAt` | timestamp | Set by `sendPickupReminders` CF when the 24-hour pre-pickup SMS has been dispatched. Null until sent. Prevents duplicate sends. |
| `staffNotes` | string | Internal — never shown to customer |
| `createdAt` | timestamp | Server timestamp |
| `updatedAt` | timestamp | Set by confirmReservation and completeReservation CFs on status transition |

---

## `config/storeHours` — single document, admin-only write

| Field | Type | Notes |
|-------|------|-------|
| `monday` | map | `{ open: string (HH:MM 24h), close: string (HH:MM 24h), closed: boolean }` |
| `tuesday` | map | Same structure as `monday` |
| `wednesday` | map | Same structure as `monday` |
| `thursday` | map | Same structure as `monday` |
| `friday` | map | Same structure as `monday` |
| `saturday` | map | Same structure as `monday` |
| `sunday` | map | Same structure as `monday` |
| `updatedBy` | string | UID of admin who last modified |
| `updatedAt` | timestamp | Server timestamp |

Slot intervals are computed at runtime: `open` → `close − 30 min` in 30-minute steps. Slot format stored in `reservations/{id}.pickupWindow`: `"YYYY-MM-DD HH:MM–HH:MM"`. Read access: any authenticated user. Write access: `admin` custom claim only via `updateStoreHours` CF.

---

## `config/shopInfo` — single document, admin-only write (E17)

| Field | Type | Notes |
|-------|------|-------|
| `foundedYear` | number | Year the shop was founded. Used to compute years-in-business badge. |
| `ownerName` | string | Optional. Display name used in testimonials context. |
| `phoneNumber` | string | E.164 format (e.g. `+16135551234`). Used for WhatsApp enquiry deep link on cannabis item pages. Admin-only write. |
| `updatedBy` | string | UID of admin who last modified |
| `updatedAt` | timestamp | Server timestamp |

Read access: public (no auth required — displayed on public Pawn page). Write access: `admin` custom claim only via Firebase console or a future admin UI. Create this document manually in Firestore console with `foundedYear: <year>`.

---

## `activityFeed/{id}` — live activity collection (E17)

| Field | Type | Notes |
|-------|------|-------|
| `viewTag` | string | `pawn` \| `cannabis` \| `fireworks` \| `tobacco` |
| `action` | string | `'browsing'` — only value for MVP |
| `displayCity` | string | Hardcoded `"Cornwall Island"` — **never** derived from user data, IP, or geolocation |
| `createdAt` | timestamp | Server timestamp. Used for ordering and 24-hour TTL purge. |

**Privacy guarantee:** No UID, item ID, IP address, device ID, or any customer-traceable field ever enters this collection. `displayCity` is a hardcoded string constant in the `logActivity` Cloud Function — not derived from request context. Read access: public. Write access: `if false` — all writes via `logActivity` callable CF (Admin SDK).

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
| `phoneNumber` | string | For shift alerts and verification |
| `consentAcceptedAt` | timestamp | null until user accepts the privacy policy. Set on account creation (SignUpPage) or by ConsentBanner on first post-E11 session. Never null for compliant accounts. |
| `consentVersion` | string | Version slug of the accepted policy (e.g. `"2026-05-01"`). Enables re-consent detection on material policy changes. |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | Server timestamp |

### `users/{uid}/favourites/{itemId}` — customer-only subcollection (E12)

| Field | Type | Notes |
|-------|------|-------|
| `itemId` | string | Reference to `items/{id}` |
| `createdAt` | timestamp | |

### `users/{uid}/notifications/{id}` — customer-only subcollection (E12)

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Display title |
| `body` | string | Notification message |
| `link` | string | Optional destination URL |
| `read` | boolean | Status flag |
| `createdAt` | timestamp | |

### `users/{uid}/hrData/{docId}` — staff-only subcollection (E20)

| Field | Type | Notes |
|-------|------|-------|
| `hireDate` | timestamp | |
| `emergencyContact` | string | |
| `schedulePreferences` | map | `{ monday: 'morning', tuesday: 'off', ... }` |
| `updatedAt` | timestamp | |

### `users/{uid}/signatures/{id}` — staff-only subcollection (E69)

| Field | Type | Notes |
|-------|------|-------|
| `documentId` | string | Reference to `documents/{id}` |
| `version` | string | The version slug signed (e.g., `v1.0`) |
| `ipAddress` | string | For compliance audit trails |
| `signedAt` | timestamp | |

---

## `shifts/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `staffUid` | string | Reference to `users/{uid}` |
| `startTime` | timestamp | |
| `endTime` | timestamp | |
| `viewTag` | string | `pawn` \| `cannabis` \| `fireworks` \| `tobacco` \| `all` |
| `notes` | string | Optional. Specific tasks or context |
| `createdBy` | string | UID of admin/manager who created |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

## `auditLogs/{id}` — immutable, no delete ever

| Field | Type | Notes |
|-------|------|-------|
| `eventType` | string | `login` `logout` `role_change` `mfa_enrolled` `age_gate_pass` `age_gate_fail` `police_hold_set` `item_published` `price_override` `hold_set` `hold_expired` `ebay_push` `ebay_sync_sold` `pawn_request_submit` `serial_blacklist_hit` `reservation_created` `reservation_confirmed` `reservation_declined` `reservation_completed` `store_hours_updated` `serial_blacklist_add` `serial_blacklist_remove` `data_purged` `staff_pick_set` `staff_pick_removed` `campaign_activated` `campaign_deactivated` `preorder_created` `preorder_confirmed` `preorder_ready` `preorder_collected` `preorder_cancelled` `dispute_created` `dispute_resolved` `item_restocked` `seasonal_reminder_sent` `pickup_reminder_sent` `weekly_digest_sent` `inventory_quantity_adjusted` |
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
| `viewTag` | string | `pawn` \| `cannabis` \| `fireworks` \| `tobacco` \| `all` |
| `startDate` | timestamp | |
| `endDate` | timestamp | |
| `active` | boolean | Managed by Cloud Function — set true when now ≥ startDate; false when now > endDate |
| `discountRule` | map | `{ type: 'percent'\|'fixed', value: number }` |
| `bannerCopy` | string | |
| `countdownEnabled` | boolean | |
| `createdBy` | string | UID of staff member who created the campaign |
| `reminderSentAt` | timestamp | Set by `sendSeasonalReminders` CF when the batch reminder has been dispatched. Null until sent. Prevents duplicate sends per campaign activation. |
| `updatedAt` | timestamp | Server timestamp. Set by CF on activate/deactivate. |
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

## `faqs/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `question` | string | |
| `answer` | string | |
| `category` | string | `pawn` \| `cannabis` \| `fireworks` \| `general` |
| `order` | number | Display order |
| `updatedAt` | timestamp | |
| `createdAt` | timestamp | |

---

## `preorders/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | Customer UID |
| `itemId` | string | Reference to `items/{id}` |
| `status` | string | `pending` \| `confirmed` \| `ready` \| `collected` \| `cancelled` |
| `quantity` | number | |
| `customerName` | string | Display name for staff inbox — never in `auditLogs` |
| `customerPhone` | string | Phone number for Twilio SMS — never in `auditLogs` |
| `viewTag` | string | `fireworks` — determines SMS language guard and age-gate verification |
| `pickupWindow` | string | Format: `"YYYY-MM-DD HH:MM–HH:MM"` — confirmed by staff on status→ready |
| `smsDeliveredAt` | timestamp | Set by CF after Twilio API call; null if not yet sent or delivery failed |
| `campaignId` | string | Optional. Reference to `campaigns/{id}` if preorder placed during a campaign |
| `staffNotes` | string | Internal — never shown to customer |
| `pickupReminderSentAt` | timestamp | Set by `sendPickupReminders` CF when the 24-hour pre-pickup SMS has been dispatched. Null until sent. Prevents duplicate sends. |
| `updatedAt` | timestamp | Set by CF on every status transition (confirm, ready, collect, cancel) |
| `createdAt` | timestamp | Server timestamp |

---

## `documents/{id}` (E69)

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | E.g., `"Age Gating SOP"` |
| `content` | string | Markdown content |
| `type` | string | `'sop'` \| `'contract'` |
| `version` | string | E.g., `"v1.2"` |
| `isRequired` | boolean | If true, staff must acknowledge before accessing POS |
| `createdBy` | string | Admin UID |
| `updatedAt` | timestamp | |
| `createdAt` | timestamp | |

---

## `socialPosts/{id}` (E70)

| Field | Type | Notes |
|-------|------|-------|
| `content` | string | Post copy |
| `mediaUrls` | array | Links to Firebase Storage assets |
| `platforms` | array | `['facebook', 'instagram', 'twitter', 'tiktok']` |
| `status` | string | `draft` \| `pending_review` \| `approved` \| `published` \| `failed` |
| `authorUid` | string | Staff who created the draft |
| `reviewerUid` | string | Manager/Admin who approved |
| `scheduledFor` | timestamp | Optional. Date/Time to publish |
| `publishedAt` | timestamp | Actual publish time |
| `apiResponseId` | string | External ID from aggregator API |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

- items/{itemId}/imageJobs/{jobId} — [Document] Temporary tracking document for background processing.
