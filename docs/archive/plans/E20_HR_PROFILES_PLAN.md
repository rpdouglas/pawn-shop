# E20 — Employee Profile & HR Data Plan

## Objective
Implement a secure Employee Profile view that captures necessary HR data (SIN, Status Card, Banking, Emergency Contacts) and foundational scheduling preferences (day-by-day availability, max hours), specifically tailored for an Ontario Native Reserve operating environment.

---

## Strategy A: Minimal (Operational Only)
Store only emergency contacts and basic shift preferences (e.g., "Mornings", "Evenings") directly on the user's main `users` document. Leave all PII (SIN, Status Card, Banking) entirely out of the application and rely strictly on external HR systems.
* **Persona Impact:** Managers must juggle two different systems for basic onboarding.
* **Compliance:** Low risk, but high friction.

## Strategy B: Recommended (Secure HR Sub-collection + Detailed Scheduling)
Create a secure `users/{uid}/hrData/profile` sub-collection protected by tight `firestore.rules` (only accessible to the owner or an admin). Store PII (SIN, Banking, Status Card) and detailed day-by-day availability grids here. Add an "HR & Scheduling" tab to the employee's `ProfilePage` and an Admin override view in `StaffManagementPage`.
* **Persona Impact:** Excellent. Employees self-serve their preferences; Admins have a single pane of glass for all operations.
* **Compliance Checklist:** PII is isolated from general user queries. Firestore native encryption at rest + IAM rules secure the data.
* **Schema Audit:** Introduces a new sub-collection `users/{uid}/hrData/{id}`.

## Strategy C: Robust (Application-Layer Encryption)
Same as Strategy B, but encrypts SIN and Banking details at the application layer before writing to Firestore, requiring a KMS-backed decryption key.
* **Persona Impact:** High engineering overhead.
* **Compliance:** Ultra-secure, but complex to maintain.

---

## Final Decision
**Strategy B** is selected and approved via `/goal`. It provides the perfect balance of security, feature depth (for future automated scheduling), and operational efficiency.
