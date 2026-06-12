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
- [x] Create `users/{uid}/hrData` secure sub-collection for sensitive employee PII and HR data `[Comp]`
- [x] Add detailed `schedulePreferences` day-by-day availability grid to support future automated scheduling engines `[Staff]`
- [x] Build `HRTab` component and integrate into Employee `ProfilePage` and Admin `StaffList` override modal `[Staff]`
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

### E95 · CI Test Gating — Remove A11y/E2E from Push Pipeline

> **Persona Gate:** Infrastructure epic. No customer-facing persona directly served.
> Improves developer velocity during active dev cycles by moving slow E2E/A11y/LHCI gates out of the push pipeline into a dedicated on-demand + scheduled workflow.

- [x] Remove Java 21, Playwright install, A11y/E2E, and LHCI steps from `deploy-dev.yml` `[Staff]`
- [x] Remove Java 21, Playwright install, and A11y/E2E steps from `deploy-prod.yml` `[Staff]`
- [x] Create `.github/workflows/e2e.yml` — `workflow_dispatch` + weekly Sunday 03:00 UTC schedule `[Staff]`
- [x] Create `docs/TESTING.md` — local testing guide and CI trigger instructions `[Staff]`
- [x] Decision logged in `docs/decisions/0005-ci-test-gating-strategy-c.md` `[Staff]`
- [x] **E95 CLOSED** | 2026-06-08

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


### E113 · Inventory Batch Action Bar Redesign

> **Persona Gate — E113:**
> - **Staff (Primary):** The batch action bar must not require staff to break eye contact with the table. Selection controls must be at the top of the view, grouped by action type, and not overflow on standard admin viewports.
> - **Makoonsii (Touch Standard applied to staff tools):** All action buttons ≥44px touch targets.
> - **Jordan (Brand Quality):** Admin UI quality reflects brand quality — overcrowded pill shapes are inconsistent with "Dapper. Debonair."

- [x] Replace floating bottom pill with top-anchored sticky context banner `[Staff]`
- [x] Two-zone layout: left (count badge + × dismiss), right (AI group | divider | CRUD group) `[Staff]`
- [x] All buttons `minHeight: 44px`, full token compliance, zero hardcoded values `[Staff]` `[Comp]`
- [x] `batchError` moved to dismissible `role="alert"` band below the banner `[Staff]`
- [x] Decision 0031 logged `[Comp]`
- [x] **E113 CLOSED** | 2026-06-10

---

### E114 · Pawn Loan Receipt Email

> **Persona Gate — E114:**
> - **Makoonsii (Primary):** Customer receives a plain-language digital copy of their loan agreement summary immediately after signing — ticket number, item, loan amount, due date, and redemption instructions. Automatic; no extra staff step required.
> - **Staff (Primary):** Zero workflow change. Receipt dispatches silently after signature is captured. If the customer has no email on file, the loan signing still succeeds without error.
> - **Jordan (Secondary):** Branded HTML email matches the dark luxury aesthetic — `#080706` background, `#C8A14A` gold headings, Georgia serif, consistent with `buildDigestHtml` in `notifications.ts`.
> - **Compliance:** Transactional receipt — CASL opt-in not required. `pawn_receipt_emailed` auditLog entry with no PII. `staffNotes` and `serialNumber` excluded from email content.

- [x] Schema: add `receiptEmailSentAt` + `receiptEmailAddress` to `loanTickets/{id}` — Decision 0032 `[Comp]`
- [x] `signPawnAgreement` CF: best-effort email dispatch after signing — try/catch, never re-thrown `[Staff]` `[Mak]`
- [x] Email address resolution: `uid → users/{uid}.email` → `pawnRequests/{id}.email` → skip silently `[Comp]`
- [x] `buildReceiptHtml` helper: dark-luxury template matching `buildDigestHtml` pattern `[Jord]`
- [x] Idempotency guard: skip if `receiptEmailSentAt` already set `[Comp]`
- [x] `pawn_receipt_emailed` auditLog entry (no PII in details) `[Comp]`
- [x] Update `loanTickets/{id}` with `receiptEmailSentAt` + `receiptEmailAddress` on successful send `[Comp]`
- [x] Decision 0033 logged `[Comp]`
- [x] User guide updated: `admin/loans.md` + `pawn/loans.md` `[Staff]` `[Mak]`
- [x] **E114 CLOSED** | 2026-06-11

---

### E115 · APR Override Warning

> **Persona Gate — E115:**
> - **Staff (Primary):** Loan issuance modal allows a deliberate rate above the legal APR cap — soft warning + confirmation checkbox instead of a hard block. Normal (under-cap) path is completely unaffected.
> - **Makoonsii (Secondary):** Printed ticket and APR disclosure are unchanged regardless of override path.
> - **Compliance:** Server-side cap enforcement added to `createLoanTicket` CF. Over-cap loans require `aprOverrideConfirmed: true` in the request. Override is recorded in `loanTickets/{id}` and a `loan_rate_override` audit log event is written (no PII).

- [x] Schema: add `aprOverrideConfirmed` to `loanTickets/{id}`; add `loan_rate_override` to `auditLogs.eventType` — Decision 0034 `[Comp]`
- [x] `IssueLoanModal.tsx`: replace hard-block with inline yellow warning banner + mandatory confirmation checkbox when rate exceeds cap `[Staff]`
- [x] `IssueLoanModal.tsx`: reset `aprOverrideChecked` on any change to amount, term, or rate `[Staff]`
- [x] `IssueLoanModal.tsx`: pass `aprOverrideConfirmed: true` to mutation when override was confirmed `[Comp]`
- [x] `useLoanTickets.ts`: add `aprOverrideConfirmed?` to `IssueLoanArgs` interface `[Comp]`
- [x] `createLoanTicket` CF: mirror APR cap constants; reject over-cap rates unless `aprOverrideConfirmed: true` `[Comp]`
- [x] `createLoanTicket` CF: write `aprOverrideConfirmed: true` to `loanTickets` doc on override `[Comp]`
- [x] `createLoanTicket` CF: write `loan_rate_override` audit log entry on override (no PII) `[Comp]`
- [x] Decision 0034 logged `[Comp]`
- [x] User guide updated: `admin/loans.md` `[Staff]`
- [x] **E115 CLOSED** | 2026-06-11

---

### E116 · Pawn Intake & Ticket UX Improvements

> **Persona Gate — E116:**
> - **Staff (Primary):** Walk-in intake collects ID once; fields are pre-filled in the loan issuance form. Live "Quote for Customer" panel shows dollar amounts and due date before committing the loan.
> - **Makoonsii (Secondary):** Printed ticket now gives plain-language extension instructions and default summary — she can read it at home and know exactly what to do without calling the shop.

- [x] `WalkInPawnModal.tsx`: thread `idType` + `idVerified` through `onSuccess` callback `[Staff]`
- [x] `PawnInbox.tsx`: add `idType?` + `initialIdVerified?` to `IssueLoanCtx`; `key` prop for remount-on-open `[Staff]`
- [x] `IssueLoanModal.tsx`: accept `initialIdType?` + `initialIdVerified?` props; pre-fill ID fields from walk-in `[Staff]`
- [x] `IssueLoanModal.tsx`: live "Quote for Customer" panel (borrow / interest / owe back / due date / APR) `[Staff]` `[Mak]`
- [x] `PrintableTicket.tsx`: plain-language default summary before sole-recourse clause `[Mak]`
- [x] `PrintableTicket.tsx`: actionable extension instructions (visit in person, bring ticket + ID) `[Mak]`
- [x] `PrintableTicket.tsx`: footer action line with dynamic due date `[Mak]`
- [x] User guide updated: `admin/pawn-inbox.md` + `admin/loans.md` `[Staff]`
- [x] **E116 CLOSED** | 2026-06-11

### E117 · Inventory Photo Management

> **Persona Gate — E117:**
> - **Marcus (Primary):** Staff must be able to delete individual photos and promote a better shot to cover position without deleting the entire item.
> - **Makoonsii (Secondary):** All photo controls meet the 48px touch target standard for one-handed operation in portrait mode.
> - **Jordan (Supporting):** Cover photo selection is an intentional staff action — `images[0]` is always the hero on `ItemDetailPage` and card thumbnails.

- [x] `removeItemImage` CF — staff+, deletes Storage file + `arrayRemove` from `items/{id}.images`, audit log `[Staff]`
- [x] `reorderItemImages` CF — staff+, validates URL set membership, full array write, audit log `[Staff]`
- [x] `ImageUploadZone.tsx` — Cover badge on `images[0]`, ★ set-cover on remaining, × delete on all `[Marc]` `[Mak]`
- [x] `QRUploadBridge.tsx` — QR code popover ("📱 Upload from Phone") pointing to `/admin/item-photo/{itemId}`, auto-close on new photo `[Marc]`
- [x] `ItemPhotoPage.tsx` — QR bridge destination, `ProtectedRoute staffOnly`, `extractData=false`, success banner `[Marc]`
- [x] `MobileIntakePage.tsx` — Cover badge + ★ set-cover + × delete on 72px thumbnail grid `[Mak]`
- [x] Route `/admin/item-photo/:itemId` added to `main.tsx` `[Marc]`
- [x] `firestore-schema.md` updated with `item_photo_removed` + `item_photos_reordered` event types `[Comp]`
- [x] User guide updated: `inventory/intake.md` + `inventory/mobile-intake.md` `[Staff]`
- [x] **E117 CLOSED** | 2026-06-12

---

### E119 · Edit Item Page

> **Persona Gate — E119:**
> - **Marcus (Primary):** All E117 photo controls (★ cover, × delete, + Add Photo) available on the edit page — no wizard navigation required.
> - **Staff (Primary):** A price, condition, or description change requires zero wizard steps — all fields on one scrollable page with a single "Save Changes" action.
> - **Makoonsii (Secondary):** All touch targets ≥48px. Condition is a single-tap `<select>` dropdown. Single-column layout; no horizontal scrolling.

- [x] `EditItemPage.tsx` — single-page edit form: photos section (Cover badge, ★ set-cover, × delete, + Add Photo), item details, pricing & stock, condition `<select>`, cannabis/fireworks conditional profiles, Save Changes action `[Marc]` `[Staff]` `[Mak]`
- [x] Route `/admin/item/:id/edit` added to `main.tsx` `[Staff]`
- [x] `InventoryCard.tsx` — "Full Edit" link updated from `/admin/mobile-intake/edit/:id` to `/admin/item/${item.id}/edit` `[Staff]`
- [x] `extractData: false` on all photo uploads in edit mode — existing staff-written data is never overwritten by AI `[Marc]` `[Comp]`
- [x] Decision 0036 logged `[Comp]`
- [x] User guide updated: `admin/inventory.md` `[Staff]`
- [x] **E119 CLOSED** | 2026-06-12

---

### E120 · Fireworks Campaign Countdown

> **Persona Gate — E120:**
> - **Tanya (Primary):** Live countdown on the fireworks page to Canada Day — real end-date, not manufactured urgency. Staff can activate immediately from the admin UI.
> - **Staff (Primary):** One-click Activate/Deactivate on any campaign. Edit existing campaigns (title, dates, banner copy, countdown toggle) without delete-and-recreate.
> - **Jordan (Secondary):** All countdown typography governed by design tokens — no hardcoded px values in `CountdownTimer.tsx`.

- [x] `CountdownTimer.tsx` — replaced 10 hardcoded `px` values with design tokens (`--text-display`, `--text-heading`, `--text-xs`, `--space-1`, `--space-2`) `[Jord]`
- [x] `CampaignAdminPage.tsx` — Activate/Deactivate toggle button per campaign (client-side `updateDoc`, permitted by existing `isStaff()` rule) `[Staff]`
- [x] `CampaignAdminPage.tsx` — inline Edit form per campaign (title, view, dates, banner copy, discount, countdown toggle) with `dateToInputStr` for correct local-timezone date display `[Staff]`
- [x] Decision 0037 logged `[Comp]`
- [x] User guide updated: `admin/campaigns.md` `[Staff]`
- [x] **E120 CLOSED** | 2026-06-12

---

## Phase 10 — Inventory Intelligence

> **Goal:** Data-driven merchandising. Automate stale-inventory turnover and close the cannabis product data gap vs. Dutchie/Jane. Schema updates in `docs/firestore-schema.md` and `docs/DECISIONS.md` are required before any implementation task begins.

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

## Phase 13 — Operational Excellence

> **Goal:** Improve internal staff efficiency (peak-season fireworks pick-path) and address monolithic backend tech debt. E34 CF Refactor must ship last — after all Phase 10–12 CFs are stable.

### E34 · Cloud Functions Modular Refactor

> **Persona Gate:** Infrastructure epic — no customer-facing persona directly served. Enables targeted deploys per function group, reducing CI/CD blast radius.
> **Dependency:** All CFs from E28–E33 must be stable in production before restructure begins.

- [x] Define and document grouping strategy in `DECISIONS.md`: `core`, `operations` groups `[Staff]`
- [x] Create group subdirectories under `functions/` — move source files, create per-group `package.json` `[Staff]`
- [x] Refactor `firebase.json` and `package.json` scripts to allow targeted deploys `[Staff]`
- [x] Run full Emulator Suite regression after restructure — zero CF name or behaviour regressions `[Staff]` `[Comp]`

---

## Phase 14 — Future Horizons

> **Goal:** Innovative differentiators that require the most R&D investment and the longest external dependency lead times. Sequence after all Phase 13 features are stable in production.

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

### E102 · Vertical Hero Sections

> **Persona Gate — E102:**
> - **Sandra (Primary):** Pawn hero must create the "I could find something here" impulse within 10 seconds. Rich above-fold visuals are the product for Sandra.
> - **Jordan (Primary):** Editorial quality visible above fold on all three verticals. Brand coherence across views.
> - **Marcus:** All hero images must pass the Marcus Photography Test before shipping. Dark luxury standard — no supplier images.
> - **Marie:** Cannabis hero must pass the Marie Discretion Test. Boutique wellness tone, no hard sell.
> - **Makoonsii:** All carousel/video controls ≥48px. All media has alt text. Carousel pauses on focus.

- [x] **Schema first:** Update `docs/firestore-schema.md` — add `heroData` map to `config/shopInfo`. Log in `DECISIONS.md`. `[Jord]` `[San]` `[Comp]`
- [x] Add `HeroMedia` interface to `src/lib/types.ts` — extend `ShopInfo` `[Staff]`
- [x] Create `src/hooks/useHeroMedia.ts` — reads `config/shopInfo.heroData[viewTag]`, returns media config `[Jord]` `[San]`
- [x] Create `src/components/ui/ImageCarousel.tsx` — slow-fade, 6s auto-advance, pause on hover/focus, keyboard nav, accessible `[San]` `[Mak]`
- [x] Create `src/components/ui/YouTubeFacade.tsx` — static thumbnail + play button, loads iframe on click only, `youtube-nocookie.com` `[Jord]` `[Comp]`
- [x] Revamp `src/components/pawn/PawnHero.tsx` — upgrade to ≥80vh spec, wire `useHeroMedia` `[San]` `[Marc]` `[Mak]`
- [x] Revamp `src/components/cannabis/CinematicHero.tsx` — upgrade to 100vh spec, wire `useHeroMedia` `[Marie]` `[Jord]`
- [x] Create `src/components/fireworks/FireworksHero.tsx` — extract from `FireworksPage.tsx`, full-screen, retain `CountdownTimer` `[Tan]` `[Jord]`
- [x] Update `src/pages/FireworksPage.tsx` — use `FireworksHero` component `[Tan]`
- [ ] **Phase 2 (blocked):** `TobaccoHero.tsx` — deferred until `.view-tobacco` CSS tokens are defined `[All]`
- [x] **E102 CLOSED** | 2026-06-09

---

### E103 · Fireworks Hero Video

> **Persona Gate — E103:**
> - **Tanya (Primary):** Video `8rmpm3ZOn50` appears prominently in the Fireworks hero, above the inventory. Countdown remains visible above it.
> - **Jordan (Primary):** 900px centered layout looks editorial and intentional on desktop.
> - **Makoonsii:** Play button ≥48px. Video has accessible `title` attribute.

- [x] Wire default video ID `8rmpm3ZOn50` into `FireworksHero.tsx` with Firestore override support `[Tan]` `[Jord]`
- [x] Restructure hero layout: video moves outside the narrow content column, 900px max-width, 16:9 responsive `[Tan]` `[Jord]` `[Mak]`
- [x] **E103 CLOSED** | 2026-06-09

---

### E104 · AI Function Resilience (P0 Bug Fix)

> **Persona Gate — E104:**
> - **Staff (Primary):** `generateAIDescription` and `suggestAiPrice` must not silently fail when `gemini-2.5-pro` returns any non-429/503 error. Flash/Lite fallbacks must activate.

- [x] Extract `callWithFallback` helper — single catch-all fallback chain, eliminates 5 copy-paste sites `[Staff]`
- [x] Wire `generateAIDescription`, `suggestAiPrice`, `generateDescriptionForItem`, `suggestPriceForItem` to use helper `[Staff]`
- [x] Fix `auditLogs` model tracking — record the model that actually ran, not hardcoded `gemini-2.5-pro` `[Staff]`
- [x] **E104 CLOSED** | 2026-06-09

---

### E105 · Admin Nav Refactor

> **Persona Gate — E105:**
> - **Staff (Primary):** Desktop admin sidebar must not overflow on a standard 1080p window. Groups must be visually labeled and scannable. Redundant "Add Item" nav entry removed.
> - **Makoonsii:** 48px touch targets and keyboard nav preserved on all sidebar items.

- [x] Remove `/admin/intake` entry from `AdminSidebar` GROUPS `[Staff]`
- [x] Expand sidebar to 210px with labeled group headings `[Staff]`
- [x] Add collapsible groups (Operations/Customer/People open by default; Content/Config/Support collapsed) `[Staff]`
- [x] Fix all hardcoded hex and font-size token violations in `AdminSidebar.tsx` `[Comp]`
- [x] Update `AdminLayout.tsx` gridTemplateColumns to match new sidebar width `[Staff]`
- [x] **E105 CLOSED** | 2026-06-09

*The Pawn Shop · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
\n### Phase 15: E69 — Onboarding & SOP Management\n- [x] Write `E69_ONBOARDING_SOP_PLAN.md` Spec and Plan\n- [x] Update `firestore.rules` and `firestore-schema.md`\n- [x] Implement `inviteEmployee` Cloud Function\n- [x] Implement `DocumentsPage` Admin UI for SOPs\n- [x] Implement `AcknowledgmentWall` middleware\n- [x] Add `Invite Staff` Modal to `StaffList`\n
\n### Phase 16: E70 — Social Media Campaign Management\n- [x] Write `E70_SOCIAL_MEDIA_PLAN.md` Spec and Plan\n- [x] Update `firestore.rules` and `firestore-schema.md` with `socialPosts`\n- [x] Implement `approveAndSchedulePost` Cloud Function (Ayrshare Stub)\n- [x] Implement `SocialDashboardPage.tsx`\n- [x] Implement `SocialComposerPage.tsx` with Canva media upload\n
\n### Phase 17: E71 — State Management Refactor (TanStack Query)\n- [x] Install `@tanstack/react-query` and configure `QueryClientProvider`\n- [x] Refactor `DashboardPage.tsx` to use `useQuery` for metrics\n- [x] Create `useStaffMembers` hook wrapping the Cloud Function\n- [x] Create `useStoreConfig` hook for global settings\n- [x] Refactor `StaffList` and `ShiftCalendar` to use new hooks\n- [x] Refactor admin mutations to use `useMutation`\n



## Future Roadmap: Consolidated Pending Phases

## Phase 18 — Security, QA & Production Readiness

### Phase 18: E72 — Comprehensive QA & Testing Gap Closure
> **Persona Gate — E72:**
> - **Compliance:** Cloud Functions must be unit tested. Unverified data mutations break compliance.
> - **Makoonsii / Marie / Tanya:** Core user flows require automated E2E validation against emulators.

- [x] Execute `docs/reports/testing_gap_analysis.md` Phase 1: Fix Playwright infrastructure & Emulators
- [x] Execute `docs/reports/testing_gap_analysis.md` Phase 2: Firebase CF `firebase-functions-test` unit tests
- [x] Execute `docs/reports/testing_gap_analysis.md` Phase 3: Component Coverage (`IntakeForm.tsx`, hooks)
- [x] Execute `docs/reports/testing_gap_analysis.md` Phase 4: Persona-driven Playwright E2E suites

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

## Phase 19 — Architecture Modernization & DX

### Phase 19: E73 — Architecture Modernization & Optimization
> **Persona Gate — E73:**
> - **Jordan (Performance):** Reducing bundle size and eliminating ineffective dynamic imports directly improves load times, especially on mobile.
> - **Staff (Efficiency):** Migrating to `react-hook-form` eliminates render thrashing in the Intake Form, dramatically speeding up data entry.

- [x] Fix `INEFFECTIVE_DYNAMIC_IMPORT` warnings — converted dynamic imports in `ConsentBanner.tsx`, `ViewContext.tsx`, `analytics.ts` to static (Quick Win)
- [x] Implement explicit `manualChunks` in `vite.config.ts` — main bundle 1,019 kB → 43.69 kB (Quick Win)
- [x] Implement Firestore `withConverter` in `useItems.ts` (Quick Win)
- [ ] Refactor `IntakeForm.tsx` to compose domain-specific sub-components (Medium Term)
- [ ] **[BACKLOG — Strategy C]** Migrate `IntakeForm.tsx` to `react-hook-form` — eliminates render-per-keystroke; requires rewiring 3 `onSnapshot` listeners and updating 7 unit tests. Planned in `docs/plans/E73_ARCHITECTURE_MODERNIZATION_PLAN.md`. (Medium Term)
- [ ] Architect unified TanStack Query v5 data layer to replace `onSnapshot` (Long Term)
- [ ] Implement strict schema validation with `zod` across client and Cloud Functions (Long Term)
- [x] **E73 Quick Wins CLOSED** | 2026-06-10

### Phase 20: E74 — Tooling & Developer Experience Improvements
> **Persona Gate — E74:**
> - **Development Velocity:** Introducing Storybook and Server-Side Retries reduces manual QA overhead and increases fault tolerance.

- [ ] Introduce Storybook 8 alongside Vite for component-driven development and visual regression testing
- [ ] Refactor Mobile Intake image upload to rely on Google Cloud Functions built-in failure policies (Server-Side Native Retry)

### Phase 21: E75 — Advanced Performance & Stability Tuning
> **Persona Gate — E75:**
> - **Jordan (Performance):** Zero jank during heavy scrolling and instant transitions.

- [ ] Audit all Intersection Observers, `useRef`, and `useCallback` in data-fetching hooks to prevent memory leaks
- [ ] Investigate and configure Firebase v2 minimum instances to reduce Cloud Function cold starts for AI endpoints
- [ ] Implement predictive prefetching for React Router links on hover for perceived instant loading

### E78 · AI Pipeline Precision & Reliability

> **Persona Gate — E78:**
> - **Staff:** Eliminates intake parsing crashes and provides real-time, non-hallucinated eBay market pricing for accurate pawn loans.
> - **Jordan (Operations):** Lowers cloud expenditure by downgrading lightweight tasks to `flash-lite` and utilizes strict `responseSchema` for API predictability.

- [x] Refactor `@google/generative-ai` calls to use native `responseSchema` for structured JSON.
- [x] Integrate `ebay.ts` Search API into `suggestAiPrice` to provide real market comps.
- [x] Inject Storage image buffers into `generateAIDescription` for multimodal context.
- [x] Implement fuzzy string matching for the Cannabis strain extraction step.
- [x] Optimize model selection to use `gemini-3.1-flash-lite` for simple text tasks.

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

## Phase 20 — Retail Operations & Inventory Deepening

### E28 · Algorithmic Markdown Engine (Dutch Auction)

> **Persona Gate — E28:**
> - **Dale (Authenticity Test):** Price drops must be real — based on staff-configured `markdownRate` and `floorPrice`. No manufactured urgency. `rare-find` and `limited-edition` tags are immune to markdown scheduling.
> - **Kevin (Alert Accuracy):** Price-drop notifications must respect CASL `alertOptIn` and fire within 60 s of the Cloud Function write — same SLA as item alerts.
> - **Sandra:** "Price Dropped" badge must surface in the masonry grid via the existing `MerchandisingBadge` component. No bounce or particle animation.

- [x] **Schema first:** Update `docs/firestore-schema.md` — add `floorPrice`, `markdownRate`, `markdownPeriodDays`, `markdownEnabled`, `lastMarkdownAt`, `originalPrice` to `items/{id}`. Log in `DECISIONS.md`. `[Staff]` `[Comp]`
- [x] Create `functions/src/markdownEngine.ts`: `applyMarkdownDrops` scheduled CF (daily 03:00 UTC) — batch price drops, CASL-gated SMS/email alerts, `price_override` audit log entries `[Dale]` `[Kev]` `[Comp]`
- [x] Create `enableMarkdown` and `disableMarkdown` callable CFs (manager+ only) — staff configures cadence and floor per item `[Staff]` `[Comp]`
- [x] Extend `functions/src/notifications.ts` — `sendMarkdownAlert` helper: saved-search match on price drop, generic SMS body (no pricing detail in copy — Marie Discretion Test) `[Kev]` `[Marie]` `[Comp]`
- [x] Admin UI: markdown config panel on item detail page in `src/pages/admin/InventoryPage.tsx` (manager-only gate) `[Staff]`
- [x] Update `src/components/pawn/MasonryGrid.tsx` and `src/components/ui/Card.tsx`: render "Price Dropped" `MerchandisingBadge` variant when `item.originalPrice` is set `[San]` `[Dale]`
- [x] Export new CFs from `functions/src/index.ts` `[Staff]`

---

### E31 · Pawn Loan Management Portal

> **Persona Gate — E31:**
> - **Makoonsii (Trust Test):** Loan form and ticket viewer must be completable one-handed in portrait mode. 48 px touch targets throughout. Plain language copy — no financial jargon.
> - **Compliance:** Audit log entry required on every loan status change (`loan_ticket_created`, `extension_requested`, `extension_approved`, `extension_declined`, `loan_forfeited`, `loan_redeemed`). All status changes via Cloud Function Admin SDK — no client writes to `loanTickets`.

- [x] **Schema first:** Update `docs/firestore-schema.md` — add `loanTickets/{id}` collection (`uid`, `pawnRequestId`, `itemDescription`, `loanAmount`, `interestRate`, `periodDays`, `dueDate`, `status`, `extensionCount`, `staffNotes`, timestamps). Add `pawnLoanId` link to `pawnRequests/{id}`. Log all in `DECISIONS.md`. `[Comp]`
- [x] Update Firestore rules: customer read own tickets (`isOwner`), staff read/write all, public blocked `[Comp]`
- [x] Create `functions/src/loanTickets.ts`: `createLoanTicket` (staff-only), `requestExtension` (customer — `isOwner`), `processExtension` (staff-only), `checkLoanDueDates` scheduled CF (daily — 48 h forfeit alert + SMS, CASL-gated) `[Mak]` `[Dale]` `[Comp]`
- [x] Add `auditLogs` event types for all loan lifecycle events `[Comp]`
- [x] Create `src/pages/LoanTicketsPage.tsx` — customer-facing ticket list, route `/pawn/my-loans` (auth-gated) `[Mak]` `[Dale]`
- [x] Create `src/components/pawn/LoanTicketCard.tsx` — loan summary card (reuses `Card`, `Badge` from `src/components/ui/`) `[Mak]`
- [x] Create `src/components/pawn/ExtensionRequestModal.tsx` — extension request confirmation (reuses `Modal`) `[Mak]`
- [x] Add loan ticket list to `/admin` — staff view of all active tickets by status/due date (reuses `Table`) `[Staff]`
- [x] Add `/pawn/my-loans` link to `NavigationDrawer` (authenticated users only) `[All]`
- [x] Export new CFs from `functions/src/index.ts` `[Staff]`

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

### E112 · Inventory UX: Grouping, Collapsible Sections & Grid Inline Edit

> **Persona Gate — E112:**
> - **Staff (Primary):** Group by viewTag/category/status, collapse groups, edit fields inline on grid cards. localStorage persistence so view state survives navigation.
> - **Makoonsii (Touch Standard applied to staff tools):** ≥48px action buttons on all cards. Plain-language labels ("Archive", not "Soft Delete").
> - **Marcus (Indirect):** 80px thumbnail on each card supports rapid photography review passes.
> - **Dale / Kevin (Indirect):** Faster staff status transitions → fresher public listings → 60s alert SLA easier to maintain.

- [x] Add `GroupBy` type export to `InventoryTable.tsx` (`'none' | 'viewTag' | 'category' | 'status'`) `[Staff]`
- [x] Manual client-side group rendering in table mode with collapsible headers + chevron animation `[Staff]`
- [x] `GROUP_DISPLAY_ORDER` — status: draft→active→reserved→sold→archived→deleted; viewTag: pawn→cannabis→fireworks→tobacco→other `[Staff]`
- [x] New `InventoryCard.tsx` — inline-editable grid card reusing `TextCellEditor`, `SelectCellEditor`, `PriceCellEditor` from CellEditors `[Staff]` `[Mak]`
- [x] Card actions: Archive, Delete, Restore, Full Edit link — all `minHeight: 48px` `[Staff]` `[Mak]`
- [x] AI Assistant drawer trigger on card thumbnail click `[Staff]`
- [x] `QuantityAdjustControl` rendered on card when `item.quantity` is set `[Staff]`
- [x] `InventoryPage.tsx` — `groupBy` dropdown (None / View Tag / Category / Status) `[Staff]`
- [x] `InventoryPage.tsx` — `collapsedGroups: Set<string>` state, toggled per group key `[Staff]`
- [x] localStorage persistence for `viewMode`, `groupBy`, `statusFilter`, `collapsedGroups` `[Staff]`
- [x] `InventoryPage.tsx` renders `InventoryCard` in grid mode with dynamic grouped sections `[Staff]`
- [x] `groupBy` prop wired into `InventoryTable` for table mode grouping `[Staff]`
- [x] Decision 0030 logged `[Comp]`
- [x] **E112 CLOSED** | 2026-06-10

---

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

## Phase 21 — Retail Innovation & Customer Experience

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

## Phase 22 — Advanced Governance

### Phase 22: E76 — Extended Autonomous Subagents
> **Persona Gate — E76:**
> - **Compliance:** Automatic enforcement of security, accessibility, and documentation rules.

- [x] Define and implement `Security_Auditor` subagent (monitors `firestore.rules` and `storage.rules`)
- [x] Define and implement `Accessibility_Auditor` subagent (monitors `@axe-core/playwright` results)
- [x] Define and implement `Documentation_Specialist` subagent (monitors `vitepress` builds and syncs documentation)

### E77 · Deferred Design & Content Enhancements

> **Persona Gate — E77:**
> - Catch-all epic for delayed content generation and minor UI tweaks from earlier phases.

- [ ] WCAG AA contrast passes on all three palettes (run axe-core in browser) `[Mak]` `[Comp]`
- [ ] Vertical video on Cannabis + Fireworks pages (masonry grid: done E05; video: content dependency — deferred) `[San]` `[Marie]` `[Tan]`
- [ ] **[PENDING MARKETING CONTENT]** Gather real customer stories for the TestimonialsModule. Fake/placeholder testimonials are hidden in `PawnPage.tsx`. Do not restore until real data is sourced. `[Mak]` `[Comp]`
- [ ] **[PENDING SECURITY]** Re-enable Firebase AppCheck in `firebase-core.ts` and ensure the production ReCaptcha Enterprise Site Key is properly configured in Google Cloud before final launch. `[Comp]`
- [ ] Lighthouse: ≥90 performance, ≥90 accessibility, ≥95 SEO `[Jord]` `[Marc]`

---

## Phase 23 — Revenue Enablement (Weeks 1–4)

### E79 · Stripe Integration (Payment Gateway)
**Priority: CRITICAL · Estimated effort: 10–12 developer-days**
- [ ] Create Stripe Connect account (enables future marketplace payments to consignors)
- [ ] Add `STRIPE_SECRET_KEY` to Firebase Secret Manager; `stripe-js` to client bundle
- [ ] **CF: `createPaymentIntent(itemId, amount, type)`** — types: `deposit`, `full_payment`, `pawn_loan_deposit`; admin/manager only
- [ ] **CF: `stripeWebhook`** — handles `payment_intent.succeeded` → updates reservation/preorder to `paid` status, writes auditLog entry
- [ ] **UI: `PaymentModal` component** — Stripe Elements (card + Apple Pay + Google Pay). Accessible with `aria-describedby` for error states.
- [ ] **Schema additions:** `reservations/{id}.paymentIntentId`, `reservations/{id}.paymentStatus`, `preorders/{id}.depositPaid`
- [ ] Stripe webhook signing verification (`STRIPE_WEBHOOK_SECRET`)
- [ ] E2E test with Stripe test mode (mock webhook events)

---

### E80 · Brother POS Live Integration
**Priority: HIGH · Estimated effort: 6–8 developer-days**
- [ ] Activate `receivePosWebhook` CF (HMAC-SHA256 stub already verified and in place)
- [ ] Add processing logic: parse `posSyncStatus: 'pending'` → match/create items in Firestore via Admin SDK
- [ ] **CF: `pushPosSoldStatus`** — bidirectional sync: Firestore `item.status → 'sold'` pushes status update to POS
- [ ] Handle POS item create → Draft item with `posSyncStatus` in Firestore → staff review before publish
- [ ] Add `posSyncStatus` indicator to admin inventory table (synced / pending / error)
- [ ] **Reconciliation CF (daily scheduled):** compare POS quantity vs Firestore quantity, flag discrepancies in admin dashboard

---

### E81 · Pawn Loan Lifecycle UI
**Priority: HIGH · Estimated effort: 8–10 developer-days**
- [x] **Extend `loanTickets` schema:** `principal`, `interestRatePct`, `termDays`, `dueDate`, `redemptionAmount`, `status`
- [x] **CF: `issueLoanTicket(pawnRequestId, principal, term)`** — admin/manager only; generates loan ticket with due date calculation
- [x] **CF: `redeemLoan(loanTicketId, paymentIntentId)`** — validates Stripe payment, transitions ticket to `redeemed`, item back to `active`
- [x] **CF: `forfeitLoan(loanTicketId)`** — admin only; transitions item to `active` (shop-owned for resale), loan to `forfeited`
- [x] **UI:** Loan Ticket detail page in admin portal with redemption workflow, Stripe payment capture, and extension option
- [x] **Customer-facing:** Loan status visible in `/profile` Activity History tab
- [x] SMS reminder 3 days before due date (extend `sendPickupReminders` CF pattern to loans)

---

## Phase 24 — Acquisition & SEO (Weeks 5–9)

### E82 · Google Business Profile API Integration
**Priority: HIGH · Estimated effort: 8–10 developer-days**
- [ ] Register in Google Business Profile API (requires Google Cloud project + OAuth 2.0)
- [ ] **CF: `syncGbpHours`** — Firestore trigger on `config/storeHours` write → pushes updated hours to GBP API automatically
- [ ] **CF: `fetchGbpReviews` (daily scheduled)** — fetches new reviews, stores in `gbpReviews/{id}` collection
- [ ] **CF: `postGbpUpdate(content, photoUrl)`** — admin posts Google Updates (promotions, events) from admin portal
- [ ] **Schema: `gbpReviews/{id}`** — reviewer, rating, comment, replied, replyText; admin-only write for replies
- [ ] **UI: Review Dashboard** in admin portal — display rating, recent reviews, flag/respond workflow

---

### E83 · SSR Evaluation & Implementation (Replacing E37)
**Priority: MEDIUM-HIGH · Estimated effort: 12–16 developer-days**
- [ ] Evaluate options: Vite SSR (Vite 8 native) vs Firebase Hosting + Cloud Run vs Next.js migration cost
- [ ] Implement Vite SSR with Firebase Cloud Run for critical SEO pages only (`/pawn/item/:id`, `/cannabis/item/:id`, Local SEO landing pages)
- [ ] SSR must pass the **Marie Discretion Test** — no cannabis category identifiers in server-rendered HTML for anonymous requests
- [ ] Hydration strategy: SPA hydration on client after server render

---

### E84 · Algolia Search Integration
**Priority: MEDIUM · Estimated effort: 6–8 developer-days**
- [ ] **CF: `syncItemToAlgolia`** — Firestore trigger on items write; sync title, description, category, viewTag, price, condition, status, merchandisingTags; exclude `internal/ai` subcollection
- [ ] **CF: `deleteItemFromAlgolia`** — on item soft or hard delete
- [ ] **Client:** replace `useItemSearch` Firestore prefix-token query with Algolia InstantSearch React; maintain existing `FilterPanel` UX
- [ ] Configure typo tolerance and synonym handling (pawn/sell, etc. — cannabis synonyms handled carefully per Marie Discretion Test; pawn view only)
- [ ] **PIPEDA compliance:** Algolia must be configured as a data processor under a Data Processing Agreement; no PII in indexed records

---

### E85 · Review & Reputation Management
**Priority: MEDIUM · Estimated effort: 5–6 developer-days**
- [ ] **Post-completion review prompt:** 24-hour delayed SendGrid email after reservation completed or preorder collected, linking to Google Maps listing
- [ ] Admin UI: review response workflow with templated replies (relies on `gbpReviews` from E82)
- [ ] **Trust badge:** display aggregate GBP rating in `PawnHero` and cannabis hero components
- [ ] *(Optional)* Trustpilot integration: CF to push completed reservations to Trustpilot verified reviews API

---

## Phase 25 — Retention & Loyalty (Weeks 10–14)

### E86 · Loyalty Points Economy
**Priority: MEDIUM · Estimated effort: 10–12 developer-days**
- [ ] **Extend `users/{uid}` schema:** `loyaltyPoints`, `loyaltyTier`, `users/{uid}/pointsHistory` subcollection
- [ ] **CF: `awardLoyaltyPoints(uid, action, amount)`** — called by `completeReservation`, `submitPawnRequest`, preorder collection
- [ ] **CF: `redeemLoyaltyPoints(uid, points, reservationId)`** — validates balance, applies discount, writes pointsHistory entry
- [ ] **UI:** Loyalty card in `/profile` — points balance, tier progress bar, redemption interface
- [ ] **Admin:** Points award/adjust UI in CRM Customer Detail page (admin/manager only)

---

### E87 · Web Push Notifications (FCM)
**Priority: MEDIUM · Estimated effort: 6–8 developer-days**
- [ ] Add Firebase Cloud Messaging (FCM) to `firebase-core.ts` (service worker registration)
- [ ] **Schema:** `users/{uid}.fcmTokens` (array) — updated on each login from each device
- [ ] **CF: `sendPushNotification(uid, title, body, actionUrl)`** — wraps FCM send; called by: reservation confirmation, preorder ready, savedSearch alert, loan due reminder
- [ ] **UI:** Push permission prompt — shown post-consent, signed-in users only; dismissable with 30-day snooze
- [ ] **Service worker:** `firebase-messaging-sw.js` at root — handles background push, click-to-open item page

---

### E88 · Internal Analytics Dashboard
**Priority: MEDIUM · Estimated effort: 8–10 developer-days**
- [ ] **Revenue metrics:** daily/weekly/monthly sales, average order value, revenue by view (pawn/cannabis/fireworks/tobacco)
- [ ] **Inventory metrics:** turnover rate, slow-moving items, stock-out frequency
- [ ] **Customer metrics:** new vs returning ratio, LTV distribution, VIP tier distribution, cross-view engagement rate
- [ ] **Acquisition metrics:** UTM campaign performance, search-to-reservation conversion
- [ ] Access: admin and manager only; TanStack Query cache with 15-min staleTime for revenue data

---

### E89 · Tax Calculation & Receipt Generation
**Priority: MEDIUM · Estimated effort: 4–5 developer-days**
- [ ] **CF: `calculateTax(items, customerProvince, exemptionCode)`** — returns tax breakdown (GST, HST, PST, exempt amounts)
- [ ] **Schema additions:** `reservations/{id}.taxBreakdown`, `pawnRequests/{id}.taxBreakdown`
- [ ] **UI:** Tax breakdown display on `PaymentModal` (E79); receipt generation via browser print or Cloud Function PDF
- [ ] **Cannabis excise tax:** Canadian federal excise duty applies; enforce correct rates server-side in CF

---

## Phase 26 — Operations & Scale (Weeks 15–20)

### E90 · Inventory Forecasting
**Priority: LOW-MEDIUM · Estimated effort: 8–10 developer-days**
- [ ] **CF: `calculateCategoryVelocity` (weekly scheduled)** — computes days-to-sell P50/P90 by category and viewTag; writes to `config/inventoryForecasts`
- [ ] **Reorder alerts:** if active items in a category fall below admin-configurable `reorderThreshold`, trigger admin notification
- [ ] **Seasonality weighting:** Fireworks: June–July spike weighting; Cannabis: weekly cadence tracking
- [ ] **UI:** Forecasting panel in admin dashboard; slow-mover list; recommended restock quantities

---

### E91 · Advanced Customer Search Experience
**Priority: LOW-MEDIUM · Estimated effort: 6–8 developer-days**
- [ ] **Voice search:** Web Speech API integration on mobile cannabis and pawn pages
- [ ] **Visual search:** Upload-an-image-to-find-similar-items flow (CF sends image to Gemini Vision for category/description extraction)
- [ ] **Personalised results:** boost items matching user's `purchaseHistory` + `viewCount` tracking from `users/{uid}`
- [ ] **Saved searches UI:** let customers name and manage `savedSearches` from `/profile`; email/push alert on new inventory match

---

### E92 · Staff Training / LMS
**Priority: LOW · Estimated effort: 8–10 developer-days**
- [ ] **Extend `documents` collection:** `quizQuestions`, `passingScore`, `certificationName`
- [ ] **CF: `submitQuizAttempt(documentId, answers)`** — grades quiz, creates `users/{uid}/signatures/{documentId}` with score and pass/fail status
- [ ] **UI:** Training module viewer (Markdown rendered, quiz at end); progress tracker in HRTab on `/profile`
- [ ] **Admin:** Training completion dashboard — who has passed what, who is overdue; CSV export
- [ ] **Onboarding checklist:** auto-generated for new staff based on role

---

### E93 · Multi-Location Preparation
**Priority: LOW · Estimated effort: 5–6 developer-days**
- [ ] Add `locationId` field to: `items`, `reservations`, `campaigns`, `config/storeHours`
- [ ] Extend `ViewContext` to be location-aware (currently single-location only)
- [ ] **CF: `createLocation(locationData)`** — admin only; initialises `storeHours` config for new location
- [ ] **Admin UI:** location selector in admin portal header; all queries scoped by `locationId` when present
- [ ] Preserve single-location behaviour as default (`locationId: 'cornwall-island'` hardcoded) — no breaking changes to existing collections

### E82 · Cannabis Storefront Hybrid Rebuild
**Priority: HIGH · Estimated effort: 2 developer-days**
> **Persona Gate — E82:**
> - **Marie:** Intuitive navigation (Flower, Vapes, Edibles) replaces the abstract Mood categories.
> - **Dale:** Product cards must clearly show USD vs CAD comparisons to validate cross-border savings.

- [x] **Schema:** Update `firestore-schema.md` to map cannabis categories (flower, vapes, prerolls, edibles, concentrates, tinctures) instead of moods.
- [x] **UI:** Build `CannabisMarqueeStrip` and `StoryStrip` components.
- [x] **UI:** Update `LuxuryProductCard` to display THC/CBD progress bars and USD vs CAD comparison logic.
- [x] **UI:** Rewrite `CannabisPage.tsx` to integrate the "American Craft, Canadian Prices" hero, removing `MoodCard`.

---

### E93 · AI Intake Toggle (Opt-Out for Batch Entry)
**Priority: MEDIUM · Effort: 0.5 developer-days**

> **Persona Gate — E93:**
> - **Staff (Primary):** When batch-entering similar items, staff must be able to skip the AI engine on the photo upload step without losing the ability to upload photos. Skipping AI cuts Gemini API cost and removes the wait time for items where description and price are already known.
> - **Compliance:** Toggle state is client-only (sessionStorage). No new Firestore fields introduced. `aiDescription` review gate remains fully enforced.

- [x] Add `aiEnabled` state (sessionStorage-persisted, ON by default) to `IntakeForm.tsx` `[Staff]`
- [x] Add `aiEnabled` state and `aiEnabledRef` to `MobileIntakePage.tsx` using the same `sessionStorage` key `[Staff]`
- [x] Render accessible toggle switch (`role="switch"`, `aria-checked`) in "Capture & View" section on both forms `[Mak]` `[Comp]`
- [x] Lock toggle to `disabled` once first photo is uploaded — prevents mid-flight state confusion `[Staff]` `[Comp]`
- [x] Wire `extractData={aiEnabled && images.length === 0}` on desktop; `extractData: aiEnabledRef.current` on mobile `[Staff]`
- [x] Update step subtitle on mobile to reflect AI state: "Upload Photo to start AI Extraction" vs "Upload Photo" `[Staff]`
- [x] 7 unit tests added to `IntakeForm.test.tsx` covering: default ON, sessionStorage read on mount, click to flip, persistence write, helper text, enabled state `[Staff]` `[Comp]`
- [x] **E93 CLOSED** | 2026-06-08

---

### E94 · Inventory Table Mode — Inline Spreadsheet Grid
**Priority: HIGH · Effort: 3 developer-days (actual)**

> **Persona Gate — E94:**
> - **Staff (Primary):** Inventory staff must be able to compare attributes across items, edit multiple rows efficiently, copy values between cells, and trigger AI functions in bulk without leaving the inventory screen.
> - **Marcus:** Image thumbnails are visible in the table; drawer opens AiAssistantPanel so AI drafts remain staff-promote-gated.
> - **Jordan:** `aiDescription` firewall fully intact — AI column opens AiAssistantPanel, never auto-publishes.
> - **Compliance:** `policeHold` editable by admin only. `rare-find`/`limited-edition` tags restricted to non-staff roles. All AI calls routed through Cloud Functions.

- [x] Install `@tanstack/react-table` v8 (headless) `[Infra]`
- [x] Add `viewMode: 'grid' | 'table'` toggle to `InventoryPage.tsx` with Grid/Table button group `[Staff]`
- [x] Create `src/components/admin/InventoryTable.tsx` — main table shell, sorting, column visibility panel `[Staff]`
- [x] Create `src/components/admin/InventoryTable/columns.tsx` — 14-column TanStack definitions with CellWrapper `[Staff]`
- [x] Create `src/components/admin/InventoryTable/CellEditors.tsx` — `TextCellEditor`, `SelectCellEditor`, `PriceCellEditor`, `TagCellEditor`, `PoliceHoldCell` `[Staff]`
- [x] Create `src/components/admin/InventoryTable/CellEditorOptions.ts` — exported option arrays for Status, Condition, ViewTag selects `[Staff]`
- [x] Create `src/hooks/useGridClipboard.ts` — `copyValue`/`readClipboard` hook `[Staff]`
- [x] Inline editing: click-to-edit per cell; Tab/Enter/Escape/blur save/cancel model; optimistic Firestore `updateDoc()` `[Staff]`
- [x] Row selection with checkbox column; floating batch action bar (≥1 rows selected) `[Staff]`
- [x] Per-row AI column (✨ description, $ price) → `AiAssistantPanel` drawer; per-row status indicators (loading/done/error) `[Jordan]` `[Comp]`
- [x] Add `batchProcessItems` callable CF to `functions/src/ai.ts` — sequential processing, 400ms rate-limit delay, max 20 items `[Staff]`
- [x] Create `functions/src/lib/audit.ts` — `writeAuditLog` helper (fixes pre-existing missing module) `[Comp]`
- [x] `policeHold` column: admin-only toggle, read-only for inventory_staff `[Comp]`
- [x] `rare-find`/`limited-edition` tags hidden from non-admin TagCellEditor `[Comp]`
- [x] Zero TypeScript errors (build + `npx tsc -b` in functions) `[Gate]`
- [x] Zero ESLint errors or warnings `[Gate]`
- [x] 29/29 frontend unit tests pass `[Gate]`
- [x] **E94 CLOSED** | 2026-06-08

---

### E96 · CI Functions Deploy — Remove Stale Bundle from Git
**Priority: MEDIUM · Effort: 0.5 developer-days**

> **Persona Gate — E96:**
> - **Staff (Infrastructure):** Prevents future AI/CF 500s caused by stale committed bundles. Ensures every `dev` branch push automatically deploys the latest Cloud Functions alongside Hosting.

**Background:** In the FIX_AI_INVENTORY_500 bug (2026-06-08), the deployed `functions/operations/lib/index.js`
bundle was stale — it used the banned `gemini-3.1-pro` model while the source had been fixed to
`gemini-2.5-pro`. Root cause: `functions/operations/lib/` is tracked in git but CI only deploys
Hosting, not Functions. Strategy B fixed the immediate issue; E96 closes the structural gap.

- [ ] Add `functions/operations/lib/` to root `.gitignore` (alongside `functions/lib/`) `[Infra]`
- [ ] Remove tracked lib artifacts: `git rm --cached -r functions/operations/lib/` `[Infra]`
- [ ] Add Firebase Functions deploy step to `.github/workflows/deploy-dev.yml` — runs after Hosting deploy on any push that changes `functions/**` `[Infra]`
- [ ] Add Firebase Functions deploy step to `.github/workflows/deploy-prod.yml` for parity `[Infra]`
- [ ] Verify: push a trivial change to `dev`, confirm both Hosting and Functions deploy in CI `[Infra]`
- [ ] Log decision in `docs/decisions/` `[Comp]`

---

### E97 · AI Inventory Assistant — Vision-First Enrichment
**Priority: HIGH · Effort: Medium (~1 developer-day)**

> **Persona Gate — E97:**
> - **Marcus:** AI must analyze the product image to write a provenance-rich description.
>   Blind descriptions fail the Marcus Photography Test.
> - **Jordan:** Title and category accuracy are editorial quality gates. AI-generated title
>   suggestions from image analysis enable faster, higher-quality metadata at scale.
> - **Staff:** The end-to-end workflow — analyze image → generate title/description → run pricing — must work as a coherent sequence.

**Background:** Four gaps found in the inventory AI assistant workflow (2026-06-09):
(1) Images never passed to `generateAIDescription` CF from either `AiAssistantPanel` or
`InventoryTable.triggerAi`. (2) CF outputs no title or category suggestion. (3) `suggestAiPrice`
has no access to the AI-generated description for richer pricing context. (4) `batchProcessItems`
was never migrated from the pre-E34 monolith — tracked as E98.

- [x] Schema: add `aiTitle` and `aiCategory` to `items/{id}/internal/ai` in `firestore-schema.md` `[Comp]`
- [x] Decision log: `docs/decisions/0007-ai-title-category.md` `[Comp]`
- [x] CF operations: `generateAIDescription` — update output schema to include `title`, `category`; save to `internal/ai` `[Staff]` `[Marc]`
- [x] CF operations: `generateAIDescription` — pass `images` when present `[Marc]`
- [x] CF operations: `suggestAiPrice` — accept optional `aiDescription` field; include in pricing prompt `[Staff]`
- [x] UI: `AiAssistantPanel` — pass `item.images` to description CF `[Marc]`
- [x] UI: `AiAssistantPanel` — display `aiTitle` and `aiCategory` with promote buttons `[Staff]`
- [x] UI: `AiAssistantPanel` — pass AI description as context to price CF `[Staff]`
- [x] UI: `InventoryTable.triggerAi` — pass images to description CF `[Staff]`
- [x] UI: `InventoryPage` — add `handleApplyTitle`, `handleApplyCategory` callbacks `[Staff]`
- [x] Rebuild operations bundle; all gates pass `[Comp]`
- [x] **E97 CLOSED** | 2026-06-09

### E98 · Batch AI Migration — Move `batchProcessItems` to Operations Codebase
**Priority: MEDIUM · Effort: Small (~0.5 developer-days)**

> **Persona Gate — E98:**
> - **Staff:** Batch AI buttons in `InventoryTable` always fail silently because `batchProcessItems` was never migrated from the pre-E34 monolith.

- [x] Migrate `batchProcessItems` + helpers from `functions/src/ai.ts` to `functions/operations/src/ai.ts` `[Staff]`
- [x] Update `generateDescriptionForItem` helper: pass images from Firestore, generate `aiTitle`/`aiCategory` `[Staff]`
- [x] Export `batchProcessItems` from `functions/operations/src/index.ts` `[Staff]`
- [x] Verify batch AI buttons in `InventoryTable` succeed in dev environment `[Staff]`
- [x] **E98 CLOSED (subsumed by E99)** | 2026-06-09

---

### E99 · Cloud Functions Architecture Remediation
**Priority: HIGH (contains P0 runtime failures) · Effort: Medium (~1 developer-day)**

> **Persona Gate — E99:**
> - **Staff (Loan Operations):** Loan issuance, redemption, and forfeiture are broken in production — client calls function names that do not match deployed exports.
> - **Jordan:** TypeScript gate does not cover deployed codebases; stale monolith and Node version mismatch increase regression risk.

- [x] **P0 — Phase 1:** Update `src/lib/useLoanTickets.ts` — rename `issueLoanTicket` → `createLoanTicket`, `redeemLoan` → `redeemLoanTicket` `[Staff]`
- [x] **P0 — Phase 1:** Add `forfeitLoan` export to `functions/core/src/loanTickets.ts` `[Staff]`
- [x] **P0 — Phase 1:** Deploy core codebase `[Staff]`
- [x] **P1 — Phase 2:** Migrate `batchProcessItems` to `functions/operations/src/ai.ts` (subsumes E98) `[Staff]`
- [x] **P1 — Phase 2:** Deploy operations codebase `[Staff]`
- [x] **P2 — Phase 3:** Fix Node version to 24 in `functions/core/package.json` and `functions/operations/package.json` (engines + esbuild target) `[Jord]`
- [x] **P2 — Phase 3:** Fix TypeScript gate — convert `functions/tsconfig.json` to project references solution covering core and operations `[Jord]`
- [x] **P2 — Phase 4:** Delete `functions/src/` (old monolith) `[Jord]`
- [x] **P3 — Phase 5:** Add `functions/core/lib/` and `functions/operations/lib/` to `.gitignore`; untrack committed lib artifacts `[Jord]`
- [x] **P3 — Phase 6:** Add functions deploy step to `.github/workflows/deploy-dev.yml` `[Jord]`
- [x] **E99 CLOSED** | 2026-06-09

---

### E100 · AI Intake Pipeline Diagnostics

> **Persona Gate — E100:**
> - **Staff:** Add structured `console.log` breadcrumbs to the AI intake Cloud Functions so the failure mode (Gemini call, JSON parse, Firestore write) can be identified in Firebase Cloud Logging.

- [x] Add diagnostic logging to `processUploadedImage` CF in `functions/operations/src/inventory.ts` `[Staff]`
- [x] Add diagnostic logging to `extractIntakeData` in `functions/operations/src/ai.ts` `[Staff]`
- [x] **E100 CLOSED** | 2026-06-09

---

### E101 · Gemini Model Inspector (Developer Tool)

> **Persona Gate — E101:**
> - **Jordan / Developer:** A local script that reads a Gemini API key from `functions/.env` and queries the live model list so developers can confidently update `docs/AI_MODELS.md` and avoid shipping invalid model IDs.

- [x] Store `GEMINI_API_KEY` in `functions/.env` (already gitignored) `[Developer]`
- [x] Create `scripts/list-gemini-models.mjs` — reads key, calls Gemini REST API, outputs annotated model table `[Developer]`
- [x] Update `docs/AI_MODELS.md` with findings from the script `[Developer]`
- [x] **E101 CLOSED** | 2026-06-09

---

### E106 · Pawn Loan Lifecycle Gap Remediation
**Priority: HIGH (compliance) · Effort: Medium (8 files)**

> **Persona Gate — E106:**
> - **Staff (Primary):** Gap 1 blocked staff from creating loan tickets in the admin UI entirely.
> - **Makoonsii:** All new loan issuance inputs meet the 48px touch target requirement.
> - **Compliance:** Gaps 2 and 3 violated E31's requirement for CF-only status writes and full auditLog coverage.

- [x] `updatePawnRequestStatus` callable CF added to `functions/core/src/pawnRequests.ts` `[Staff]` `[Comp]`
- [x] `PawnInbox.tsx` routes all status saves through `updatePawnRequestStatus` CF (removes direct `updateDoc`) `[Comp]`
- [x] `createLoanTicket` CF refactored — derives `uid`/`itemDescription` server-side; duplicate-issuance guard via `pawnLoanId` check `[Comp]`
- [x] `IssueLoanModal.tsx` created — staff issues loan from pawn request (amount, term, rate); 48px inputs; success state shows ticket ID `[Staff]` `[Mak]`
- [x] "Issue Loan" button in `PawnInbox` detail row — enabled only when `status === 'quoted'` and no `pawnLoanId` exists `[Staff]`
- [x] `redeemLoanTicket` CF updated to accept and persist `redemptionAmount` (CAD cents) `[Comp]`
- [x] `checkLoanDueDates` scheduler updated — auto-forfeit now transitions linked `items/{id}` to `status: 'active'` `[Comp]`
- [x] 7 `auditLogs.eventType` values added to `docs/firestore-schema.md` `[Comp]`
- [x] `PawnRequest` interface in `types.ts` extended with `pawnLoanId?: string` `[Staff]`
- [x] `useIssueLoanTicket` and `useRedeemLoan` hook signatures updated to match new CF contracts `[Staff]`
- [x] `LoanTicketsAdminPage` passes computed `redemptionAmount` on redeem `[Staff]`
- [x] User guide updated: `admin/pawn-inbox.md` and `admin/loans.md` `[Staff]`
- [x] Decision 0014 logged `[Comp]`
- [x] **E106 CLOSED** | 2026-06-09

---

### FIX · Seed Item Visibility — Admin Inventory Hidden Items

> **Persona Gate:** Staff (inventory_staff / manager / admin). No customer-facing change.

**Root cause:** Admin `InventoryPage` query had `limit(50)` ordered by `createdAt desc`. Seed items (batch-written 2026-05-18) held the oldest timestamps and fell past position 50 as real items accumulated. Public storefronts were unaffected — per-viewTag `limit(20)` buckets are independent of the global admin query.

- [x] Raise admin inventory query from `limit(50)` to `limit(500)` in `InventoryPage.tsx` `[Staff]`
- [x] Create `scripts/find-seed-items.mjs` — read-only fingerprint query to identify 36 fake seed items `[Staff]`
- [x] Decision 0015 logged `[Comp]`
- [x] User guide updated: `admin/inventory.md` `[Staff]`
- [x] **FIX_SEED_ITEM_VISIBILITY CLOSED** | 2026-06-10

---

### FIX · Loans Permissions — Admin Loans Page PERMISSION_DENIED

> **Persona Gate:** Staff (admin / manager / inventory_staff). No customer-facing change.

**Root cause:** `useAllLoanTickets` had no `enabled` guard. TanStack Query fired `queryFn` immediately on mount, before Firebase auth confirmed staff custom claims. Firestore evaluated `isStaff()` as false → `PERMISSION_DENIED` on the unbounded collection read.

- [x] Add `enabled: !!user?.isStaff` guard to `useAllLoanTickets` in `src/lib/useLoanTickets.ts` `[Staff]`
- [x] Decision 0016 logged `[Comp]`
- [x] **FIX_LOANS_PERMISSIONS CLOSED** | 2026-06-10

---

### FIX · Inventory Table — Bulk Delete / Restore

> **Persona Gate:** Staff (inventory_staff / manager / admin). No customer-facing change.

**Root cause:** `InventoryTable` batch action bar only had AI operations (`onBulkDelete`/`onBulkRestore` props were never defined). Staff could select multiple rows but had no way to act on them with CRUD.

- [x] Add `onBulkDelete`, `onBulkRestore`, `showRestoreAction` props to `InventoryTable` `[Staff]`
- [x] Add `handleBulkCrud` — confirmation, ID collection, selection reset on success `[Staff]`
- [x] Add Delete button (error-coloured) and Restore button (primary-coloured) to batch action bar `[Staff]`
- [x] Add `handleBulkDelete` and `handleBulkRestore` in `InventoryPage`, wired via props `[Staff]`
- [x] Decision 0017 logged `[Comp]`
- [x] User guide updated: `admin/inventory.md` — Table View section and Batch Actions `[Staff]`
- [x] **FIX_INVENTORY_BULK_CRUD CLOSED** | 2026-06-10

---

### FIX · Firebase Init Order — Site Down After E73 Static Import Conversion

> **Persona Gate:** All personas — site was fully unloadable (P0 regression).

**Root cause:** `src/lib/firebase.ts` called `getApp()` at module evaluation time, relying on `firebase-core.ts` having run `initializeApp()` first. E73's static import conversion changed the ES module evaluation order: `App.tsx` → `ViewContext.tsx` → `firebase.ts` now executed before `AuthContext.tsx` → `firebase-core.ts`, causing `getApp()` to throw `FirebaseError: No Firebase App '[DEFAULT]' has been created`.

- [x] Replace `getApp()` in `firebase.ts` with `import { app } from './firebase-core'` — creates explicit module graph edge `[All]`
- [x] Decision 0019 logged `[Comp]`
- [x] **FIX_FIREBASE_INIT_ORDER CLOSED** | 2026-06-10

---

## Phase 27 — POS & In-Store Operations

### E107 · Pawn Ticket Generation & Digital Signature (POS)

> **Persona Gate — E107:**
> - **Staff (Primary):** The POS operator must be able to collect a customer signature and print a ticket within the existing loan issuance flow — no separate application, no extra login step.
> - **Makoonsii (Secondary):** The agreement text must be plain language. The signature canvas must have large, accessible touch targets (≥100px height, clear "Sign here" label). The printed ticket must include the item description, loan amount, due date, and ticket number in readable font.

- [x] Schema: add `ticketNumber`, `signatureUrl`, `signedAt`, `agreementVersion`, `customerName` to `loanTickets/{id}` `[Comp]`
- [x] CF: extend `createLoanTicket` to generate `ticketNumber` (date + doc-id prefix) on creation `[Staff]`
- [x] CF: `signPawnAgreement(loanTicketId, signatureDataUrl, customerName)` — uploads PNG to Storage, writes `signatureUrl`/`signedAt`/`agreementVersion`, fires `pawn_agreement_signed` auditLog `[Comp]`
- [x] UI: Add "Sign Agreement" step to `IssueLoanModal` — shows agreement terms + signature canvas after loan terms are confirmed `[Staff]` `[Mak]`
- [x] UI: `PrintableTicket` component — print-optimized, renders all ticket fields + signature image `[Staff]`
- [x] UI: Add "Print Ticket" button to `LoanTicketsAdminPage` row actions and post-sign success screen `[Staff]`
- [x] Decision 0020 logged `[Comp]`
- [x] User guide updated: `admin/loans.md` and `admin/pawn-inbox.md` `[Staff]`
- [x] **E107 CLOSED** | 2026-06-10

---

### E109 · Walk-in Pawn Intake (POS Direct Loan Issuance)

> **Persona Gate — E109:**
> - **Staff (Primary):** Counter operator must be able to create a pawn intake and issue a loan for a walk-in customer without requiring an online form submission.
> - **Makoonsii (Secondary):** 48px touch targets, plain language. The most common real-world transaction at the Cornwall Island counter.

- [x] Schema: add `source: 'online' | 'walk_in'` to `pawnRequests/{id}` and update `docs/firestore-schema.md` `[Comp]`
- [x] CF: `createWalkInPawnRequest` — staff-only; creates `pawnRequest` with `status: 'quoted'` and `source: 'walk_in'`; serial blacklist trigger still fires `[Staff]` `[Comp]`
- [x] UI: `WalkInPawnModal.tsx` — name, phone (opt), email (opt), item description, serial (opt); 48px inputs `[Staff]` `[Mak]`
- [x] UI: "New Walk-in Pawn" button at the top of `PawnInbox`; on CF success opens `IssueLoanModal` directly `[Staff]`
- [x] Decision log `[Comp]`
- [x] **E109 CLOSED** | 2026-06-10

---

### FIX · Pawn Loan Defaults — Interest Rate Cap + Blank Print Page

> **Persona Gate:** Staff (admin / manager / inventory_staff) + Makoonsii (printed ticket recipient).

**Root cause — Bug 1:** `IssueLoanModal` initialised `interestRatePct` with `'5'`. At 5%/30-day term this annualises to ~60% APR — the federal criminal ceiling. Correct legal caps for Akwesasne (Ontario side): 48% APR for loans under $1,000; 35% APR for loans $1,000 and over. These are now computed dynamically from the entered amount and term and auto-populated into the rate field. Submit validation blocks any rate above the cap.

**Root cause — Bug 2:** `setPrintTicket(data)` followed by `setTimeout(() => window.print(), 0)`. In React 18 concurrent mode, the macrotask fires before the state commit; `PrintableTicket` renders `null` and the print dialog opens on a blank page. Fix: `window.print()` moved into `useEffect` inside `PrintableTicket` — guaranteed post-commit.

- [x] Remove hardcoded `useState('5')` default; rate field starts blank `[Staff]` `[Comp]`
- [x] Add `calcMaxRatePct(amountCents, days)` helper — APR cap × (days/365) conversion `[Comp]`
- [x] Add APR constants (`APR_CAP_UNDER_1000 = 0.48`, `APR_CAP_OVER_1000 = 0.35`, `LOAN_THRESHOLD_CENTS = 100_000`) `[Comp]`
- [x] Auto-populate rate to legal max in `onChange` handlers for amount + term inputs (avoids `setState-in-effect` lint violation) `[Staff]`
- [x] Show live cap indicator label beneath rate input: "Max for this loan: X.XX% (48% APR)" `[Staff]`
- [x] Submit-time validation: block if `ratePct > calcMaxRatePct(...)` with human-readable error `[Comp]`
- [x] Move `window.print()` into `useEffect` in `PrintableTicket.tsx` — remove `setTimeout(fn, 0)` from `PawnInbox.tsx` and `LoanTicketsAdminPage.tsx` `[Staff]` `[Mak]`
- [x] Decision 0023 logged `[Comp]`
- [x] User guide updated: `admin/pawn-inbox.md` and `admin/loans.md` `[Staff]`
- [x] **FIX_PAWN_LOAN_DEFAULTS CLOSED** | 2026-06-10

---

### FIX · Print Ticket — Content Invisible on Printed Page

> **Persona Gate:** Staff (admin / manager / inventory_staff) + Makoonsii (printed ticket recipient).

**Root cause:** `index.css @media print` sets `body * { visibility: hidden }` for the QR label print flow. `print.css` restored `display: block !important` on `.print-ticket` but never restored `visibility: visible`. Result: the ticket was laid out and occupying space but invisible to the printer. The browser's native URL header and page-number footer (always printed by the browser engine regardless of CSS) were the only visible output.

- [x] Add `.print-ticket, .print-ticket * { visibility: visible; }` to `@media print` in `src/styles/print.css` `[Staff]` `[Mak]`
- [x] **FIX_PRINT_TICKET_VISIBILITY CLOSED** | 2026-06-10

---

### FIX · Print Ticket — PDF Renders Blank Page

> **Persona Gate:** Staff (admin / manager / inventory_staff) + Makoonsii (printed ticket recipient).

**Root cause:** `Modal.tsx` sets `document.body.style.overflow = 'hidden'` as an inline style (scroll-lock). In the PDF print engine, `overflow: hidden` on `body` clips the content area; combined with `body { min-height: 100vh }` from `index.css`, the `.print-ticket` portal was constrained and never captured in the PDF output. `!important` in a `@media print` stylesheet rule overrides an inline style without `!important`.

- [x] Add `html, body { height: auto !important; overflow: visible !important; }` to top of `@media print` in `src/styles/print.css` `[Staff]` `[Mak]`
- [x] Decision 0024 logged `[Comp]`
- [x] **FIX_PRINT_TICKET_PDF CLOSED** | 2026-06-10

---

### FIX · Print Ticket — Invalid Date & Missing Signature Image

> **Persona Gate:** Staff (admin / manager / inventory_staff) + Makoonsii (printed ticket recipient).

**Root causes:** (1) `result.dueDate` is absent from pre-E110 CF responses; `new Date(undefined)` → `"Invalid Date"`. (2) `window.print()` fires after React's DOM commit but before the browser fetches the remote Firebase Storage signature URL — print dialog captures the img tag blank.

- [x] `IssueLoanModal.tsx`: defensive fallback `result.dueDate ? new Date(result.dueDate) : client-side-computation` `[Staff]`
- [x] `PrintableTicket.tsx`: preload signature image via hidden `Image()` before calling `window.print()`; `onerror` still triggers print `[Staff]` `[Mak]`
- [x] Decision 0026 logged `[Comp]`
- [x] **FIX_PRINT_TICKET_BUGS CLOSED** | 2026-06-10

---

### E110 · Pawn Compliance — Intake Forms & Printed Ticket

> **Persona Gate — E110:**
> - **Staff / POS Operator (Primary):** Complete, compliant intake form captures structured item details and ID verification. Printed ticket is a legally valid document with APR, agreed value, serial number, and proper terms.
> - **Makoonsii (Secondary):** Ticket is readable, complete, and protects their rights — shows what was pawned, the total cost in plain language, and how to get it back.

**Status:** ✅ CLOSED — 2026-06-10 · **Priority:** HIGH — Legal/Compliance · **Cycle:** 33

- [x] Update `firestore-schema.md` with new fields (`pawnRequests`: `itemCategory`, `itemMake`, `itemModel`, `itemColour`, `condition`, `notableMarkings`, `requestedAmount`, `idType`, `idVerified`; `loanTickets`: `serialNumber`, `issuedByDisplayName`, `agreedItemValue`, `itemCategory`, `itemMake`, `itemModel`, `itemColour`, `condition`, `notableMarkings`) — Decision 0025 `[Comp]`
- [x] `types.ts`: add new fields to `PrintTicketData`, `LoanTicket`, `PawnRequest` interfaces `[Comp]`
- [x] `PrintableTicket.tsx`: APR row (computed from rate + term), agreed item value, serial number, staff issuer name, structured item block; improved terms (sole-recourse language, police hold clause, age/ownership declaration, retention note) `[Staff]` `[Mak]`
- [x] `IssueLoanModal.tsx`: add agreedItemValue input, idType dropdown, idVerified + item-received checkboxes; pass staffName from `useAuth`; fix client-side due-date drift `[Staff]`
- [x] `WalkInPawnModal.tsx`: add category, make/model, colour, condition, notableMarkings, requestedAmount fields `[Staff]`
- [x] `PawnEnquiryForm.tsx`: add category, condition, notableMarkings, requestedAmount fields `[Mak]`
- [x] `PawnInbox.tsx`: thread serialNumber through to IssueLoanModal props and PrintTicketData `[Staff]`
- [x] `LoanTicketsAdminPage.tsx`: serialNumber + staffName available on reprint path `[Staff]`
- [x] `createLoanTicket` CF: copy serialNumber + structured fields from pawnRequest, persist issuedByDisplayName, accept agreedItemValue, remove `?? 0.05` fallback `[Comp]`
- [x] `createWalkInPawnRequest` CF (`pawnIntake.ts`): accept new optional intake fields `[Comp]`
- [x] `submitPawnRequest` CF (`pawnRequests.ts`): accept new optional intake fields `[Comp]`
- [x] Decision 0025 logged `[Comp]`
- [x] User guide updated: `admin/pawn-inbox.md` and `admin/loans.md` `[Staff]`
- [x] **E110 CLOSED** | 2026-06-10

---

### E111 · Pawn Ticket Two-Page Print Layout + Logo

> **Persona Gate — E111:**
> - **Jordan (Primary):** Printed document is a polished, branded two-page agreement — not a single wall of text.
> - **Staff / POS Operator (Primary):** Page 1 = loan summary; page 2 = legal terms. Logo confirms document provenance at the counter.
> - **Makoonsii / Dale (Secondary):** Cleaner page 1 makes loan terms easier to read and retain.

**Status:** ✅ CLOSED — 2026-06-10 · **Priority:** LOW · **Cycle:** 33

- [x] `print.css`: add `.print-ticket-logo` rule; add `break-before: page` to `.print-ticket-agreement` `[Jord]`
- [x] `PrintableTicket.tsx`: replace shop-name text with `<img src="/branding/logo_pc.png">` in page 1 header `[Jord]`
- [x] `PrintableTicket.tsx`: add "— Page 2 of 2 — Terms & Conditions" copy-header inside `.print-ticket-agreement` `[Staff]`
- [x] Decision 0027 logged `[Jord]`
- [x] **E111 CLOSED** | 2026-06-10

---

### E108 · Server-Side PDF Pawn Tickets (Backlog)

> **Persona Gate — E108:**
> - **Staff (Primary):** Generate a server-side PDF for archival, email delivery, or when browser printing is unavailable.
> - **Makoonsii (Secondary):** PDF must include all ticket fields, customer signature, and be retrievable by ticket number.

- [ ] CF: `generateTicketPdf(loanTicketId)` — Cloud Function using `pdf-lib`, uploads PDF to `tickets/{id}/ticket.pdf`; returns download URL `[Staff]`
- [ ] Schema: add `pdfUrl` field to `loanTickets/{id}` `[Comp]`
- [ ] UI: "Download PDF" button on `LoanTicketsAdminPage` row for signed tickets `[Staff]`
- [ ] Storage rule: staff-read-only for `tickets/{id}/ticket.pdf` (no public read) `[Comp]`
- [ ] Decision log: PDF library selection and Storage access pattern `[Comp]`

