# Project E66: Backend Cloud Functions v2 Migration

**Status:** Closed
**Epic:** E66
**Primary Persona:** Developers, System Architecture

## Objective
Migrate the Firebase Cloud Functions to the v2 architecture (backed by Google Cloud Run) to dramatically reduce cold start latency via concurrent execution, while maintaining zero baseline cost.

## Requirements
- **v2 API Migration:** Update `functions/src/index.ts` and related files to import from `firebase-functions/v2`.
- **Concurrency & Scaling:** Configure the functions with a concurrency of `80` and `minInstances` of `0`.
- **AI Processing Optimization:** Ensure the `processImageUpload` background task benefits from the new v2 runtime concurrency to prevent user delays.
