# E48 Strategy Plan: Mobile Intake Processing Resilience

## Context & Persona Impact
**Persona:** Staff (Inventory/Admin)
Staff using the `MobileIntakePage` occasionally experience stalls where an image uploads successfully to Storage, but the Firestore listener never fires (either because the `processImageUpload` Cloud Function timed out, ran out of memory, or the mobile WebSocket temporarily dropped). 

Extending the safety timeout to 30 seconds and adding 3 retries before failing will save staff time and prevent manual re-work.

---

## Strategy A: The Local UI Re-Upload (Minimal)
When the 30-second processing timeout hits, we treat it as a failure but immediately trigger a new `uploadBytesResumable` task for the exact same file under the hood, up to 3 times.

- **How it works:** We store the original `File` object in a `useRef` or within the `uploads` Map state. If the timeout fires, we check the retry count. If `< 3`, we re-invoke the Firebase Storage upload function (which will overwrite the Storage blob and force a new Cloud Function execution).
- **Pros:** Completely self-contained in `MobileIntakePage.tsx`. Easy to build.
- **Cons:** We are spending customer bandwidth re-uploading the physical file over a mobile network just to re-trigger a Cloud Function.

## Strategy B: The Cloud Function Retry Signal (Recommended)
Instead of re-uploading the potentially large file from the mobile device, we use a lightweight Firestore document write to signal the backend to retry processing. 

- **How it works:** We modify the timeout logic in `MobileIntakePage.tsx` to call a new lightweight Cloud Function (or simply write a `retryCount` field to a subcollection) that triggers the `processImageUpload` logic directly on the backend. However, since `processImageUpload` relies on the Storage trigger, an easier variant is to have a lightweight Callable Cloud Function `retryImageProcessing(storagePath)` that directly processes the existing storage blob without requiring a re-upload.
- **Pros:** Saves massive amounts of mobile bandwidth and time since the file is already sitting in Google Cloud Storage. 
- **Cons:** Requires writing and deploying a new Cloud Function (`retryImageProcessing`).

## Strategy C: The Local File-Touch Workaround (Robust & Clever)
We combine the simplicity of Strategy A with the bandwidth savings of Strategy B. When the timeout hits, instead of re-uploading the entire file, we update the Storage metadata of the existing object.

- **How it works:** Firebase Storage `onFinalize` Cloud Functions trigger when a new object is created OR when its metadata is updated. In `MobileIntakePage.tsx`, when the 30s timeout hits, we call `updateMetadata(storageRef, { customMetadata: { retryAttempt: "1" } })`. This uses a few bytes of network traffic but triggers the backend Cloud Function exactly as if the file had just been uploaded.
- **Pros:** Zero new backend endpoints required. Saves massive mobile bandwidth. Extremely fast retry trigger.
- **Cons:** We must ensure the `processImageUpload` Cloud Function is idempotent (which it already is, as it writes to an array).

---

## Schema Audit
No Firestore collections are structurally impacted. If Strategy C is chosen, we are simply mutating custom metadata on the Storage object.

## Compliance Checklist
- [x] **Age Gate:** N/A (Staff feature)
- [x] **Audit Logs:** N/A (Internal temporary processing state)
- [x] **PII:** Confirmed None.
- [x] **Police Hold:** N/A.

---

## Open Questions for Approval
Which strategy would you prefer?
1. **Strategy A:** Full re-upload (heavy network usage, but simple).
2. **Strategy B:** Dedicated Callable Cloud Function (heaviest backend changes).
3. **Strategy C:** Metadata update trigger (fastest, lowest bandwidth, cleverest). 

*(I strongly recommend **Strategy C** as it solves the problem with the least amount of architectural drift and network strain).*
