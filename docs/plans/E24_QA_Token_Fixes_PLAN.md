# Feature Plan: Cycle 24 QA Token Fixes

This plan details the implementation strategies for the Cycle 24 QA Token Fixes feature, aligned to Cycle 24 QA — Design Token & WCAG Fixes.

## User Review Required

> [!IMPORTANT]
> The `HomePage.tsx` component mentioned in `EPICS.md` has already been refactored to use `PortalLayout` and `PortalCard` which do not contain the hardcoded `1200px`, `240px`, or `2rem` values inline. We will assume the `HomePage.tsx` task is mostly resolved, but we will ensure `UserProfileCircle.tsx` and `NavigationDrawer.tsx` are fully tokenized.

## Open Questions

> [!WARNING]
> None at this time. 

---

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona
*   **Primary Persona:** Jordan (The Lifestyle Connoisseur)
*   **Secondary Persona:** Makoonsii
*   **UX Constraints Check:** Confirm alignment with the acceptance criteria defined in [E24_QA_Token_Fixes.md](file:///workspaces/pawn-shop/docs/projects/E24_QA_Token_Fixes.md). No hardcoded pixel/rem values, and WCAG AA contrast passes.

### 1.2 Compliance Gate

- **Age gate required?** — No
- **`auditLogs` events:** NONE
- **PII exclusion:** Confirmed
- **`policeHold` compliance:** NONE
- **`aiDescription` isolation:** NONE

---

## Phase 2 — Schema Audit

```
Collections impacted:
NONE

New fields required: NONE
```

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimalist Approach

**Summary:** Targeted replacement of exactly the tokens requested without wider refactoring.

*   **Architecture:**
    *   `src/components/layout/UserProfileCircle.tsx`: Replace `48px` with `--space-12`, `200px` with a custom inline calc or standard token, `1rem` with `--text-body`.
    *   `src/components/layout/NavigationDrawer.tsx`: Replace `color: var(--color-primary)` with `color: var(--color-text-muted)`.
*   **Persona Lens:**
    *   Serves Jordan by restoring token fidelity. Serves Makoonsii by fixing contrast.
*   **Compliance:** N/A
*   **Trade-offs:**
    *   *Gains:* Fast and low risk.
    *   *Sacrifices:* Doesn't audit the rest of the application for similar issues.
*   **Estimated scope:** Small — 2 components

---

### Strategy B — Recommended Balanced Approach

**Summary:** Token replacement for `UserProfileCircle.tsx` and `NavigationDrawer.tsx`, plus a quick verification pass to ensure no other hardcoded values slipped into related layout components.

*   **Architecture:**
    *   Same fixes as Strategy A for `UserProfileCircle` and `NavigationDrawer`.
    *   Convert `minWidth: '200px'` in `UserProfileCircle` to `minWidth: '16rem'` or an equivalent spacing variable (or update CSS tokens if a dropdown width token is missing).
    *   Run `npm run test:a11y` locally to guarantee zero violations.
*   **Persona Lens:**
    *   Meets Jordan and Makoonsii's exact requirements.
*   **Compliance:** N/A
*   **Trade-offs:**
    *   *Gains:* Confirms the fix actually passes the axe-core scan.
    *   *Sacrifices:* Minor extra testing time.
*   **Estimated scope:** Small — 2 components

---

### Strategy C — Robust Scale Approach

**Summary:** Full audit of all files in `src/` to remove any remaining `px`/`rem` inline styles and enforce a strict ESLint rule against inline pixels.

*   **Architecture:**
    *   Same fixes as Strategy B.
    *   Add an ESLint plugin/rule to block hardcoded `px` strings in React style props.
*   **Persona Lens:**
    *   Highest strictness for Jordan.
*   **Compliance:** N/A
*   **Trade-offs:**
    *   *Gains:* Prevents future regressions completely.
    *   *Sacrifices:* High setup cost for linting rules and potentially a massive refactor scope.
*   **Estimated scope:** Large — Many components and config changes.

---

### Recommendation

**Strategy B** is recommended. It directly addresses the Cycle 24 QA acceptance criteria, fixes the known contrast and hardcoded value issues, and verifies the axe-core scan passes, without inflating the scope into a sweeping codebase linting refactor.

---

## Phase 4 — Anti-Regression Protocol

1.  **The Hardcoded Hex Trap:** All fixes will use `var(--color-text-muted)` and spacing tokens. No hex added.
2.  **The Firestore Field Invention Trap:** N/A.
3.  **The Client-Side AI Key Trap:** N/A.
4.  **The Scarcity Manufacture Trap:** N/A.
5.  **The PII Log Trap:** N/A.
6.  **The Motion Trap:** N/A.
7.  **The Typography Scale Trap:** `1rem` becomes `var(--text-body)`.

---

## Phase 5 — Output & Storage

The full plan is saved to this file: `docs/plans/E24_QA_Token_Fixes_PLAN.md`.

*The Pawn Shop · docs/plans/E24_QA_Token_Fixes_PLAN.md · v1.0*
