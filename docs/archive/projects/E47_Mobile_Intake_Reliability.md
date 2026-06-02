# Project E47: Mobile Intake Reliability Improvements

**Status:** Done
**Epic:** E09 — Quality, Security, Accessibility
**Phase:** Phase 3
**Primary Persona:** Staff
**AI Involvement:** Claude (dev)

**Objective:** Resolve intermittent image processing hangs during mobile staff inventory intake by preventing backend memory exhaustion and improving frontend state recovery.

---

## 1. User Story

> As **Staff**, I want **my photos to upload and process reliably every time** so that I can **input inventory quickly without having to restart the browser or guess if an upload failed**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate (Staff)
> *"Zero-friction operational tooling..."*

Test for it: Uploading a large photo from a modern smartphone must succeed 100% of the time. The UI must properly reflect processing status for multiple parallel uploads, and must surface a clear error/retry option if an upload fails or times out.

---

## 3. Compliance Gate

- [ ] **Age gate required?** No.
- [ ] **`auditLogs` events required?** No.
- [ ] **PII exclusion** — Verified.
- [ ] **`policeHold` respected** — N/A.

---

## 4. Schema & Architecture

### Firestore Collections Impacted
NONE.

### New Fields Required
NONE.

### TypeScript Interfaces
NONE.

### Security Rules Required
NONE.

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.

---

## 6. Implementation Phases

### Phase 1 — Backend Resilience
- [x] Increase `processImageUpload` Cloud Function memory allocation to `1GiB`.

### Phase 2 — Frontend Logic Refactor
- [x] Update `MobileIntakePage.tsx` to fix the aggressive `onSnapshot` clearance bug (preventing parallel uploads from prematurely erasing processing states).
- [x] Implement a 20-second safety timeout on the frontend that transitions stuck `processing` states into an actionable `error` state.

### Phase 3 — QA
- [x] Verify large file uploads process successfully.
- [x] Verify multiple simultaneous gallery uploads resolve correctly without disappearing.

---

## 7. Definition of Done

- [x] Cloud Function configured with higher memory.
- [x] UI correctly tracks parallel uploads.
- [x] `npm run build` — zero errors.
- [x] PR opened.
