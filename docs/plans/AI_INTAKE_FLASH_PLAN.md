# EPIC: AI Models - FEATURE: Intake Data Extraction Flash Migration

**Date:** June 3, 2026
**Architect:** Antigravity

## Overview
Switch the multimodal vision model used in the `extractIntakeData` function from Gemini Pro (`gemini-pro-latest`) to Gemini Flash (`gemini-flash-latest`) to significantly reduce staff wait times during item intake, while leaving `generateAIDescription` and `suggestAiPrice` optimized on Pro.

---

## Strategy A: Minimal Surgical Switch

**Description:** 
Simply update the model reference in `extractIntakeData` within `functions/src/ai.ts` to use `flashModel`. No other changes.

- **Persona Impact Statement:** 
  - **Makoonsii (Staff):** Sees an immediate reduction in latency when uploading an item photo for intake. The form populates faster.
- **Compliance Checklist:** 
  - Age gate: N/A
  - Audit logs: Existing `auditLogs` for intake will remain unchanged (though this function itself doesn't directly write to `auditLogs`, the parent CF `processUploadedImage` does).
  - PII: No PII included in the prompt.
  - Police Hold: N/A
- **Schema Audit:** 
  - Impacted Collections: None.
  - Impacted Fields: None.

---

## Strategy B: Recommended - Switch with Resiliency Fallback

**Description:** 
Update `extractIntakeData` to use `flashModel`. Wrap the call in a `try/catch` specifically designed to fall back to the Pro `model` if Flash encounters a multimodal processing error or rate limit. 

- **Persona Impact Statement:** 
  - **Makoonsii (Staff):** Faster intake most of the time. If Flash glitches on a particularly complex image, the system silently retries with Pro, ensuring the intake flow doesn't break.
- **Compliance Checklist:** 
  - Age gate: N/A
  - Audit logs: Unchanged.
  - PII: No PII included in the prompt.
  - Police Hold: N/A
- **Schema Audit:** 
  - Impacted Collections: None.
  - Impacted Fields: None.

---

## Strategy C: Robust - Switch, Fallback & Latency Audit

**Description:** 
Implement the Flash switch and Pro fallback from Strategy B, but also inject explicit latency tracking. We will record the execution time of `extractIntakeData` and log an event to `auditLogs` with the performance metrics to actively monitor the ROI of this switch.

- **Persona Impact Statement:** 
  - **Makoonsii (Staff):** Faster intake flow.
  - **Kevin (Manager):** Gains visibility into staff efficiency via audit logs that show exact AI processing times for intake.
- **Compliance Checklist:** 
  - Age gate: N/A
  - Audit logs: **New event type** (`ai_vision_performance`) added to track processing time (ms).
  - PII: No PII included in the prompt.
  - Police Hold: N/A
- **Schema Audit:** 
  - Impacted Collections: `auditLogs`
  - Impacted Fields: New `details.processingTimeMs` and `details.modelUsed` added to the `auditLogs` schema.

---

## Next Steps
Please review the strategies above and explicitly state which strategy (A, B, or C) you approve for execution. Once approved, I will implement the change in `functions/src/ai.ts` and verify with a build check.
