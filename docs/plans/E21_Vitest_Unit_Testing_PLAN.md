# Implementation Plan — E21 · Vitest Unit Testing Framework

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona
- **Primary persona:** **Developer (Staff)**. They need a fast, reliable, and integrated way to verify code correctness without manual browser testing.
- **Secondary personas:** **Marie (Compliance)**. Automated tests ensure that critical compliance logic (e.g., age gates, PII filters) remains intact during future refactors.

### 1.2 Compliance Gate
- [x] **Age gate required?** No (infrastructure).
- [x] **`auditLogs` event defined?** No.
- [x] **PII excluded from all logs and analytics?** Yes.
- [x] **`policeHold` logic respected?** N/A.
- [x] **`aiDescription` kept separate?** N/A.
- [x] **All AI API calls go through Cloud Functions?** Yes.

---

## Phase 2 — Schema Audit

**Collections impacted:** NONE.

**New fields required:** NONE.

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimal (Basic Vitest)
**Summary:** Install Vitest and configure it to run simple utility tests.
- **Architecture:** `vitest` as runner, no DOM simulation.
- **Estimated scope:** Small — 2 files (`package.json`, `vite.config.ts`).

### Strategy B — Recommended (Full React Testing Suite)
**Summary:** Implement Vitest with `jsdom` and React Testing Library for comprehensive component and hook testing.
- **Architecture:** Vitest + jsdom + @testing-library/react.
- **Setup:** `src/setupTests.ts` for DOM matchers.
- **Estimated scope:** Medium — 4 files (`package.json`, `vite.config.ts`, `src/setupTests.ts`, `src/components/ui/Button.test.tsx`).

### Strategy C — Robust (Testing + Coverage + E2E Placeholder)
**Summary:** Strategy B plus code coverage reporting and Playwright scaffolding for future E2E tests.
- **Architecture:** Strategy B + `v8` coverage + Playwright.
- **Estimated scope:** Large — 6+ files.

---

## Phase 4 — Anti-Regression Protocol

1. **The Hardcoded Hex Trap:** N/A.
2. **The Firestore Field Invention Trap:** Verified against schema.
3. **The Client-Side AI Key Trap:** N/A.
4. **The Scarcity Manufacture Trap:** N/A.
5. **The PII Log Trap:** N/A.
6. **The Age Gate Bypass Trap:** Testing suite will include a test for `AgeGate.tsx` logic.
7. **The Motion Trap:** N/A.
8. **The Typography Scale Trap:** N/A.
9. **The Brand Voice Trap:** N/A.

---

## Recommendation

I recommend **Strategy B**. It provides the necessary environment to test both logic (`src/lib/format.ts`) and UI components (`src/components/ui/Button.tsx`) using the same build pipeline as the main app. It avoids the overhead of coverage/E2E until the project scales further.

---
*The Pawn Shop · docs/plans/E21_Vitest_Unit_Testing_PLAN.md · v1.1*
