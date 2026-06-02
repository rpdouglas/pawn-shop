# Pawn Shop Roadmap Summary
*Current State: Cycle 32 (June 2026)*

After our recent cleanup and archival of Phase 1 through Phase 12 completed projects, our roadmap (`EPICS.md`) is now heavily focused on advanced operations, automation, and deep integrations. 

Here is what the immediate horizon and upcoming phases look like:

## 1. Currently Active (Cycle 32)
**E21 · Vitest Unit Testing**
- The team is currently building the testing infrastructure for the codebase.
- Installing Vitest, React Testing Library, and writing tests for core compliance logic (AgeGates, Formats, Buttons) to ensure regression safety.

## 2. Immediate Pending Gates (Pre-Prod QA)
Before deploying to full production, there are several hard compliance and infrastructure gates left over from previous Epics:
- **E03-QA (MFA Verification):** Enforcing the Identity Platform upgrade so staff MFA bypass is strictly impossible.
- **E06-QA (eBay Sync):** Registering production webhooks and API keys with the eBay developer portal.
- **E09-QA (Performance):** Ensuring the current SPA meets Lighthouse scoring baselines.

## 3. Upcoming Major Feature Epics
Once testing and QA are stable, the roadmap moves into advanced functional verticals:

**E28 · Algorithmic Markdown Engine (Dutch Auction)**
- Automating price drops on old inventory (e.g., dropping 5% every 30 days) and sending matching alerts to customers who favourited the items.

**E30 · Gemini Vision Appraisal Engine**
- A high-impact AI feature. Customers upload photos of items they want to pawn, and a Cloud Function uses Gemini 1.5 Pro to visually appraise the item, fetch recent eBay sold comps, and return a real-time value estimate.

**E31 · Pawn Loan Management Portal**
- Digitizing the core business: Allowing customers to view their active pawn loans, check due dates, and request extensions via their authenticated dashboard.

**E32 · Digital Pawn Wallets**
- Generating Apple `.pkpass` and Google Wallet passes for Pawn Loans and Reservations so customers can tap their phones at the shop counter.

## 4. Operational Optimizations
- **E33 · Staff Pick-Path Optimizer:** Helping floor staff locate inventory efficiently.
- **E34 · Cloud Functions Modular Refactor:** Splitting up our monolithic backend into smaller, modular files for faster cold starts.
- **E35 · Store Mode Geo-Fencing:** Altering the app's UI dynamically when the customer is physically standing inside the shop.
- **E36 · Authenticated Trust Ledgers:** Moving high-value watch/jewelry provenance onto an immutable ledger.
- **E37 · Vite SSR:** Refactoring the frontend to use Server-Side Rendering (SSR) to achieve perfect 100/100 Lighthouse performance metrics.
