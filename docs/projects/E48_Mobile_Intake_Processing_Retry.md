# Project E48: Mobile Intake Processing Resilience

**Status:** Done — 2026-06-02
**Epic:** E09 — Quality, Security & Accessibility (or E48 standalone)
**Phase:** Phase 14
**Primary Persona:** Staff (Inventory/Admin)
**Secondary Personas:** None
**AI Involvement:** Claude (dev)

**Objective:** Improve the reliability of the image processing pipeline in `MobileIntakePage.tsx` by extending the timeout safety net and adding automatic retries for images that stall in the "Processing..." state.

---

## 1. User Story

> As **Inventory Staff**, I want **the mobile intake tool to automatically retry processing if an image stalls**, so that **I don't have to manually restart or abandon intake flows on spotty connections or under heavy backend load**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate (Staff)

- [ ] Timeout in `MobileIntakePage.tsx` is extended from 20s to 30s.
- [ ] If an image stalls in "Processing..." for 30s, the system automatically retries the upload/processing flow.
- [ ] The system gives up and surfaces an error only after 3 failed processing attempts.

---

## 3. Compliance Gate

- [ ] **Age gate required?** No.
- [ ] **`auditLogs` events required?** No.
- [ ] **PII exclusion** — Confirmed.
- [ ] **`policeHold` respected** — N/A.

---

## 4. Schema & Architecture

### Firestore Collections Impacted
None.

### New Fields Required
None.

### Security Rules Required
None.

---

## 5. Definition of Done

- [ ] `MobileIntakePage.tsx` updated with 30s timeout and 3x retry logic.
- [ ] `npm run build` — zero errors.
- [ ] `npm run lint` — zero warnings.
