# Epics

> Build roadmap. Work top to bottom — each phase unblocks the next.
> Tick tasks as you go. Open a GitHub Issue when you start each epic.
>
> **Persona tags** appear after each task in `[brackets]`.
> Every task serves at least one persona. See `docs/PERSONAS.md` for full profiles.
> Run the Persona Gate (listed under each epic) before starting work on that epic.

---

## Persona Tag Key

| Tag | Persona | Primary view |
|---|---|---|
| `[Mak]` | Makoonsii — The Reserve Regular | Pawn |
| `[Dale]` | Dale — The Cross-Border Bargain Hunter | Pawn |
| `[Tan]` | Tanya — The Seasonal Celebrator | Fireworks |
| `[Marie]` | Marie — The Wellness Seeker | Cannabis |
| `[Kev]` | Kevin — The Reseller & Picker | Pawn |
| `[San]` | Sandra — The Curious Passerby | Pawn |
| `[Jord]` | Jordan — The Lifestyle Connoisseur | All views |
| `[Marc]` | Marcus — The Dapper Connoisseur | All views |
| `[Staff]` | Internal staff — admin, manager, inventory_staff | Admin UI |
| `[Comp]` | Compliance requirement — no persona ships without this | All views |
| `[All]` | All personas benefit | All views |

---

## Phase 1 — Foundation

### E01 · Dev Environment Setup

> **Persona Gate:** Infrastructure epic. No customer-facing persona directly served.
> However: if the emulator doesn't run cleanly, no feature can be tested to persona standards.
> This is the floor everything else is built on.

- [x] Codespace opens and Firebase CLI is available (`firebase --version`) `[All]`
- [x] Firebase Emulator Suite starts without errors `[All]`
- [x] Vite dev server starts and app loads on port 5173 `[All]`
- [x] `deploy-dev.yml` triggers on push and deploys to `nats-rack` `[All]`
- [x] GitHub Secrets set (14 Actions secrets + 6 Codespaces secrets) `[All]`
- [x] `.env.local` populated from Codespaces Secrets and excluded from git `[All]`
- [x] Firestore rules and indexes deployed to both projects `[Comp]`
- [x] Docs-as-Code Planning workflow: plans saved to `docs/plans/` `[Staff]`

---

### E02 · Three-View Design System

> **Persona Gate — E02:**
> - **Makoonsii:** Touch targets ≥48px. IM Fell English body font legible at 16px minimum. High contrast on `#080706` background.
> - **Marie:** `.view-cannabis` dark luxury aesthetic matches premium wellness brand standards. Cormorant Garamond renders at correct weights.
> - **Tanya:** `.view-fireworks` high-energy palette and Bebas Neue headline render correctly on mobile.
> - **Marcus (Photography Test):** Every `.view-*` layout must frame product photography correctly — dark backgrounds, macro-scale presentation. No layout that crops or clips the primary image.
> - **All:** WCAG AA contrast passes on all three palettes before any view ships.

- [x] Tailwind v4 `@theme` tokens — Pawn (`#C8A14A` primary / `#080706` bg) `[Mak]` `[Dale]` `[Kev]` `[San]`
- [x] Tailwind v4 `@theme` tokens — Cannabis (`#7B4FA0` primary / `#1A0D2E` bg) `[Marie]`
- [x] Tailwind v4 `@theme` tokens — Fireworks (`#C0392B` primary / `#1A0A0A` bg) `[Tan]`
- [x] `ViewContext` provider reads URL prefix, injects `.view-*` CSS class on root `[All]`
- [x] Core components: Button, Badge, Card, Modal, Input, Table (Pawn base) `[Mak]` `[Dale]`
- [x] Cannabis component variants (cinematic hero, mood card, luxury product card) `[Marie]`
- [x] Fireworks component variants (countdown timer, bundle card, urgency badge) `[Tan]`
- [ ] WCAG AA contrast passes on all three palettes (run axe-core in browser) `[Mak]` `[Comp]`
- [x] PWA manifest configured (per-view icons + theme colours) `[Jord]` `[Marc]`

---

### E03 · Auth & Staff Roles

> **Persona Gate — E03:**
> - **Marie (Compliance Anchor):** MFA for staff is non-negotiable. A staff account without MFA that can access customer cannabis purchase data is a compliance failure.
> - **Kevin:** Role system enables VIP tier management (E15). Staff must be able to set `vipFlag` — that requires the role system to work.
> - **Makoonsii:** Auth must not create friction for customers. Guest browse must be possible without account creation. Account creation must be simple, large-target, plain-language.
> - **All staff flows:** `auditLogs` events for `login`, `logout`, `role_change`, `mfa_enrolled` are compliance requirements — not optional.

- [x] Firebase Auth: email/password + Google SSO `[All]`
- [x] Five custom claims: `admin` `manager` `inventory_staff` `marketing_staff` `customer` `[Staff]` `[Comp]`
- [x] Cloud Function to assign/revoke roles `[Staff]`
- [x] `AuthContext` and `ProtectedRoute` components `[All]`
- [x] MFA enforced for all staff — TOTP mandatory (**hard compliance requirement**) `[Comp]` `[Marie]`
- [ ] MFA bypass tested and confirmed impossible `[Comp]` — pending Identity Platform upgrade (see DECISIONS.md)
- [x] `auditLogs` writing: `login` `logout` `role_change` `mfa_enrolled` `[Comp]`

---

## Phase 2 — Core Product

### E04 · Inventory Schema & Intake

> **Persona Gate — E04:**
> - **Dale:** `searchTokens[]` accuracy directly determines how fast he finds and verifies items. Poor tokenisation = slow search = Dale leaves.
> - **Kevin:** `searchTokens[]` accuracy also determines alert matching quality. A badly tokenised item means Kevin's saved search misses it.
> - **Marcus:** `provenanceNotes` field must exist and be staff-writable before any high-value item can be presented to his standard. `merchandisingTags[]` controls `rare-find` — staff-set only, enforced by rule.
> - **Comp:** `policeHold: true` must hide item from all public reads immediately on write. Verify in emulator before this epic closes.

- [x] `items/{id}` v3 schema documented in `firestore-schema.md` (update file first) `[All]`
- [x] Admin intake form: receive → condition grade → photo upload → pricing → publish `[Staff]`
- [x] Multi-image upload to Firebase Storage (watermark via Cloud Function, not client-side) `[Marc]` `[Jord]` `[Staff]`
- [x] Hold system: status → `reserved` + `holdExpiresAt` `[Dale]` `[Kev]`
- [x] `resetExpiredHolds` Cloud Function (scheduled, every 30 min) `[Dale]` `[Kev]`
- [x] QR label generation per item `[Staff]`
- [x] `searchTokens[]` array built from title + category on every write `[Dale]` `[Kev]`
- [x] Firestore rules: public read only when `status == 'active'` and `policeHold != true` `[Comp]`

---

### E05 · Three-View Storefronts

> **Persona Gate — E05:**
> - **Sandra (Primary — Pawn homepage):** Pawn homepage uses masonry grid, not standard grid. If it renders as a uniform list, the Sandra experience fails and the feature does not ship.
> - **Marie (Primary — Cannabis):** Age gate at `/cannabis` route level before any cannabis data renders. 19+ modal is full-screen, session-scoped. Every pass/fail logged to `auditLogs`.
> - **Tanya (Primary — Fireworks):** Age gate at `/fireworks` route level. 18+ enforced. Every pass/fail logged.
> - **Makoonsii:** Mobile-responsive Pawn view with large touch targets and high-contrast text.
> - **All views:** Mobile-responsive across all three before any view ships to dev.

- [x] `/pawn` `/cannabis` `/fireworks` routes with correct ViewContext theme `[All]`
- [x] Homepage per view: hero, featured items, search bar `[Mak]` `[Marie]` `[Tan]`
- [x] Shop/listing page with prefix search (via `searchTokens`) `[Dale]` `[Kev]`
- [x] Item detail page: image gallery, condition, price, enquiry CTA `[Dale]` `[Marc]`
- [x] Masonry grid layout on Pawn homepage `[San]`
- [x] Age gate at route level: `/cannabis` (19+) — full-screen, session-scoped `[Marie]` `[Comp]`
- [x] Age gate at route level: `/fireworks` (18+) — full-screen, session-scoped `[Tan]` `[Comp]`
- [x] Every age gate pass/fail logged to `auditLogs` `[Comp]`
- [x] Mobile-responsive across all three views `[Mak]` `[All]`

---

### E07 · Pawn Form & Inbox

> **Persona Gate — E07:**
> - **Makoonsii:** Pawn form must be completable one-handed, in portrait mode, with large touch targets. Plain-language field labels. No jargon.
> - **Dale:** Serial blacklist check gives Dale confidence that the platform takes item integrity seriously — it builds trust in the overall pricing model.
> - **Compliance:** Every pawn form submission triggers a serial blacklist check. A match sets `serialBlacklistFlag: true` and fires an admin alert. This is not optional.

- [x] Customer pawn enquiry form (item description, photos, contact info) `[Mak]` `[Dale]`
- [x] `onPawnRequestCreate` Cloud Function: serial blacklist check, police hold flag if match, admin alert `[Comp]` `[Staff]`
- [x] `pawnRequests/{id}` collection written on submit `[Mak]` `[Dale]`
- [x] Staff admin inbox: view requests, update status, add notes `[Staff]`

---

### E08 · Click & Collect / Contact

> **Persona Gate — E08:**
> - **Tanya (Primary):** Click-and-collect confirmation must arrive via SMS within 60 seconds of `reservations/{id}` creation. Pickup window must be a specific time slot — "we'll call you" fails the Tanya spec.
> - **Sandra:** Click-and-collect CTA on item detail page must be reachable in ≤3 taps from the Pawn homepage.
> - **Makoonsii:** Contact page must include Google Maps embed (store location on Cornwall Island) with large, accessible tap targets for directions.

- [x] Click-and-collect request form on item detail pages `[Tan]` `[San]`
- [x] `reservations/{id}` collection + status flow (pending → confirmed → completed) `[Tan]`
- [x] Staff confirms/declines pickup window `[Staff]`
- [x] SMS confirmation fires within 60 seconds of reservation creation `[Tan]` `[Comp]`
- [x] Contact page with form routing to staff email `[Mak]`
- [x] Google Maps embed (store location) `[Mak]`

---

## Phase 3 — Discovery & Merchandising

### E13 · Merchandising Engine

> **Persona Gate — E13:**
> - **Sandra (Primary):** Staff Picks are editorial endorsements — first-person curator voice, not algorithmic bullets. Quick-view modals open within 200ms. Masonry grid: non-uniform layout required.
> - **Marie:** Mood Collections for cannabis (Relax/Focus/Social/Ceremony) are the navigation system for this view. Marie does not browse by SKU.
> - **Marcus:** `rare-find` tag may only appear when genuinely rare — staff confirms. Quick-view photography must meet dark luxury standard.
> - **Dale + Kevin:** Search decision (Firestore prefix tokens vs Algolia) must be documented in `DECISIONS.md`. Sub-300ms response is the target.

- [x] Staff picks admin UI `[San]` `[Marc]` `[Staff]`
- [x] `calculateTrendingScore` Cloud Function (view + save + enquiry count) `[San]` `[Kev]`
- [x] Auto-tagging: `just-arrived` (< 48h), `rare-find` (staff-set only) `[Marc]` `[Kev]` `[Comp]`
- [x] Collection pages per view (Cannabis: Relax/Focus/Social/Ceremony; Fireworks: bundles) `[Marie]` `[Tan]`
- [x] Quick-view modal (pre-fetch on hover, opens within 200ms) `[San]`
- [x] Related items on detail page (same category + view, sorted by trending score) `[Jord]` `[Marc]`
- [ ] Vertical video on Cannabis + Fireworks pages (masonry grid: done E05; video: content dependency — deferred) `[San]` `[Marie]` `[Tan]`
- [x] Search decision: keep Firestore prefix tokens or add Algolia — log in `DECISIONS.md` `[Dale]` `[Kev]`

---

### E06 · eBay Cross-Posting

> **Persona Gate — E06:**
> - **Dale (Primary):** eBay status sync (`sold on eBay → item sold in Firestore`) directly prevents the worst Dale experience: arriving at the store for an item sold online. This task is a trust feature, not an ops feature.
> - **Kevin:** Real-time `ebayListingId` sync means Kevin's saved search alerts are accurate — no alerts fire for items already listed and moving on eBay.
> - **Staff:** eBay push must go through a Cloud Function. API key never on client.

- [x] Push item to eBay from admin (Cloud Function — API key never on client) `[Staff]` `[Comp]`
- [x] `ebayListingId` stored on `items/{id}` `[Dale]` `[Kev]`
- [x] Status sync: sold on eBay → item `status: 'sold'` in Firestore immediately `[Dale]` `[Kev]`
- [x] Basic eBay category mapping per `viewTag` `[Staff]`

---

### E09 · Quality, Security & Accessibility

> **Persona Gate — E09:**
> - **Makoonsii (Primary):** This is the Makoonsii epic. axe-core clean, keyboard navigability, WCAG AA, VoiceOver spot-check — Makoonsii is the standard setter for the platform's accessibility floor. If she can't use it, it doesn't ship.
> - **Compliance:** Firestore security rules audit is a compliance requirement. `purgeExpiredData` schedule must be documented in `DECISIONS.md` before prod.
> - **Jordan + Marcus:** Lighthouse ≥90 performance and ≥95 SEO are Jordan and Marcus's PWA quality bar.
> - **Kanien'kéha:** Any Kanien'kéha in the codebase at this point must be flagged for community review before the `/accessibility` page goes live.

- [x] Firestore security rules audit (all collections) `[Comp]`
- [x] `purgeExpiredData` Cloud Function — PIPEDA retention schedule `[Comp]` `[Marie]`
- [x] Serial blacklist admin management UI `[Staff]` `[Comp]`
- [x] Keyboard navigability audit across all three views `[Mak]` `[Comp]`
- [x] axe-core clean (no failures in browser dev tools) `[Mak]` `[Comp]`
- [x] `/accessibility` page live `[Mak]` `[Comp]`
- [ ] Lighthouse: ≥90 performance, ≥90 accessibility, ≥95 SEO `[Jord]` `[Marc]`
- [x] Kanien'kéha copy community-reviewed before any publication `[Mak]` `[Marc]` `[Comp]`

---

## Phase 4 — Conversion & Admin Intelligence

### E10 · Analytics, Feature Flags & Admin Dashboard

> **Persona Gate — E10:**
> - **All personas — No PII:** Every GA4 custom event must exclude PII. No names, emails, or UIDs in Analytics event parameters.
> - **Kevin:** `policeHold` flag management must be admin-only and immediately hide the item from all public views — including any real-time analytics feeds.
> - **Dale:** Pawn request volume in the admin dashboard helps staff understand demand — which informs pricing and sourcing decisions that Dale eventually benefits from.

- [x] GA4 custom events: page views per view, item views, enquiry submits, age-gate events, pawn form submits `[All]` `[Comp]`
- [x] Firebase Remote Config for feature flags `[All]`
- [x] Admin dashboard: inventory counts by status + view, pawn request volume, top items `[Staff]`
- [x] `policeHold` flag management in admin (admin-only) `[Staff]` `[Comp]`
- [x] UTM parameters captured per session `[All]`
- [x] Inventory Management page (`/admin/inventory`) and branded 404 handler `[Staff]` `[Comp]`

---

### E20 · Staff Management & Scheduling

> **Persona Gate — E20:**
> - **Managers:** Must be able to see all staff members and their roles. Role updates must be immediate.
> - **Staff:** Shift schedule must be accessible and assignment-clear (Pawn/Cannabis/Fireworks).
> - **Compliance:** Shift CRUD must be role-gated. Audit logs must capture all shift modifications.

- [x] `getStaffMembers` Cloud Function (Manager/Admin only) `[Staff]` `[Comp]`
- [x] Staff Management UI: list members, update roles via `assignRole` `[Staff]`
- [x] Shift Scheduling UI: calendar-style list, create/delete shifts `[Staff]`
- [x] Personal Schedule UI: staff see their own shifts only `[Staff]`
- [x] `auditLogs` for `shift_created`, `shift_updated`, `shift_deleted` `[Comp]`

---

### E17 · Conversion Optimisation

> **Persona Gate — E17:**
> - **Sandra (Primary):** Live activity feed must be privacy-safe (city-level only, rate-limited, no PII). A live feed that surfaces identifiable information is a compliance failure and an anti-persona design.
> - **Marcus:** `limited-edition` and `rare-find` display is authentic only. Any display of these tags must source from staff-set `merchandisingTags[]` — never from inventory age or quantity calculations.
> - **Makoonsii:** "Years in business" badge and testimonials module build the trust signal she needs. Copy must be warm, community-rooted — not generic.
> - **Dale:** Recently sold strip validates deal quality. Real data only — `onItemSold` events, not manufactured.

- [x] Recently sold strip on homepage (sourced from `onItemSold` Firestore events — real data only) `[Dale]` `[San]`
- [x] Years in business badge + testimonials module `[Mak]`
- [x] Privacy-safe live activity feed (city-level only, rate-limited, no PII) `[San]` `[Comp]`
- [x] `limited-edition` / `rare-find` display (staff-set only — never manufactured) `[Marc]` `[Comp]`
- [x] Hold countdown badge on reserved items `[Kev]` `[Dale]`

---

### E14 · Seasonal Campaign Scheduler

> **Persona Gate — E14:**
> - **Tanya (Primary):** This entire epic is built for Tanya. Countdown timers must display real campaign end dates from `campaigns/{id}.endDate` — never a fake countdown. Fireworks season is a curated event, not a manufactured urgency play.
> - **Makoonsii:** Campaign banners should use the brand voice — not aggressive retail copy.
> - **Marie:** Cannabis seasonal campaigns must still pass the Marie Discretion Test. No category disclosure in any campaign CRM communications.

- [x] `campaigns/{id}` collection `[Tan]`
- [x] `activateCampaign` + `deactivateCampaign` Cloud Functions (scheduled) `[Tan]` `[Staff]`
- [x] Admin campaign calendar UI `[Tan]` `[Staff]`
- [x] Countdown timer component for active campaigns (real dates only) `[Tan]` `[Comp]`
- [x] Fireworks pre-order: `preorders/{id}`, payment-on-pickup flow `[Tan]`

---

### E11 · Compliance Programme

> **Persona Gate — E11:**
> - **Marie (Primary):** This epic's age gate audit, PIPEDA retention, and anonymous enquiry feature are built primarily for Marie. If the cannabis view fails the compliance programme audit, it does not ship to prod.
> - **Tanya:** Fireworks age gate (18+) included in the same audit.
> - **Makoonsii:** NVDA + VoiceOver spot-check is Makoonsii's accessibility audit. She is the accessibility standard.
> - **All:** Get legal counsel before launch. This is not a suggestion.

- [x] Age gate audit log entries confirmed working for all gate events `[Marie]` `[Tan]` `[Comp]`
- [x] `purgeExpiredData` schedule documented in `DECISIONS.md` `[Comp]` `[Marie]`
- [x] Jurisdiction legal review scheduled (get counsel before launch) `[Comp]`
- [x] NVDA + VoiceOver spot-check on all three storefronts `[Mak]` `[Comp]`
- [x] `/accessibility` page confirmed live `[Mak]` `[Comp]`

---

## Phase 5 — Retention & Post-Sale

### E15 · CRM & Retention

> **Persona Gate — E15:**
> - **Kevin (Primary):** VIP tier (`vipFlag`, `resellerTier`) is the retention mechanism built for Kevin. Engagement scoring surfaces candidates — staff confirms. Never auto-assigned.
> - **Marcus:** Cross-view browsing (`crossViewFlag`) enables the lifestyle CRM journey that keeps Marcus engaged across all three views. VIP early access is Marcus's reward.
> - **Marie:** All CRM automations must pass the Marie Discretion Test before activating. Automated follow-up for cannabis/fireworks views must use generic language.
> - **Kevin:** 48h staff reminder on pending pawn requests — this is the Kevin conversion trigger. A pawn request that goes unresponded for 48h means Kevin (or Dale) has moved on.

- [x] `users/{uid}` CRM fields: `purchaseHistory[]` `inquiryHistory[]` `lifetimeValue` `segments[]` `[All]`
- [x] VIP flag + reseller tiers (bronze/silver/gold) — staff-set only `[Kev]` `[Marc]` `[Comp]`
- [x] Automated follow-ups: 48h staff reminder on pending pawn requests; 72h customer follow-up on quoted items `[Kev]` `[Dale]`
- [x] `/admin/crm` dashboard: customer profile view, engagement score `[Staff]`
- [x] Cross-view browsing flag (`crossViewFlag`) tracking `[Jord]` `[Marc]`

---

### E12 · Alerts & Notifications

> **Persona Gate — E12:**
> - **Kevin (Primary):** The 60-second alert SLA is not a target — it is a pass/fail requirement. Test it in the Firebase emulator: create a matching item, confirm the Cloud Function dispatches within 60 seconds. If it doesn't, the epic is not done.
> - **Marie:** CASL `alertOptIn == true` checked before every send. No exceptions. Any alert that fires without this check is a compliance failure.
> - **Marie (Discretion):** Weekly digest email per view must use generic "The Pawn Shop Update" language. No category words in subject lines.
> - **Tanya:** Seasonal reminders for fireworks (Canada Day, Victoria Day) are the Tanya retention mechanism. Pickup confirmation SMS uses specific time slots.

- [x] `savedSearches/{id}` collection + customer UI to save searches `[Kev]`
- [x] Favourites/wishlist on item detail pages `[San]` `[Marc]`
- [x] `onItemCreated` Cloud Function: match saved searches, dispatch SMS (Twilio) or email (SendGrid) within 60 seconds `[Kev]` `[Comp]`
- [x] In-app notification centre (mark as read) `[Kev]` `[San]`
- [x] Seasonal reminders + pickup confirmation SMS `[Tan]`
- [x] CASL: `alertOptIn == true` checked before every send `[Marie]` `[Kev]` `[Comp]`
- [x] Weekly digest email per view (generic subject line — no category disclosure) `[Jord]` `[Marc]` `[Marie]`

---

### E16 · Post-Sale Operations

> **Persona Gate — E16:**
> - **Makoonsii:** Return/dispute form must be simple, plain-language, accessible — one-handed mobile usable.
> - **Dale:** eBay disputes pulled from API and manageable in admin — Dale's cross-border purchases sometimes require post-sale resolution. A broken dispute flow ends his trust in the platform.
> - **Staff:** Resolving a return that restocks an item must update `items/{id}.status` immediately — so Kevin's alerts work correctly on restocked items.

- [x] Return/dispute ticket form (customer or staff) `[Mak]` `[Dale]`
- [x] `disputes/{id}` collection: status, refund log, staff notes `[Dale]` `[Comp]`
- [x] eBay disputes pulled from API and manageable in admin `[Dale]` `[Staff]`
- [x] Resolving a return updates `items/{id}.status` if item is restocked `[Kev]` `[Staff]`

---

## Phase 6 — AI & Editorial

### E18 · AI Assistant (Staff-Facing)

> **Persona Gate — E18:**
> - **Jordan + Marcus (Primary quality drivers):** AI descriptions must go beyond condition grade into provenance, cultural context, and collecting significance where applicable. Marcus reads the full description. If it reads like a product datasheet, it fails.
> - **Dale:** AI-informed pricing (eBay sold comps) must be accurate enough that Dale's cross-reference check confirms the listing price is credible.
> - **Staff review gate (Compliance):** Every Gemini output is a draft. It saves to `aiDescription` only. Staff must explicitly promote to `description`. No exceptions. This is enforced at the Cloud Function level, the Firestore rule level, and the UI level.
> - **Kanien'kéha Rule:** AI must never generate Kanien'kéha. Embed this constraint in every Gemini system prompt. See `docs/prompts/GEMINI_INITIALIZATION.md`.

- [x] `generateAIDescription` Cloud Function (callable, Gemini, staff review gate — no auto-publish) `[Jord]` `[Marc]` `[Comp]`
  - High-value items: prompt includes provenance, cultural context, scarcity `[Marc]`
  - Draft saved to `aiDescription` only — Firestore rule prevents customer read `[Comp]`
- [x] eBay title optimiser (AI suggests 3 variants, staff selects) `[Dale]` `[Staff]`
- [x] Auto-tagging: min 3 suggestions per item, staff confirms each `[All]` `[Comp]`
- [x] Price suggestion: eBay sold comps range, guidance only, never a published price `[Dale]` `[Comp]`
- [x] Duplicate detection: alert before publishing if similar item exists `[Staff]`

---

### E19 · Editorial CMS & Brand Narrative

> **Persona Gate — E19:**
> - **Makoonsii + Marcus (Primary):** This is the most persona-critical epic in the entire roadmap. The Akwesasne identity, the Warriors of Akwesasne series, and the Kanien'kéha integration are the reason Makoonsii trusts The Pawn Shop and the reason Marcus shares it.
> - **Kanien'kéha (Hard rule):** No Kanien'kéha phrase enters any article, heading, or collection name without community review and `indigenousLanguageReviewed: true` set on the article. Every single instance. No shortcuts.
> - **Sandra + Jordan:** Finds of the Week is the editorial hook that brings Sandra back and keeps Jordan engaged. It must be photographed to dark luxury standard (Marcus Photography Test) before publishing.

- [x] `articles/{id}` collection + admin editor + public article pages per view `[Jord]` `[Marc]` `[Mak]`
- [x] About page + founder story + Akwesasne identity section `[Mak]` `[Marc]`
- [x] Warriors of Akwesasne series — first edition `[Mak]` `[Marc]` `[Jord]`
  - **Kanien'kéha phrases: community review required — no AI generation** `[Comp]`
  - `indigenousLanguageReviewed: true` must be set before publishing any article with Kanien'kéha `[Comp]`
- [x] Finds of the Week — first edition, templated for non-technical staff `[San]` `[Marc]` `[Jord]`
  - Must pass Marcus Photography Test before each edition is published `[Marc]`
- [x] Local SEO landing pages (≥6) with JSON-LD LocalBusiness schema `[Dale]`
- [x] FAQ engine — admin-editable Q&A `[Mak]`

---

## Phase 7 — App Shell & Navigation

### E23 · Unified Global Header

> **Persona Gate — E23:**
> - **Makoonsii (Primary):** Hamburger menu toggle, drawer links, and profile circle must meet the 48px hit area standard. Navigation must be intuitive and accessible on small viewports.
> - **Staff:** Admin Dashboard must remain role-gated and easily accessible via the unified header.

- [ ] Unified `GlobalHeader` with Hamburger Menu `[Mak]` `[All]`
- [ ] Contextual page title in header `[All]`
- [ ] `NavigationDrawer` with Home, Pawn, Cannabis, Fireworks, Tobacco links `[All]`
- [ ] `UserProfileCircle` with dropdown (Sign In / Profile / Sign Out) `[All]`
- [ ] Basic `HomePage` landing page (`/`) `[All]`
- [ ] Role-gated Admin button in header `[Staff]`

---

*The Pawn Shop · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
