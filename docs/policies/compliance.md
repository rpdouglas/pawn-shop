# Compliance Policy — The Pawn Shop

This policy defines the regulatory and safety requirements for The Pawn Shop's multi-vertical platform.

## 1. Age Verification (Marie & Tanya Personas)
*   **Mandate:** All restricted views (Cannabis 19+, Fireworks 18+) must be gated at the **Router level**.
*   **Enforcement:** Use the `<AgeGate>` component in `main.tsx`. Component-level gating is insufficient.
*   **Logging:** Every pass/fail event must call the `logAgeGate` Cloud Function to write to `auditLogs`.

## 2. PII Isolation (Marie Persona)
*   **Mandate:** No PII (Email, Phone, Name, Address) is permitted in `auditLogs.details`, GA4 Analytics, or console logs.
*   **Enforcement:** Use typed interfaces for analytics that structurally exclude PII.

## 3. Police Holds
*   **Mandate:** Setting `policeHold: true` must immediately hide the item from all public Firestore queries.
*   **Enforcement:** Verified via Firestore Security Rules: `allow read: if resource.data.status == 'active' && resource.data.policeHold != true`.

## 4. Audit Log Integrity
*   **Mandate:** `auditLogs` are immutable compliance records.
*   **Enforcement:** Client-side writes are forbidden. All writes must occur via Admin SDK in Cloud Functions.

---
*The Pawn Shop · docs/policies/compliance.md · v1.0*
