# Audit Logging & Accountability

The Pawn Shop maintains an immutable **Audit Log** system to ensure complete accountability for all high-stakes actions within the platform.

## What is Logged?
The system automatically records the following events:
- **Authentication:** Logins, logouts, and MFA enrollments.
- **Safety Actions:** Setting or lifting a Police Hold, Age Gate passes/fails.
- **Inventory Actions:** Publishing an item, setting a hold, or eBay cross-posting.
- **Pawn Services:** Submission of new enquiries and Serial Blacklist hits.

## Immutable Records
Audit logs are stored in a separate collection with the following strict rules:
- **No Deletion:** No user, including Admins, can delete an audit log.
- **No Modification:** Once a log is written, it cannot be changed.
- **Cloud-Only Writes:** Most high-stakes logs are written by Cloud Functions using the Admin SDK, preventing any client-side manipulation.

## Reporting for Compliance
Managers can use these logs to verify compliance with regional regulations (like the Age Gate) and to track the chain of custody for pawn inventory. All logs are timestamped and linked to the staff member's unique ID (UID).
