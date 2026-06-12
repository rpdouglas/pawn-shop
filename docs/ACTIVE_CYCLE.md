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

E107 + E109 + E110 · POS Loan Issuance & Compliance — Digital signature flow, walk-in intake, interest rate compliance, and full pawn ticket legal compliance all complete. APR disclosure, agreed item value, sole-recourse terms, police hold clause, age declaration, and structured intake fields in place. (COMPLETED)

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
| `FIX_FIREBASE_INIT_ORDER` — E73's static import conversion broke ES module evaluation order: `firebase.ts` called `getApp()` before `firebase-core.ts` ran `initializeApp()`, crashing the entire app on load. Fix: replaced `getApp()` with `import { app } from './firebase-core'` to encode the dependency in the module graph. Decision 0019 logged. | BUGFIX | 2026-06-10 |
| **FIX_FIREBASE_INIT_ORDER CLOSED** | BUGFIX | 2026-06-10 |
| `E107 Pawn Ticket Generation & Digital Signature` — Three-step modal (Terms → Sign → Done+Print) in `IssueLoanModal`; `signature_pad` v5 canvas for stylus/finger capture on Android POS tablet with devicePixelRatio scaling; `signPawnAgreement` CF uploads PNG to Firebase Storage; `createLoanTicket` CF now generates `ticketNumber`; `PrintableTicket` portal-rendered with `@media print` CSS; Signed/Unsigned badge + Print button in `LoanTicketsAdminPage`; `storage.rules` updated for `tickets/` path. Decisions 0020 + 0021 logged. | E107 | 2026-06-10 |
| **E107 CLOSED** | E107 | 2026-06-10 |
| `E109 Walk-in Pawn Intake` — Closed the walk-in POS gap: "New Walk-in Pawn" button in PawnInbox opens `WalkInPawnModal` (name, item, serial, phone, email); new `createWalkInPawnRequest` CF creates `pawnRequest` with `status: 'quoted'` + `source: 'walk_in'`; serial blacklist check runs identically to online path; on success `IssueLoanModal` opens immediately for full sign + print flow. `source` field added to `pawnRequests` schema. Walk-in badge in PawnInbox table. Decision 0022 logged. | E109 | 2026-06-10 |
| **E109 CLOSED** | E109 | 2026-06-10 |
| `FIX_PAWN_LOAN_DEFAULTS` — (1) Removed hardcoded 5%/period default (≈60% APR — above legal cap); replaced with dynamic `calcMaxRatePct` that converts the applicable APR cap (48% for <$1K, 35% for ≥$1K) to a per-period rate using amount and term. Rate auto-populates in onChange handlers; submit-time validation blocks overages. (2) Fixed blank-page print bug: moved `window.print()` from `setTimeout(fn, 0)` into `useEffect` in `PrintableTicket.tsx`. Decision 0023 logged. | BUGFIX | 2026-06-10 |
| **FIX_PAWN_LOAN_DEFAULTS CLOSED** | BUGFIX | 2026-06-10 |
| `FIX_PRINT_TICKET_VISIBILITY` — Printed pawn ticket showed browser native header/footer but no ticket content. Root cause: `index.css @media print` sets `body * { visibility: hidden }` for the QR label flow; `print.css` restored `display: block` but never restored `visibility: visible` on `.print-ticket` and its children. Added `.print-ticket, .print-ticket * { visibility: visible; }` to `print.css`. One line, zero regressions. | BUGFIX | 2026-06-10 |
| **FIX_PRINT_TICKET_VISIBILITY CLOSED** | BUGFIX | 2026-06-10 |
| `FIX_PRINT_TICKET_PDF` — After the visibility fix, printing to PDF still produced a blank page. Root cause: `Modal.tsx` sets `document.body.style.overflow = 'hidden'` inline (scroll-lock); the PDF engine respects this overflow clip on body, hiding the `.print-ticket` portal. Added `html, body { height: auto !important; overflow: visible !important; }` to `@media print` in `print.css` — `!important` overrides the inline style. Decision 0024 logged. | BUGFIX | 2026-06-10 |
| **FIX_PRINT_TICKET_PDF CLOSED** | BUGFIX | 2026-06-10 |
| `E110 Pawn Compliance — Intake Forms & Printed Ticket` — Closed all 10 compliance gaps from the gap analysis. APR disclosure on ticket (SOR/2024-114); agreed item value (25 CFR §141.35); sole-recourse + police hold + age/ownership declaration in ticket terms; structured item details at intake (category, make/model, colour, condition, notableMarkings) in both walk-in and online forms; ID type + verified checkboxes at issuance and walk-in intake; `createLoanTicket` CF hardened (removed `?? 0.05` default, now throws on missing rate), copies structured fields + serial to loanTickets, records `issuedByDisplayName`, returns server-side dueDate; reprint path passes all fields through. 15 files updated. Build ✅ Lint ✅ Tests 29/29 ✅ CF tsc ✅. Decisions 0025 logged. | E110 | 2026-06-10 |
| **E110 CLOSED** | E110 | 2026-06-10 |
| `FIX_PRINT_TICKET_BUGS` — (1) Invalid Date: `result.dueDate` absent on pre-E110 CF builds; `new Date(undefined)` → `"Invalid Date"`. Fixed with `result.dueDate ? new Date(result.dueDate) : client-side-fallback`. (2) Blank signature: `window.print()` fired before browser fetched remote Storage URL. Fixed by preloading via hidden `Image()` and calling `window.print()` only in `img.onload`. Decision 0026 logged. | BUGFIX | 2026-06-10 |
| **FIX_PRINT_TICKET_BUGS CLOSED** | BUGFIX | 2026-06-10 |
| `E111 Pawn Ticket Two-Page Layout + Logo` — Printed ticket is now a two-page branded document: shop logo in page 1 header; `break-before: page` forces Terms & Conditions onto page 2; "Page 2 of 2" copy-header labels the second page. 2 files, ~8 lines CSS + JSX. Decision 0027 logged. | E111 | 2026-06-10 |
| **E111 CLOSED** | E111 | 2026-06-10 |
| `FIX_PRINT_TICKET_E111` — Diagnosed and fixed E111 regression: logo appeared blank in print preview because `window.print()` fired after the signature preload (cached) but before the logo fetch completed. Replaced single-image preload with `Promise.all([signature, logo]).then(() => window.print())` dual preload. Promoted `@page` rule to top-level CSS (outside `@media print`) to comply with CSS spec and ensure A4 sizing applies in all PDF engines. Decision 0028 logged. | BUGFIX | 2026-06-10 |
| **FIX_PRINT_TICKET_E111 CLOSED** | BUGFIX | 2026-06-10 |
| `FIX_PRINT_PAGE_BREAK` — Terms & Conditions still printed on page 1 despite E111's `break-before: page` CSS. Root cause: Blink's print fragmenter doesn't re-evaluate `break-before` on elements whose containing block transitions from `display:none` to `display:block` at print time. Fix: added explicit `<div class="print-page-break" />` sibling before `.print-ticket-agreement` with `break-after: page` in `@media print` — evaluated earlier in Blink's fragmentation pass. Decision 0029 logged. | BUGFIX | 2026-06-10 |
| **FIX_PRINT_PAGE_BREAK CLOSED** | BUGFIX | 2026-06-10 |
| `E112 Inventory UX: Grouping, Collapsible Sections & Grid Inline Edit` — Added `GroupBy` type and manual client-side group rendering (table mode) with collapsible headers, chevron animation, and workflow-ordered status/viewTag groups. New `InventoryCard.tsx` with inline-editable title/status/condition/price via existing CellEditors; 48px action buttons; AI drawer trigger; `QuantityAdjustControl`. `InventoryPage.tsx` gained `groupBy` dropdown, `collapsedGroups` state, and localStorage persistence for all four view-state keys (`viewMode`, `groupBy`, `statusFilter`, `collapsedGroups`). No new dependencies. Decision 0030 logged. | E112 | 2026-06-10 |
| **E112 CLOSED** | E112 | 2026-06-10 |
| `E113 Inventory Batch Action Bar Redesign` — Replaced the overcrowded centred oval pill (`position: fixed; bottom`) with a top-anchored sticky context banner (`position: sticky; top: 0`) placed between the toolbar and table. Two-zone layout: left = count badge + × dismiss; right = AI group (✨ Descriptions · $ Prices) | divider | CRUD group (Delete or Restore). `batchError` promoted from inline pill span to a full-width dismissible `role="alert"` band. All banner buttons `minHeight: 44px`. `color-mix()` primary tint on banner background. Decision 0031 logged. | E113 | 2026-06-10 |
| **E113 CLOSED** | E113 | 2026-06-10 |
| `E114 Pawn Loan Receipt Email` — Extended `signPawnAgreement` CF with best-effort HTML receipt email auto-sent after signing. `buildReceiptHtml` dark-luxury template (matches `buildDigestHtml` pattern). Email resolution chain: `uid → users/{uid}.email → pawnRequests/{id}.email → skip`. Idempotency guard via `receiptEmailSentAt`. `pawn_receipt_emailed` auditLog (no PII). `receiptEmailAddress` snapshot on ticket. try/catch ensures email failure never blocks loan signing. Decision 0033 logged. | E114 | 2026-06-11 |
| **E114 CLOSED** | E114 | 2026-06-11 |
| `E115 APR Override Warning` — Replaced hard-block on over-cap interest rates with inline yellow warning banner + mandatory confirmation checkbox in `IssueLoanModal`. Server-side `createLoanTicket` CF now mirrors APR cap constants and rejects over-cap rates unless `aprOverrideConfirmed: true` is passed; override written to `loanTickets/{id}.aprOverrideConfirmed`; `loan_rate_override` auditLog fires on override (no PII). `IssueLoanArgs` updated with `aprOverrideConfirmed?`. Decision 0034 logged. | E115 | 2026-06-11 |
| **E115 CLOSED** | E115 | 2026-06-11 |
| `E116 Pawn Intake & Ticket UX Improvements` — Eliminated duplicate ID entry in walk-in pawn flow by threading `idType`/`idVerified` from `WalkInPawnModal` through `PawnInbox.IssueLoanCtx` into `IssueLoanModal` (pre-filled via `key`-prop remount). Added live "Quote for Customer" panel in Step 1 showing borrow amount, interest, redemption total, due date, and APR. Enhanced `PrintableTicket` page 2 with plain-language default summary, specific extension instructions (visit in person, bring ticket + ID), and a footer action line with dynamic due date. No schema changes. 4 files. Build ✅ Lint ✅ Tests 29/29 ✅ CF tsc ✅. | E116 | 2026-06-11 |
| **E116 CLOSED** | E116 | 2026-06-11 |
| `E117 Inventory Photo Management` — Closed the photo management gap: ✕ delete and ★ set-cover controls on every uploaded photo thumbnail, on both desktop (`ImageUploadZone`) and mobile (`MobileIntakePage`). QR Desktop Bridge: "📱 Upload from Phone" button on desktop generates a QR code pointing to `/admin/item-photo/{itemId}` — staff scan with phone, take photo, desktop auto-updates via `onSnapshot`. Two new CFs: `removeItemImage` (Storage delete + `arrayRemove`) and `reorderItemImages` (URL-injection-safe full array write). `ItemPhotoPage` is the QR destination: `ProtectedRoute staffOnly`, `extractData=false`. 6 files + route. Build ✅ Lint ✅ Tests 29/29 ✅ CF tsc ✅. Decision 0035 logged. | E117 | 2026-06-12 |
| **E117 CLOSED** | E117 | 2026-06-12 |
| `E119 Edit Item Page` — Replaced the 3-step wizard edit flow with a dedicated single-page edit route (`/admin/item/:id/edit`). New `EditItemPage.tsx` with photos section (★ cover, × delete, + Add Photo via existing CFs), all item fields, condition as `<select>` dropdown, conditional cannabis/fireworks profiles, and a "Save Changes" action. `InventoryCard.tsx` "Full Edit" link updated. `extractData: false` on all edit-mode uploads. No new schema fields, no new CFs. Build ✅ Lint ✅ Tests 29/29 ✅ CF tsc ✅. Decision 0036 logged. | E119 | 2026-06-12 |
| **E119 CLOSED** | E119 | 2026-06-12 |

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

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-06-12 (Cycle 33 — E119 CLOSED)*
