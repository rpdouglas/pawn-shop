# Decisions

> One-liner log of technical and architectural decisions.
> Add a line whenever you make a meaningful choice. Date it. That's it.
> Replaces formal ADR documents.

---

## Format

```
YYYY-MM-DD — Decision. Brief reason.
```

---

## Log

2026-05-16 — Primary dev environment is GitHub Codespaces. No local setup required or assumed.

2026-05-16 — Firestore prefix tokens (`searchTokens[]`) for search instead of Algolia. Revisit if search UX becomes a problem.

2026-05-16 — Two Firebase projects: `nats-rack` (dev) and `the-addicts-agenda` (prod). No staging — overkill for one developer.

2026-05-16 — GitHub Issues as a simple numbered task list. No labels, no milestones, no Projects board.

2026-05-16 — No Storybook. Build components in context, iterate in the app.

2026-05-16 — `deploy-prod.yml` requires typing "DEPLOY" as confirmation. Intentional friction — prod deploys should be deliberate.

2026-05-16 — `aiDescription` is draft-only, never customer-facing, enforced by Firestore security rules. Staff must promote to `description` before publishing.

2026-05-16 — All AI API calls (Claude/Gemini) go through Cloud Functions. API keys never on the client.

2026-05-16 — Prices stored in CAD cents (integer) to avoid floating-point errors.

2026-05-16 — firebase.json emulators bound to `0.0.0.0` so they are reachable from Codespaces port forwarding.

2026-05-17 — Vite chosen as the build tool. Fast HMR, native ESM, TypeScript out of the box — no CRA or Next.js overhead needed for this app's routing model.

2026-05-17 — deploy-dev.yml skips all steps when package.json is absent. Prevents CI failures before the Vite app is scaffolded.

2026-05-17 — aiDescription and aiPriceSuggestion moved to items/{id}/internal/ai subcollection. Firestore rules are document-level — field-level hiding on the parent document is not enforceable at the rules layer.

2026-05-17 — View-scoped CSS tokens defined as custom properties on `.view-*` selectors, not in Tailwind `@theme` (E02). `@theme` defines globally-fixed values — putting `--color-primary` there would mean one value for the entire app. `.view-*` selectors allow the same token name to cascade differently per view at runtime without JavaScript.

2026-05-17 — Self-hosted fonts via @fontsource npm packages (E02). No CDN requests at runtime. Fonts bundled with the Vite build. Packages: playfair-display, im-fell-english, cormorant-garamond, dm-sans, bebas-neue, oswald.

2026-05-17 — react-router-dom installed in E02, not deferred to E03. ViewContext uses useLocation() — building on window.location would require rewrite when ProtectedRoute (E03) needs the router.

2026-05-17 — PWA manifest uses a single manifest.json with per-view shortcuts. Dynamic per-view theme-color is handled by ViewLayout updating the <meta name="theme-color"> tag on route change. Full per-view manifest files (Strategy C) deferred until brand icon assets exist.

2026-05-17 — TOTP MFA requires Firebase Identity Platform upgrade before production staff accounts are created (E03). TotpMultiFactorGenerator is available in firebase/auth v12 SDK but server-side TOTP enforcement (bypass-impossible) requires Identity Platform. Client-side ProtectedRoute gate and enrollment UI are in place; Identity Platform upgrade is a pre-prod compliance gate (E09/E11).

2026-05-17 — MfaEnrollPage is not wrapped in ProtectedRoute (E03). Wrapping it causes an infinite redirect loop: staff without MFA → /auth/mfa-enroll → ProtectedRoute checks mfaEnrolled → redirect back to /auth/mfa-enroll. The page handles its own auth guard inline instead.

2026-05-17 — items/{id}.status adds 'draft' value (E04). Intake form creates items as draft before staff publish. Existing Firestore public read rule (status == 'active' && policeHold != true) already excludes draft items — no rule change required.

2026-05-17 — auditLogs adds hold_set and hold_expired event types (E04). Written by setHold and resetExpiredHolds Cloud Functions respectively. Schema updated to list approved values. Details map is {itemId, fromStatus, toStatus} — no PII.

2026-05-17 — publishItem CF skips Kevin alert dispatch when policeHold: true (E04). Item is hidden from public reads by the Firestore rule; alerting customers about an item they cannot see would be a compliance violation.

2026-05-17 — createDraftItem is a Cloud Function, not a direct client write (E04). Firestore rules block client-side creates on items/ because resource.data is null for creates, making diff() fail. Admin SDK (CF) bypasses rules — the correct pattern for any collection where staff create documents.

2026-05-17 — processImageUpload watches items/{itemId}/uploads/* staging path (E04). Processed images land at items/{itemId}/images/*. Separate paths prevent the trigger from re-firing on its own output, avoiding an infinite loop.

2026-05-17 — E05: logAgeGate CF uses invoker: 'public' so anonymous users can log age gate events. Admin SDK write bypasses the auditLogs Firestore rule (allow create: isSignedIn()), which correctly prevents anonymous client writes. CF write is the authoritative path.

2026-05-17 — E05: Fireworks age gate set to 18+ per EPICS.md and E05 project spec. design-system.md §10 lists 19+ for fireworks — discrepancy noted; EPICS.md treated as the functional requirement. Confirm with business owner before prod.

2026-05-17 — E05: Cannabis mood filter (Relax/Focus/Social/Ceremony) maps to Firestore category field values (cannabis-indica, cannabis-sativa, cannabis-hybrid, cannabis-premium) and filters client-side. Cannabis inventory is small; avoids a composite index on category + viewTag + status. Revisit in E13 if performance becomes a concern.

2026-05-17 — E05: CountdownTimer on Fireworks page uses hardcoded Canada Day 2026 date. E14 will wire it to campaigns/{id} with countdownEnabled: true. Kept as a named constant to make the E14 wiring point obvious.

2026-05-17 — E05: useItemSearch uses expanding-limit onSnapshot for infinite scroll (not cursor pagination with getDocs). Limit increments of 20 trigger a new subscription; React cleanup unsubscribes the previous one. Accepted brief loading flash on page boundary as the tradeoff for simpler real-time updates.

2026-05-17 — E05: MasonryGrid builds item cards inline (MasonryCard) rather than reusing Card component. Card.tsx forces aspect-ratio: 4/3 on the image; masonry requires natural image height (never force-cropped per §6.5). Avoids modifying Card.tsx outside E05 scope.

2026-05-17 — E05: ItemQuickView is a standalone createPortal component, not an extension of Modal.tsx. Modal.tsx has a CSS max-width of 560px hardcoded in index.css; the quick-view spec requires 640px. Standalone component keeps E05 scope contained without modifying a shared UI primitive.

2026-05-17 — eBay REST Sell Inventory API chosen over legacy Trading API (XML) for E06. REST is the current eBay developer standard; Trading API is in maintenance mode and being deprecated. Three-step flow: create inventory item (PUT) → create offer (POST) → publish offer (POST → listingId).

2026-05-17 — pushToEbay CF scoped to admin and manager claims only, not inventory_staff (E06). eBay listing is a commercial publishing action with business implications beyond intake; inventory_staff handles receiving and grading, not external marketplace decisions.

2026-05-17 — ebayWebhook sends HTTP 200 before processing the sold notification (E06). eBay requires acknowledgment within 3 seconds; Firestore writes can exceed that under load. Response is sent synchronously; processEbayNotification runs asynchronously after. Any processing error is logged via console.error — it cannot be surfaced to eBay.

2026-05-17 — No ebayListingStatus field added to items/{id} (E06). For MVP, ebayListingId presence implies an active listing; status: 'sold' implies it sold. A separate eBay-specific status field adds schema complexity without actionable benefit at current scale. Revisit in E16 if relist workflows require it.

2026-05-17 — auditLogs adds ebay_push and ebay_sync_sold event types (E06). Written by pushToEbay and ebayWebhook Cloud Functions respectively. Details map is {itemId, ebayListingId, viewTag} — no PII.

2026-05-17 — Cannabis and fireworks items are blocked from eBay push at the Cloud Function level (E06). eBay prohibits cannabis listings and heavily restricts/prohibits fireworks. pushToEbay validates viewTag == 'pawn' before calling eBay API — not a UI concern, enforced server-side.

2026-05-17 — pawnRequests allow create: if false in Firestore rules (E07). All creates go through submitPawnRequest callable CF (Admin SDK bypasses rules). Blocks client-side writes to guarantee serialBlacklistHit is always set before staff reads the document.

2026-05-17 — auditLogs adds pawn_request_submit and serial_blacklist_hit event types (E07). Written by submitPawnRequest Cloud Function. Details map is {requestId, viewTag} for submit and {requestId, serialNumber} for blacklist hit — no PII in details; name/email/phone stay in pawnRequests/{id} only.

2026-05-18 — pawn-requests Storage read restricted to staff custom claims (E07). Any authenticated user could previously read another customer's submission photos by path. Scoped to admin/manager/inventory_staff to match the Firestore pawnRequests read rule.

2026-05-18 — PawnInbox uses onSnapshot instead of getDocs + manual refresh (E07). Real-time subscription means new submissions appear immediately without staff action. Expanded row closes automatically if the document leaves the current filter view after a status update.

2026-05-18 — E08: reservations/{id} extended with customerName, customerPhone, viewTag, smsDeliveredAt. Required for Twilio SMS dispatch and staff inbox display. PII fields (customerName, customerPhone) never appear in auditLogs.

2026-05-18 — E08: config/storeHours added as new single-document collection. Admin-only write via updateStoreHours CF. Authenticated read for slot picker. Slot intervals computed at runtime (open→close−30min in 30-min steps). Not stored in Firestore per-slot — computed from the config document.

2026-05-18 — E08: auditLogs adds reservation_created, reservation_confirmed, reservation_declined, reservation_completed, store_hours_updated event types. Details map: {itemId, reservationId, viewTag} for reservation events; {daysModified: string[]} for store_hours_updated — no PII in any details map.

2026-05-18 — E08: SMS dispatch in createReservation is inline (not via Firestore trigger) to guarantee 60-second SLA. Firestore triggers can queue under load; inline Twilio call within the CF execution window is deterministic.

2026-05-18 — E08: confirmReservation and completeReservation are callable CFs (not direct client Firestore writes) because both trigger side effects — confirmReservation sets items/{id}.status='reserved' and fires a confirmation SMS; completeReservation sets items/{id}.status='sold'. Side-effect operations belong in CFs, not client-side updateDoc.

2026-05-18 — E08: sendContactEmail CF writes no Firestore document and no auditLogs entry. Contact form collects PII (name, email, message) that cannot appear in auditLogs.details. Email-only routing satisfies the requirement without creating a PII-bearing collection.

2026-05-18 — E08: Click-and-collect CTA hidden on cannabis items. Cannabis view discretion (Marie persona) requires no persistent reservation records at this stage. Cannabis enquiry path remains the existing WhatsApp deep-link (E11).

2026-05-18 — E08: Google Maps embed uses static iframe Share/Embed URL (no API key). Avoids client-side Maps JavaScript API key exposure. Sufficient for a single store location display.

2026-05-18 — E09: auditLogs Firestore rule tightened from `if isSignedIn()` to `if false`. All auditLog writes go through Cloud Functions using Admin SDK — the client rule was never the intended write path. Tightening removes a potential surface for client-side auditLog injection.

2026-05-18 — E09: savedSearches create rule corrected from `resource.data.uid` to `request.resource.data.uid`. `resource.data` is null on creates; the previous rule was silently denying all new savedSearch creates from non-staff clients. Bug introduced in schema, not yet user-impacting since E12 (Alerts) is undelivered.

2026-05-18 — E09: campaigns write rule left as `isStaff()` (includes inventory_staff, manager, admin). Campaigns are time-sensitive marketing objects; restricting to admin-only would block managers from scheduling promotions during peak periods. Decision: manager-level write is acceptable and intentional.

2026-05-18 — E09: preorders create rule left as `isSignedIn()`. Preorders are customer-initiated — any authenticated customer should be able to create one. No PII exposure risk; records are staff-readable. No change required.

2026-05-18 — E09: PIPEDA data retention schedule — pawnRequests and reservations with terminal status (declined, completed) purged after 730 days (2 years). auditLogs never purged (immutable compliance record). Retention window configurable via PURGE_RETENTION_DAYS env var (default: 730). Schedule: Sunday 02:00 UTC weekly via Cloud Scheduler.

2026-05-18 — E09: Kanien'kéha codebase scan complete. Two references to "Akwesasne" found (ContactPage.tsx:46, PawnHero.tsx:53) — both are English-language proper noun place name usage, not Kanien'kéha language content. No language strings, grammar, or vocabulary present. Codebase clean; no community review required for existing content.

2026-05-18 — E13: enquiryCount field added to items/{id}. Counter incremented by createReservation CF via FieldValue.increment(1). Input to calculateTrendingScore. Avoids expensive per-item reservation count query in scheduled CF.

2026-05-18 — E13: staffPickNote field added to items/{id}. Staff-written curator note (max 280 chars) written by updateMerchandisingTags CF when staff-pick tag is added. Customer-visible on StaffPicksSection and ItemQuickView.

2026-05-18 — E13: trendingScore formula = viewCount + (enquiryCount * 5). No time decay at MVP scale — small inventory doesn't benefit from decay complexity. Staff picks and just-arrived tags provide editorial and recency signals independently. Revisit if trending accuracy becomes a concern in E17.

2026-05-18 — E13: calculateTrendingScore and removeJustArrivedTags scheduled every 30 minutes (co-located in merchandising.ts, separate exports). Matches resetExpiredHolds schedule. Batch-writes in groups of 500 (Firestore batch limit).

2026-05-18 — E13: StaffPicksSection queries via useStaffPicks hook with array-contains on merchandisingTags. Composite index added: viewTag + status + policeHold + merchandisingTags (CONTAINS). Same pattern as existing searchTokens index.

2026-05-18 — E13: Search decision — Firestore prefix tokens retained (no Algolia). Current inventory scale and response times are within Dale's 300ms requirement. Algolia evaluation deferred until production traffic data shows degradation. Decision logged to close EPICS.md open search decision task.

2026-05-18 — E10: GA4 analytics helper (analytics.ts) uses typed parameter interfaces that structurally exclude uid, email, name, and phone. PII exclusion is a compile-time guarantee, not a code review concern.

2026-05-18 — E10: analytics export in firebase.ts is conditionally null when VITE_FIREBASE_MEASUREMENT_ID is not set. All Analytics.* call sites check for null before logEvent — no GA4 call is ever made in dev environments without measurementId configured.

2026-05-18 — E10: Remote Config minimumFetchIntervalMillis set to 0 in dev (import.meta.env.DEV) and 60,000ms in production. This avoids hitting Remote Config quota during rapid local iteration while keeping flag propagation within 60 seconds in prod.

2026-05-18 — E10: Remote Config defaults (show_staff_picks: true, show_related_items: true, pawn_form_enabled: true) are set on the remoteConfig object in firebase.ts rather than inside useFeatureFlags. This means getValue() returns the correct default even before fetchAndActivate completes on first render.

2026-05-18 — E10: UTM params captured at module load in main.tsx (captureUtm() called before router creation). sessionStorage-only — never written to Firestore or included in auditLogs. Attribution data for future campaign analysis without PII exposure.

2026-05-18 — E10: setPoliceHold CF restricted to admin claim only (not manager). policeHold is a compliance action tied to law enforcement contact — a higher bar than operational staff decisions. Managers may request a hold via an admin.

2026-05-18 — E10: DashboardPage uses getDocs for active-by-view breakdown (client-side count) to avoid composite indexes. getCountFromServer is used for single-field status counts and pawn request volume where it is efficient without index overhead.

2026-05-18 — E10: DashboardPage auth gate: admin or manager role. PoliceHoldManager sub-section additionally restricted to isAdmin only (managers can view the dashboard but cannot set holds).

---

*Add new entries above this line.*
