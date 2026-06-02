# E45_PHOTO_UPLOAD_FIX_PLAN

## Epic/Feature
Fix Photo Upload Processing Timeout / Hang

## Persona Lens
- **Staff (e.g., Kevin, Marie)**: Need a reliable, immediate photo upload experience from their mobile devices during intake, without getting stuck on a "Processing..." spinner indefinitely if the backend hangs.

## 3-Strategy Proposal (Review)

### Strategy A: Client-Side Watchdog (Minimal)
Re-introduce a strict timeout loop on the client side (`setTimeout` in the upload callback).
* **Persona Impact**: Staff get an error if the upload takes > 15s instead of hanging.
* **Compliance Checklist**: No schema changes.
* **Pros/Cons**: Fast to add, but prone to race conditions if the Storage trigger is merely slow, leading to duplicate processing.

### Strategy B: Backend Scheduled Watchdog (Robust)
Rely on a scheduled pubsub cron job (`onSchedule`) to clean up hanging processes in Firestore.
* **Persona Impact**: Staff won't be permanently stuck, but might wait up to 2 minutes for the cron job to declare the task failed.
* **Compliance Checklist**: Requires a new Cloud Scheduler task. No PII impact.
* **Pros/Cons**: Highly robust backend state, but terrible UX latency for a real-time intake app.

### Strategy C: Synchronous Callable Architecture (Recommended & Approved)
Eliminate the background Storage trigger (`onObjectFinalized`) entirely and move to a direct request-response model using an HTTPS Callable Cloud Function.
* **Persona Impact**: Staff experience immediate, predictable upload processing. If it fails, they are notified instantly.
* **Compliance Checklist**: Staff-only auth gate strictly enforced on the Callable. No new schema fields.
* **Pros/Cons**: Eliminates async flakiness, simplifies client logic, and leverages native HTTPS timeouts.

---

## Strategy C Execution Plan (Approved Strategy)

### 1. Schema Audit
- **Collections Impacted**: `items/{itemId}/imageJobs/{filename}` (This collection becomes obsolete as an async sync mechanism, though we can still write to it for audit logs). `items` (No schema changes, just array unions to `images`).
- **No new Firestore fields invented.**

### 2. Exact Code Changes

**A. Backend: `functions/src/inventory.ts`**
1. **Remove** the `processImageUpload` (`onObjectFinalized`) trigger entirely.
2. **Rename** the existing `retryImageProcessing` callable to `processUploadedImage`.
3. **Refactor `processUploadedImage`**:
   - Validate `isStaffToken(request.auth.token)`.
   - Take `filePath` (e.g. `items/{itemId}/uploads/{filename}`).
   - Download the temporary file.
   - Run Sharp watermarking and WebP conversion.
   - Upload final file to `items/{itemId}/images/{filename}.webp`.
   - Update `items/{itemId}` `images` array with `FieldValue.arrayUnion(finalUrl)`.
   - Delete the temp upload file.
   - Return `{ success: true, url: finalUrl }`.

**B. Frontend: `src/pages/admin/MobileIntakePage.tsx`**
1. **Update Callable**: Replace `retryImageProcessingFn` with `processUploadedImageFn`.
2. **Remove Firestore Listener**: Remove the complex `onSnapshot(jobRef, ...)` logic that was waiting for the backend to update `status` to `completed`.
3. **Refactor `uploadTask.on('state_changed')` completion callback**:
   - On upload success, update state to `processing: true`.
   - Immediately `await processUploadedImageFn({ filePath: storagePath })`.
   - On Callable success: Update state to `processing: false`. The existing `items/{itemId}` `onSnapshot` listener will naturally pick up the new image URL and render it.
   - On Callable failure: Catch the error, log it, and update state to `processing: false, error: err.message`.

### 3. Regression & Compliance Checks
- **Auth Gate**: Ensure `processUploadedImage` strictly verifies `isStaffToken()`.
- **Anti-Regression Check**: 
  - No AI keys exposed on the client.
  - No hardcoded hex colors used in any UI error states (use `.view-*` tokens or `var(--color-error)`).
  - No Kanien'kéha generation involved.
- **Compiler Gate**: Must run `npm run build` (or `tsc -b`) and `npm run lint` cleanly before closing the ticket.
