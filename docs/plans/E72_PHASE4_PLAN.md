# E72 Phase 4: Persona-Driven E2E Suites Plan

## Background
Phase 4 requires building automated Playwright E2E tests for the core persona flows (Makoonsii on Pawn, Marie on Cannabis, Tanya on Admin/Intake). Playwright currently tests against the local Firebase Emulator. We must decide how to handle state (data seeding) and code structure for these tests to ensure they are reliable and not flaky.

## Strategy A: Minimal (Flat E2E Tests)
- **Approach**: Write flat Playwright tests that rely on whatever data exists in the current emulator instance, or attempt to click through the UI to create prerequisites.
- **Schema Audit**: No changes.
- **Compliance Checklist**: Fast delivery, but tests may become flaky if the emulator state is dirty.
- **Persona Impact**: Makoonsii and Marie tests might fail if inventory is empty.

## Strategy B: Recommended (Isolated Data Setup)
- **Approach**: Write separate spec files (`pawn.spec.ts`, `cannabis.spec.ts`, `admin.spec.ts`). For each suite, create a test helper that writes directly to the Firestore Emulator (via REST or a helper endpoint) before the test starts to guarantee the exact inventory items needed for the test exist.
- **Schema Audit**: No changes.
- **Compliance Checklist**: High reliability since tests control their own initial state.
- **Persona Impact**: Guarantees a deterministic experience for Makoonsii's click-and-collect and Marie's cannabis browsing. Aligns with the Architect persona.

## Strategy C: Robust (Page Objects & Custom Fixtures)
- **Approach**: Build complete Playwright Page Object Models (POMs) for every screen. Create custom Playwright fixtures that automatically spin up typed, pre-seeded user sessions for every test block.
- **Schema Audit**: No changes.
- **Compliance Checklist**: Enterprise-grade E2E scaling.
- **Persona Impact**: Overkill for the current scale, slowing down E72 delivery, but provides the strongest foundation for massive future expansion.
