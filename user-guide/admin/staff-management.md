# Staff Management

Managing your team's access and permissions is critical for maintaining the security and integrity of the platform.

## Assigning Roles

Access to the staff management tools is restricted to **Admins**.
- **Role Hierarchy:**
  - **Admin:** Full system access, including staff management and serial blacklisting.
  - **Manager:** High-level access for scheduling, inventory management, and enquiry handling.
  - **Inventory Staff:** Access to intake forms and item status updates.
  - **Marketing Staff:** Access to staff picks and editorial content management.

## Updating Permissions

1. Navigate to `/admin/staff`.
2. Locate the staff member in the list.
3. Use the **Role** dropdown to select the new assignment.
4. The change is immediate and is enforced via Firebase Custom Claims.

## MFA Verification

The staff list displays the MFA (Multi-Factor Authentication) enrollment status for every team member.
- **Mandatory:** All staff members MUST enroll in TOTP (Time-based One-Time Password) MFA to access customer-facing data or compliance-sensitive routes.
- **Compliance:** Marie's Discretion Test ensures that no staff account without MFA can access cannabis purchase history.

---
*Primary Persona: Admin*
