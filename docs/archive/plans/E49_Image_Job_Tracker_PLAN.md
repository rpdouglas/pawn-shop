# Feature Plan: E49 Image Job Tracker

This plan details the implementation strategies for the E49 Image Job Tracker feature, migrating away from client-side `setTimeout` loops to real-time Firestore observation.

## User Review Required
> [!IMPORTANT]
> Approach C (Firestore Job Tracker) has been pre-approved by the user. This plan documents that approved strategy.

## Open Questions
None.

---

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona
*   **Primary Persona:** Makoonsii
*   **Secondary Persona:** None
*   **UX Constraints Check:** Confirm alignment with the acceptance criteria defined in `E49_Image_Job_Tracker.md`. Makoonsii needs fast, observable status updates.

### 1.2 Compliance Gate
- **Age gate required?** — No
- **`auditLogs` events:** NONE
- **PII exclusion:** Confirmed
- **`policeHold` compliance:** NONE
- **`aiDescription` isolation:** NONE

---

## Phase 2 — Schema Audit

```
Collections impacted:
- items (subcollection: imageJobs)

New fields required:
items/{itemId}/imageJobs/{jobId}:
- fileName (string)
- status (string: 'processing' | 'retrying' | 'completed' | 'failed')
- attempt (number)
- error (string?)
- updatedAt (Timestamp)
```

---

## Phase 3 — Three-Strategy Proposal

*(The 3 strategies were presented in `mobile_intake_retry_analysis.md`. Approach C was selected.)*

### Strategy C — The Robust Firestore Tracker (Approved)

**Summary:** Build an explicit "job tracking" document in Firestore and watch it via `onSnapshot`.

*   **Architecture:**
    *   Add `items/{itemId}/imageJobs/{jobId}` schema.
    *   Update `MobileIntakePage.tsx` to set this doc on upload complete and attach an `onSnapshot` listener instead of `triggerTimeout()`.
    *   Update `functions/src/inventory.ts` to update this document as it processes the image and encounters failures/retries.
    *   Update `firestore.rules` to allow authenticated staff to read/write `items/{item}/imageJobs/{job}`.
*   **Persona Lens:** Provides Makoonsii with exact, real-time insight into the upload pipeline.
*   **Compliance:** No PII stored.
*   **Trade-offs:** 
    *   *Gains:* True observability.
    *   *Sacrifices:* Requires slightly more code.

---

## Phase 4 — Anti-Regression Protocol

1.  **The Hardcoded Hex Trap:** UI updates for status will use existing tokens.
2.  **The Firestore Field Invention Trap:** `imageJobs` will be added to `firestore-schema.md`.
3.  **The Client-Side AI Key Trap:** N/A.
4.  **The Scarcity Manufacture Trap:** N/A.
5.  **The PII Log Trap:** Job tracker docs will not store PII.

---

## Phase 5 — Output & Storage

The full plan is saved to this file: `docs/plans/E49_Image_Job_Tracker_PLAN.md`.
