# Staff Management

Managing your team's access and permissions is critical for maintaining the security and integrity of the platform.

## Assigning Roles

Access to the staff management tools is restricted to **Admins**.
- **Role Hierarchy:**
  - **Admin:** Full system access, including staff management and serial blacklisting.
  - **Manager:** High-level access for scheduling, inventory management, and enquiry handling.
  - **Inventory Staff:** Access to intake forms and item status updates.
  - **Marketing Staff:** Access to staff picks and editorial content management.
  - **Customer:** Default role assigned to users upon first login. Restricted to public storefronts and personal account features; no admin access.

## Updating Permissions

1. Navigate to `/admin/staff`.
2. Locate the staff member in the list.
3. Use the **Role** dropdown to select the new assignment.
4. The change is immediate and is enforced via Firebase Custom Claims.

## MFA Verification

The staff list displays the MFA (Multi-Factor Authentication) enrollment status for every team member.
- **Strongly Recommended:** All staff members should enroll in TOTP (Time-based One-Time Password) MFA. Full enforcement at the platform level is on the roadmap pending an Identity Platform upgrade.
- **Compliance:** Once enforcement is active, Marie's Discretion Test requires that no staff account without MFA can access cannabis purchase history. Admins should proactively track enrollment status and encourage all team members to enroll now.

---
*Primary Persona: Admin*
