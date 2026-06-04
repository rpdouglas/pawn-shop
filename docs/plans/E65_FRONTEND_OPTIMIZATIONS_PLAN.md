# Plan: E65_FRONTEND_OPTIMIZATIONS

## Persona Impact Statement
- **Makoonsii:** Will experience instantaneous page transitions when navigating the storefront due to predictive prefetching.
- **Staff:** Will have a more stable browser experience (no memory leaks) and guaranteed QA on role-specific views.

## Compliance Checklist
- **E2E Role Mocks:** Ensure Playwright mocks role claims securely without leaking production credentials.

## Schema Audit
No database schema changes required.

## Strategies

### Strategy A: Minimal
- Fix only the most egregious `useCallback` warnings.
- Implement prefetching manually on a few key links.

### Strategy B: Recommended
- Exhaustive audit of all Firestore hook dependencies.
- Create a reusable `<PrefetchLink>` wrapper component that hooks into React Router's data routers on hover.
- Add robust Playwright test files specifically for the `manager` and `inventory_staff` custom claims.

### Strategy C: Robust
- Strategy B + implement a global IntersectionObserver prefetcher that preloads links as they enter the viewport (discarded via /grill-me due to bandwidth concerns).
