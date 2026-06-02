# Docs Audit Report

## 1. Route to Document Mapping Drift
The following routes defined in `src/main.tsx` lack corresponding documentation in the VitePress `/user-guide/`:
- **Verticals & Storefronts:**
  - `/cannabis` & `/cannabis/collections/:mood` (Age Gate 19)
  - `/fireworks` & `/fireworks/collections/bundles` (Age Gate 18)
  - `/tobacco` (Age Gate 19)
- **Customer Auth & Profile:**
  - `/login`, `/signup`, `/auth/mfa-enroll`
  - `/favourites`
- **Customer Support & Legal:**
  - `/contact`, `/accessibility`, `/privacy`, `/terms`
  - `/faq` (Customer view missing; Admin FAQ management is documented)
- **Content & SEO:**
  - `/articles/:slug` (Customer view missing; Admin CMS is documented)
  - `/local/:location` (Customer view missing; Local SEO admin is documented)

## 2. Role Definition Drift
The `functions/src/auth.ts` defines the following valid roles: `admin`, `manager`, `inventory_staff`, `marketing_staff`, `customer`.
- **Drift:** The `/user-guide/admin/staff-management.md` documentation covers the staff roles (`admin`, `manager`, `inventory_staff`, `marketing_staff`) but completely omits the `customer` role and how/when it is assigned (e.g. upon first login via `recordLogin`).

## 3. VitePress Configuration Gaps (`.vitepress/config.ts`)
Several documentation files exist in the `/user-guide/admin/` repository but are missing from the VitePress navigation configuration, making them inaccessible in the built user guide:
- `admin/branding.md`
- `admin/portal.md`
- `admin/reservations.md`
- `admin/store-hours.md`

## 4. Core Workflows Analysis
- **Inventory Lifecycle (`inventory/lifecycle.md`):** Generally accurate and covers Draft, Active, Reserved, Sold, Archived statuses and Police Hold overrides.
- **Pre-orders (`admin/preorders.md`):** Documents the seasonal item flow well, including SLA/Persona requirements.
- **Reservations (`admin/reservations.md`):** Accurately details the 48-hour Click & Collect hold system but is currently orphaned (missing from VitePress sidebar).

## 5. Suggested Updates
1. **Update VitePress Config:** Add `branding.md`, `portal.md`, `reservations.md`, and `store-hours.md` to `.vitepress/config.ts` under their respective sections.
2. **Document Storefronts:** Create overview guides for the Cannabis, Fireworks, and Tobacco verticals (including their specific age-gate mechanics).
3. **Document Customer Features:** Create documentation for customer-facing auth (MFA enrollment), favourites, FAQs, and articles.
4. **Update Staff Management:** Add clarification regarding the default `customer` role to `staff-management.md`.
