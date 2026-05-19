---
name: qa-verification
description: Professional QA engineering workflow for The Pawn Shop. Use when a feature or epic is delivered and requires formal verification against persona constraints, compliance rules, and build health. Executes a 5-part audit: Build Health, Persona Smoke Tests, Compliance Audit, Accessibility Check, and QA Sign-Off.
---

# QA & Verification Skill — The Pawn Shop

This skill provides a systematic workflow for verifying new features and epics against the project's high engineering and compliance standards.

## Workflow Phases

### Part 1 — Build Health
Always start by verifying the codebase is in a stable state.
- **Run:** `npm run build` (Zero TypeScript errors)
- **Run:** `npm run lint` (Zero ESLint warnings or errors)
- **Type Safety Audit:** Ensure no `any` types were introduced. **CRITICAL:** Explicitly check for and reject `as any` casts or `!` non-null assertions during Firestore data handling (e.g., `doc.data()`). Enforce `Record<string, unknown>` and strict `Timestamp` typing.

### Part 2 — Persona Smoke Tests
Execute pass/fail tests for the primary persona of the feature. Refer to `docs/prompts/TESTING.md` for specific criteria for:
- **Makoonsii:** **48px minimum hit areas** on all interactive elements (buttons, radio labels, inputs). Plain language, Kanien'kéha audit.
- **Dale:** Price visibility, condition clarity, stale inventory check.
- **Tanya:** 60-second SMS SLA, specific pickup windows, age gates (18+).
- **Marie:** Discretion audit (no category names in CRM), age gates (19+), auditLog verification.
- **Kevin:** 60-second alert dispatch, CASL opt-in check, policeHold alert prevention.
- **Sandra:** Masonry grid layout, <200ms quick-view speed, live activity privacy audit.
- **Jordan & Marcus:** `aiDescription` firewall, Lighthouse scores, dark luxury photography standard.

### Part 3 — Compliance Audit
Verify `auditLogs` integrity.
- Entries MUST be written via Cloud Function (Admin SDK).
- ZERO PII in `details` maps.
- `eventType` must match `docs/firestore-schema.md`.

### Part 4 — Accessibility Check
- Run `axe-core` in browser.
- Verify focus states, `alt` text, and WCAG AA contrast (4.5:1).

### Part 5 — Design System Verification
Refer to `docs/design-system.md` and `docs/prompts/TESTING.md` Part 5.
- **Tokens:** No hardcoded `px` or hex values.
- **Motion:** Approve timing/patterns; verify <200ms modal speed.
- **Voice:** No prohibited vocabulary; cannabis discretion maintained.

## Reporting

### QA PASSED
If all checks pass:
`QA PASSED. Feature: [name]. Persona: [name]. Build: clean. Compliance: verified. Smoke tests: passed. Design system: verified. Ready for TICKET_CLOSE.md.`

### QA BLOCKED
If any check fails:
`QA BLOCKED. Failures: 1. [Description] - severity: [blocking|non-blocking]`
