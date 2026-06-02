# E54_ITEM_LANDING_PAGES_PLAN

## Phase 1 — Persona & Compliance Gate
- **Primary Personas:** Kevin (SMS alerts), Sandra (Shared links). Fast, direct access to specific inventory items.
- **Compliance Audit:** This is the most critical aspect. Because users are bypassing the storefronts (`/cannabis`, `/fireworks`) and landing directly on an item, we cannot rely on the parent route to age-gate them. The `/item/:id` route must dynamically intercept the user and throw up the `AgeGate` component if the fetched item's `viewTag` requires it. Furthermore, items with `policeHold == true` must never be rendered to the public.

## Phase 2 — Schema Audit
- **Collections Impacted:** None. We are purely adding a routing and presentation layer over the existing `items/{id}` documents.

## Phase 3 — Three-Strategy Proposal

### Strategy A: Dynamic Redirect to Modal (Minimal)
The `/item/:id` route is a dummy wrapper. It fetches the item, determines its `viewTag`, and immediately redirects the user to `/{viewTag}?itemId={id}`. We update the storefronts to read the URL parameter and automatically open the `ItemQuickView` modal over the grid.
* **Pros:** Reuses all existing UI.
* **Cons:** Terrible for SEO (no dedicated page). Messy URL state management. The user misses out on a premium full-page experience.

### Strategy B: Standalone SEO-Optimized Page (Recommended)
Create a new `ItemDetailPage.tsx` component mapped to `/item/:id`. This component fetches the item, dynamically wraps itself in the correct `ViewContext` and `AgeGate` (if required), and sets the `<title>` and `<meta name="description">` tags for SEO. It displays a premium, full-page layout using the same styling tokens as the quick view, but expanded for a desktop-class experience.
* **Pros:** Excellent SEO (crucial for organic growth). Clean URLs. Premium feel (meets the "Dapper" design mandate). Fully compliant.
* **Cons:** Requires building a new layout component.

### Strategy C: Shared Unified Wrapper
Like Strategy B, but we literally mount `ItemQuickView` full-screen. We just hide the "Close" button and the overlay backdrop.
* **Pros:** Less code duplication.
* **Cons:** `ItemQuickView` is heavily optimised as a portal/modal. Hacking it to act as a full page will lead to technical debt and compromises the "premium design" mandate.

**Recommendation:** Strategy B. Dedicated landing pages are a staple of premium e-commerce. It allows us to implement proper SEO best practices and ensures we can scale the page (e.g., adding "Related Items" grids at the bottom) without bloating the modal component.

## Phase 4 — Anti-Regression Protocol
- Ensure `useDocumentTitle` or similar is used to reset the title when navigating away.
- Verify that a direct visit to a cannabis item link triggers the session-scoped 19+ gate.
- Ensure the bundle size isn't impacted by eagerly loading this route (must use `lazy()`).
