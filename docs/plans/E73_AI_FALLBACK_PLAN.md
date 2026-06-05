# E73: AI Fallback & Graceful Degradation - Plan

## Persona Impact Statement
- **Marie (Store Manager):** Needs the intake process to be completely unblockable. If the AI is down, she expects to just type the details in manually.
- **Kevin (Staff):** Will see a clear popup explaining that AI failed but the photo is saved, avoiding confusion about whether he needs to retake the photo.

## Compliance Checklist
- [x] Graceful degradation must not bypass any compliance gates (e.g., photo watermarking must still occur).
- [x] Alert messages must not expose stack traces or PII to staff.

## Schema Audit
- No schema changes required. `jobRef` will naturally mark `completed` even if AI fails, and `internal/ai` will simply remain empty until explicitly generated or bypassed.

## Strategy A: Selected
**Graceful Degradation with Pop-up Notification**

1. **Model Updates (`functions/src/ai.ts`)**:
   - Update to `gemini-3.1-pro` and `gemini-2.5-flash`.
   - Update error catching to handle 503s.
   - If both models fail, log the error and return `{ error: "Service unavailable" }`.

2. **Cloud Function Updates (`functions/src/inventory.ts`)**:
   - Check `aiResult.error` inside `processUploadedImage`.
   - If present, do NOT throw `HttpsError`.
   - Return `{ success: true, url: finalUrl, aiFailed: true, aiError: aiResult.error }`.

3. **Frontend Updates (`MobileIntakePage.tsx`, `ImageUploadZone.tsx`)**:
   - Destructure `aiFailed` and `aiError` from the function response.
   - If `aiFailed === true`, invoke `window.alert()` to notify the user.
   - Proceed to mark the upload as successfully processed so the user can submit the form manually.
