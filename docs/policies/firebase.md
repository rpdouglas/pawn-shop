# Firebase Architecture Policy — The Pawn Shop

This policy defines the engineering standards for the Firebase/Google Cloud backend.

## 1. Data Handling
*   **Mandate:** Zero usage of `as any` when casting Firestore data.
*   **Enforcement:** Use explicit TypeScript interfaces or type guards when reading `snap.data()`.

## 2. Security Rules
*   **Mandate:** Every schema change must be accompanied by a corresponding update to `firestore.rules`.
*   **Verification:** Deploy rules to the emulator and verify with `QA_Analyst` before PR.

## 3. Cloud Functions (V2)
*   **Mandate:** All sensitive logic (logic that bypasses rules or has side effects) belongs in a Cloud Function.
*   **Enforcement:** Client-side `setDoc` or `addDoc` on restricted collections (e.g., `items`, `auditLogs`, `pawnRequests`) is forbidden.

## 4. AI Guardrails
*   **Mandate:** All AI API calls must be routed through Cloud Functions.
*   **Enforcement:** API keys must never be exposed to the client or stored in the `src/` directory.

---
*The Pawn Shop · docs/policies/firebase.md · v1.0*
