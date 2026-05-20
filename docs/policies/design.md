# Design System & UX Policy — The Pawn Shop

This policy defines the visual and interaction standards for the "Dapper & Debonair" brand.

## 1. Token Integrity
*   **Mandate:** Zero hardcoded hex, rem, px, or ms values in UI components.
*   **Enforcement:** All values must reference Tailwind v4 CSS variables (e.g., `var(--color-primary)`, `var(--space-4)`, `var(--text-body)`).

## 2. View-Scoped Theming
*   **Mandate:** Theming must be handled by the `.view-*` CSS class on the root container.
*   **Enforcement:** Never use JavaScript conditionals for primary brand colors. Use the CSS cascade.

## 3. Motion & Animation
*   **Mandate:** Only approved motion patterns from `docs/design-system.md §4` are permitted.
*   **Approved:** Slow fade, cinematic reveal, ambient glow, smooth hover, staggered grid, quick-view open.
*   **Forbidden:** Bounce, particle effects, constant micro-animations, slide-in-from-sides.

## 4. Typography
*   **Mandate:** Display fonts (`--font-display`) for headings; Body fonts (`--font-body`) for copy.
*   **Accessibility:** Touch targets must be ≥ 48px for the **Makoonsii** persona.

---
*The Pawn Shop · docs/policies/design.md · v1.0*
