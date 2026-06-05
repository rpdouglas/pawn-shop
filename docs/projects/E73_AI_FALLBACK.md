# E73: AI Extraction Fallback & Graceful Degradation

**Status:** Completed
**Epic:** Intake AI Reliability

## Objective
Handle intermittent 503 (Service Unavailable) and 429 (Quota Exceeded) errors from Gemini models during the photo upload intake process. Provide a graceful degradation path so that when AI models are unavailable, the image upload succeeds and staff can manually enter item details, preventing blocked intake workflows.

## Background
Currently, if the `gemini-flash-latest` model fails during `processUploadedImage` execution, the entire Cloud Function throws an error. This causes the client-side upload component to report a failure, confusing staff since the image itself is successfully saved to Firebase Storage.

## Scope
1. Update `functions/src/ai.ts` to use `gemini-3.1-pro` and `gemini-2.5-flash` to ensure we're using current models.
2. Update the fallback logic in `ai.ts` to cover 503 errors and gracefully degrade if both models fail.
3. Update `functions/src/inventory.ts` to not throw an error if `extractIntakeData` fails. Instead, return a flag `aiFailed: true`.
4. Update client-side components (`MobileIntakePage.tsx`, `ImageUploadZone.tsx`) to show a popup alert when AI fails, while allowing the upload process to complete successfully.

## Affected Areas
- `functions/src/ai.ts`
- `functions/src/inventory.ts`
- `src/pages/admin/MobileIntakePage.tsx`
- `src/components/admin/ImageUploadZone.tsx`
