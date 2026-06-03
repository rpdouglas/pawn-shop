# E57 Epic Plan: AI-First Inventory Intake Flow

## Pre-Flight Checklist
- [x] Project Spec verified: `docs/projects/E57_AI_INVENTORY_INTAKE.md`
- [x] Context verified: `IntakeForm.tsx`, `MobileIntakePage.tsx`, `firestore-schema.md`, `functions/src/ai.ts`.

---

## Phase 1 — Persona & Compliance Gate
- **Primary Persona:** **Staff (Marie/Inventory)**. The intake flow is their primary tool. Friction reduction is paramount. Reversing the flow means they take a photo first and let the machine do the heavy lifting of categorization, description, and market analysis.
- **Secondary Persona:** **Dale (The Bargain Hunter)**. Accurate `avgSalePrice` and `avgRefurbPrice` ensures our pricing remains razor-sharp and competitive.
- **Compliance Audit:**
  - Gemini API keys must remain strictly within Cloud Functions.
  - AI estimates MUST NOT auto-publish as final `price` or `cost`. They must be presented as a draft for staff approval.
  - Rate limiting must be enforced on the CF.

## Phase 2 — Schema Audit
**Impacted Collections:** `items/{id}` and `items/{id}/internal/staff`, `items/{id}/internal/ai`.

**Proposed Schema Additions (`docs/firestore-schema.md`):**
We need to capture the AI's deep dive market pricing in the internal AI sub-document so we retain the context even after staff sets the final price.
```typescript
// in items/{id}/internal/ai
{
  intakeExtraction: {
    suggestedFields: Record<string, any>; // The raw form fields suggested
    marketPricing: {
      avgRegularPriceCents: number;
      avgSalePriceCents: number;
      avgRefurbPriceCents: number;
      currency: "CAD";
      retrievedAt: Timestamp;
    };
  }
}
```

---

## Phase 3 — Three-Strategy Proposal

### Strategy A: Minimal (Synchronous Callable Function)
- **Architecture:** Staff selects the storefront and uploads a photo. The client calls a new `extractInventoryData` Cloud Function with the image URL. The UI displays a spinner. The CF calls Gemini 1.5 Pro, parses the JSON, and returns it. The React client applies the JSON to the `FormState`.
- **Persona Lens:** Simple, but a 10-15s loading spinner violates the Staff speed requirement.
- **Compliance:** Secure, but vulnerable to mobile network drops causing the function to time out.
- **Estimated Scope:** Small (3 files).

### Strategy B: Recommended (Async Job Tracker Pattern)
- **Architecture:** Reuses the rock-solid E49 `imageJobs` architecture. 
  1. Staff selects View (Pawn/Cannabis/etc.) and captures a photo.
  2. Photo uploads to Storage, triggering the existing `processImageUpload` background flow.
  3. We extend the background CF to optionally run the `Gemini Vision` extraction if an `extractData: true` flag is passed in the job.
  4. The CF writes the results to `items/{id}/internal/ai` and marks the `imageJob` as `ai_complete`.
  5. The front-end listens to the job status, and once `ai_complete`, pulls the internal AI doc to hydrate the `FormState` and show the market pricing insights in a new panel.
- **Persona Lens:** Perfect for Staff. They can snap a photo, and the UI provides real-time progress ("Processing Image", "Analysing Product", "Fetching Market Data") without blocking the main thread or dropping due to network changes.
- **Compliance:** 100% secure. Uses server-side triggers. Data is stored safely in `internal/ai` prior to staff approval.
- **Estimated Scope:** Medium (5 files).

### Strategy C: Robust (Multi-Modal Streaming UI)
- **Architecture:** Client streams the image to a proxy Cloud Run service which uses Server-Sent Events (SSE) to stream the Gemini structured JSON tokens back to the UI in real-time, typing out the form fields before the staff's eyes.
- **Persona Lens:** Extremely premium, but over-engineered for a staff tool.
- **Compliance:** Requires standing up a new Cloud Run container, breaking our pure Firebase serverless architecture.
- **Estimated Scope:** Large (10+ files, infrastructure changes).

### Recommendation
**Strategy B** is highly recommended. It leverages the E49 job tracking pattern we *just* stabilized for mobile uploads. It respects network fragility by keeping the 15-second Gemini call entirely server-side, and gives the UI a reliable Firestore listener to update from.

---

## Phase 4 — Anti-Regression Protocol
- [x] No hardcoded hexes in the new Pricing Insight panel.
- [x] Firestore schema updates will be logged properly.
- [x] Client-side AI keys are strictly prohibited.
- [x] AI data is kept out of customer-facing fields until staff explicitly clicks "Accept & Publish".

---

**Next Steps:** Await user approval of Strategy A, B, or C before writing code.
