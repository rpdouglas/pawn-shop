# Potential Features & Recommendations

This document compiles all recommendations and suggestions for new features, architectural improvements, and tooling enhancements extracted from past strategic analyses and audit reports that are **not** currently implemented or actively planned in `EPICS.md`.

## Product & User Experience Features

### 1. "Store Mode" Geo-Fencing
- **Concept:** The application detects when a user is physically inside the shop and flips the global header to a camera-first Barcode/QR Scanner.
- **Impact:** Customers can scan physical tags on items in the store to instantly pull up high-res photos, hidden condition reports, and AI provenance notes on their own devices.

### 2. Authenticated Trust Ledgers
- **Concept:** Implement cryptographic hashing of staff provenance data and item serial numbers to generate a "Verified Provenance" badge.
- **Impact:** Provides immense psychological trust for high-ticket buyers (e.g., Jordan persona) when purchasing luxury watches, jewelry, or rare collectibles.

## Architecture & Tooling Improvements

### 3. Storybook Implementation
- **Concept:** Introduce Storybook 8 alongside the Vite builder for component-driven development.
- **Impact:** 
  - Prevents visual regressions via snapshot testing.
  - Allows side-by-side theme testing for Pawn, Cannabis, Fireworks, and Tobacco without navigating the live app.
  - Enables simulated multi-role testing (Guest vs. Staff vs. Admin) in isolation.
  - Significantly improves accessibility QA by integrating axe-core directly into component stories.

### 4. Server-Side Native Retry Policy
- **Concept:** Refactor the mobile intake image processing retry logic (currently handled by client-side `setTimeout` loops) to rely entirely on Google Cloud Functions' built-in failure policies (`failurePolicy: true` or v2 equivalent).
- **Impact:** Results in cleaner client code, reduces arbitrary client timeouts, and leverages GCP exponential backoff for true resilience against transient OOM crashes or network drops.

## AI Governance & Automation Subagents

*The following specialized AI subagents were recommended to enforce our strict "Docs-as-Code" governance model automatically:*

### 5. Linguistic & Cultural Reviewer (`Linguistic_Auditor`)
- **Role:** Scans all proposed UI copy, articles, and documentation specifically for Kanien'kéha content. If found, it flags the file for "Manual Community Review" and blocks the PR until a human sign-off is logged in `DECISIONS.md`.

### 6. Data & State Steward (`Data_Steward`)
- **Role:** Manages the consistency of Firebase emulator data exports (`emulator-data`). Ensures that new features have corresponding "Seed Sets" and verifies that `export-on-exit` functions correctly so local environments don't drift.

### 7. Performance & Bundle Engineer (`Performance_Engineer`)
- **Role:** Monitors the bundle impact of new dependencies. Automatically runs `npm run test:lhci` and compares results against the previous cycle's baseline to block performance regressions before they reach the compliance gate.

### 8. Merchandising & Urgency Auditor (`Brand_Auditor`)
- **Role:** Audits any logic involving `items` collection writes to guarantee that `merchandisingTags` (like `rare-find`) are only modified by staff-driven functions, strictly preventing accidental algorithmic dark patterns or manufactured urgency.
