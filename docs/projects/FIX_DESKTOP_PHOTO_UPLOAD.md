# Fix Desktop Photo Upload Project Spec

**Status:** Done — 2026-06-02

## Overview
The desktop inventory intake photo upload process is broken. It uploads the image to Firebase Storage but stalls infinitely on "Saving photo...". This occurred because the backend `processUploadedImage` Cloud Function was recently migrated from an asynchronous Firebase Storage trigger (`onObjectFinalized`) to a synchronous HTTPS Callable to improve reliability for mobile. However, the desktop component (`ImageUploadZone.tsx`) was not updated to invoke this callable, so it waits infinitely for a trigger that no longer exists.

## Requirements
1. **Migration to HTTPS Callable:** Update `src/components/admin/ImageUploadZone.tsx` to invoke the `processUploadedImage` HTTPS Callable immediately after the Firebase Storage upload completes, exactly mirroring the `MobileIntakePage.tsx` implementation.
2. **Error Handling:** Gracefully catch and display errors from the Callable function in the UI, enabling the existing manual "Retry" flow if the processing fails.
3. **No Deadlocks:** Ensure the UI drops the "Saving photo..." spinner if the Callable fails.

## Persona Impact
- **Staff / Admin:** Unblocks inventory creation on desktop, which is crucial for bulk processing or back-office tasks where desktop speed is preferred over mobile camera integration.

## Compliance
- Maintain watermarking logic in the backend (handled by the Callable).
- Desktop uploads still flow through the same compliant Cloud Function infrastructure.
