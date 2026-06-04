# Project E64: Customer Profile & Admin Customers View

**Status:** Closed
**Epic:** E64
**Primary Persona:** Makoonsii, Staff

## Objective
Provide a unified `/profile` page for authenticated users to view their account information and activity history (reservations, preorders, pawn requests). Additionally, rename the Admin 'CRM' terminology to 'Customers' across the platform to make it more intuitive, and expose it in the mobile admin navigation.

## Requirements
- Create `ProfilePage.tsx` and map it to `/profile` in `main.tsx`.
- The profile page must show Account Info + Activity History.
- Rename 'CRM' to 'Customers' in `AdminSidebar.tsx`.
- Add 'Customers' to `AdminMobileNav.tsx`.
- Update the relevant route from `/admin/crm` to `/admin/customers` to match the new naming (optional based on strategy).
