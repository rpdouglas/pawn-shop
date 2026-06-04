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

### E21 · Vitest Unit Testing

> **Persona Gate — E21:**
> - **Developer (Staff):** Fast, reliable verification of code correctness.
> - **Compliance (Marie):** Regression testing for critical compliance logic (age gates, PII filters).

- [x] Install Vitest, jsdom, and React Testing Library `[Staff]`
- [x] Configure `vite.config.ts` and `src/setupTests.ts` `[Staff]`
- [x] Implement initial unit tests for core utilities and components `[Staff]`

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

### E39 · Cannabis Storefront Enhancement

> **Persona Gate — E39:**
> - **Marie (Primary):** Filter panel and layout toggle must not introduce urgency, clinical language, or category disclosure. Controls must be accessible on mobile in under 3 taps.
> - **Marcus:** All card layouts must frame item photography correctly — no cropping of primary images.
> - **Makoonsii:** All touch targets ≥48px. Plain-language labels on all filters.

- [x] Filter panel: mood, category, price range slider, sort controls — client-side, no new Firestore queries `[Marie]` `[Mak]`
- [x] Layout toggle: grid2, grid3, list, magazine modes `[Marie]` `[Jord]`
- [x] `TagBadge` component — `merchandisingTags` displayed with cannabis palette tokens `[Marc]` `[Marie]`
- [x] Enhanced `LuxuryProductCard` — badge strip, list/magazine card variants `[Marc]` `[Marie]`
- [x] All design tokens — zero hardcoded hex, px, or ms values `[Comp]`

---

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

### E59 · Pawn Page Multiple Views

> **Persona Gate — E59:**
> - **Sandra:** Provide consistency in multi-view layouts without losing the Pawn masonry brand identity.

- [x] Abstract LayoutToggle for shared usage `[San]`
- [x] Integrate multiple layouts (masonry, grid3, list) into Pawn Page `[San]`


---

### E53 · Native Web Share

> **Persona Gate — E53:**
> - **Sandra:** Quickly share items with friends. Uses native OS-level share sheet (iOS/Android).

- [x] ShareButton component using `navigator.share` with clipboard fallback `[San]`
- [x] Integrate ShareButton in ItemQuickView and BundleCard `[San]`

---

### E54 · Dedicated Item Landing Pages

> **Persona Gate — E54:**
> - **Kevin / Marie / Tanya:** Links directly to an item provide a premium, full-page desktop/mobile layout.
> - **Compliance:** Direct links to age-gated items (Cannabis/Fireworks/Tobacco) must enforce the router-level Age Gate. Police holds hide the item.

- [x] Create `ItemDetailPage` full-page component `[All]`
- [x] Map `/item/:id` route in `main.tsx` `[All]`
- [x] Dynamic `ViewContext` wrapping and `AgeGate` injection `[Comp]`
- [x] SEO `<title>` and `<meta name="description">` injection `[Jord]` `[Marc]`

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
- [x] E45 Pawn Readability Improvements — Lora font substitution and text contrast `[Mak]` `[UX]`
- [x] E46 Admin Text Contrast — Global lightening of muted text `[Mak]` `[Staff]`
- [x] E47 Mobile Intake Reliability — CF memory bump and frontend state recovery `[Staff]`

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

- [x] Unified `GlobalHeader` with Hamburger Menu `[Mak]` `[All]`
- [x] Contextual page title in header `[All]`
- [x] `NavigationDrawer` with Home, Pawn, Cannabis, Fireworks, Tobacco links `[All]`
- [x] `UserProfileCircle` with dropdown (Sign In / Profile / Sign Out) `[All]`
- [x] Basic `HomePage` landing page (`/`) `[All]`
- [x] Role-gated Admin button in header `[Staff]`

---

### E27 · Homepage Logo Integration

> **Persona Gate — E27:**
> - **Makoonsii:** High-recognition brand signal. Appropriate mobile sizing.
> - **Jordan:** PWA Performance maintenance. No layout shift.

- [x] Optimize and integrate official brand logo on HomePage `[Mak]` `[Jord]`

---

## Phase 8 — Infrastructure

### E24 · CI/CD Pipeline Strategy

> **Persona Gate:** Infrastructure epic. No customer-facing persona directly served.
> Enables safe feature development by separating `dev` and `main` branch deploys.

- [x] `deploy-dev.yml` re-targeted to `dev` branch (was `main`) `[All]`
- [x] `deploy-prod.yml` adds `push: branches: [main]` trigger; temporarily routes to `nats-rack` using `DEV_FIREBASE_*` secrets `[All]`
- [x] Prod switchover comment block embedded in `deploy-prod.yml` (exact steps + prerequisites) `[Staff]`
- [x] `deploy-prod.yml` parity: paths filter, "skip if no package.json" step, event-aware `if:` guard `[All]`
- [x] Decision logged in `DECISIONS.md` `[Staff]`

---

### E44 · CI/CD Testing Pipeline

> **Persona Gate:** Infrastructure epic. No customer-facing persona directly served.
> Enforces the fail-fast deployment pipeline to protect against regressions.

- [x] Modify `deploy-dev.yml` to enforce Lint/Unit/A11y/LHCI gates `[Staff]` `[Comp]`
- [x] Modify `deploy-prod.yml` to enforce Lint/Unit/A11y gates `[Staff]` `[Comp]`

---

### E25 · Header Navigation Refinement

> **Persona Gate — E25:**
> - **Jordan:** Brand prefix "The Pawn Shop - [View]" visible in header on every non-home route. Admin link removed from header bar.
> - **Makoonsii:** Admin link in drawer meets 48px touch target. No navigation regression.
> - **All staff:** Admin Dashboard accessible via hamburger drawer, role-gated to `isStaff`.

- [x] Move admin dashboard link from `UserNav` header to `NavigationDrawer` drawer (staff-only) `[Staff]`
- [x] Update `getPageTitle()` to prefix "The Pawn Shop - " on Pawn, Cannabis, Fireworks, Admin views `[Jord]` `[All]`
- [x] Fix Cycle 23 deferred token violations in `NavigationDrawer.tsx` (`--text-lead`, `--motion-speed-base`) `[Jord]`

---

### E26 · Versioning Strategy

> **Persona Gate:** Infrastructure epic.
> Automates app versioning using CalVer + Git SHA for improved traceability.

- [x] Modify deployment workflows to generate and inject `VITE_APP_VERSION` `[Staff]`
- [x] Display automated version string in Site Footer and Admin Dashboard `[Staff]`

---

---

## Phase 9 — Production Readiness

> **Gate:** All Phase 9 items must be closed before any Phase 10+ work begins in `the-addicts-agenda`. No net-new features ship to production until this phase is complete.

### Cycle 24 QA — Design Token & WCAG Fixes

> **Persona Gate:**
> - **Makoonsii:** Navigation drawer heading must pass WCAG AA contrast in all three views.
> - **Jordan:** No hardcoded px/rem/ms values in any shipped component. Token system must be consistent end-to-end.
> - **Compliance:** axe-core scan must return zero violations after fixes.

- [x] Fix `HomePage.tsx`: replace `maxWidth: '1200px'`, `minHeight: '240px'`, `fontSize: '2rem'`, clamp hero font, and `transition: 'transform 0.2s ease-in-out'` with `--space-*`, `--text-*`, and `--motion-*` tokens `[Jord]` `[Comp]`
- [x] Fix `UserProfileCircle.tsx`: replace all hardcoded `px` and `rem` values with `--space-*` / `--text-*` / `--dropdown-min-width` tokens `[Mak]` `[Jord]`
- [x] Fix `NavigationDrawer.tsx`: change "Navigation" `h2` colour from `--color-primary` to `--color-text-muted` (WCAG AA at 2.8:1 fails in cannabis view) `[Mak]` `[Comp]`
- [x] Run Playwright axe-core scan — zero violations is the close condition `[Mak]` `[Comp]`

---

### E49 · Mobile Intake Image Job Tracker

> **Persona Gate:** Makoonsii — Provides exact real-time UI feedback for upload drops.

- [x] Replace `setTimeout` polling with Firestore tracker in `MobileIntakePage.tsx` `[Comp]`

- [x] Add job tracking `set`/`update` logic to `processImageUpload` and `retryImageProcessing` `[Comp]`

- [x] Add `/imageJobs/{jobId}` rule to `firestore.rules` `[Comp]`

---


### E03-QA · MFA Bypass Confirmation

> Identity Platform upgrade required for production gate.

- [ ] Upgrade Firebase project `the-addicts-agenda` to Identity Platform (console operation) `[Comp]`
- [ ] Verify `assertMfaEnrolled` (in `functions/src/auth.ts`) enforces MFA in production `[Comp]` `[Marie]`
- [ ] Test MFA bypass attempt with staff account in prod — confirm `unauthenticated` error thrown `[Comp]`
- [ ] Log decision date in `DECISIONS.md` `[Comp]`

---

### E06-QA · eBay Webhook Production Credentials

> Config-only — implementation is complete in `functions/src/ebay.ts`.

- [ ] Register `ebayWebhook` deployed URL in eBay developer portal Notification API `[Staff]`
- [ ] Set `EBAY_VERIFICATION_TOKEN` and `EBAY_WEBHOOK_URL` in GitHub Secrets + Firebase Functions env `[Staff]`
- [ ] Run GET challenge verification to confirm eBay handshake `[Staff]`
- [ ] Test sandbox sold event — confirm `status: 'sold'` propagates to Firestore within 60 s `[Dale]` `[Kev]`

---

### E68-QA · Secret Manager Production Provisioning

> **Persona Gate:** Infrastructure and Operations epic.
> Currently, the backend gracefully skips external integrations if a `dummy` key is used. These must be replaced with live keys prior to launch.

- [ ] Obtain production `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`. Update via `firebase functions:secrets:set`. `[Staff]`
- [ ] Obtain production `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`. Update via `firebase functions:secrets:set`. `[Staff]`
- [ ] Obtain `EBAY_USER_TOKEN` and `EBAY_VERIFICATION_TOKEN`. Update via `firebase functions:secrets:set`. `[Staff]`
- [ ] Obtain `BROTHER_POS_HMAC_SECRET`. Update via `firebase functions:secrets:set`. `[Staff]`
- [ ] Configure `BACKUP_BUCKET_NAME` for disaster recovery. Update via `firebase functions:secrets:set`. `[Staff]`

---

### E09-QA · Lighthouse Performance Decision Gate

> Confirm non-negotiable Lighthouse gates pass. Log SSR decision for Phase 14 planning.

- [ ] Confirm Lighthouse accessibility ≥0.90 and SEO ≥0.95 pass on dev build `[Jord]` `[Marc]` `[Comp]`
- [ ] Log SSR deferral decision in `DECISIONS.md` with rationale (performance ≥0.90 blocked by SSR — deferred to Phase 14) `[Staff]`
- [ ] Update `lighthouserc.json` comment to reference E37 (SSR epic in Phase 14) `[Staff]`

---

## Phase 10 — Inventory Intelligence

> **Goal:** Data-driven merchandising. Automate stale-inventory turnover and close the cannabis product data gap vs. Dutchie/Jane. Schema updates in `docs/firestore-schema.md` and `docs/DECISIONS.md` are required before any implementation task begins.

### E28 · Algorithmic Markdown Engine (Dutch Auction)

> **Persona Gate — E28:**
> - **Dale (Authenticity Test):** Price drops must be real — based on staff-configured `markdownRate` and `floorPrice`. No manufactured urgency. `rare-find` and `limited-edition` tags are immune to markdown scheduling.
> - **Kevin (Alert Accuracy):** Price-drop notifications must respect CASL `alertOptIn` and fire within 60 s of the Cloud Function write — same SLA as item alerts.
> - **Sandra:** "Price Dropped" badge must surface in the masonry grid via the existing `MerchandisingBadge` component. No bounce or particle animation.

- [ ] **Schema first:** Update `docs/firestore-schema.md` — add `floorPrice`, `markdownRate`, `markdownPeriodDays`, `markdownEnabled`, `lastMarkdownAt`, `originalPrice` to `items/{id}`. Log in `DECISIONS.md`. `[Staff]` `[Comp]`
- [ ] Create `functions/src/markdownEngine.ts`: `applyMarkdownDrops` scheduled CF (daily 03:00 UTC) — batch price drops, CASL-gated SMS/email alerts, `price_override` audit log entries `[Dale]` `[Kev]` `[Comp]`
- [ ] Create `enableMarkdown` and `disableMarkdown` callable CFs (manager+ only) — staff configures cadence and floor per item `[Staff]` `[Comp]`
- [ ] Extend `functions/src/notifications.ts` — `sendMarkdownAlert` helper: saved-search match on price drop, generic SMS body (no pricing detail in copy — Marie Discretion Test) `[Kev]` `[Marie]` `[Comp]`
- [ ] Admin UI: markdown config panel on item detail page in `src/pages/admin/InventoryPage.tsx` (manager-only gate) `[Staff]`
- [ ] Update `src/components/pawn/MasonryGrid.tsx` and `src/components/ui/Card.tsx`: render "Price Dropped" `MerchandisingBadge` variant when `item.originalPrice` is set `[San]` `[Dale]`
- [ ] Export new CFs from `functions/src/index.ts` `[Staff]`

---

### E29 · Cannabis Product Intelligence

> **Persona Gate — E29:**
> - **Marie (Discretion Test):** No new fields, labels, or analytics events may disclose the cannabis category in CRM output, SMS, or email subjects. "Wellness Profile" is the permitted section heading. No strain names in notification copy.
> - **Jordan:** Spider-chart must render correctly at all breakpoints and meet the dark luxury aesthetic — muted lavender lines, token-based colours only, no external charting library.
> - **Marcus:** All terpene data is staff-entered — never AI-generated. `provenanceNotes` standard applies.

- [x] **Schema first:** Update `docs/firestore-schema.md` — add `cannabisProfile` submap (`thcMin`, `thcMax`, `cbdMin`, `cbdMax`, `terpenes[]`, `geneticLineage`, `effectProfile[]`) to `items/{id}`. Log in `DECISIONS.md`. `[Marie]` `[Comp]`
- [x] Update `src/lib/types.ts` — add `CannabisProfile` interface, extend `Item` interface `[Staff]`
- [x] Extend `src/components/admin/IntakeForm.tsx` — cannabis-specific panel (renders only when `viewTag === 'cannabis'`): THC/CBD ranges, terpene add/remove rows, genetic lineage `[Staff]`
- [x] Create `src/components/cannabis/TerpeneProfile.tsx` — SVG-only spider/radar chart, no charting library dependency `[Marie]` `[Jord]`
- [x] Create `src/components/cannabis/CannabisProductData.tsx` — collapsible panel for product intelligence data on item detail page `[Marie]` `[Jord]`
- [x] Update `src/pages/CannabisPage.tsx` item detail view to include `CannabisProductData` when `item.cannabisProfile` is present `[Marie]`

---

## Phase 11 — Customer Acquisition

> **Goal:** Reduce friction for new pawn customers entering the enquiry funnel via AI-assisted pre-submission triage. Schema updates required before implementation.

### E30 · Gemini Vision Appraisal Engine

> **Persona Gate — E30:**
> - **Dale (Speed Test):** Appraisal result must return within 10 seconds of image upload. Gemini latency is the binding constraint — test against the deployed CF, not emulator.
> - **Makoonsii (Language Test):** Result must display in plain language. Copy template: "Here's what our system found. This is a general guide — our team will give you a final offer." No jargon. No price commitment in any customer-facing string.
> - **Compliance:** Gemini API key stays in Cloud Functions. Appraisal result is transient — not persisted to `aiDescription` subcollection. Result is always framed as an estimate, never a commitment. Rate-limit: 5 calls per UID per hour.

- [ ] **Schema first:** Update `docs/firestore-schema.md` — add `appraisalResult` submap to `pawnRequests/{id}`; add `visionAppraisal` to `items/{id}/internal/ai`. Log in `DECISIONS.md`. `[Comp]`
- [ ] Export `ebayRequest()` helper from `functions/src/ebay.ts` (currently unexported — needed by vision appraisal) `[Staff]`
- [ ] Extend `functions/src/ai.ts` — add `appraisePawnItem` callable CF: Gemini 1.5 Pro vision → item ID → eBay Browse API sold comps → structured result. Rate-limited. Writes `appraisalResult` to `pawnRequests/{id}` if `pawnRequestId` provided. `[Dale]` `[Mak]` `[Comp]`
- [ ] Extend `functions/src/ai.ts` — add `appraiseDraftItem` callable CF (staff-only): vision appraisal on intake items, writes to `items/{id}/internal/ai.visionAppraisal` `[Marc]` `[Staff]`
- [ ] Add `auditLogs` event types: `vision_appraisal_requested`, `vision_appraisal_completed` `[Comp]`
- [ ] Create `src/components/pawn/AppraisalUploader.tsx` — camera-first image capture (`<input capture="environment">`) + drag-drop fallback `[Mak]` `[Dale]`
- [ ] Create `src/components/pawn/AppraisalResult.tsx` — value range card, confidence indicator, "Estimate Only — Not a Commitment" label, CTA to full enquiry `[Mak]` `[Dale]`
- [ ] Update `src/pages/pawn/SellPage.tsx` — add optional "Get Instant Estimate" step above `PawnEnquiryForm` `[Mak]` `[Dale]`
- [ ] Add "AI Appraisal" button to admin item detail page (alongside existing `AiAssistantPanel`) `[Marc]` `[Staff]`
- [ ] Export new CFs from `functions/src/index.ts` `[Staff]`

---

### E57 · AI-First Inventory Intake

> **Persona Gate — E57:**
> - **Jordan + Marcus:** AI descriptions and pricing deep-dives are strictly isolated in `internal/ai` — never exposed directly to the public view without staff review.
> - **Staff:** The first photo uploaded triggers a Gemini Vision background job that automatically fills the form details, reducing manual entry.

- [x] **Schema first:** Update `docs/firestore-schema.md` — add `intakeExtraction` submap to `items/{id}/internal/ai`. Log in `DECISIONS.md`. `[Comp]`
- [x] Extend `functions/src/ai.ts` — add `extractIntakeData` to perform structured data extraction and pricing deep-dive. `[Staff]`
- [x] Update `processUploadedImage` CF to accept `extractData` and trigger `extractIntakeData`. `[Staff]`
- [x] Update Mobile Intake UI to flip the flow: select View -> Photo Upload -> wait for AI -> Form Hydration. `[Staff]`
- [x] Update Desktop Intake UI to trigger AI extraction on the first uploaded photo. `[Staff]`
- [x] Update AI Intake for Cannabis: Create `cannabisStrains` open dataset collection and implement 2-pass AI extraction (Flash -> DB -> Pro) to hydrate `cannabisProfile` reliably. `[Staff]`

---

## Phase 12 — Pawn Services Deepening

> **Goal:** Deepen the customer relationship post-sale with mobile loan management and wallet passes. E31 must land before E32 — wallet passes reference loan ticket data.

### E31 · Pawn Loan Management Portal

> **Persona Gate — E31:**
> - **Makoonsii (Trust Test):** Loan form and ticket viewer must be completable one-handed in portrait mode. 48 px touch targets throughout. Plain language copy — no financial jargon.
> - **Compliance:** Audit log entry required on every loan status change (`loan_ticket_created`, `extension_requested`, `extension_approved`, `extension_declined`, `loan_forfeited`, `loan_redeemed`). All status changes via Cloud Function Admin SDK — no client writes to `loanTickets`.

- [ ] **Schema first:** Update `docs/firestore-schema.md` — add `loanTickets/{id}` collection (`uid`, `pawnRequestId`, `itemDescription`, `loanAmount`, `interestRate`, `periodDays`, `dueDate`, `status`, `extensionCount`, `staffNotes`, timestamps). Add `pawnLoanId` link to `pawnRequests/{id}`. Log all in `DECISIONS.md`. `[Comp]`
- [ ] Update Firestore rules: customer read own tickets (`isOwner`), staff read/write all, public blocked `[Comp]`
- [ ] Create `functions/src/loanTickets.ts`: `createLoanTicket` (staff-only), `requestExtension` (customer — `isOwner`), `processExtension` (staff-only), `checkLoanDueDates` scheduled CF (daily — 48 h forfeit alert + SMS, CASL-gated) `[Mak]` `[Dale]` `[Comp]`
- [ ] Add `auditLogs` event types for all loan lifecycle events `[Comp]`
- [ ] Create `src/pages/LoanTicketsPage.tsx` — customer-facing ticket list, route `/pawn/my-loans` (auth-gated) `[Mak]` `[Dale]`
- [ ] Create `src/components/pawn/LoanTicketCard.tsx` — loan summary card (reuses `Card`, `Badge` from `src/components/ui/`) `[Mak]`
- [ ] Create `src/components/pawn/ExtensionRequestModal.tsx` — extension request confirmation (reuses `Modal`) `[Mak]`
- [ ] Add loan ticket list to `/admin` — staff view of all active tickets by status/due date (reuses `Table`) `[Staff]`
- [ ] Add `/pawn/my-loans` link to `NavigationDrawer` (authenticated users only) `[All]`
- [ ] Export new CFs from `functions/src/index.ts` `[Staff]`

---

### E32 · Digital Pawn Wallets

> **Persona Gate — E32:**
> - **Tanya (Confirmation Test):** Wallet pass URL must be included in the reservation confirmation SMS within 60 seconds of `status: 'confirmed'`.
> - **Makoonsii:** Pass content must use plain language. Item category for cannabis must not appear in pass text — use "wellness item" or reference number only.
> - **Compliance:** Apple and Google Wallet signing credentials go through Secret Manager (same pattern as Twilio/SendGrid). Never client-side.
> - **External dependency gate:** Do not begin implementation until Apple Developer Program membership and Google Pay & Wallet Console service account are confirmed available.

- [ ] **Schema first:** Update `docs/firestore-schema.md` — add `walletPassId` and `walletPassUrl` to `reservations/{id}`, `preorders/{id}`, and `loanTickets/{id}`. Log in `DECISIONS.md`. `[Comp]`
- [ ] Create `functions/src/walletPasses.ts`: `generateReservationPass` (Firestore-triggered on `confirmed`), `generateLoanTicketPass` (callable — dep: E31), `updatePassStatus` (internal helper for completion/forfeiture) `[Tan]` `[Mak]` `[Comp]`
- [ ] Integrate `passkit-generator` (Apple `.pkpass`) and Google Wallet REST API — signing credentials via Secret Manager `[Staff]` `[Comp]`
- [ ] Add `auditLogs` event types: `wallet_pass_generated`, `wallet_pass_updated` `[Comp]`
- [ ] Update `functions/src/lib/sms.ts` — include `walletPassUrl` short link in reservation confirmation SMS `[Tan]`
- [ ] Update `src/components/pawn/ClickCollectModal.tsx` — add "Add to Apple Wallet" / "Add to Google Wallet" CTAs on confirmation state `[Tan]` `[Mak]`
- [ ] Update `src/pages/LoanTicketsPage.tsx` (E31) — add wallet pass buttons on each active ticket card `[Mak]`
- [ ] Export new CFs from `functions/src/index.ts` `[Staff]`

---

## Phase 13 — Operational Excellence

> **Goal:** Improve internal staff efficiency (peak-season fireworks pick-path) and address monolithic backend tech debt. E34 CF Refactor must ship last — after all Phase 10–12 CFs are stable.

### E33 · Staff Pick-Path Optimizer

> **Persona Gate — E33:**
> - **Tanya (60s SLA):** `completePickItem` must trigger `status: 'ready'` transition and confirmation SMS to the customer within 60 seconds.
> - **Compliance:** Staff-only route (manager/admin/inventory_staff claims). No PII in the pick list — order reference + item title only.

- [ ] **Schema first:** Update `docs/firestore-schema.md` — add `pickPathAssignedTo`, `pickPathOrder`, `pickPathCompletedAt` to `preorders/{id}`. Log in `DECISIONS.md`. `[Comp]`
- [ ] Create `functions/src/pickPath.ts`: `generatePickPath` callable (staff-only — orders by category), `assignPickPath` callable (staff-only), `completePickItem` callable (staff-only — fires `status: 'ready'` + customer SMS) `[Tan]` `[Staff]`
- [ ] Add `auditLogs` event types: `pick_path_generated`, `pick_path_item_completed` `[Comp]`
- [ ] Create `src/pages/admin/PickPathPage.tsx` — staff pick list: date range selector, sequenced order rows grouped by category, checkbox per item (`completePickItem` CF call). Reuses `Table` component. `[Tan]` `[Staff]`
- [ ] Add route `/admin/pick-path` (staff-gated) and link in `NavigationDrawer` staff section `[Staff]`
- [ ] Export new CFs from `functions/src/index.ts` `[Staff]`

---

### E34 · Cloud Functions Modular Refactor

> **Persona Gate:** Infrastructure epic — no customer-facing persona directly served. Enables targeted deploys per function group, reducing CI/CD blast radius.
> **Dependency:** All CFs from E28–E33 must be stable in production before restructure begins.

- [ ] Define and document grouping strategy in `DECISIONS.md`: `inventory`, `reservations`, `pawn`, `ai`, `notifications`, `compliance`, `admin` groups `[Staff]`
- [ ] Create group subdirectories under `functions/src/groups/` — move source files, create per-group `index.ts` `[Staff]`
- [ ] Refactor `functions/src/index.ts` to import from group index files (no function name changes) `[Staff]`
- [ ] Update `.github/workflows/deploy-dev.yml` and `deploy-prod.yml` — add path-aware targeted deploy steps (`firebase deploy --only functions:groupName`) `[Staff]`
- [ ] Run full Emulator Suite regression after restructure — zero CF name or behaviour regressions `[Staff]` `[Comp]`

---

## Phase 14 — Future Horizons

> **Goal:** Innovative differentiators that require the most R&D investment and the longest external dependency lead times. Sequence after all Phase 13 features are stable in production.

### E35 · Store Mode Geo-Fencing

> **Persona Gate — E35:**
> - **Makoonsii (Trust Test):** Store Mode activates only on explicit location permission grant — never silently. Permission prompt must explain purpose in plain language (PIPEDA). If permission is denied, Store Mode is simply not available — no degraded state shown.
> - **Sandra:** In-store scanning must surface the full item detail within 3 seconds of QR scan decode.
> - **Compliance:** Location data is never sent to Firestore, Cloud Functions, or analytics. Proximity check is client-side only. Log this decision in `DECISIONS.md`.

- [ ] **Schema first:** Update `docs/firestore-schema.md` — add `latitude`, `longitude`, `geofenceRadiusMetres` to `config/shopInfo`. Log in `DECISIONS.md`. `[Comp]`
- [ ] Create `src/hooks/useStoreMode.ts` — Geolocation API `watchPosition()`, Haversine distance check against `config/shopInfo` coordinates, debounced 10 s intervals `[San]` `[Mak]` `[Comp]`
- [ ] Create `src/components/layout/StoreModeHeader.tsx` — "You're in The Pawn Shop" header with large "Scan Item" CTA; camera capture via `<input capture="environment">`; QR decode via lightweight library (evaluate `html5-qrcode` bundle impact first) `[San]` `[Mak]`
- [ ] Update `src/App.tsx` — conditionally swap `GlobalHeader` for `StoreModeHeader` based on `useStoreMode()` `[All]`
- [ ] Create `functions/src/storeMode.ts`: `getItemByQrTag(tagId)` callable CF (public — reads active items only) `[San]` `[Staff]`
- [ ] In-store item detail view: surface `ProvenanceBadge` (E36) prominently; read-only `AiAssistantPanel` appraisal result if available; no checkout/click-and-collect CTAs in Store Mode `[San]` `[Marc]`
- [ ] Export new CF from `functions/src/index.ts` `[Staff]`

---

### E36 · Authenticated Trust Ledgers

> **Persona Gate — E36:**
> - **Marcus (Photography + Provenance):** "Verified Provenance" badge must only appear when a manager or admin has explicitly sealed the provenance via the admin tool — never auto-applied on publish.
> - **Jordan:** Verification UI must be plain-language. Customers see: "Independently Verified on [date] by The Pawn Shop staff." No cryptographic detail visible.
> - **Dale (Authenticity Test):** Hash verification callable is public — any customer can independently verify. Result shows pass/fail + verified date. No price or staff identity disclosed.
> - **Compliance:** Hash computed server-side only (`node:crypto` in Cloud Function). `provenanceNotes` remain staff-write-only. Badge copy passes Makoonsii plain-language standard.

- [ ] **Schema first:** Update `docs/firestore-schema.md` — add `provenanceLedger` map (`hash`, `snapshot`, `verifiedAt`, `verifiedBy`, `badgeVisible`) to `items/{id}`. Log in `DECISIONS.md`. `[Comp]`
- [ ] Create `functions/src/provenance.ts`: `sealProvenance` callable (manager+ only — SHA-256 hash of canonical snapshot, sets `badgeVisible: true`, writes `provenance_sealed` audit log), `verifyProvenanceHash` callable (public — re-computes hash from stored snapshot, returns `{ verified, verifiedAt }`) `[Marc]` `[Dale]` `[Comp]`
- [ ] Add `auditLogs` event type: `provenance_sealed` `[Comp]`
- [ ] Create `src/components/pawn/ProvenanceBadge.tsx` — "Verified Provenance" badge with modal: what was verified, date, "Verify" button calling `verifyProvenanceHash` CF, pass/fail result. Reuses `Badge`, `Modal` from `src/components/ui/`. `[Marc]` `[Dale]` `[Jord]`
- [ ] Update `src/components/pawn/ItemQuickView.tsx` — display `ProvenanceBadge` when `item.provenanceLedger?.badgeVisible == true` `[Marc]` `[Dale]`
- [ ] Add `sealProvenance` button to admin item detail view (manager-only) `[Staff]`
- [ ] Export new CFs from `functions/src/index.ts` `[Staff]`

---

### E37 · Vite SSR (Lighthouse Performance ≥0.90)

> **Persona Gate — E37:**
> - **Jordan (PWA Standard):** Lighthouse performance ≥0.90 on simulated 4G after SSR is enabled. This is the single measure of success for this epic.
> - **Compliance:** Age gates (`AgeGate.tsx`) must use client-only hydration in SSR — server has no session context. This must be verified before the epic closes.
> - **All:** Zero functional regressions across all three views after SSR ships. Persona smoke tests (E09 standard) must re-pass.
> **Dependency:** All Phase 10–14 features must be stable in production before SSR refactoring begins.

- [ ] Log SSR approach decision in `DECISIONS.md`: Vite SSR (`renderToString`) in a Firebase Cloud Functions v2 `onRequest` CF + Hosting rewrite — no meta-framework migration `[Staff]`
- [ ] Create `src/entry-server.tsx` and `src/entry-client.tsx` — split from existing `src/main.tsx` `[Jord]` `[All]`
- [ ] Create `ssrRenderer` Cloud Function (`onRequest`) — imports Vite SSR bundle, calls `renderToString`, injects into `index.html` shell `[Jord]` `[All]`
- [ ] Configure Firebase Hosting rewrite: `{ "source": "**", "function": "ssrRenderer" }` — static assets bypass via direct Hosting paths `[All]`
- [ ] Age gate SSR handling — render placeholder server-side; client hydration replaces with session-aware gate `[Marie]` `[Tan]` `[Comp]`
- [ ] Audit all components for `typeof window !== 'undefined'` guards (browser-only APIs) `[Jord]` `[Comp]`
- [ ] Run LHCI — confirm performance ≥0.90 on simulated 4G `[Jord]`
- [ ] Update `lighthouserc.json` — promote performance threshold back to `["error", { "minScore": 0.9 }]` `[Jord]`
- [ ] Re-run full persona smoke tests across all three views `[All]` `[Comp]`

---

---

### E40 · Cannabis Mobile Mood Pills

> **Persona Gate — E40:**
> - **Marie:** Maintains the premium wellness aesthetic. Pills must not look "cheap" or "budget". They must use the `.view-cannabis` primary color for active states.
> - **Kevin:** Tap targets must remain large enough (minimum 48px height or padding) for quick, reliable selection on mobile.

- [x] Create `src/components/cannabis/MoodPillStrip.tsx` using the design system tokens. `[Marie]`
- [x] Update `CannabisPage.tsx` to conditionally display pills on mobile and cards on desktop. `[Marie]` `[Kev]`

---

### E41 · Mobile Staff Inventory

> **Persona Gate — E41:**
> - **Staff (Primary):** Shop floor staff must be able to view all inventory as mobile cards and add a new item — including taking a photo — from a 375px viewport in under 3 taps.
> - **Makoonsii:** All touch targets ≥48px. Plain language throughout.
> - **Marcus:** Camera-first intake reinforces the photography standard — photo is Step 1.

- [x] Add `AdminMobileNav.tsx` — bottom tab bar for admin routes on mobile (`< 1024px`) `[Staff]`
- [x] Update `AdminLayout.tsx` to render `AdminMobileNav` on mobile `[Staff]`
- [x] Refactor `InventoryPage.tsx` — card layout on mobile, table preserved on desktop `[Staff]` `[Mak]`
- [x] Add client-side search + status filter chips to mobile inventory view `[Staff]` `[Dale]`
- [x] Update `ImageUploadZone.tsx` — add `capture="environment"` for native camera on mobile `[Staff]` `[Marc]`

### Phase 14: E61 — Mobile Intake UX Refinement
- [x] Refactor `MobileIntakePage.tsx` to move title to Details step
- [x] Implement cycling AI loading states during image processing

### Phase 14: E62 — User Role Management
- [x] Write `E62_USER_ROLE_MANAGEMENT.md` Spec and Plan
- [x] Create `RoleControls.tsx` for CRM
- [x] Update `CustomerDetailPage.tsx` to include `RoleControls` for Admins
- [x] Create `MobileIntakePage.tsx` — 3-step camera-first intake flow (`/admin/mobile-intake`) `[Staff]` `[Marc]` `[Mak]`
- [x] Register `/admin/mobile-intake` route in `main.tsx` `[Staff]`

---

### E42 · Inventory Cost, Quantity & POS Integration

> **Persona Gate — E42:**
> - **Staff (Primary):** Cost and quantity fields must be settable during item creation (mobile and desktop intake) and quantity must be adjustable from the inventory view without a desktop.
> - **Makoonsii:** All quantity adjustment controls ≥48px touch targets. Plain language copy ("Stock Level", not "SKU Quantity").
> - **Dale:** Customer-facing pages must never expose the `cost` field. Subcollection isolation verified before close.

- [x] **Schema first:** Update `docs/firestore-schema.md` — add `quantity`, `posId`, `posSyncStatus`, `posLastSyncAt` to `items/{id}`; add `items/{id}/internal/staff` subcollection with `cost`. Log all in `DECISIONS.md`. `[Staff]` `[Comp]`
- [x] Update `firestore.rules` — existing `match /internal/{doc}` wildcard already covers `internal/staff`; no new rule required. `[Staff]` `[Comp]`
- [x] Update `src/lib/types.ts` — extend `Item`; add `StaffInternalDoc`, `PosSyncStatus`, `AdjustInventoryPayload` `[Staff]`
- [x] Create `adjustInventory` callable CF — validates staff role, applies signed quantity delta, writes `inventory_quantity_adjusted` audit log `[Staff]` `[Comp]`
- [x] Create `receivePosWebhook` HTTP CF stub — HMAC-verified Brother POS webhook receiver (stub: parse + log; no live processing until credentials available) `[Staff]`
- [x] Create `src/components/admin/QuantityAdjustControl.tsx` — `−`/`+` controls (≥48px), calls `adjustInventory` CF `[Staff]` `[Mak]`
- [x] Update `MobileIntakePage.tsx` — add Cost and Quantity fields to Step 2 `[Staff]` `[Marc]`
- [x] Update `IntakeForm.tsx` (desktop) — add Cost and Quantity fields to pricing section `[Staff]`
- [x] Update `InventoryPage.tsx` — render `QuantityAdjustControl` on cards (mobile) and table rows (desktop); show "Out of Stock" badge when `quantity === 0` `[Staff]` `[Dale]`
- [x] Export new CFs from `functions/src/index.ts` `[Staff]`

---

### E43 · Image Upload Performance

> **Persona Gate — E43:**
> - **Staff (Primary):** Image thumbnails must appear within 2 seconds of selection on a 500 KB/s connection. Upload must recover automatically from a dropped connection without manual retry.
> - **Makoonsii:** No regression to existing touch targets or camera flow. Plain-language status copy throughout.
> - **Marcus:** CF watermark + WebP pipeline must be untouched — final customer-visible image quality is unchanged.

- [x] Add `browser-image-compression` to `package.json` `[Staff]`
- [x] Update `src/components/admin/ImageUploadZone.tsx` — compress to max 1920px / WebP 80% before upload `[Staff]` `[Marc]`
- [x] Update `src/components/admin/ImageUploadZone.tsx` — optimistic preview via `URL.createObjectURL()` shown immediately on file selection `[Staff]` `[Marc]`
- [x] Update `src/components/admin/ImageUploadZone.tsx` — auto-retry with exponential backoff (3 attempts: 500 ms / 1 s / 2 s) on upload failure `[Staff]` `[Mak]`
- [x] Update `src/components/admin/ImageUploadZone.tsx` — clear "failed" state after all retries exhausted, with manual retry CTA `[Staff]` `[Mak]`
- [x] Log `browser-image-compression` dependency decision in `docs/DECISIONS.md` `[Comp]`

---

### E60 · AI Governance & Automation Subagents

> **Persona Gate — E60:**
> - **Marcus:** Subagents enforce cultural and merchandising integrity.
> - **Compliance:** Enforces all rules automatically during development.

- [x] Define `Linguistic_Auditor` subagent `[Marc]` `[Comp]`
- [x] Define `Data_Steward` subagent `[Staff]`
- [x] Define `Performance_Engineer` subagent `[Jord]`
- [x] Define `Brand_Auditor` subagent `[Comp]`

---

*The Pawn Shop · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
