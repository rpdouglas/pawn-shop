# Plan: Employee Onboarding & SOP Management (E69)

## The Goal
Create a system to onboard new employees, store Standard Operating Procedures (SOPs) and contracts, and track employee acknowledgments (signatures) when documents are created or updated.

## Persona Impact Statement
- **Marie (Compliance):** Needs rock-solid audit trails. If a cannabis inspector asks "Did this employee read the updated age-gating SOP?", we need a timestamped, version-aware signature.
- **Admin/Manager:** Needs a frictionless way to invite staff and see who is delinquent on their required reading.
- **Staff:** Needs a clear, un-ignorable portal to read and acknowledge updates without getting confused.

## Schema Audit Impact
- New `invitations` collection for secure onboarding.
- New `documents` collection for SOPs and Contracts.
- New `signatures` subcollection under `users/{uid}/hrData`.

---

## Strategy A: Minimal (The Boolean Map)
- **Employee Creation:** Admins trigger a Cloud Function that creates the Firebase Auth user and sends a password reset email. 
- **Documents:** A flat `documents` collection.
- **Signatures:** Stored directly on the user's `hrData` profile as a simple map: `acknowledgments: { [docId]: timestamp }`.
- **Updates:** If an SOP is updated, the admin must manually trigger a script to clear that specific `docId` from everyone's profile.
- **Pros:** Very fast to build.
- **Cons:** Lacks true version control. Weak compliance audit trail.

## Strategy B: Robust (Versioned Documents & Invite Flow) **[RECOMMENDED]**
- **Employee Creation:** Admins create an "Invite" in the system. The system emails the new hire a unique, secure link. When they sign up, a Cloud Function automatically grants them the correct Role and MFA requirement.
- **Documents:** A `documents` collection (`category: 'sop' | 'contract'`) with built-in versioning (e.g., `v1.0`, `v1.1`).
- **Signatures:** A dedicated `signatures` subcollection: `users/{uid}/hrData/signatures/{docId}`. This stores the `version` they signed, a `timestamp`, and the `ipAddress`. 
- **Enforcement:** When an employee logs in, if there is a required document where `latestVersion != signedVersion`, they are **blocked** from accessing the rest of the app until they read and click "I Acknowledge".
- **Pros:** Legally sound. Perfect for heavily regulated industries (Cannabis/Pawn). Bulletproof audit trail.
- **Cons:** Requires building a document viewer and an "Acknowledgment Wall" overlay.

## Strategy C: External Integration (Third-Party HRIS)
- **Employee Creation & Docs:** Handled entirely in a platform like Gusto, BambooHR, or DocuSign.
- **Our App:** We only store the employee's role. We use webhooks to listen for when an employee is terminated in the external system to revoke their access in our app.
- **Pros:** Offloads legal and document management to dedicated enterprise software.
- **Cons:** Expensive monthly SaaS fees. Fragmented experience (staff juggle multiple logins). Does not enforce SOP reading *before* accessing our POS.

---

*Awaiting your strategic decision via the prompt!*
## Implementation Status\n\n**STATUS: CLOSED (2026-06-04)**\nImplemented Strategy B end-to-end. Created Cloud Function for invites, configured Admin UI for documents, and implemented AcknowledgmentWall middleware.
