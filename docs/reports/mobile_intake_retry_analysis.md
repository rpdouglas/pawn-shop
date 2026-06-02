# Report: Mobile Intake Image Processing Retry Analysis

## 1. The Current Bug
The user correctly observed that the mobile intake image processing "no longer times out at all" and just sits at "processing" with no indication of a retry attempt.

### Why this is happening:
In `E48`, we wrapped the client-side Cloud Function waiting logic in a recursive `setTimeout` loop. 
The system does exactly what it was programmed to do: it waits 30 seconds, and if the image hasn't appeared in Firestore, it calls the `retryImageProcessingFn` and waits *another* 30 seconds. It does this 3 times. 
From the user's perspective, the UI simply says "Processing..." for up to **120 seconds (2 full minutes)** before finally showing the timeout error. Furthermore, because the retry happens silently in the background, the UI gives zero indication that it's attempting a retry. It looks frozen.

## 2. Proposed Approaches to Resolve

Here are 3 different approaches we can take to fix this experience, ranging from a quick UX patch to a robust architectural shift.

### Approach A: The Quick UX Patch (Status Polling)
**How it works:** We keep the current client-side timeout logic but surface the `attempt` count to the UI.
* Update the `UploadEntry` interface to include a `retryAttempt?: number` field.
* Modify the recursive `setTimeout` to update the state on each loop (e.g., "Processing... (Retry 1 of 3)").
* Reduce the timeout interval from 30 seconds down to 15 seconds so failures resolve faster.
**Pros:** Easy to implement. Requires only a few lines of frontend changes.
**Cons:** It's still client-side "guessing". If the client closes the browser while it's waiting, the retries never happen.

### Approach B: Server-Side Retry Native Policy
**How it works:** We remove the client-side retry completely and rely entirely on Google Cloud Functions.
* We configure the `processImageUpload` Cloud Function with built-in retries (`failurePolicy: true` or v2 equivalent).
* The client simply waits for a single 45-second timeout and shows "Processing...".
* If the backend fails to process the image, the Google Cloud infrastructure will automatically retry the execution using exponential backoff.
**Pros:** Much cleaner client code. No custom retry loops needed. More resilient to transient errors.
**Cons:** The user still doesn't get real-time feedback on what attempt the backend is on.

### Approach C: The Robust Firestore Tracker (Recommended)
**How it works:** We build an explicit "job tracking" document in Firestore.
* When the image upload finishes, the client creates a temporary tracker doc: `items/{itemId}/imageJobs/{imageId}`.
* The backend `processImageUpload` triggers, updates the job to `status: 'processing'`, then `status: 'completed'` (or `status: 'failed'`).
* If it fails, the backend triggers the retry mechanism and sets the status to `status: 'retrying'`.
* The client uses standard Firestore `onSnapshot` listeners to watch this document and updates the UI in true real-time, showing exactly what the backend is doing.
**Pros:** True real-time observability. No arbitrary `setTimeout` guessing. The gold standard for async tasks.
**Cons:** Requires slightly more code (a new subcollection and updated security rules).

---
**Which approach would you like to take?** If you approve an approach, I will create the project spec and formal implementation plan so we can execute the fix.
