# Epic Plan: Fix Desktop Photo Upload

## Phase 1 — Persona & Compliance Gate
- **Primary Persona:** Staff (Inventory Management). Unblocking desktop inventory creation is crucial for bulk processing or back-office tasks where desktop speed is preferred over mobile camera integration.
- **Compliance Audit:** The backend `processUploadedImage` Cloud Function enforces compliance by running watermarking and generating final storage URLs securely via Admin SDK. The desktop client must invoke this explicitly just like the mobile client. No PII is exposed during this process.

## Phase 2 — Schema Audit
- **Impacted Collections:** `items/{id}`
- **Current Schema (`docs/firestore-schema.md`):** `images: string[]`
- **Schema Changes:** No schema changes are required. This is purely a client-side execution path fix.

## Phase 3 — Three-Strategy Proposal

### Strategy A: Minimal Fix
- **Architecture:** Simply add a call to `processUploadedImageFn` in the `on` success callback in `ImageUploadZone.tsx`. Let any uncaught errors be handled by existing generic UI patterns.
- **Trade-offs:** Fast to implement but lacks the robust manual retry flow that `ImageUploadZone.tsx` currently offers for storage upload failures.

### Strategy B: Robust Call + Error UI Integration (Recommended)
- **Architecture:** 
  1. Add `processUploadedImageFn` to `ImageUploadZone.tsx`.
  2. Await the HTTPS callable in the success callback.
  3. If it throws, update the local component `UploadEntry` state to display the error in the UI (e.g. `u.error`) and keep `hasBlob: true` so the staff member can click "Retry".
- **Persona Lens:** Prevents frustration for Staff by allowing them to retry just the processing if it stalls or fails, rather than starting the upload over.
- **Trade-offs:** Slightly more state-handling code than Strategy A.

### Strategy C: Complete Unification of Upload Code
- **Architecture:** Extract the entire upload + processing flow into a shared custom hook (`useImageUpload`) to guarantee `MobileIntakePage` and `IntakeForm`/`ImageUploadZone` can never diverge again.
- **Persona Lens:** Staff benefits from a completely identical flow between mobile and desktop.
- **Trade-offs:** Extends scope beyond a quick bug fix and requires refactoring the mobile page that currently works fine.

## Phase 4 — Anti-Regression Protocol
- [x] No Hex Codes: Confirmed.
- [x] Firestore field invention: None.
- [x] Client-side AI keys: None.
- [x] Manufactured scarcity: None.
- [x] PII in logs: None.
- [x] Component-level only age gates: N/A.
- [x] Brand voice violations: N/A.

**Recommendation:** Strategy B is recommended. It fixes the bug immediately while ensuring the desktop UI handles processing errors gracefully, without unnecessary refactoring overhead (Strategy C).
