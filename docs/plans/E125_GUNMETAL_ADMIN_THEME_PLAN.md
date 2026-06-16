# E125 — Gunmetal Club Admin Theme · Plan

**Reference design:** `docs/reports/GunmetalClubAdmin.jsx`
**Token spec:** `docs/reports/gunmetal-club-design-tokens.md`
**Status:** AWAITING APPROVAL

---

## Step 2 — State Read

### Current Admin Shell
- **Desktop:** `AdminLayout.tsx` renders a 210px `AdminSidebar` + `AdminTopbar` + `<Outlet>`. Topbar has a hardcoded `backgroundColor: '#1c1400'` — a token violation.
- **Mobile (<1024px):** `AdminLayout.tsx` renders `<Outlet>` + `AdminMobileNav`. The mobile nav is a 4-tab bottom bar using `var(--color-primary)` / `var(--color-text-muted)`. Height is 56px (missing the spec's 64px + safe-area).
- **InventoryCard.tsx:** Uses existing pawn tokens (`--color-surface`, `--color-border`). No stat strip, no section accent bar, no Georgia price / Courier SKU.
- **DashboardPage.tsx:** `StatCard` uses `--color-surface` + `--text-display` (48px) — too large per the GMC spec (22–36px display numbers).
- **Token system:** `index.css` defines pawn view tokens (`--color-bg: #080706`, `--color-surface: #1A1714`). The GMC system uses a slate base (`#2A2D35`) with three surface layers — no mapping exists today.

### What the GunmetalClubAdmin.jsx Reference Defines
1. **Top bar:** Sticky, `bgSurface` fill, gold vertical rule (3px×18px), "The Pawn Shop · Akwesasne" wordmark, live green dot + "LIVE" label, bell icon, avatar initials circle.
2. **Bottom nav:** 4 tabs (Inventory / Add Item / Customers / Dashboard), 64px, safe-area-aware, gold active icon + bold label.
3. **FAB:** 50px gold circle, positioned above nav at bottom-right, shows only on Inventory tab.
4. **Inventory view:** Horizontal stat strip (4 cells with dividers), search input with icon prefix, filter chip row (All / Active / Reserved / Draft), section accent bar (3px gold rule + uppercase label), item card list.
5. **Item card:** 52px thumbnail slot, `bgSurface` fill, title (Arial 13px bold), price (Georgia 14px gold bold), status + tag badges, EDIT/HOLD action buttons.
6. **Edit drawer:** Bottom sheet with drag handle, gold top border (2px), item title header, price/SKU inputs, status toggle chips, SAVE CHANGES / DELETE actions.
7. **Colours:** `#2A2D35` base / `#32363F` surface / `#3D4149` elevated / `#C8A14A` gold.
8. **Fonts:** Georgia (display/price), Arial (body/labels), Courier New (SKU/tokens).

---

## Step 3 — Persona Gate

| Persona | Test Applied |
|---|---|
| **Staff** | All interactive elements ≥44px touch target; operational labels visible at a glance |
| **Jordan** | Zero hardcoded hex or pixel font-sizes; approved motion patterns only (0.12–0.15s ease hover) |
| **Marcus** | Admin shell photography framing unaffected (item thumbnails preserved) |
| **Makoonsii** | Mobile bottom nav ≥44px tap targets; item card action buttons ≥44px |

---

## Step 4 — Schema Audit

No Firestore reads or writes change. This feature is purely presentational.

Collections touched (reads only, no change):
- `items/{id}` — title, price, status, viewTag, images, sku (existing fields)
- Dashboard stats — existing `getCountFromServer` queries unchanged

No new fields required. No schema update needed.

---

## Step 5 — Three-Strategy Proposal

---

### Strategy A — Scoped CSS Token Remap (Small · ~4 files)

**Architecture:**
Add an `.admin-mobile` wrapper class injected by `AdminLayout.tsx` on the mobile path. In `index.css`, add an `.admin-mobile` block that remaps the existing `--color-bg`, `--color-surface`, `--color-border` to GMC values. Add `--font-display` → Georgia, `--font-body` → Arial overrides. Remove the hardcoded hex from `AdminTopbar.tsx`. Update `AdminMobileNav` colour references.

**Files:**
- `src/index.css` — add `.admin-mobile { --color-bg: #2A2D35; --color-surface: #32363F; ... }`
- `src/components/layout/AdminLayout.tsx` — inject `.admin-mobile` class on mobile container
- `src/components/layout/AdminMobileNav.tsx` — token compliance only
- `src/components/layout/AdminTopbar.tsx` — remove `#1c1400` hardcode

**Persona Lens:** Palette shifts to GMC slate. All components auto-inherit via CSS cascade. No structural changes.

**Compliance:** Zero new hex hardcodes; existing token variables respected.

**Trade-offs:**
- ✅ Minimal risk — only CSS and two wrapper changes
- ✅ Existing components auto-inherit via cascade
- ❌ No structural improvements (no stat strip, no section accent bar, no FAB, no GMC card anatomy)
- ❌ CSS cascade conflicts possible — existing inline `style` props override CSS class rules
- ❌ Does not fulfil the user's intent of a "make over"

**Scope:** Small — 4 files

---

### Strategy B — Token Namespace + Structural Mobile UX Polish ✅ RECOMMENDED (Medium · ~9 files)

**Architecture:**
Create `src/styles/admin.css` with the full `--gmc-*` custom property namespace (imported in AdminLayout, never in the public app). Update each admin shell component to use `--gmc-*` tokens. Adopt the GMC structural patterns from the reference: horizontal stat strip on InventoryPage mobile, section accent bar, gold-border stat cards on Dashboard, and a rebuilt AdminMobileNav with 64px height + safe-area support. AdminTopbar gets the sticky GMC bar treatment (gold vertical rule, live dot, avatar).

**Files:**
1. `src/styles/admin.css` — new; full `--gmc-*` token definitions from the design doc
2. `src/components/layout/AdminLayout.tsx` — import `admin.css`; inject `gmc-admin` class on both mobile and desktop admin containers
3. `src/components/layout/AdminTopbar.tsx` — remove hardcoded hex; adopt GMC top bar (gold rule, wordmark, live dot, avatar)
4. `src/components/layout/AdminMobileNav.tsx` — GMC bottom nav: 64px, safe-area-inset, bold active label, gold active icon
5. `src/components/admin/InventoryCard.tsx` — GMC card anatomy: Georgia price, Courier SKU, status + tag badge strip, 44px action buttons
6. `src/pages/admin/InventoryPage.tsx` — mobile toolbar: horizontal stat strip + search with icon + filter chips + section accent bar
7. `src/pages/admin/DashboardPage.tsx` — GMC StatCard: 2×2 grid layout, Georgia number (22–36px), uppercase label, muted zero colour

**Persona Lens:**
- **Staff:** Cleaner scan hierarchy — stat strip gives inventory status at a glance; filter chips replace dropdown on mobile.
- **Jordan:** Zero token violations; approved hover transitions (0.15s ease) only.
- **Makoonsii/Staff:** All buttons ≥44px via explicit `minHeight: 44px`.

**Compliance:**
- All values via `var(--gmc-*)` — no raw hex in JSX
- GMC tokens live in a separate namespace; no collision with pawn view tokens
- No PII, no age gate changes, no Firestore field changes
- Motion: only `transition: all 0.15s ease` on hover states — within approved §4 patterns

**Anti-regression:**
- `--gmc-*` tokens are additive; existing pawn/cannabis/fireworks tokens unaffected
- `admin.css` only imported inside `AdminLayout` — never loaded on the public storefront
- Desktop sidebar and routing unchanged

**Trade-offs:**
- ✅ Achieves the full GMC visual language (palette + typography + structural patterns)
- ✅ Stays within the existing routing and data architecture
- ✅ Additive token namespace — zero collision with storefront tokens
- ⚠️ 9 files is medium scope — needs careful per-file token audit
- ❌ Does not rebuild the Edit Drawer (bottom sheet) — existing AiAssistantPanel / EditItemPage still used on mobile

**Scope:** Medium — 9 files

---

### Strategy C — Full Mobile Shell Extraction (Large · ~16 files)

**Architecture:**
Extract the mobile admin experience into a self-contained `AdminMobileShell.tsx` that implements the GunmetalClubAdmin.jsx architecture exactly: owns its own top bar, scrollable content region, 4-tab bottom nav, FAB, and edit drawer. Split current InventoryPage, DashboardPage, and CustomersDashboardPage into `Mobile*` variants that render inside the shell. Desktop remains the existing sidebar + page architecture, receiving the GMC palette from Strategy B.

**Additional files beyond Strategy B:**
- `src/components/layout/AdminMobileShell.tsx` — self-contained mobile shell
- `src/pages/admin/mobile/InventoryMobile.tsx` — mobile inventory with stat strip, search, filter chips, card list
- `src/pages/admin/mobile/DashboardMobile.tsx` — mobile dashboard with 2×2 stat grid, quick actions
- `src/pages/admin/mobile/CustomersMobile.tsx` — mobile customer list with avatar initials, flagged border
- `src/components/admin/GmcItemCard.tsx` — new card component matching GMC spec exactly
- `src/components/admin/GmcEditDrawer.tsx` — bottom sheet with drag handle, status chips, SAVE/DELETE

**Persona Lens:** Complete visual parity with `GunmetalClubAdmin.jsx`. Every structural pattern reproduced.

**Compliance:** Same as Strategy B.

**Trade-offs:**
- ✅ Full fidelity to reference design
- ✅ Mobile and desktop cleanly separated — no shared component compromise
- ❌ Large scope: ~16 files including new components and page splits
- ❌ Risk of duplicating or diverging from existing data hooks, Firestore listeners, image upload flows, and AI panel integrations
- ❌ Existing mobile flows (MobileIntakePage, ItemPhotoPage, QR bridge) reference AdminLayout; extracting the shell adds complexity

**Scope:** Large — ~16 files

---

## Step 6 — Anti-Regression Check (all strategies)

| Rule | Status |
|---|---|
| No hardcoded hex | ✅ All values via `var(--gmc-*)` |
| No invented Firestore fields | ✅ No schema changes |
| No AI API keys on client | ✅ Unaffected |
| No auto-scarcity tags | ✅ Unaffected |
| No PII in logs | ✅ Unaffected |
| Age gates at router level only | ✅ Unaffected — admin is `staffOnly`, not age-gated |
| No unapproved motion | ✅ Only `transition: all 0.15s ease` hover states |
| Cannabis WCAG contrast guardrail | ✅ Admin shell is not view-specific; no cannabis context |

---

## Step 7 — Recommendation

**Strategy B** is the recommended path. It delivers the full Gunmetal Club visual language (palette, typography, structural UX patterns) across both mobile and desktop admin surfaces while staying within the existing routing and data architecture. The risk surface is predictable and the token namespace approach makes it zero-collision with the storefront design system.

---

*The Pawn Shop · docs/plans/E125_GUNMETAL_ADMIN_THEME_PLAN.md · 2026-06-15*
