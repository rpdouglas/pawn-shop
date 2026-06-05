# E62 User Role Management Plan

## Strategy A: Minimal Integration
- **Implementation**: Append a basic `<select>` dropdown inside the existing `TierControls.tsx` component on the CRM page. 
- **Pros**: Fastest to implement.
- **Cons**: Mixes VIP management logic with Core Auth Role logic.

## Strategy B: Dedicated Component (Recommended)
- **Implementation**: Create a new, distinct `RoleControls.tsx` component. Place it on the `CustomerDetailPage.tsx` sidebar below `TierControls`. Only render it if the current logged-in user is an Admin. It will call the existing `assignRole` Firebase Cloud Function.
- **Pros**: Clean separation of concerns; visually distinct for high-privilege actions.
- **Cons**: Slightly more component boilerplate.

## Strategy C: Robust Audit Visibility
- **Implementation**: Do Strategy B, but also fetch and display the `auditLogs` for 'role_change' events on the customer profile so the Admin can see exactly *who* promoted them and *when*.
- **Pros**: Maximum transparency and compliance.
- **Cons**: Requires additional Firestore queries and UI rendering for audit trails.

### Compliance Checklist (All Strategies)
- **Persona:** Kevin (Admin) needs secure access control.
- **Security Rules:** `assignRole` callable already enforces `admin` claim securely on the backend.
- **Schema Audit:** No new Firestore fields required. Relying on existing `role` field on `users` collection.
