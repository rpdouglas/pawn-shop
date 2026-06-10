# Active Cycle — The Pawn Shop

> **Sprint tracking file.** Update at the start and end of every work cycle.
> Referenced by `docs/prompts/INITIALIZATION.md` on session load.

---

## Current Cycle

**Cycle:** 32
**Started:** 2026-05-22
**Target close:** TBD
**Deploy target:** dev

---

## Cycle Goal

E94 · Inventory Table Mode — Inline spreadsheet grid with click-to-edit cells, copy/paste, row selection, per-row and batch AI dispatch. (COMPLETED)

---

## In Progress

| Task | Epic | Persona | Owner | Notes |
|---|---|---|---|---|
| | | | | |

---

## Completed This Cycle

| Task | Epic | Completed |
|---|---|---|
| Installed `vitest`, `jsdom`, `@testing-library/react` and configured `vite.config.ts` | E21 | 2026-05-22 |
| Implemented autonomous governance agents (Security, A11y, QA, Docs) and fixed E2E test suite flakiness | E76 | 2026-06-05 |
| **E76 CLOSED** | E76 | 2026-06-05 |
| AI Fallback: Graceful degradation for 503/429 errors and updated Gemini models to 3.1-pro/2.5-flash | E73 | 2026-06-05 |
| Implemented unit tests for `format.ts`, `Button.tsx`, and `AgeGate.tsx` | E21 | 2026-05-22 |
| **E21 CLOSED** | E21 | 2026-05-22 |
| Modified `deploy-dev.yml` to enforce Lint/Unit/A11y/LHCI gates | E44 | 2026-05-22 |
| **E44 CLOSED** | E44 | 2026-05-22 |
| Schema + `types.ts` updated with `cannabisProfile` | E29 | 2026-05-22 |
| `IntakeForm` extended with Cannabis attributes | E29 | 2026-05-22 |
| `TerpeneProfile` SVG spider chart + `CannabisProductData` detail panel built | E29 | 2026-05-22 |
| `CannabisPage` updated to show `ItemQuickView` with wellness profile | E29 | 2026-05-22 |
| **E29 CLOSED** | E29 | 2026-05-22 |
| `E45 Pawn Readability` — Lora font swap & contrast | E09 | 2026-06-02 |
| **E45 CLOSED** | E09 | 2026-06-02 |
| `E46 Admin Text Contrast` — Muted text visibility | E09 | 2026-06-02 |
| **E46 CLOSED** | E09 | 2026-06-02 |
| `E47 Mobile Intake Reliability` — CF Memory & UI State Fixes | E09 | 2026-06-02 |
| **E47 CLOSED** | E09 | 2026-06-02 |
| `E48 Mobile Intake Processing Resilience` — 30s timeout & CF Retry Logic | E48 | 2026-06-02 |
| **E48 CLOSED** | E48 | 2026-06-02 |
| `E24 QA Token Fixes` — Removed hardcoded px & fixed WCAG contrast | E24 | 2026-06-02 |
| **E24 CLOSED** | E24 | 2026-06-02 |
| `E49 Mobile Intake Image Job Tracker` — Firestore Job Tracking | E49 | 2026-06-02 |
| **E49 CLOSED** | E49 | 2026-06-02 |
| `Photo Upload Synchronous Architecture` — Replaced async trigger with HTTPS Callable | Fix | 2026-06-02 |
| `E51 Photo Upload Compression & Resilience` — Client-side compression and 1GiB memory bump | E51 | 2026-06-02 |
| **E51 CLOSED** | E51 | 2026-06-02 |
| `E52 Inventory Management CRUD` — Hard delete & archive UI + deleteInventoryItem CF | E52 | 2026-06-02 |
| **E52 CLOSED** | E52 | 2026-06-02 |
| `E53 Native Web Share` — navigator.share component with clipboard fallback | E53 | 2026-06-02 |
| **E53 CLOSED** | E53 | 2026-06-02 |
| `E54 Item Landing Pages` — Dedicated `/item/:id` route with dynamic AgeGate and SEO tags | E54 | 2026-06-02 |
| **E54 CLOSED** | E54 | 2026-06-02 |
| `Fix Desktop Photo Upload` — Migrated `ImageUploadZone.tsx` to `processUploadedImage` Callable | BUGFIX | 2026-06-03 |
| **BUGFIX CLOSED** | BUGFIX | 2026-06-03 |
| `E55 Edit Inventory Item` — Refactored intake flows to accept `initialItemId` for edits | E55 | 2026-06-03 |
| **E55 CLOSED** | E55 | 2026-06-03 |
| `E56 Cannabis Data Model` — Expanded `CannabisProfile` schema to support subcategories, servings, strain types, and unit toggles | E56 | 2026-06-03 |
| **E56 CLOSED** | E56 | 2026-06-03 |
| `E57 AI-First Inventory Intake` — Flipped intake flow to upload photo first, triggering Gemini to hydrate form data automatically | E57 | 2026-06-03 |
| **E57 CLOSED** | E57 | 2026-06-03 |
| `E58 Desktop Photo First` — Re-architected desktop IntakeForm to auto-create drafts and trigger AI extraction on photo drop | E58 | 2026-06-03 |
| **E58 CLOSED** | E58 | 2026-06-03 |
| `E59 Pawn Page Multiple Views` — Refactored LayoutToggle for Pawn view | E59 | 2026-06-04 |
| **E59 CLOSED** | E59 | 2026-06-04 |
| `E60 AI Governance Subagents` — Defined Linguistic_Auditor, Data_Steward, Performance_Engineer, and Brand_Auditor | E60 | 2026-06-04 |
| **E60 CLOSED** | E60 | 2026-06-04 |
| `E61 Mobile Intake UX Refinement` — Moved title to details, added fun cycling loading state | E61 | 2026-06-04 |
| **E61 CLOSED** | E61 | 2026-06-04 |
| `E62 User Role Management` — Added RoleControls to CRM profile for Admins | E62 | 2026-06-04 |
| **E62 CLOSED** | E62 | 2026-06-04 |
| `E63 Inventory Desktop Layout` — Refactored inventory grid view and AI drawer | E63 | 2026-06-04 |
| **E63 CLOSED** | E63 | 2026-06-04 |
| `E64 Profile and Customers` — Created ProfilePage and renamed CRM to Customers | E64 | 2026-06-04 |
| **E64 CLOSED** | E64 | 2026-06-04 |
| `E65 Frontend Optimizations` — Fixed observer loops, added prefetching, E2E roles test | E65 | 2026-06-04 |
| **E65 CLOSED** | E65 | 2026-06-04 |
| `E66 Backend Optimizations` — Migrated Cloud Functions to v2 with high concurrency | E66 | 2026-06-04 |
| **E66 CLOSED** | E66 | 2026-06-04 |
| `E67 Inventory Recycle Bin` — Soft delete with 30 day purge and Admin override | E67 | 2026-06-04 |
| **E67 CLOSED** | E67 | 2026-06-04 |
| `Cannabis AI Intake Enhancement` — Augmented AI Intake prompt to extract cannabisProfile specifically for Cannabis views | E57 | 2026-06-04 |
| `Cannabis Dataset Seeding Pipeline` — Built an ETL seeder script (`scripts/seed-public-dataset.mjs`) to aggressively clean, parse, and batch-upload public CSV strain data into the `cannabisStrains` schema | E57 | 2026-06-04 |
| `E20 Employee Profiles & HR Data` — Created secure `hrData` sub-collection, day-by-day scheduling preferences grid, and integrated into `ProfilePage` and `StaffList` | E20 | 2026-06-04 |
| **E20 CLOSED** | E20 | 2026-06-04 |
| `E69 Onboarding & SOP Management` — Developed versioned documents architecture, digital signatures, invite flow, and staff AcknowledgmentWall | E69 | 2026-06-04 |
| **E69 CLOSED** | E69 | 2026-06-04 |
| `E70 Social Media Campaign Management` — Built SocialDashboardPage, Composer with Canva media support, and integrated approveAndSchedulePost Cloud Function for Unified API broadcasting | E70 | 2026-06-04 |
| **E70 CLOSED** | E70 | 2026-06-04 |
| `E71 State Management Refactor` — Replaced duplicate Firestore snapshot listeners with TanStack React Query caching for performance optimization. Refactored configs and dashboard. | E71 | 2026-06-04 |
| **E71 CLOSED** | E71 | 2026-06-04 |
| `E34 Cloud Functions Modular Refactor` — Split monolithic codebase into core and operations | E34 | 2026-06-04 |
| **E34 CLOSED** | E34 | 2026-06-04 |
| `E72 Phase 1` — Boot Firebase Emulators + Vite via `wait-on` for stable Playwright execution. Added Vitest coverage reporting. | E72 | 2026-06-04 |
| `E72 Phase 2` — Implemented Firebase Cloud Function unit testing via `firebase-functions-test` and Vitest across `core` and `operations` modules. Restructured npm workspaces for singleton isolation. | E72 | 2026-06-04 |
| `E72 Phase 3` — Executed Strategic Extraction of `IntakeForm.tsx` (CannabisFields, FireworksFields) and built component and hook test coverage using Vitest and RTL. | E72 | 2026-06-04 |
| `E72 Phase 4` — Persona E2E Suites. Built robust Playwright tests mapping to real UI logic and configured the emulator environment to handle CI constraints. | E72 | 2026-06-05 |
| **E72 CLOSED** | E72 | 2026-06-05 |
| `E81 Phase 1` — Implemented `issueLoanTicket`, `redeemLoan` (Stripe stubbed), and `forfeitLoan` CFs. | E81 | 2026-06-06 |
| `E81 Phase 2` — Added `sendLoanReminders` CF for 3-day SMS reminders. | E81 | 2026-06-06 |
| `E81 Phase 3` — Updated `LoanTicketsAdminPage` with manual redeem/forfeit UI and `ProfilePage` for customer visibility. | E81 | 2026-06-06 |
| **E81 CLOSED** | E81 | 2026-06-06 |
| `E82 Phase 1` — Rebuilt `CannabisPage`, added `CannabisMarqueeStrip` and `StoryStrip`, updated `LuxuryProductCard` USD/CAD logic. | E82 | 2026-06-06 |
| **E82 CLOSED** | E82 | 2026-06-06 |
| `E78 Phase 1` — Rebuilt AI Extraction pipeline with schema validation, fuzzy matching for cannabis, eBay comps integration, and model fallback handling. | E78 | 2026-06-06 |
| **E78 CLOSED** | E78 | 2026-06-06 |
| `E28 Algorithmic Markdown Engine` — Built automated Dutch auction pricing with cron jobs and CASL compliant SMS alerts. Added Admin UI to configure markdown. | E28 | 2026-06-06 |
| **E28 CLOSED** | E28 | 2026-06-06 |
| `E93 AI Intake Toggle` — Added sessionStorage-persisted AI opt-out toggle to both `IntakeForm.tsx` and `MobileIntakePage.tsx`. Default ON, locks after first photo, skips both extraction and eBay pricing comps when off. 7 new unit tests. | E93 | 2026-06-08 |
| **E93 CLOSED** | E93 | 2026-06-08 |
| `E93 AI Overlay Bugfix` — Fixed misleading AI status indicators (fun messages on mobile, "✨ AI Extracting..." overlays on desktop) showing when AI toggle is OFF. Mobile now shows neutral "Saving photo…"; desktop overlays gated on `aiEnabled && isAiProcessing`. 2 regression tests added. | E93 | 2026-06-08 |
| `E94 Inventory Table Mode` — TanStack Table v8 headless grid on InventoryPage with click-to-edit cells (Text, Select, Price, Tag, PoliceHold), Ctrl+C/V clipboard, row selection, floating batch action bar, per-row AI (✨/$) with AiAssistantPanel, `batchProcessItems` CF, `policeHold` admin gate, scarcity tag restriction. Zero lint errors/warnings, 29/29 tests pass. | E94 | 2026-06-08 |
| **E94 CLOSED** | E94 | 2026-06-08 |
| `E95 CI Test Gating` — Removed Java 21, Playwright install, A11y/E2E, and LHCI steps from both deploy workflows. Push pipeline now: Lint → Unit → Build → Deploy (~3 min). Created `.github/workflows/e2e.yml` (on-demand + weekly Sunday 03:00 UTC). Created `docs/TESTING.md`. Decision logged as 0005. | E95 | 2026-06-08 |
| **E95 CLOSED** | E95 | 2026-06-08 |
| `FIX_AI_INVENTORY_500` — Rebuilt stale `functions/operations/lib/index.js` bundle. Root cause: source updated to `gemini-2.5-pro` in commit bd3ae16 but bundle was never rebuilt; deployed bundle still used banned `gemini-3.1-pro` model → HTTP 500. Bundle rebuilt, bundle committed. User to run `firebase deploy --only functions --project nats-rack` to push fix. E96 added to backlog for structural CI fix. | BUGFIX | 2026-06-08 |
| **FIX_AI_INVENTORY_500 CLOSED** | BUGFIX | 2026-06-08 |
| `FIX_AI_DESCRIPTION_500` — Added third fallback tier (Lite model) to `generateAIDescription` and `suggestAiPrice`. Root cause: both `gemini-2.5-pro` and `gemini-3.5-flash` returned 503 simultaneously after deploy; two-tier fallback had no third tier. Bundle rebuilt and deployed. | BUGFIX | 2026-06-09 |
| `E97 AI Inventory Enrichment` — Images now passed to `generateAIDescription` CF; CF generates `aiTitle` + `aiCategory` alongside description; `suggestAiPrice` receives AI description context; `AiAssistantPanel` shows and promotes title/category; `InventoryTable.triggerAi` passes images. Four gaps closed. E98 (batch migration) tracked on backlog. | E97 | 2026-06-09 |
| **E97 CLOSED** | E97 | 2026-06-09 |
| `E99 Cloud Functions Architecture Remediation` — Fixed 3 P0 loan function name mismatches (`issueLoanTicket`/`redeemLoan`/`forfeitLoan`); added `forfeitLoan` to core; migrated `batchProcessItems` to operations (subsumes E98); fixed Node 20→24 version mismatch; converted `functions/tsconfig.json` to project references so `tsc -b` now covers deployed codebases; deleted 4,393-line pre-E34 monolith; added `lib/` to `.gitignore`; added CI/CD functions deploy step. | E99 | 2026-06-09 |
| **E99 CLOSED** | E99 | 2026-06-09 |
| `E100 AI Intake Pipeline Diagnostics` — Added structured `console.info` breadcrumbs to `processUploadedImage` and `extractIntakeData` CFs. Logs capture: entry params, buffer size, Gemini model selection (Flash/Pro), raw response length, JSON parse result, and Firestore write confirmation. Enables root-cause diagnosis of AI intake failures via Firebase Cloud Logging. | E100 | 2026-06-09 |
| **E100 CLOSED** | E100 | 2026-06-09 |
| `E101 Gemini Model Inspector` — Created `scripts/list-gemini-models.mjs`: reads `GEMINI_API_KEY` from `functions/.env`, queries the Gemini REST API (`/v1beta/models`), and outputs an annotated console table cross-referencing `docs/AI_MODELS.md` categories (Stable GA / Preview / Deprecated / Unknown). Zero new dependencies. Setup instructions printed when key is missing. Decision 0009 logged. | E101 | 2026-06-09 |
| **E101 CLOSED** | E101 | 2026-06-09 |
| `E102 Vertical Hero Sections` — Upgraded all three vertical heroes to design spec: PawnHero ≥80vh, CinematicHero 100vh self-contained, FireworksHero extracted from page. Added `HeroMedia` types, `useHeroMedia` hook, `ImageCarousel`, `YouTubeFacade` shared components. Schema + decision 0010 logged. | E102 | 2026-06-09 |
| **E102 CLOSED** | E102 | 2026-06-09 |
| `E103 Fireworks Hero Video` — Wired default YouTube video `8rmpm3ZOn50` into `FireworksHero.tsx` with Firestore override/suppress capability. Restructured layout: video outside narrow content column, 900px max-width, 16:9 responsive. Decision 0011 logged. | E103 | 2026-06-09 |
| **E103 CLOSED** | E103 | 2026-06-09 |
| `E104 AI Function Resilience` — Extracted `callWithFallback` helper in `functions/operations/src/ai.ts`. Replaced broken 429/503-only fallback in `generateAIDescription`, `suggestAiPrice`, `generateDescriptionForItem`, and `suggestPriceForItem` with catch-all cascade. Fixed `auditLogs` model tracking to record actual model used. Decision 0012 logged. | E104 | 2026-06-09 |
| **E104 CLOSED** | E104 | 2026-06-09 |
| `E105 Admin Nav Refactor` — Replaced 54px icon-only sidebar with 210px labeled accordion sidebar. Removed redundant Intake nav entry. Collapsible groups: Operations/Customer/People open by default; Content/Config/Support collapsed. Default height ~720px — fits comfortably on 1080p. All 5 hardcoded hex values and 3 font/spacing violations replaced with design tokens. Decision 0013 logged. Portal user guide updated. | E105 | 2026-06-09 |
| **E105 CLOSED** | E105 | 2026-06-09 |
| `E106 Pawn Loan Lifecycle Gap Remediation` — Closed 6 gaps in E31 compliance: (1) Created `IssueLoanModal` + "Issue Loan" button in `PawnInbox` to unblock loan issuance; (2) Routed all `pawnRequests` status writes through new `updatePawnRequestStatus` CF; (3) Added 7 `auditLogs.eventType` values to schema; (4) `redeemLoanTicket` now persists `redemptionAmount`; (5) Auto-forfeit scheduler transitions linked item to `active`; (6) Extension decline documented (`active` is correct post-decline state). Decision 0014 logged. | E106 | 2026-06-09 |
| **E106 CLOSED** | E106 | 2026-06-09 |
| `FIX_SEED_ITEM_VISIBILITY` — Admin inventory query had `limit(50)` hiding 36 fake seed items (added 2026-05-18) from admin view while they remained visible on public storefront pages. Raised limit to 500. Created `scripts/find-seed-items.mjs` fingerprint script — identified all 36 seed items by picsum.photos image, template description, and seed title. Decision 0015 logged. | BUGFIX | 2026-06-10 |
| **FIX_SEED_ITEM_VISIBILITY CLOSED** | BUGFIX | 2026-06-10 |
| `FIX_LOANS_PERMISSIONS` — `useAllLoanTickets` had no `enabled` guard; TanStack Query fired before Firebase confirmed staff custom claims, causing Firestore `isStaff()` to evaluate false → `PERMISSION_DENIED` on `/admin/loans/`. Added `enabled: !!user?.isStaff`. Decision 0016 logged. | BUGFIX | 2026-06-10 |
| **FIX_LOANS_PERMISSIONS CLOSED** | BUGFIX | 2026-06-10 |
| `FIX_INVENTORY_BULK_CRUD` — Inventory table batch action bar had no CRUD buttons despite full row-selection support. Added `onBulkDelete`/`onBulkRestore` props, `handleBulkCrud` callback, and Delete/Restore buttons. `showRestoreAction` gates which button shows based on `statusFilter`. Decision 0017 logged. | BUGFIX | 2026-06-10 |
| **FIX_INVENTORY_BULK_CRUD CLOSED** | BUGFIX | 2026-06-10 |
| `E73 Architecture Modernization — Quick Wins` — Converted 3 dynamic imports to static (eliminating all `INEFFECTIVE_DYNAMIC_IMPORT` warnings); added `manualChunks` to `vite.config.ts` (main bundle 1,019 kB → 43.69 kB, 96% reduction); added Firestore `withConverter` to `useItems.ts`. Strategy C (`react-hook-form`) logged to backlog. Decision 0018 logged. | E73 | 2026-06-10 |
| **E73 Quick Wins CLOSED** | E73 | 2026-06-10 |

---

## Deferred / Blocked

| Item | Reason | Target cycle |
|---|---|---|
| MFA bypass confirmed impossible | Requires Identity Platform upgrade — pre-prod compliance gate | Before prod deploy (E11) |
| eBay developer account setup (webhook URL registration, notification subscription) | Requires eBay seller account and developer credentials — outside codebase scope | Before E06 deploys to prod |
| Admin axe-core tests (dashboard, inventory, preorders, campaigns) | Require `PLAYWRIGHT_AUTH_EMAIL` + `PLAYWRIGHT_AUTH_PASSWORD` env vars — skipped in CI | When auth vars available |
| Performance ≥0.90 on Lighthouse | Requires SSR or pre-rendering — current SPA + static hosting cannot reach ≥0.90 on simulated 4G | Backlogged (E37 SSR cycle) |
| Vertical video on Cannabis + Fireworks pages | Content dependency — no video assets available | When assets supplied |
| `config/shopInfo` document creation | Requires admin to create via Firebase console (`foundedYear: <year>`) — no admin UI in E17 | Before E17 deploys to dev |

---

## Open Decisions Needed

| Question | Context | Urgency |
|---|---|---|
| Legal counsel on cannabis/fireworks regulation | Required before E11 features ship to prod | Before prod deploy |

---





---

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-06-10 (Cycle 32 — E73 Quick Wins CLOSED)*
