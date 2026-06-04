# Project E65: Frontend Optimizations & Prefetching

**Status:** Closed
**Epic:** E65
**Primary Persona:** Makoonsii, Staff

## Objective
Implement the high and medium priority frontend optimizations discovered during the comprehensive codebase audit to improve memory stability, perceived load times, and test coverage.

## Requirements
- **Hook Stability Audit:** Audit custom hooks (like `useItemSearch`) fetching Firestore data to ensure `useCallback` and `useRef` are used correctly, preventing infinite render loops with IntersectionObservers.
- **Predictive Prefetching:** Implement route preloading on `onMouseEnter` for primary navigation links (Pawn, Cannabis, Admin) to make navigation feel instantaneous.
- **Role-Based E2E Tests:** Add Playwright scenarios that explicitly test the UI permutations and access levels of `manager` vs. `inventory_staff` roles.
