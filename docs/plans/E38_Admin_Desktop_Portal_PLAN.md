# Admin Desktop Portal — Design Approach Report

**Request:** Keep mobile admin experience unchanged. Add a robust desktop admin portal inspired by `docs/reports/pawn_shop_option_b_full.html`. Report only — no changes yet.

---

## Current State Summary

**Layout chain for all admin routes today:**
```
main.tsx → <App /> → ViewLayout → GlobalHeader (64px sticky, hamburger)
                                → <Outlet /> (admin page content, maxWidth 1280px, centered)
```

**18 admin pages** exist under `path: 'admin'` in `main.tsx` with no shared layout wrapper — each page is a sibling route that inherits GlobalHeader from the parent `App`. The admin route group has no `element` prop today.

**Mobile:** GlobalHeader + NavigationDrawer (hamburger slide-in). Works well. Must remain unchanged.

**Reference design (Option B HTML):** Slim topbar (38px, brand left + user/role right) + narrow icon sidebar (54px, icon + 8px label, gold active state) + main content area. 7 nav groups. Uses the project's CSS variable token system throughout.

---

## What All Three Approaches Share

- **Zero changes to individual admin pages** — the 18 existing page files are untouched in all approaches.
- **Mobile experience unchanged** — GlobalHeader + hamburger drawer continues on `< 1024px`.
- **Token-only styling** — `var(--color-*)`, `var(--space-*)`, `var(--text-*)`, `var(--motion-*)` throughout. No hardcoded hex, px, or rem.
- **Icon library** — Option B uses Tabler Icons (`ti ti-*`). If not already loaded, all approaches would add it.
- **Nav grouping** — 18 admin routes collapse into 5 logical sidebar groups (see below).

**Proposed sidebar grouping for all approaches:**

| Group | Icon | Label | Route |
|---|---|---|---|
| **Operations** | `ti-layout-dashboard` | Overview | `/admin/dashboard` |
| | `ti-tag` | Inventory | `/admin/inventory` |
| | `ti-circle-plus` | Intake | `/admin/intake` |
| *(divider)* | | | |
| **Customer** | `ti-inbox` | Pawn Inbox | `/admin/pawn-inbox` |
| | `ti-calendar-check` | Reservations | `/admin/reservations` |
| | `ti-package` | Preorders | `/admin/preorders` |
| | `ti-alert-triangle` | Disputes | `/admin/disputes` |
| *(divider)* | | | |
| **People** | `ti-users` | Staff | `/admin/staff` |
| | `ti-calendar` | Scheduling | `/admin/scheduling` |
| | `ti-chart-bar` | CRM | `/admin/crm` |
| *(divider)* | | | |
| **Content** | `ti-star` | Staff Picks | `/admin/staff-picks` |
| | `ti-speakerphone` | Campaigns | `/admin/campaigns` |
| | `ti-file-text` | Articles | `/admin/articles` |
| | `ti-help-circle` | FAQs | `/admin/faqs` |
| *(spacer + divider)* | | | |
| **Config** | `ti-clock` | Store Hours | `/admin/store-hours` |
| | `ti-shield-off` | Blacklist | `/admin/serial-blacklist` |

---

## Approach A — React Router Nested Layout

**The cleanest structural approach.**

### What it does
Adds an `element` prop to the existing `path: 'admin'` route group in `main.tsx`. This element is a new `AdminLayout` component that acts as a conditional shell:

- **Desktop (≥ 1024px):** `AdminLayout` renders its own admin-specific structure: a slim topbar (brand + user/role, matches Option B) + icon sidebar (54px, groups as above) + `<Outlet />` in the main content area. The GlobalHeader from `App` is suppressed via a context flag (`AdminShellContext`) that `GlobalHeader` reads to hide itself on desktop admin.
- **Mobile (< 1024px):** `AdminLayout` renders `<Outlet />` only — GlobalHeader from `App` continues to operate as-is.

### Files
| Action | File |
|---|---|
| **Create** | `src/components/layout/AdminLayout.tsx` |
| **Create** | `src/components/layout/AdminSidebar.tsx` |
| **Create** | `src/components/layout/AdminTopbar.tsx` |
| **Modify** | `src/main.tsx` — add `element: <AdminLayout />` to the `path: 'admin'` route group |
| **Modify** | `src/components/layout/GlobalHeader.tsx` — read context flag to hide on admin+desktop |
| **Modify** | `src/index.css` — add `@media (min-width: 1024px)` admin shell token overrides |

### How it looks
```
Desktop admin (≥ 1024px):
┌──────────────────────────────────────────────────┐
│ topbar: "The Pawn Shop"    rpdouglas@gmail.com  ▲ │  ← AdminTopbar.tsx (38px)
├────┬─────────────────────────────────────────────┤
│ 54 │                                             │
│ px │   Page content (<Outlet />)                 │
│    │   max-width 1280px, padded                  │
│ sb │                                             │
│    │                                             │
└────┴─────────────────────────────────────────────┘

Mobile (< 1024px):
┌──────────────────────────────────────────────────┐
│ ☰  The Pawn Shop - Dashboard    [🔔] [👤]        │  ← GlobalHeader (unchanged)
├──────────────────────────────────────────────────┤
│   Page content (<Outlet />, full width)          │
└──────────────────────────────────────────────────┘
```

### Pros
- Architecturally correct — the router controls which layout is active.
- Zero changes to individual admin pages.
- Single source of truth for admin shell styles.
- Direct match to how Option B is structured (topbar + sidebar + content).
- `AdminLayout.tsx` is fully testable in isolation.

### Cons
- Requires a mechanism to suppress GlobalHeader on desktop (context flag is clean but is a coupling between two layout components).
- 5–6 files to create/modify (most work of the three approaches, but contained).
- GlobalHeader modification is the only cross-cutting change.

### Complexity
**Medium.** ~300 lines of new code, 1 context modification, clean router integration.

---

## Approach B — Progressive Enhancement: Fixed Admin Rail

**The least invasive approach — zero router changes.**

### What it does
Injects a single new `AdminDesktopRail` component into the existing `App.tsx`. The component:
- Uses `useLocation()` to detect when the current route is under `/admin`.
- On desktop (≥ 1024px) and on admin routes: renders a fixed-position icon rail (`position: fixed; left: 0; top: 64px; bottom: 0; width: 54px`).
- Adds a CSS class `admin-rail-open` to `document.body` when the rail is active, which applies `padding-left: 54px` to admin page content via CSS.
- On mobile or non-admin routes: renders `null`. Zero impact.
- GlobalHeader remains completely unchanged on all breakpoints.

### Files
| Action | File |
|---|---|
| **Create** | `src/components/layout/AdminDesktopRail.tsx` |
| **Modify** | `src/App.tsx` — add `<AdminDesktopRail />` alongside the existing `<Outlet />` |
| **Modify** | `src/index.css` — add `.admin-rail-open` padding rule + `@media (min-width: 1024px)` rail styles |

### How it looks
```
Desktop admin (≥ 1024px):
┌──────────────────────────────────────────────────┐
│ ☰  The Pawn Shop - Dashboard    [🔔] [👤]        │  ← GlobalHeader (unchanged, 64px)
├────┬─────────────────────────────────────────────┤
│ 54 │                                             │
│ px │   Page content (padded left 54px)           │
│    │   max-width 1280px continues to work        │
│rail│                                             │
└────┴─────────────────────────────────────────────┘

Mobile (< 1024px):
┌──────────────────────────────────────────────────┐
│ ☰  The Pawn Shop - Dashboard    [🔔] [👤]        │  ← GlobalHeader (unchanged)
├──────────────────────────────────────────────────┤
│   Page content (full width, rail hidden)         │
└──────────────────────────────────────────────────┘
```

### Pros
- Smallest change surface — 1 new component, 1 line in `App.tsx`.
- No router restructuring.
- No changes to GlobalHeader, ViewLayout, or individual admin pages.
- Trivially reversible.
- Works immediately for all 18 admin pages without any per-page changes.

### Cons
- GlobalHeader stays on desktop — Option B's slim dedicated topbar (brand + user role tag) is not achievable. The rail sits *below* the 64px header, reducing visible content area slightly.
- No dedicated topbar — the user/role indicator from Option B is missing.
- Desktop experience is "enhanced" rather than truly admin-class; the GlobalHeader hamburger remains visible on desktop (non-functional in admin context).

### Complexity
**Low.** ~150 lines of new code, minimal touch points. Achievable in a single cycle.

---

## Approach C — Collapsible Admin Shell (Full Desktop Portal)

**The most capable approach — closest to a professional admin product.**

### What it does
Same router integration as Approach A (AdminLayout wraps the admin route group), but the sidebar is **collapsible**: icon-only (54px) by default, expands to full-label width (220px) on click. A chevron toggle button sits at the bottom of the sidebar.

The expanded state is persisted in `localStorage` so the user's preference survives navigation. The desktop shell also includes:
- A **breadcrumb bar** beneath the topbar showing the current admin section (e.g., `Admin / Inventory`)
- A **notification badge** on inbox-type sidebar items (Pawn Inbox, Preorders, Disputes) driven by Firestore count queries
- A **role-aware nav** — `inventory_staff` cannot see Staff or CRM links (same role gates as the existing NavigationDrawer)
- CSS transition only for expand/collapse — `transition: width var(--motion-speed-base) var(--motion-easing)` — no JS animation library

### Files
| Action | File |
|---|---|
| **Create** | `src/components/layout/AdminLayout.tsx` |
| **Create** | `src/components/layout/AdminSidebar.tsx` (collapsible, badge counts, role-aware) |
| **Create** | `src/components/layout/AdminTopbar.tsx` |
| **Create** | `src/components/layout/AdminBreadcrumb.tsx` |
| **Create** | `src/hooks/useAdminSidebarCounts.ts` (Firestore count queries for badge numbers) |
| **Modify** | `src/main.tsx` — add `element: <AdminLayout />` to admin route group |
| **Modify** | `src/components/layout/GlobalHeader.tsx` — suppress on admin+desktop |
| **Modify** | `src/index.css` — admin shell token overrides, collapsed/expanded classes |

### How it looks
```
Desktop admin — sidebar expanded (≥ 1024px):
┌──────────────────────────────────────────────────────────┐
│ The Pawn Shop                     rpdouglas@gmail.com ▲  │  ← AdminTopbar.tsx
├───────────────┬──────────────────────────────────────────┤
│ 🏠  Overview  │ Admin / Inventory                        │  ← AdminBreadcrumb
│ 🏷  Inventory │                                          │
│ ➕  Intake    │   Page content (<Outlet />)               │
│               │                                          │
│ 📥  Pawn   ③  │                                          │
│ 📅  Reserv.   │                                          │
│  ‹ collapse   │                                          │
└───────────────┴──────────────────────────────────────────┘

Desktop admin — sidebar collapsed (54px icon-only):
┌──────────────────────────────────────────────────┐
│ The Pawn Shop            rpdouglas@gmail.com ▲   │
├────┬─────────────────────────────────────────────┤
│ 🏠 │  Page content                               │
│ 🏷 │                                             │
│ ➕ │                                             │
│ 📥③│                                             │
│  › │                                             │
└────┴─────────────────────────────────────────────┘
```

### Pros
- Best desktop UX — matches or exceeds professional admin portals (Linear, Vercel, Retool).
- Notification badges on inbox items are genuinely useful (Pawn Inbox has unread count, etc.).
- Role-aware nav prevents staff from seeing links they can't access.
- Collapsible state means the sidebar doesn't permanently eat horizontal real estate.
- Breadcrumb adds orientation for deep admin flows (e.g., `Admin / CRM / Customer Detail`).
- Still zero changes to 18 individual admin pages.

### Cons
- Most implementation work — 5 new files, 3 modified.
- `useAdminSidebarCounts` adds live Firestore listeners — small ongoing cost.
- Expanded sidebar (220px) reduces content width on smaller desktops (1024–1280px range).

### Complexity
**High.** ~600 lines of new code across 5 files. Multiple Firestore subscriptions. Plan as a full epic (E38).

---

## Comparison Matrix

| | Approach A | Approach B | Approach C |
|---|---|---|---|
| Router changes | Yes (add element) | None | Yes (add element) |
| Admin page changes | None | None | None |
| GlobalHeader untouched | No (hide on desktop) | **Yes** | No (hide on desktop) |
| Dedicated topbar | Yes | No | Yes |
| Sidebar type | Fixed icon-only | Fixed icon-only | **Collapsible** |
| Badge counts | No | No | **Yes** |
| Role-aware nav | Via existing ProtectedRoute | Via existing ProtectedRoute | **Explicit in sidebar** |
| Breadcrumb | No | No | **Yes** |
| Matches Option B | **Closely** | Partially | Exceeds it |
| New files | 3 | 1 | 5 |
| Implementation size | ~300 lines | ~150 lines | ~600 lines |
| Reversibility | Easy | **Trivial** | Easy |
| Desktop fidelity | High | Medium | **Highest** |

---

## Recommended Approach: A

**Approach A — React Router Nested Layout** is the recommendation.

**Why not B:** The GlobalHeader remaining on desktop means a 64px dead zone at the top and a hamburger that does nothing in admin context. The reference design's slim topbar (brand + user role) is specifically valuable — it tells staff at a glance who is logged in and in what role. That context is absent in Approach B.

**Why not C:** The collapsible sidebar, badge counts, and breadcrumb are genuinely better UX, but the complexity is 2× Approach A. Approach A gets the foundational shell right (router-level layout, topbar, icon sidebar, mobile/desktop split) at a fraction of the cost. Approach C is a natural **evolution** of Approach A — the collapsible sidebar and badge counts can be added in a follow-up cycle once the shell pattern is established.

**Why A:** Clean router integration, the correct architectural pattern, matches Option B closely with minimal coupling. Suppressing GlobalHeader via context is a 5-line change. The resulting code is maintainable and the shell is isolated to one place in the codebase.

### Approach A Implementation Sequence
1. Add `AdminShellContext` (prop: `isAdminDesktop: boolean`, default `false`)
2. `AdminLayout.tsx` — reads breakpoint, provides context, renders topbar + sidebar + outlet on desktop, outlet-only on mobile
3. `AdminSidebar.tsx` — 16 icon nav items in 5 groups, active route highlight, token-only styling
4. `AdminTopbar.tsx` — brand left, user email + role badge right (matches Option B topbar exactly)
5. `main.tsx` — add `element: <AdminLayout />` to the `path: 'admin'` route object
6. `GlobalHeader.tsx` — add `const { isAdminDesktop } = useAdminShell()` + `if (isAdminDesktop) return null`
7. `index.css` — admin desktop breakpoint styles using existing tokens

**Critical files to touch:**
- `src/main.tsx` — line 82 (`path: 'admin'` route group)
- `src/components/layout/GlobalHeader.tsx`
- `src/App.tsx` — wrap with `AdminShellContext.Provider`

**Zero changes to:**
- All 18 files under `src/pages/admin/`
- `NavigationDrawer.tsx`
- `ViewLayout.tsx`
- Any individual page component

### Verification
- Resize browser: confirm sidebar visible at ≥ 1024px, hidden at < 1024px
- Confirm GlobalHeader absent on desktop admin, present on mobile admin
- Confirm GlobalHeader fully functional on all non-admin routes at all breakpoints
- Navigate all 18 admin routes — confirm active sidebar item highlights correctly
- Confirm user role badge in topbar matches `user.role` from `AuthContext`
- Run axe-core — zero new violations (sidebar nav items need `aria-label`)

---

*The Pawn Shop · Cornwall Island, Akwesasne*
