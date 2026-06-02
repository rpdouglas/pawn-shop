# Root Cause Analysis: Mobile Intake Image Processing Hang

## The Symptoms
Staff members report that photo uploads intermittently hang at the "Processing…" state and never resolve into a thumbnail. Closing and re-opening the browser temporarily resolves the issue.

## Diagnosed Root Causes

### 1. Cloud Function Memory Exhaustion (OOM) - Primary Cause
**The Issue:**
Modern smartphones (especially recent iPhones and premium Androids) take extremely high-resolution photos (12MP to 48MP). The raw file size might be 5MB–15MB, but when the `processImageUpload` Cloud Function uses `sharp` to process the image, it must uncompress it into a raw bitmap in server memory.
A 48MP image requires ~192MB of RAM just to hold the pixels. The Cloud Function currently uses the default memory allocation (256MB). Combined with Node.js overhead, processing these massive images frequently causes silent Out-Of-Memory (OOM) crashes on the server.
**Why it hangs:** When the Cloud Function crashes mid-execution, the final Firestore update (`images: FieldValue.arrayUnion(...)`) never runs. The frontend sits at "Processing…" forever because the `onSnapshot` listener never receives an update.

### 2. Browser Tab Suspension / WebSocket Disconnect
**The Issue:**
On mobile operating systems (iOS Safari, Android Chrome), when a user clicks "Take Photo", the native camera app takes over the screen. The OS aggressively suspends the browser tab to free up memory and battery for the camera.
When this happens, the active Firebase Firestore WebSocket connection (`onSnapshot`) is often dropped or frozen.
**Why it hangs:** When the user returns to the browser, the file uploads successfully via a standard HTTP POST. The Cloud Function may process the image successfully. However, the frontend's Firestore listener has gone stale or hasn't reconnected fast enough to catch the update event. It misses the signal, leaving the UI stuck.
**Why a restart fixes it:** Closing and re-opening the browser forces a completely fresh session and WebSocket connection, clearing out any dead listeners.

### 3. Flawed UI Clearance Logic (Secondary UI Bug)
**The Issue:**
In `MobileIntakePage.tsx`, the `onSnapshot` listener executes this block when an image is processed:
```tsx
if (newImages.length > 0) {
  setUploads(prev => { ... delete all entries where processing === true })
}
```
**Why it's buggy:** If a staff member uploads multiple images simultaneously from the gallery, the moment the *first* image finishes processing, this logic clears the "Processing..." status text for *all* other images currently processing. They silently disappear from the UI before their thumbnails actually load.

---

## Recommended Fixes

1. **Increase Cloud Function Memory:**
   In `functions/src/inventory.ts`, increase the memory allocation for `processImageUpload` to at least `1GiB` to safely handle 48MP smartphone images without crashing.
   ```typescript
   export const processImageUpload = onObjectFinalized(
     { region: "us-east1", memory: "1GiB" }, // Add explicit memory allocation
     async (event) => { ... }
   )
   ```

2. **Implement an Image-Specific UI Clearance:**
   Update the `onSnapshot` listener in `MobileIntakePage.tsx` so it maps specific filenames/URLs to processing states, rather than blindly deleting all `processing: true` flags as soon as the first image finishes.

3. **Add a Recovery Timeout:**
   Implement a safety timeout on the frontend (e.g., 20 seconds). If an image stays in `processing: true` for longer than the timeout, display an error message allowing the staff member to try again, rather than locking up the UI indefinitely.
