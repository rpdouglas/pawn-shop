# Plan: E64_PROFILE_AND_CUSTOMERS

## Persona Impact Statement
- **Makoonsii:** Will now have a clear, centralized place to view her account info and past activity, improving trust and transparency.
- **Staff:** Will easily find customer profiles in the admin panel by looking for "Customers" instead of "CRM", and can access it on mobile.

## Compliance Checklist
- **PII Handling:** The profile page must securely fetch only the signed-in user's data. 
- **Role Guards:** Admin routes renamed to `/admin/customers` must retain the same role guards (Admin/Manager).

## Schema Audit
No new schema fields are strictly necessary, as `users/{uid}`, `pawnRequests`, `reservations`, and `preorders` already exist and contain the required data.

## Strategies

### Strategy A: Minimal
- Create `ProfilePage.tsx` with basic account info and a list of active reservations.
- Rename the label 'CRM' to 'Customers' in `AdminSidebar.tsx` and add a 4th tab to `AdminMobileNav.tsx`. Keep the underlying route as `/admin/crm`.

### Strategy B: Recommended
- Create a comprehensive `ProfilePage.tsx` with tabs for Account Info, Active Pawn Requests, Reservations, and Preorders.
- Rename 'CRM' to 'Customers' in `AdminSidebar.tsx` and `AdminMobileNav.tsx`.
- Refactor the underlying route from `/admin/crm` to `/admin/customers` and rename components like `CrmDashboardPage.tsx` to `CustomersDashboardPage.tsx` for codebase consistency.

### Strategy C: Robust
- Strategy B + implement edit functionality for account info (phone number, display name) on the `ProfilePage.tsx`.
- Add push notification settings on the profile page.
- Build a dedicated mobile-optimized view for the `CustomersDashboardPage`.
