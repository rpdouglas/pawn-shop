# Feature Plan: Pawn Page Multiple Views

This plan details the implementation strategies for the Pawn Page Multiple Views feature, aligned to E59 — Pawn Page Experience Enhancement.

## User Review Required

> [!IMPORTANT]
> Please review the three strategies below and let me know which one you prefer to proceed with. Strategy B is recommended for the best balance of UX and maintainability.

## Open Questions

> [!WARNING]
> None at this time.

---

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona
*   **Primary Persona:** Sandra
*   **UX Constraints Check:** Confirm alignment with the acceptance criteria defined in [E59_PAWN_MULTIPLE_VIEWS.md](file:///workspaces/pawn-shop/docs/projects/E59_PAWN_MULTIPLE_VIEWS.md).

### 1.2 Compliance Gate

State how the compliance requirements are met:
- **Age gate required?** (cannabis 19+, fireworks 18+) — NONE (Pawn is not age-gated by default, though some specific items might be, relying on existing logic)
- **`auditLogs` events:** NONE
- **PII exclusion:** Confirmed zero customer data escapes into logs.
- **`policeHold` compliance:** Confirmed via existing `useItemSearch` hook.
- **`aiDescription` isolation:** Confirmed, no internal fields exposed to UI.

---

## Phase 2 — Schema Audit

List all Firestore collections, security rules, and schemas involved.

```
Collections impacted:
- None. This is purely a UI state management and rendering update.

New fields required: NONE
```

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimalist Approach

**Summary:** Add a simple toggle button directly to `PawnPage.tsx` that switches between the existing `MasonryGrid` and a simple vertical flex list.

*   **Architecture:**
    *   Logic lives entirely in `PawnPage.tsx` state (`[isListMode, setIsListMode]`).
    *   No Firestore operations required.
*   **Persona Lens:**
    *   Serves Sandra by allowing a quick switch to a denser, list-based view, but lacks the polished multi-layout system seen on Cannabis.
*   **Compliance:**
    *   Satisfies all compliance gates natively.
*   **Trade-offs:**
    *   *Gains:* Extremely fast to implement.
    *   *Sacrifices:* Duplicates some logic, hardcoded specifically for Pawn, lacks "grid3" or "magazine" options.
*   **Estimated scope:** Small — [1 file modified]

---

### Strategy B — Recommended Balanced Approach

**Summary:** Abstract the Cannabis `LayoutToggle` into a shared UI component and introduce `layoutMode` state to `PawnPage.tsx`, allowing toggling between `masonry` (default), `grid3`, and `list` modes.

*   **Architecture:**
    *   Move `LayoutToggle` to `src/components/ui/LayoutToggle.tsx`.
    *   Update `PawnPage` to store `layoutMode` state.
    *   Depending on state, render either `MasonryGrid` or a standard mapped list of `LuxuryProductCard`s.
*   **Persona Lens:**
    *   Best alignment with Sandra's UX requirements. Provides a unified, premium feel consistent with the Cannabis page while preserving the unique "Masonry" default of the Pawn experience.
*   **Compliance:**
    *   Rigorous integration of all compliance checks.
*   **Trade-offs:**
    *   *Gains:* Code reuse (LayoutToggle), consistent cross-vertical UX, maintains Masonry layout option.
    *   *Sacrifices:* Slight increase in `PawnPage` rendering complexity.
*   **Estimated scope:** Medium — [3 files created/modified]

---

### Strategy C — Robust Scale Approach

**Summary:** Build a unified `UniversalProductGrid` component that consumes any item array and handles filtering, sorting, pagination, and multi-layout rendering across all verticals.

*   **Architecture:**
    *   Create a massive `UniversalProductGrid` component.
    *   Refactor both `CannabisPage` and `PawnPage` to use this new component instead of their bespoke implementations.
*   **Persona Lens:**
    *   Provides Sandra with exactly identical UI controls on all pages.
*   **Compliance:**
    *   Standardized compliance across the entire app via one component.
*   **Trade-offs:**
    *   *Gains:* Ultimate scalability, single source of truth for grid rendering.
    *   *Sacrifices:* High complexity, requires refactoring the currently stable Cannabis page, overkill for just adding a toggle to Pawn.
*   **Estimated scope:** Large — [8+ files created/modified]

---

### Recommendation

**Strategy B** is recommended. It abstracts the `LayoutToggle` for code reuse, brings the Pawn page's UX parity up to the Cannabis page, and preserves the unique Masonry view without requiring a massive, risky refactor of existing stable pages.

---

## Phase 4 — Anti-Regression Protocol

Verify against Pawn Shop active guardrails:
1.  **The Hardcoded Hex Trap:** All colours must use `var(--color-primary)` and `.view-*` cascade variables.
2.  **The Firestore Field Invention Trap:** Verify all field additions are logged in `docs/firestore-schema.md` before execution.
3.  **The Client-Side AI Key Trap:** Ensure all AI operations run inside Cloud Functions.
4.  **The Scarcity Manufacture Trap:** Check that all countdowns or tags are campaign-date or staff-bound only.
5.  **The PII Log Trap:** Double check that no customer data escapes to console or `auditLogs`.
6.  **The Motion Trap:** Confirm animations use `--motion-speed-*` tokens and approved visual patterns.

---

## Phase 5 — Output & Storage

The full plan is saved to this file: `docs/plans/E59_Pawn_Page_Multiple_Views_PLAN.md`.

*The Pawn Shop · docs/plans/E59_Pawn_Page_Multiple_Views_PLAN.md · v1.0*
