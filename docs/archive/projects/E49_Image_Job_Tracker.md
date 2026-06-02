# Project E49: Mobile Intake Image Job Tracker

**Status:** Done — 2026-06-02
**Epic:** E49 — Mobile Intake Image Job Tracker
**Phase:** Phase 9 — Production Readiness
**Primary Persona:** Makoonsii
**Secondary Personas:** None
**AI Involvement:** Claude (dev)

**Objective:** Implement a robust Firestore job tracker for backend image processing to provide true real-time feedback and retry status to the client, replacing arbitrary `setTimeout` guessing.

---

## 1. User Story

> As **Makoonsii**, I want to **see exact, real-time status updates while my photos are processing (including if it's retrying)** so that I **don't sit wondering if the app is frozen for two minutes.**

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate
*   **Makoonsii (The Hustler):** Time is money. The UI must instantly show when an upload is done, when processing starts, when it retries, and when it succeeds or fails. No dead air.

### AI Integration Gate
*   N/A

### Brand Aesthetics Gate
*   Real-time progress indicators should feel responsive and premium.

---

## 3. Compliance & Safety

-   **Age gate required?** No
-   **auditLogs required?** No
-   **PII Check:** No PII logged.
-   **policeHold Check:** N/A
-   **aiDescription Check:** N/A

---

## 4. Architecture Definition

### Required Schemas

`items/{itemId}/imageJobs/{jobId}`
- `fileName` (string)
- `status` (string enum: 'processing' | 'retrying' | 'completed' | 'failed')
- `attempt` (number)
- `error` (string, optional)
- `updatedAt` (Timestamp)

### Core Logic

- The frontend (`MobileIntakePage.tsx`) creates a draft tracker document with `status: 'processing'` and `attempt: 1` as soon as storage upload completes, then subscribes to it via `onSnapshot`.
- The backend (`processImageUpload` CF or `retryImageProcessing` CF) updates this tracker document as it executes, including updating `status` and `attempt` if retries occur, and setting `status: 'completed'` when finished.

---

## 5. Deployment Pre-flight

- [ ] Schema documented
- [ ] No PII exposed
- [ ] Accessible to screen readers (ARIA live regions for status changes)
