# E51_PHOTO_UPLOAD_COMPRESSION_PLAN

## Epic/Feature
Photo Upload Compression & Backend Resilience (Fixing the "Processing" Hang)

## Persona Lens
- **Staff (Marie / Kevin):** Rely on fast, reliable image processing when performing inventory intake on mobile devices. Long delays or silent crashes destroy their operational efficiency.

## 3-Strategy Proposal

### Strategy A: Beef up the Callable (Backend Only)
Simply update the `onCall` definition for `processUploadedImage` to increase the memory limit (`1GiB`) and timeout (`120s`), preventing the `sharp` library from causing an Out-Of-Memory (OOM) crash.
* **Persona Impact:** Staff don't experience silent crashes, but still face painfully slow upload times for 20MB raw images.
* **Compliance Checklist:** No schema changes.

### Strategy B: Revert to Background Trigger with Strict Job Tracking (Most Scalable)
Go back to the `onObjectFinalized` trigger but write processing status to a dedicated `imageJobs/{filename}` collection that the frontend explicitly listens to.
* **Persona Impact:** Completely unblocks the client UI, though processing still takes a long time.
* **Compliance Checklist:** No new PII. Re-introduces the `imageJobs` collection dependency.

### Strategy C: Client-Side Compression + Resource Fix (Recommended & Approved)
Implement `browser-image-compression` on the frontend *before* the upload task begins, shrinking the 20MB file to ~300KB. Combine this with the resource fix from Strategy A (`1GiB` memory) to guarantee the backend never crashes.
* **Persona Impact:** Blazing fast uploads on mobile networks. The backend `sharp` processor handles the tiny 300KB file instantly without risk of OOM.
* **Compliance Checklist:** No schema changes. Auth gates remain strictly enforced.

---

## Strategy C Execution Plan (Approved Strategy)

### 1. Schema Audit
- **Collections Impacted**: None. 

### 2. Exact Code Changes

**A. Backend: `functions/src/inventory.ts`**
1. Modify the `onCall` definition for `processUploadedImage`:
   - Change from: `onCall<{ filePath: string }>({ cors: true }, ...)`
   - Change to: `onCall<{ filePath: string }>({ cors: true, memory: '1GiB', timeoutSeconds: 120 }, ...)`

**B. Frontend: `src/pages/admin/MobileIntakePage.tsx`**
1. Import `imageCompression` from `browser-image-compression`.
2. Wrap the incoming `File` inside `uploadFile` with `imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true })`.
3. Upload the resulting compressed Blob instead of the original File.

### 3. Regression & Compliance Checks
- **Auth Gate**: Ensure `processUploadedImage` strictly verifies `isStaffToken()`.
- **Compiler Gate**: Must run `npm run build` (or `tsc -b`) and `npm run lint` cleanly before closing the ticket.
