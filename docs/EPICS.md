# Epics

> Build roadmap. Work top to bottom — each phase unblocks the next.
> Tick tasks as you go. Open a GitHub Issue when you start each epic.

---

## Phase 1 — Foundation

### E01 · Dev Environment Setup
- [ ] Codespace opens and Firebase CLI is available (`firebase --version`)
- [ ] Firebase Emulator Suite starts without errors
- [ ] Vite dev server starts and app loads on port 5173
- [ ] `deploy-dev.yml` triggers on push and deploys to `rpd-pawn-shop-dev`
- [ ] GitHub Secrets set (14 Actions secrets + 6 Codespaces secrets)
- [ ] `.env.local` populated from Codespaces Secrets and excluded from git
- [ ] Firestore rules and indexes deployed to both projects

### E02 · Three-View Design System
- [ ] Tailwind v4 `@theme` tokens — Pawn (`#C8A14A` / `#080706`)
- [ ] Tailwind v4 `@theme` tokens — Cannabis (`#7B4FA0` / `#1A0D2E`)
- [ ] Tailwind v4 `@theme` tokens — Fireworks (`#C0392B` / `#1A0A0A`)
- [ ] `ViewContext` provider reads URL prefix, injects `.view-*` CSS class on root
- [ ] Core components: Button, Badge, Card, Modal, Input, Table (Pawn base)
- [ ] Cannabis component variants (cinematic hero, mood card, luxury product card)
- [ ] Fireworks component variants (countdown timer, bundle card, urgency badge)
- [ ] WCAG AA contrast passes on all three palettes (run axe-core in browser)
- [ ] PWA manifest configured (per-view icons + theme colours)

### E03 · Auth & Staff Roles
- [ ] Firebase Auth: email/password + Google SSO
- [ ] Five custom claims: `admin` `manager` `inventory_staff` `marketing_staff` `customer`
- [ ] Cloud Function to assign/revoke roles
- [ ] `AuthContext` and `ProtectedRoute` components
- [ ] MFA enforced for all staff — TOTP mandatory (**hard compliance requirement**)
- [ ] MFA bypass tested and confirmed impossible
- [ ] `auditLogs` writing: `login` `logout` `role_change` `mfa_enrolled`

---

## Phase 2 — Core Product

### E04 · Inventory Schema & Intake
- [ ] `items/{id}` v3 schema documented in `firestore-schema.md` (update file first)
- [ ] Admin intake form: receive → condition grade → photo upload → pricing → publish
- [ ] Multi-image upload to Firebase Storage (watermark via Cloud Function, not client-side)
- [ ] Hold system: status → `reserved` + `holdExpiresAt`
- [ ] `resetExpiredHolds` Cloud Function (scheduled, every 30 min)
- [ ] QR label generation per item
- [ ] `searchTokens[]` array built from title + category on every write
- [ ] Firestore rules: public read only when `status == 'active'` and `policeHold != true`

### E05 · Three-View Storefronts
- [ ] `/pawn` `/cannabis` `/fireworks` routes with correct ViewContext theme
- [ ] Homepage per view: hero, featured items, search bar
- [ ] Shop/listing page with prefix search (via `searchTokens`)
- [ ] Item detail page: image gallery, condition, price, enquiry CTA
- [ ] Age gate at route level: `/cannabis` (19+) `/fireworks` (18+)
- [ ] Every age gate pass/fail logged to `auditLogs`
- [ ] Mobile-responsive across all three views

### E07 · Pawn Form & Inbox
- [ ] Customer pawn enquiry form (item description, photos, contact info)
- [ ] `onPawnRequestCreate` Cloud Function: serial blacklist check, police hold flag if match, admin alert
- [ ] `pawnRequests/{id}` collection written on submit
- [ ] Staff admin inbox: view requests, update status, add notes

### E08 · Click & Collect / Contact
- [ ] Click-and-collect request form on item detail pages
- [ ] `reservations/{id}` collection + status flow (pending → confirmed → completed)
- [ ] Staff confirms/declines pickup window
- [ ] Contact page with form routing to staff email
- [ ] Google Maps embed (store location)

---

## Phase 3 — Discovery & Merchandising

### E13 · Merchandising Engine
- [ ] Staff picks admin UI
- [ ] `calculateTrendingScore` Cloud Function (view + save + enquiry count)
- [ ] Auto-tagging: `just-arrived` (< 48h), `rare-find` (staff-set only)
- [ ] Collection pages per view (Cannabis: Relax/Focus/Social/Ceremony; Fireworks: bundles)
- [ ] Quick-view modal (pre-fetch on hover)
- [ ] Related items on detail page (same category + view, sorted by trending score)
- [ ] Masonry grid on Pawn homepage; vertical video on Cannabis + Fireworks pages
- [ ] Search decision: keep Firestore prefix tokens or add Algolia — log in `DECISIONS.md`

### E06 · eBay Cross-Posting
- [ ] Push item to eBay from admin (Cloud Function — API key never on client)
- [ ] `ebayListingId` stored on `items/{id}`
- [ ] Status sync: sold on eBay → item sold in Firestore
- [ ] Basic eBay category mapping per `viewTag`

### E09 · Quality, Security & Accessibility
- [ ] Firestore security rules audit (all collections)
- [ ] `purgeExpiredData` Cloud Function — PIPEDA retention schedule
- [ ] Serial blacklist admin management UI
- [ ] Keyboard navigability audit across all three views
- [ ] axe-core clean (no failures in browser dev tools)
- [ ] `/accessibility` page live
- [ ] Lighthouse: ≥90 performance, ≥90 accessibility, ≥95 SEO (run in Codespace browser)
- [ ] Kanien'keha copy community-reviewed before any publication

---

## Phase 4 — Conversion & Admin Intelligence

### E10 · Analytics, Feature Flags & Admin Dashboard
- [ ] GA4 custom events: page views per view, item views, enquiry submits, age-gate events, pawn form submits
- [ ] Firebase Remote Config for feature flags
- [ ] Admin dashboard: inventory counts by status + view, pawn request volume, top items
- [ ] `policeHold` flag management in admin (admin-only)
- [ ] UTM parameters captured per session

### E17 · Conversion Optimisation
- [ ] Recently sold strip on homepage (sourced from `onItemSold` Firestore events)
- [ ] Years in business badge + testimonials module
- [ ] Privacy-safe live activity feed (city-level only, rate-limited, no PII)
- [ ] `limited-edition` / `rare-find` display (staff-set only — never manufactured)
- [ ] Hold countdown badge on reserved items

### E14 · Seasonal Campaign Scheduler
- [ ] `campaigns/{id}` collection
- [ ] `activateCampaign` + `deactivateCampaign` Cloud Functions (scheduled)
- [ ] Admin campaign calendar UI
- [ ] Countdown timer component for active campaigns
- [ ] Fireworks pre-order: `preorders/{id}`, payment-on-pickup flow

### E11 · Compliance Programme
- [ ] Age gate audit log entries confirmed working for all gate events
- [ ] `purgeExpiredData` schedule documented in `DECISIONS.md`
- [ ] Jurisdiction legal review scheduled (get counsel before launch)
- [ ] NVDA + VoiceOver spot-check on all three storefronts
- [ ] `/accessibility` page confirmed live

---

## Phase 5 — Retention & Post-Sale

### E15 · CRM & Retention
- [ ] `users/{uid}` CRM fields: `purchaseHistory[]` `inquiryHistory[]` `lifetimeValue` `segments[]`
- [ ] VIP flag + reseller tiers (bronze/silver/gold) — staff-set only
- [ ] Automated follow-ups: 48h staff reminder on pending pawn requests; 72h customer follow-up on quoted items
- [ ] `/admin/crm` dashboard: customer profile view, engagement score
- [ ] Cross-view browsing flag (`crossViewFlag`) tracking

### E12 · Alerts & Notifications
- [ ] `savedSearches/{id}` collection + customer UI to save searches
- [ ] Favourites/wishlist on item detail pages
- [ ] `onItemCreated` Cloud Function: match saved searches, dispatch SMS (Twilio) or email (SendGrid) within 60s
- [ ] In-app notification centre (mark as read)
- [ ] Seasonal reminders + pickup confirmation SMS
- [ ] CASL: `alertOptIn == true` checked before every send
- [ ] Weekly digest email per view

### E16 · Post-Sale Operations
- [ ] Return/dispute ticket form (customer or staff)
- [ ] `disputes/{id}` collection: status, refund log, staff notes
- [ ] eBay disputes pulled from API and manageable in admin
- [ ] Resolving a return updates `items/{id}.status` if item is restocked

---

## Phase 6 — AI & Editorial

### E18 · AI Assistant (Staff-Facing)
- [ ] `generateAIDescription` Cloud Function (callable, Claude or Gemini, staff review gate — no auto-publish)
  - High-value items: prompt includes provenance, cultural context, scarcity
  - Draft saved to `aiDescription` only — Firestore rule prevents customer read
- [ ] eBay title optimiser (AI suggests, staff accepts/edits)
- [ ] Auto-tagging: min 3 suggestions per item, staff confirms
- [ ] Price suggestion: eBay sold comps range, guidance only, never a published price
- [ ] Duplicate detection: alert before publishing if similar item exists

### E19 · Editorial CMS & Brand Narrative
- [ ] `articles/{id}` collection + admin editor + public article pages per view
- [ ] About page + founder story + Akwesasne identity section
- [ ] Warriors of Akwesasne series — first edition
  - **Kanien'keha phrases: community review required — no AI generation**
- [ ] Finds of the Week — first edition, templated for non-technical staff
- [ ] Local SEO landing pages (≥6) with JSON-LD LocalBusiness schema
- [ ] FAQ engine — admin-editable Q&A

---

*The Pawn Shop · Cornwall Island, Akwesasne*
