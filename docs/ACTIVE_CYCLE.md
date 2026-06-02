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
| — | — | — | — | — |

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

## Previous Cycle Summary

**Cycle 31** (2026-05-22) — Closed E43 · Image Upload Performance.

| Task | Epic | Completed |
|---|---|---|
| `package.json` — added `browser-image-compression` v2 | E43 | 2026-05-22 |
| `src/components/admin/ImageUploadZone.tsx` — client-side compression (max 1920px / 1 MB) before `uploadBytesResumable`; ~40× size reduction on camera photos | E43 | 2026-05-22 |
| `src/components/admin/ImageUploadZone.tsx` — optimistic preview via `URL.createObjectURL()` shown in <200 ms of file selection; blob revoked on CF completion and unmount | E43 | 2026-05-22 |
| `src/components/admin/ImageUploadZone.tsx` — auto-retry with exponential backoff (3 attempts: 500 ms / 1 s / 2 s); manual "tap to retry" CTA after exhaustion | E43 | 2026-05-22 |
| `src/index.css` — 4 new classes: `upload-optimistic-preview`, `upload-processing-label`, `upload-error-row`, `upload-retry-btn` (48px, `:focus-visible`, token-only) | E43 | 2026-05-22 |
| `docs/DECISIONS.md` — `browser-image-compression` dependency decision logged | E43 | 2026-05-22 |
| **E43 CLOSED** | E43 | 2026-05-22 |

---

**Cycle 30** (2026-05-22) — Closed E42 · Inventory Cost, Quantity & POS Integration.

| Task | Epic | Completed |
|---|---|---|
| `docs/firestore-schema.md` — added `quantity`, `posId`, `posSyncStatus`, `posLastSyncAt`, `internal/staff.cost`, `inventory_quantity_adjusted` auditLog eventType | E42 | 2026-05-22 |
| `docs/DECISIONS.md` — 4 new E42 entries: cost subcollection, quantity on parent, adjustInventory CF, receivePosWebhook stub | E42 | 2026-05-22 |
| `src/lib/types.ts` — added `PosSyncStatus`, `StaffInternalDoc`, `AdjustInventoryPayload`; extended `Item` with 4 new fields | E42 | 2026-05-22 |
| `src/hooks/useItems.ts` — `docToItem` maps `quantity`, `posId`, `posSyncStatus`, `posLastSyncAt` | E42 | 2026-05-22 |
| `functions/src/inventory.ts` — `adjustInventory` callable CF: staff auth, signed delta, `newQuantity >= 0` guard, audit log | E42 | 2026-05-22 |
| `functions/src/pos.ts` — `receivePosWebhook` HTTP CF: HMAC-SHA256 verification, stub processing, `posSyncStatus: 'pending'` write | E42 | 2026-05-22 |
| `functions/src/index.ts` — exported `receivePosWebhook` | E42 | 2026-05-22 |
| `src/components/admin/QuantityAdjustControl.tsx` — `−`/`+` buttons (48px), in-flight delta pattern, `aria-live` | E42 | 2026-05-22 |
| `src/components/admin/IntakeForm.tsx` — Cost + Initial Stock fields; `writeCostIfProvided` to `internal/staff` | E42 | 2026-05-22 |
| `src/pages/admin/MobileIntakePage.tsx` — Cost + Initial Stock in Step 2; review summary shows cost/quantity | E42 | 2026-05-22 |
| `src/pages/admin/InventoryPage.tsx` — `QuantityAdjustControl` in mobile cards and desktop Stock column | E42 | 2026-05-22 |
| **E42 CLOSED** | E42 | 2026-05-22 |

---

**Cycle 29** (2026-05-22) — Closed E41 · Mobile Staff Inventory.

| Task | Epic | Completed |
|---|---|---|
| `AdminMobileNav.tsx` — fixed bottom tab bar (Inventory / Add Item / Dashboard) for mobile admin (`< 1024px`) | E41 | 2026-05-22 |
| `AdminLayout.tsx` — renders `AdminMobileNav` on mobile with 64px bottom padding on `<Outlet />` | E41 | 2026-05-22 |
| `InventoryPage.tsx` — responsive card layout on mobile; table + `AiAssistantPanel` preserved on desktop; search input + status filter chips | E41 | 2026-05-22 |
| `ImageUploadZone.tsx` — camera-first mobile UI: dual hidden inputs (`capture="environment"` + gallery), 56px CTA | E41 | 2026-05-22 |
| `MobileIntakePage.tsx` — 3-step wizard: Step 1 Photo, Step 2 Details (title/view/category/description/price/condition), Step 3 Review + Publish | E41 | 2026-05-22 |
| `main.tsx` — `/admin/mobile-intake` route registered as lazy chunk | E41 | 2026-05-22 |
| QA fixes: filter chip touch target 36px → 44px; description field added (CF required); upload processing state replaces silent deletion | E41 | 2026-05-22 |
| `e2e/accessibility.spec.ts` — `/admin/mobile-intake` and `/admin/inventory` (E41) added to admin axe-core suite | E41 | 2026-05-22 |
| **E41 CLOSED** | E41 | 2026-05-22 |

---

**Cycle 28** (2026-05-21 → 2026-05-22) — UX Refinements.

| Task | Epic | Completed |
|---|---|---|
| `CannabisPage.tsx` — Reduce `.cannabis-collections` top padding to `var(--space-4)` | UX | 2026-05-21 |
| `FilterState` — Refactor `mood` to `moods[]` for multiselect, remove "All" pill | UX | 2026-05-21 |

---

**Cycle 27** (2026-05-21 → 2026-05-21) — Closed E40 · Cannabis Mobile Mood Pills.

| Task | Epic | Completed |
|---|---|---|
| `MoodPillStrip.tsx` — icon pills (All/Relax/Focus/Social/Ceremony), 48px targets, `aria-pressed`, token-only | E40 | 2026-05-21 |
| `CannabisPage.tsx` — `.mood-pills` / `.mood-cards` CSS toggle at 768px breakpoint | E40 | 2026-05-21 |
| `index.css` — 4 responsive rules + `.mood-pills button:focus-visible` a11y fix | E40 | 2026-05-21 |
| **E40 CLOSED** | E40 | 2026-05-21 |

---

**Cycle 26** (2026-05-21 → 2026-05-21) — Closed E39 · Cannabis Storefront Enhancement. Phase 3 (Discovery & Merchandising).

| Task | Epic | Completed |
|---|---|---|
| Filter panel: mood, category, price range slider, sort | E39 | 2026-05-21 |
| Layout toggle: grid2, grid3, list, magazine | E39 | 2026-05-21 |
| `TagBadge` component — `merchandisingTags` with cannabis palette tokens | E39 | 2026-05-21 |
| `LuxuryProductCard` — list/magazine variants, token fixes, `TagBadge` integration | E39 | 2026-05-21 |
| QA: token violations resolved (`--color-on-primary`, `--space-12`, `--space-24`, `--space-4`) | E39 | 2026-05-21 |
| **E39 CLOSED** | E39 | 2026-05-21 |

---

**Cycle 25** (2026-05-19 → 2026-05-21) — Closed Cycle 24 QA block + E26 · Versioning Strategy. Phase 8 complete.

| Task | Epic | Completed |
|---|---|---|
| Fix `HomePage.tsx` and `UserProfileCircle.tsx` token violations | Cycle 24 QA | 2026-05-20 |
| Fix `NavigationDrawer.tsx` contrast failure (`--color-primary` → `--color-text-muted`) | Cycle 24 QA | 2026-05-20 |
| Playwright axe-core scan — 4/4 public routes zero violations; `/tobacco` added to suite | Cycle 24 QA | 2026-05-21 |
| Fix User Guide nav link (`/user-guide/` → `https://rpdouglas.github.io/pawn-shop/`) | E23 | 2026-05-21 |
| Docs audit — 2 new files, 7 updated (Tobacco fourth view, MFA drift, branding palette terms) | Governance | 2026-05-21 |
| Initialize `docs/policies/` and `CULTURAL_LOG.md` | Governance | 2026-05-21 |
| `VITE_APP_VERSION` CalVer + SHA injected in both deploy workflows | E26 | 2026-05-21 |
| `src/vite-env.d.ts` created — `VITE_APP_VERSION` typed in `ImportMetaEnv` | E26 | 2026-05-21 |
| Version string displayed in site footer and Admin Dashboard subtitle | E26 | 2026-05-21 |
| **E26 CLOSED** | E26 | 2026-05-21 |

---

**Cycle 24** (2026-05-19 → 2026-05-19) — Closed E38 · Admin Desktop Portal. Phase 7 continued.

| Task | Epic | Completed |
|---|---|---|
| Admin Desktop Portal implemented (Approach A: Nested Router Layout) | E38 | 2026-05-19 |
| Core Portal Components: `AdminLayout`, `AdminSidebar`, `AdminTopbar` delivered | E38 | 2026-05-19 |
| Persistent desktop shell (≥ 1024px) for all staff roles | E38 | 2026-05-19 |
| Makoonsii 48px hit area fix for sidebar icons | E38 | 2026-05-19 |
| **E38 CLOSED** | E38 | 2026-05-19 |

---

**Cycle 23** (2026-05-19 → 2026-05-19) — Closed E25 · Header Navigation Refinement. Phase 8 continued.

| Task | Epic | Completed |
|---|---|---|
| Admin dashboard link moved from `UserNav` header to `NavigationDrawer` drawer (staff-gated) | E25 | 2026-05-19 |
| Page title updated to "The Pawn Shop - [View]" format on all non-home routes | E25 | 2026-05-19 |
| `NavigationDrawer.tsx` token violations resolved — `--text-lead`, `--motion-speed-base` | E25 | 2026-05-19 |
| **E25 CLOSED** | E25 | 2026-05-19 |

---

**Cycle 22** (2026-05-19 → 2026-05-19) — Closed E24 · CI/CD Pipeline Strategy. Phase 8 complete.

| Task | Epic | Completed |
|---|---|---|
| `firebase-core.ts` split — auth/functions eager, Firestore/Storage/Analytics lazy | Cycle 22 infra | 2026-05-19 |
| React Router v7 `lazy()` for all 35+ page routes — main bundle 437 KB (135 KB gzip) | Cycle 22 infra | 2026-05-19 |
| `UserProfileCircle` WCAG AA contrast fix — `--color-on-primary` token, cannabis view 5.4:1 | Cycle 22 a11y | 2026-05-19 |
| Playwright + `@axe-core/playwright` setup — `e2e/accessibility.spec.ts`, zero violations | Cycle 22 QA | 2026-05-19 |
| LHCI setup — `lighthouserc.json`, `npm run test:lhci`, performance warn ≥0.40 | Cycle 22 QA | 2026-05-19 |
| `TESTING.md` updated to v1.1 — bundle architecture checks, automated a11y, LHCI thresholds | Cycle 22 docs | 2026-05-19 |
| `DECISIONS.md` — 4 new Cycle 22 architectural entries logged | Cycle 22 docs | 2026-05-19 |
| E24 CI/CD — `dev`/`main` branch split, `deploy-prod.yml` routes to `nats-rack` temporarily | E24 | 2026-05-19 |
| **E24 CLOSED** | E24 | 2026-05-19 |

---

**Cycle 21** (2026-05-19 → 2026-05-19) — Closed E23 · Unified Global Header.

| Task | Epic | Completed |
|---|---|---|
| Unified `GlobalHeader` with Hamburger Menu | E23 | 2026-05-19 |
| Contextual page title in header | E23 | 2026-05-19 |
| `NavigationDrawer` with Home, Pawn, Cannabis, Fireworks, Tobacco links | E23 | 2026-05-19 |
| `UserProfileCircle` with dropdown (Sign In / Profile / Sign Out) | E23 | 2026-05-19 |
| Basic `HomePage` landing page (`/`) | E23 | 2026-05-19 |
| Role-gated Admin button in header | E23 | 2026-05-19 |
| **E23 CLOSED** | E23 | 2026-05-19 |

---

**Cycle 20** (2026-05-19 → 2026-05-19) — Closed E12 · Alerts & Notifications (remaining tasks).

| Task | Epic | Completed |
|---|---|---|
| `sendSeasonalReminders` CF — campaign-driven SMS batch, idempotency via `reminderSentAt` | E12 | 2026-05-19 |
| `sendPickupReminders` CF — 24h advance SMS for confirmed reservations + preorders | E12 | 2026-05-19 |
| `sendWeeklyDigest` CF — Monday HTML email, subject "The Pawn Shop Update", CASL-gated | E12 | 2026-05-19 |
| `dispatchEmail` SendGrid utility (`functions/src/lib/email.ts`) | E12 | 2026-05-19 |
| `CampaignAdminPage` — `reminderSentAt` read-only display | E12 | 2026-05-19 |
| **E12 CLOSED** | E12 | 2026-05-19 |

---

**Cycle 19** (2026-05-19 → 2026-05-19) — Closed E19 · Editorial CMS & Brand Narrative.

| Task | Epic | Completed |
|---|---|---|
| `articles/{id}` collection + schema | E19 | 2026-05-19 |
| Admin Article Editor + Review Gate | E19 | 2026-05-19 |
| `createArticle` & `publishArticle` Cloud Functions | E19 | 2026-05-19 |
| Dynamic Public Article routes (`/articles/:slug`) | E19 | 2026-05-19 |
| Home-view `ArticleSection` & `ArticleCard` components | E19 | 2026-05-19 |
| Local SEO landing pages (≥6) | E19 | 2026-05-19 |
| FAQ engine & Admin UI | E19 | 2026-05-19 |
| **E19 CLOSED** | E19 | 2026-05-19 |

---

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-05-22 (Cycle 31 open — E21)*
