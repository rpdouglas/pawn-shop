# E72 Phase 3: Component Coverage & IntakeForm Refactoring Plan

## Background
The `IntakeForm.tsx` component has grown to over 1,000 lines. As part of Phase 3 of E72, we must establish component-level test coverage. Due to the massive size of the form, adding tests directly to the monolithic file will result in fragile, hard-to-maintain tests. We need to define a strategy for component decomposition and hook testing.

## Strategy A: Minimal (Test the Monolith)
- **Approach**: Leave `IntakeForm.tsx` as a single 1,000+ line file. Write high-level integration tests using `@testing-library/react` that mock the API responses and interact with the form fields directly. Test hooks (`useItems`, `useStaffMembers`) using `renderHook`.
- **Schema Audit**: No changes.
- **Compliance Checklist**: High risk of fragile tests breaking when new fields are added.
- **Persona Impact**: Fast to implement, but fails the "Maintainability" requirement for future developers working on the platform.

## Strategy B: Recommended (Strategic Extraction)
- **Approach**: Break `IntakeForm.tsx` into logical, testable sub-components before testing. 
  - Extract the `ImageUploadZone` and AI extraction logic.
  - Extract view-specific field sections (`CannabisFields`, `FireworksFields`, `PawnFields`).
  - Extract the `PricingAndCondition` section.
  - Write focused unit tests for each extracted component and the main shell.
  - Test TanStack Query hooks using `renderHook` and a `QueryClient` wrapper.
- **Schema Audit**: No changes. Relies entirely on existing `Item` typing.
- **Compliance Checklist**: Ensures isolated tests that survive layout changes.
- **Persona Impact**: Strongly aligns with the Architect role by reducing cognitive load and simplifying future domain extensions.

## Strategy C: Robust (Form Library Migration)
- **Approach**: Migrate the entire form state from React `useState` to a dedicated library like `react-hook-form` with `zod` schema validation. Extract all fields into reusable UI components.
- **Schema Audit**: Requires aligning `zod` schemas tightly with `docs/firestore-schema.md`.
- **Compliance Checklist**: Provides runtime safety and perfect validation but requires massive rewriting of the intake flow.
- **Persona Impact**: Highest initial friction. Highly robust but risks delaying E72 completion due to scope creep.
