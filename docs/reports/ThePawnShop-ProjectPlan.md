# The Pawn Shop — Project Plan
**Cornwall Island · Akwesasne**
*Extracted from Technical Report v1.0 · June 2026*

---

## Pre-Launch Blockers

> ⚠️ These must be resolved before any public traffic hits the site.

| # | Blocker | Status |
|---|---------|--------|
| 1 | **Identity Platform upgrade** — TOTP MFA bypass currently in place (`assertMfaEnrolled` disabled). Compliance risk for admin operations. | Open |
| 2 | **App Check re-enable (E77)** — temporarily disabled in dev (June 5, 2026). Backend exposed to unauthenticated CF calls and billing abuse without it. | Open |
| 3 | **Legal page copy** — Privacy Policy and Terms of Use contain `[LEGAL REVIEW REQUIRED]` placeholder sections throughout. Must be replaced with counsel-approved text. | Open |
| 4 | **Fireworks age gate confirmation** — EPICS.md says 18+, design-system.md says 19+. Business owner must confirm before prod. | Open |
| 5 | **Stripe integration (E78)** — zero online revenue capability without payment processing. | Phase 1 |

---

## Phase 1 — Revenue Enablement
**Weeks 1–4 · Priority: CRITICAL / HIGH**

---

### E78 · Stripe Integration (Payment Gateway)
**Priority: CRITICAL · Estimated effort: 10–12 developer-days**

- [ ] Create Stripe Connect account (enables future marketplace payments to consignors)
- [ ] Add `STRIPE_SECRET_KEY` to Firebase Secret Manager; `stripe-js` to client bundle
- [ ] **CF: `createPaymentIntent(itemId, amount, type)`** — types: `deposit`, `full_payment`, `pawn_loan_deposit`; admin/manager only
- [ ] **CF: `stripeWebhook`** — handles `payment_intent.succeeded` → updates reservation/preorder to `paid` status, writes auditLog entry
- [ ] **UI: `PaymentModal` component** — Stripe Elements (card + Apple Pay + Google Pay). Accessible with `aria-describedby` for error states.
- [ ] **Schema additions:**
  - `reservations/{id}.paymentIntentId`
  - `reservations/{id}.paymentStatus`
  - `preorders/{id}.depositPaid`
- [ ] Stripe webhook signing verification (`STRIPE_WEBHOOK_SECRET`)
- [ ] E2E test with Stripe test mode (mock webhook events)

**Business impact:** Enables online deposits for click-and-collect, fireworks preorder deposits (reduces no-shows), and pawn loan issuance.

---

### E79 · Brother POS Live Integration
**Priority: HIGH · Estimated effort: 6–8 developer-days** *(requires Brother POS credentials)*

- [ ] Activate `receivePosWebhook` CF (HMAC-SHA256 stub already verified and in place)
- [ ] Add processing logic: parse `posSyncStatus: 'pending'` → match/create items in Firestore via Admin SDK
- [ ] **CF: `pushPosSoldStatus`** — bidirectional sync: Firestore `item.status → 'sold'` pushes status update to POS
- [ ] Handle POS item create → Draft item with `posSyncStatus` in Firestore → staff review before publish
- [ ] Add `posSyncStatus` indicator to admin inventory table (synced / pending / error)
- [ ] **Reconciliation CF (daily scheduled):** compare POS quantity vs Firestore quantity, flag discrepancies in admin dashboard

---

### E80 · Pawn Loan Lifecycle UI
**Priority: HIGH · Estimated effort: 8–10 developer-days**

- [ ] **Extend `loanTickets` schema:**
  - `principal` (CAD cents)
  - `interestRatePct`
  - `termDays`
  - `dueDate`
  - `redemptionAmount`
  - `status` — `active` | `redeemed` | `forfeited` | `extended`
- [ ] **CF: `issueLoanTicket(pawnRequestId, principal, term)`** — admin/manager only; generates loan ticket with due date calculation
- [ ] **CF: `redeemLoan(loanTicketId, paymentIntentId)`** — validates Stripe payment, transitions ticket to `redeemed`, item back to `active`
- [ ] **CF: `forfeitLoan(loanTicketId)`** — admin only; transitions item to `active` (shop-owned for resale), loan to `forfeited`
- [ ] **UI:** Loan Ticket detail page in admin portal with redemption workflow, Stripe payment capture, and extension option
- [ ] **Customer-facing:** Loan status visible in `/profile` Activity History tab
- [ ] SMS reminder 3 days before due date (extend `sendPickupReminders` CF pattern to loans)

---

## Phase 2 — Acquisition & SEO
**Weeks 5–9 · Priority: HIGH / MEDIUM**

---

### E81 · Google Business Profile API Integration
**Priority: HIGH · Estimated effort: 8–10 developer-days**

- [ ] Register in Google Business Profile API (requires Google Cloud project + OAuth 2.0)
- [ ] **CF: `syncGbpHours`** — Firestore trigger on `config/storeHours` write → pushes updated hours to GBP API automatically
- [ ] **CF: `fetchGbpReviews` (daily scheduled)** — fetches new reviews, stores in `gbpReviews/{id}` collection
- [ ] **CF: `postGbpUpdate(content, photoUrl)`** — admin posts Google Updates (promotions, events) from admin portal
- [ ] **Schema: `gbpReviews/{id}`** — reviewer, rating, comment, replied, replyText; admin-only write for replies
- [ ] **UI: Review Dashboard** in admin portal — display rating, recent reviews, flag/respond workflow

**SEO impact:** GBP signals (hours accuracy, review responses, posts) are the #1 local SEO ranking factor. Directly impacts foot traffic and organic web traffic.

---

### E82 · SSR Evaluation & Implementation
**Priority: MEDIUM-HIGH · Estimated effort: 12–16 developer-days**

- [ ] **Decision gate first:** measure current Lighthouse Performance score on production
  - If ≥ 0.6 → defer
  - If ≤ 0.4 → implement
- [ ] Evaluate options: Vite SSR (Vite 8 native) vs Firebase Hosting + Cloud Run vs Next.js migration cost
- [ ] **Recommended approach:** Vite SSR with Firebase Cloud Run for critical SEO pages only:
  - `/pawn/item/:id`
  - `/cannabis/item/:id`
  - Local SEO landing pages (6 pages)
  - Admin portal remains SPA
- [ ] SSR must pass the **Marie Discretion Test** — no cannabis category identifiers in server-rendered HTML for anonymous requests
- [ ] Hydration strategy: SPA hydration on client after server render

---

### E83 · Algolia Search Integration
**Priority: MEDIUM · Estimated effort: 6–8 developer-days**

**Trigger:** Only implement when production traffic data shows >300ms P95 search latency OR customer search abandonment rate >40%.

- [ ] **CF: `syncItemToAlgolia`** — Firestore trigger on items write; sync title, description, category, viewTag, price, condition, status, merchandisingTags; exclude `internal/ai` subcollection
- [ ] **CF: `deleteItemFromAlgolia`** — on item soft or hard delete
- [ ] **Client:** replace `useItemSearch` Firestore prefix-token query with Algolia InstantSearch React; maintain existing `FilterPanel` UX
- [ ] Configure typo tolerance and synonym handling (pawn/sell, etc. — cannabis synonyms handled carefully per Marie Discretion Test; pawn view only)
- [ ] **PIPEDA compliance:** Algolia must be configured as a data processor under a Data Processing Agreement; no PII in indexed records

---

### E84 · Review & Reputation Management
**Priority: MEDIUM · Estimated effort: 5–6 developer-days**

- [ ] **Post-completion review prompt:** 24-hour delayed SendGrid email after reservation completed or preorder collected, linking to Google Maps listing
- [ ] Admin UI: review response workflow with templated replies (relies on `gbpReviews` from E81)
- [ ] **Trust badge:** display aggregate GBP rating in `PawnHero` and cannabis hero components
- [ ] *(Optional)* Trustpilot integration: CF to push completed reservations to Trustpilot verified reviews API

---

## Phase 3 — Retention & Loyalty
**Weeks 10–14 · Priority: MEDIUM**

---

### E85 · Loyalty Points Economy
**Priority: MEDIUM · Estimated effort: 10–12 developer-days**

- [ ] **Extend `users/{uid}` schema:**
  - `loyaltyPoints` (integer)
  - `loyaltyTier` — `bronze` | `silver` | `gold` | `platinum`
  - `users/{uid}/pointsHistory` subcollection
- [ ] **CF: `awardLoyaltyPoints(uid, action, amount)`** — called by `completeReservation`, `submitPawnRequest`, preorder collection
  - Purchase: 100 pts per $ spent
  - Referral: 500 pts
  - Review: 50 pts
  - Birthday bonus: 200 pts
- [ ] **CF: `redeemLoyaltyPoints(uid, points, reservationId)`** — validates balance, applies discount, writes pointsHistory entry
- [ ] **Tier thresholds and perks:**
  - Bronze (0+) — base access
  - Silver (500+) — priority pickup windows
  - Gold (2,000+) — exclusive preorder access
  - Platinum (10,000+) — extended pawn terms
- [ ] **UI:** Loyalty card in `/profile` — points balance, tier progress bar, redemption interface
- [ ] **Admin:** Points award/adjust UI in CRM Customer Detail page (admin/manager only)

---

### E86 · Web Push Notifications (FCM)
**Priority: MEDIUM · Estimated effort: 6–8 developer-days**

- [ ] Add Firebase Cloud Messaging (FCM) to `firebase-core.ts` (service worker registration)
- [ ] **Schema:** `users/{uid}.fcmTokens` (array) — updated on each login from each device
- [ ] **CF: `sendPushNotification(uid, title, body, actionUrl)`** — wraps FCM send; called by: reservation confirmation, preorder ready, savedSearch alert, loan due reminder
- [ ] **UI:** Push permission prompt — shown post-consent, signed-in users only; dismissable with 30-day snooze
- [ ] **Service worker:** `firebase-messaging-sw.js` at root — handles background push, click-to-open item page
- [ ] Complement (not replace) existing SMS/email channel — push is zero-cost and instant

---

### E87 · Internal Analytics Dashboard
**Priority: MEDIUM · Estimated effort: 8–10 developer-days**

- [ ] **Revenue metrics:** daily/weekly/monthly sales (from `completeReservation` auditLog events), average order value, revenue by view (pawn/cannabis/fireworks/tobacco)
- [ ] **Inventory metrics:** turnover rate (avg days to sell by category), slow-moving items (>30 days active), stock-out frequency
- [ ] **Customer metrics:** new vs returning ratio, LTV distribution, VIP tier distribution, cross-view engagement rate
- [ ] **Acquisition metrics:** UTM campaign performance (from `sessionStorage` capture in `main.tsx`), search-to-reservation conversion
- [ ] **Implementation:** recharts (already in React dependency tree) + Firestore aggregation queries; no external BI tool required at current scale
- [ ] Access: admin and manager only; TanStack Query cache with 15-min staleTime for revenue data

---

### E88 · Tax Calculation & Receipt Generation
**Priority: MEDIUM · Estimated effort: 4–5 developer-days**

> ⚠️ Consult tax counsel before implementation — First Nations tax exemption rules apply to Akwesasne territory.

- [ ] **CF: `calculateTax(items, customerProvince, exemptionCode)`** — returns tax breakdown (GST, HST, PST, exempt amounts)
- [ ] **Schema additions:**
  - `reservations/{id}.taxBreakdown`
  - `pawnRequests/{id}.taxBreakdown`
- [ ] **UI:** Tax breakdown display on `PaymentModal` (E78); receipt generation via browser print or Cloud Function PDF
- [ ] **Cannabis excise tax:** Canadian federal excise duty applies; enforce correct rates server-side in CF

---

## Phase 4 — Operations & Scale
**Weeks 15–20 · Priority: LOW / LOW-MEDIUM**

---

### E89 · Inventory Forecasting
**Priority: LOW-MEDIUM · Estimated effort: 8–10 developer-days**

- [ ] Demand signals: `viewCount`, `enquiryCount`, `reservationCount` per item/category; historical `soldAt` timestamps
- [ ] **CF: `calculateCategoryVelocity` (weekly scheduled)** — computes days-to-sell P50/P90 by category and viewTag; writes to `config/inventoryForecasts`
- [ ] **Reorder alerts:** if active items in a category fall below admin-configurable `reorderThreshold`, trigger admin notification
- [ ] **Seasonality weighting:**
  - Fireworks: June–July spike weighting
  - Cannabis: weekly cadence tracking
- [ ] **UI:** Forecasting panel in admin dashboard; slow-mover list; recommended restock quantities

---

### E90 · Advanced Customer Search Experience
**Priority: LOW-MEDIUM · Estimated effort: 6–8 developer-days** *(assumes Algolia from E83 is complete)*

- [ ] **Voice search:** Web Speech API integration on mobile cannabis and pawn pages
- [ ] **Visual search:** Upload-an-image-to-find-similar-items flow
  - CF sends image to Gemini Vision for category/description extraction
  - Extracted terms used to query Algolia
- [ ] **Personalised results:** boost items matching user's `purchaseHistory` + `viewCount` tracking from `users/{uid}`
- [ ] **Saved searches UI:** let customers name and manage `savedSearches` from `/profile`; email/push alert on new inventory match

---

### E91 · Staff Training / LMS
**Priority: LOW · Estimated effort: 8–10 developer-days**

- [ ] **Extend `documents` collection:**
  - `quizQuestions` (array of `{question, options, correctIndex}`)
  - `passingScore`
  - `certificationName`
- [ ] **CF: `submitQuizAttempt(documentId, answers)`** — grades quiz, creates `users/{uid}/signatures/{documentId}` with score and pass/fail status
- [ ] **UI:** Training module viewer (Markdown rendered, quiz at end); progress tracker in HRTab on `/profile`
- [ ] **Admin:** Training completion dashboard — who has passed what, who is overdue; CSV export
- [ ] **Onboarding checklist:** auto-generated for new staff based on role (inventory_staff vs manager vs admin have different checklists)

---

### E92 · Multi-Location Preparation
**Priority: LOW · Estimated effort: 5–6 developer-days** *(architectural preparation only)*

- [ ] Add `locationId` field to: `items`, `reservations`, `campaigns`, `config/storeHours`
- [ ] Extend `ViewContext` to be location-aware (currently single-location only)
- [ ] **CF: `createLocation(locationData)`** — admin only; initialises `storeHours` config for new location
- [ ] **Admin UI:** location selector in admin portal header; all queries scoped by `locationId` when present
- [ ] Preserve single-location behaviour as default (`locationId: 'cornwall-island'` hardcoded) — no breaking changes to existing collections

---

## Summary Timeline

| Epic | Name | Weeks | Priority | Effort (dev-days) |
|------|------|-------|----------|-------------------|
| E78 | Stripe Integration | 1–2 | 🔴 CRITICAL | 10–12 |
| E79 | POS Live Integration | 2–3 | 🔴 HIGH | 6–8 |
| E80 | Pawn Loan Lifecycle UI | 3–4 | 🔴 HIGH | 8–10 |
| E81 | Google Business Profile API | 5–6 | 🟠 HIGH | 8–10 |
| E82 | SSR Evaluation & Implementation | 5–8 | 🟠 HIGH | 12–16 |
| E83 | Algolia Search | 7–8 | 🟡 MEDIUM | 6–8 |
| E84 | Review & Reputation Management | 8–9 | 🟡 MEDIUM | 5–6 |
| E85 | Loyalty Points Economy | 10–12 | 🟡 MEDIUM | 10–12 |
| E86 | Web Push Notifications (FCM) | 11–12 | 🟡 MEDIUM | 6–8 |
| E87 | Internal Analytics Dashboard | 12–14 | 🟡 MEDIUM | 8–10 |
| E88 | Tax Calculation & Receipts | 13–14 | 🟡 MEDIUM | 4–5 |
| E89 | Inventory Forecasting | 15–17 | 🟢 LOW-MED | 8–10 |
| E90 | Advanced Search (Voice + Visual) | 16–18 | 🟢 LOW-MED | 6–8 |
| E91 | Staff LMS / Training | 17–19 | 🟢 LOW | 8–10 |
| E92 | Multi-Location Preparation | 19–20 | 🟢 LOW | 5–6 |

**Total estimated effort: ~120–145 developer-days across ~20 weeks**

---

*The Pawn Shop · Cornwall Island, Akwesasne · Project Plan v1.0 · June 2026*
