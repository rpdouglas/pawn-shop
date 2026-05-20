# [Implementation Plan] Antigravity Onboarding & Project Alignment

Welcome to the Antigravity era of The Pawn Shop. This plan outlines the industry best practice steps to get fully operational within this codebase while strictly adhering to the Kanien'kéha-inspired architectural mandates.

## User Review Required

> [!IMPORTANT]
> **Design System Compliance:** `HomePage.tsx` and `UserProfileCircle.tsx` currently contain token violations (hardcoded px, non-existent shadow tokens). I will resolve these as part of the onboarding.
> **Environment Variables:** Automated admin tests require `PLAYWRIGHT_AUTH_EMAIL` and `PLAYWRIGHT_AUTH_PASSWORD`. Please verify these are set in your environment if you wish to run full QA.

## Proposed Changes

### 1. Antigravity Configuration & Guardrails
Establish a persistent context for Antigravity to ensure every future turn respects the `GEMINI.md` mandates without manual re-prompting.

#### [NEW] [mandates.md](file:///workspaces/pawn-shop/.antigravitycli/mandates.md)
*   Create a condensed version of `GEMINI.md` and `firestore-schema.md` for fast reference.
*   Include the "Persona Lens" checklist.

---

### 2. Design System Alignment (Cycle 25 Cleanup)
Resolution of the pending Cycle 25 QA items to synchronize the codebase with the `docs/design-system.md`.

#### [MODIFY] [HomePage.tsx](file:///workspaces/pawn-shop/src/pages/HomePage.tsx)
*   Replace hardcoded `minHeight: '240px'` with `--space-*` or relative units.
*   Replace `fontSize: '2rem'` with `var(--text-heading)`.
*   Replace hardcoded transition speeds with `var(--motion-speed-fast)`.

#### [MODIFY] [UserProfileCircle.tsx](file:///workspaces/pawn-shop/src/components/layout/UserProfileCircle.tsx)
*   Replace `fontSize: '1rem'` with `var(--text-body)`.
*   Fix `boxShadow: 'var(--shadow-lg)'` (non-existent token) with a standard shadow or defined token.
*   Fix `color: 'var(--color-error)'` to `var(--color-danger)`.

---

### 3. Compliance & Security Audit
Verify the age-gate mandates are strictly enforced at the router level.

#### [RESEARCH] [main.tsx](file:///workspaces/pawn-shop/src/main.tsx)
*   Audit `main.tsx` to ensure all `cannabis` and `fireworks` routes are wrapped in `<AgeGate>`.
*   Verify `auditLogs` are triggered on age-gate pass/fail (Mental model check).

---

### 4. Developer Experience (DX)
Ensure the local development environment is "Dapper".

#### [EXECUTE] Environment Check
*   Run `npm install` (if needed).
*   Verify Firebase emulators start.

## Verification Plan

### Automated Tests
*   `npm run lint` — Verify no design system violations (if custom rules exist).
*   `npm run test` — Run existing unit tests.

### Manual Verification
*   Visual inspection of `HomePage` and `UserProfileCircle` in different view modes (Pawn, Cannabis, Fireworks).
*   Check browser console for missing CSS variable warnings.
