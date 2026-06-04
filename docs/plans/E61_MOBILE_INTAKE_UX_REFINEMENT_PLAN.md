# Implementation Plan: E61 Mobile Intake UX Refinement

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona
- **Primary persona:** Staff (Inventory operations on mobile devices).
- **Secondary personas:** N/A.

### 1.2 Compliance Gate
- [x] Age gate required? N/A
- [x] `auditLogs` event defined? N/A
- [x] PII excluded from all logs and analytics? N/A
- [x] `policeHold` logic respected? N/A
- [x] `aiDescription` kept separate from `description`? N/A
- [x] All AI API calls going through Cloud Functions? N/A

## Phase 2 — Schema Audit
Collections impacted: NONE
New fields required: NONE

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimal Form Swap
**Summary:** Move the title input from Step 1 to Step 2 and update the validation on the "Next" button.
**Architecture:** 
- Modified `MobileIntakePage.tsx`.
**Persona Lens:** Fixes the core issue where the title can't be reviewed, but leaves the user guessing when the AI analysis is actually finished.
**Compliance:** N/A
**Trade-offs:** Fast to implement, but suboptimal UX during the waiting period.
**Estimated scope:** Small — 1 file.

### Strategy B — Integrated Loading State with Cycling Fun Messages (Recommended)
**Summary:** Move the title to Step 2, update validation, and introduce an interactive loading indicator on Step 1 that cycles through playful, brand-appropriate status messages (e.g., "Analyzing image...", "Researching regular price...", "Checking the bargain bin...", "Guesstimating value...") every 3 seconds until the `internal/ai` Firestore document is received, at which point it automatically advances to Step 2.
**Architecture:**
- Modified `MobileIntakePage.tsx`.
- Utilizes the existing real-time listener for `internal/ai` to trigger the step advance.
- Adds a `useEffect` interval to cycle through a static array of status messages while the image is processing.
**Persona Lens:** Provides immediate, engaging feedback to staff that the app is working, making the wait time feel shorter and adding a bit of delight to the daily workflow.
**Compliance:** The messages must remain plain language and brand appropriate, avoiding any "cheap" or "junk" terminology (e.g., "Checking the bargain bin..." is okay, but "Looking for junk" is not per Brand Voice Trap).
**Trade-offs:** Best UX, requires a small `useEffect` timer for the cycling strings.
**Estimated scope:** Small — 1 file.

### Strategy C — Dedicated Analysis Interstitial Step
**Summary:** Introduce a brand new step `step === 'analyzing'` that takes over the entire screen with a large spinner and progress text between capture and details.
**Architecture:** 
- Modified `MobileIntakePage.tsx` with a new `Step` type enum.
**Persona Lens:** Very explicit, but adds an unnecessary click/transition to a flow that needs to be as fast as possible.
**Compliance:** N/A
**Trade-offs:** High clarity, but disrupts the flow unnecessarily.
**Estimated scope:** Medium — 1 file.

## Phase 4 — Anti-Regression Protocol
1. **The Hardcoded Hex Trap:** N/A - relying on existing `.view-*` classes.
2. **The Firestore Field Invention Trap:** N/A.
3. **The Client-Side AI Key Trap:** N/A.
4. **The Scarcity Manufacture Trap:** N/A.
5. **The PII Log Trap:** N/A.
6. **The Age Gate Bypass Trap:** N/A.
7. **The Motion Trap:** N/A.
8. **The Typography Scale Trap:** N/A.
9. **The Brand Voice Trap:** N/A.
