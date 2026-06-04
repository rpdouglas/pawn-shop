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

E21 · Vitest Unit Testing — Install Vitest + React Testing Library, configure `vite.config.ts` and `src/setupTests.ts`, implement initial unit tests for core utilities and compliance logic.

---

## In Progress

| Task | Epic | Persona | Owner | Notes |
|---|---|---|---|---|
| `E72 Phase 4` Persona E2E Suites | E72 | All | Antigravity | Build Playwright tests for core personas |

---

## Completed This Cycle

| Task | Epic | Completed |
|---|---|---|
| Installed `vitest`, `jsdom`, `@testing-library/react` and configured `vite.config.ts` | E21 | 2026-05-22 |
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

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-05-22 (Cycle 31 open — E21)*
