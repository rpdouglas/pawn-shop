# Mobile Intake Photo Upload Architecture

This report details the end-to-end photo upload and processing pipeline used by the staff mobile intake feature (`MobileIntakePage.tsx`). The architecture ensures high-performance mobile uploads, guarantees secure image processing (watermarking and compression) on the backend, and provides seamless real-time feedback to the staff user.

## 1. Frontend: The Camera-First Flow
The process begins in `MobileIntakePage.tsx` using a native-feeling capture interface.

- **Dual Inputs:** The UI leverages two hidden file inputs. A "Take Photo" button triggers an input with `capture="environment"`, which forces mobile devices to bypass file picker popups and directly open the rear-facing camera. A secondary "Choose from Library" button allows multi-file selection from the device gallery.
- **Draft Pre-Flight:** Before any bytes are uploaded, the client mandates the staff member input a title and select a view. It then immediately calls the `createDraftItem` Cloud Function to securely generate a Firestore document. This step is critical because it reserves an authoritative `itemId` that will be used as the destination path for the image uploads.

## 2. Direct-to-Storage Upload
Instead of bottlenecking the Node.js backend by sending base64 strings or binary blobs over HTTP, the client uploads the raw files directly to a temporary holding directory in Cloud Storage.
- **Upload Path:** `items/{itemId}/uploads/{filename}`
- **Client-Side Validation:** The UI strictly enforces MIME types (JPG, PNG, WebP) and caps files at 20MB.
- **Progress Tracking:** The client uses Firebase's `uploadBytesResumable` to render real-time progress bars. Once the upload hits 100%, the UI enters a "Processing..." state.

## 3. Backend Processing (`processImageUpload` Cloud Function)
The heavy lifting is completely decoupled from the client. Located in `functions/src/inventory.ts`, the `processImageUpload` function listens for `onObjectFinalized` Storage events.

When a raw image hits the `uploads/` directory, the function wakes up and executes the following pipeline:
1. **Ingestion:** Downloads the temporary file buffer into server memory.
2. **Watermarking & Conversion (via Sharp):** 
   - Composites an SVG watermark ("© The Pawn Shop") into the bottom right ("southeast") corner of the image with 60% opacity.
   - Compresses and converts the final image into highly-optimized WebP format at 85% quality, which satisfies the platform's strict Lighthouse performance requirements for fast painting.
3. **Storage Relocation:** Saves the finalized WebP file to the permanent, public-facing directory: `items/{itemId}/images/`.
4. **Firestore Synchronization:** Runs an atomic `FieldValue.arrayUnion` update to append the final `publicUrl` of the WebP image into the `images` array of the associated Firestore item document.
5. **Garbage Collection:** Safely deletes the raw, uncompressed original file from the `uploads/` folder to prevent storage bloat.

## 4. Real-Time Frontend Resolution
Because the frontend component (`MobileIntakePage.tsx`) maintains an active `onSnapshot` listener on the Firestore document, the moment the Cloud Function successfully runs the atomic update to the `images` array, the updated data pushes to the client.

The frontend intercepts this push, dismisses the "Processing..." state, and immediately renders the thumbnail of the fully watermarked and optimized WebP image, creating a magical, instantaneous feel for the staff member.

---
### Summary
By combining **direct-to-storage resumable uploads**, **event-driven backend Sharp processing**, and **Firestore real-time listeners**, the system avoids client-side freezing, protects the main backend from CPU-heavy image crunching, and strictly enforces visual brand consistency (watermarking) before an image ever becomes publicly accessible.
