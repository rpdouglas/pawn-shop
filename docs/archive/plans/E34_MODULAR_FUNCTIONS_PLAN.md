# E34: Cloud Functions Modular Refactor — 3-Strategy Plan

## Context
We need to modularize our Cloud Functions to reduce deployment times. The current monolithic structure takes too long to deploy and bundles all dependencies together. We must decide how strictly to separate the function codebases in `firebase.json`.

---

## Strategy A: The "Monorepo with Export Groups" Approach (Minimal)
Instead of fully isolating the codebases physically, we keep the single `functions/package.json` and single `functions/src/` structure, but we create separate entry points (`index.inventory.ts`, `index.ai.ts`, etc.). We then map these entry points to different `codebase` identifiers in `firebase.json`.

- **Pros:** 
  - Lowest effort. No need to duplicate `package.json` or manage internal local dependencies.
  - Keeps the file structure mostly as-is.
- **Cons:** 
  - Since all groups share the same `package.json`, they still share all dependencies (e.g., `sharp`, `twilio`, `@google/generative-ai`), meaning the deployed container size isn't reduced, only the deployment *targeting* is improved.
- **Persona Impact:** Developer (Staff) gets faster targeted deploys, but cold start performance doesn't benefit as much.
- **Compliance/Schema Impact:** Zero.

---

## Strategy B: The "Firebase Codebases" Approach (Recommended)
We physically break the `functions/` directory into multiple independent Firebase Codebases (e.g., `functions/inventory/`, `functions/ai/`, `functions/core/`), each with its own `package.json`, `tsconfig.json`, and `src/index.ts`. We use a shared local directory (e.g., `functions/shared/`) for common utilities (like `types.ts`, `db.ts`) and link it using `npm workspaces` or local file dependencies.

- **Pros:** 
  - Maximum deployment speed.
  - Reduces container bloat: The `ai` group only installs `@google/generative-ai`; the `inventory` group only installs `sharp`. This reduces memory usage and cold start times.
  - Best alignment with Firebase's intended "codebases" architecture.
- **Cons:** 
  - Moderate refactoring effort to manage shared dependencies (types, helper functions) via NPM workspaces.
- **Persona Impact:** Developer (Staff) gets instant deploys. Customers (Makoonsii, Marie) get faster cold-starts for isolated functions.
- **Compliance/Schema Impact:** Zero.

---

## Strategy C: The "Microservices / Run" Approach (Robust)
We completely migrate the heaviest Cloud Functions (like AI and image processing) out of Firebase Functions entirely and into Google Cloud Run as containerized microservices. The remaining lightweight functions stay in a single Firebase default codebase.

- **Pros:** 
  - Infinite scalability and custom Docker environments (useful if we need heavy AI/ML libraries later).
  - Keeps the Firebase backend incredibly lightweight.
- **Cons:** 
  - High complexity. Requires writing Dockerfiles, setting up Cloud Build, and managing Cloud Run VPC routing.
  - Overkill for our current state.
- **Persona Impact:** Developer (Staff) assumes a much higher DevOps burden.
- **Compliance/Schema Impact:** High. Authentication and security rules become more complex to manage cross-service.

---

## Recommendation: Strategy B (The "Firebase Codebases" Approach)
Strategy B is the sweet spot. It directly solves the deployment time issue by allowing `firebase deploy --only functions:ai`, while also trimming the fat from the deployed containers so that our core functions don't have to load AI and Image Processing libraries. It leverages Firebase's native codebase feature perfectly.

Please review and approve a strategy, and I will begin the autonomous execution.
