# Developer Deployments

This page is for internal developers managing the platform infrastructure.

## Modular Cloud Functions

To ensure fast deployment times and lightweight serverless containers, The Pawn Shop's Cloud Functions are physically divided into multiple codebases rather than a single monolith.

### The Codebases

1. **Core (`functions/core`)**
   Contains lightweight, rapid-response functions such as authentication, user role management, scheduling, and notifications. This container is completely devoid of heavy ML or image processing dependencies.

2. **Operations (`functions/operations`)**
   Contains heavy-duty workflows including the AI Intake extraction (`@google/generative-ai`), image processing (`sharp`), and eBay synchronization.

3. **Shared (`functions/shared`)**
   A local NPM workspace containing shared utilities (`secrets`, `sms`, `email`, and `authHelpers`). This package is automatically built and packed during deployments.

---

## Deployment Commands

During local development or when deploying hotfixes, you no longer need to wait 5+ minutes for the entire backend to compile and deploy. You can target specific codebases natively using the provided `npm` scripts:

| Command | Action |
|---|---|
| `npm run deploy:fn` | Deploys *all* cloud functions (Core and Operations). Used primarily by CI/CD. |
| `npm run deploy:fn:core` | Builds and deploys only the `core` codebase. Use this when updating Auth, CRM, or notifications. |
| `npm run deploy:fn:operations` | Builds and deploys only the `operations` codebase. Use this when updating AI Prompts or Inventory flows. |

> **Note:** The `firebase.json` automatically triggers `npm run build` in the respective directory via its `predeploy` hook, which also builds the shared workspace dependencies natively.

---

## CI/CD Pipeline

### What runs on every push

Every push to `dev` or `main` automatically runs a fast pipeline:

| Step | Command | Purpose |
|---|---|---|
| Lint | `npm run lint` | Catches style, compliance, and type errors |
| Unit Tests | `npm run test` | Vitest suite — age gates, utilities, components |
| Build | `npm run build` | Full Vite + TypeScript compile |
| Deploy | Firebase Hosting | Publishes to `nats-rack` (dev environment) |

This pipeline completes in approximately **3 minutes**.

### Accessibility, E2E, and Lighthouse

These suites require Playwright and the Firebase Emulator Suite — they are **not** part of the push pipeline. Run them before merging large features or before a production release.

**Locally:**

```bash
# Full Playwright E2E + accessibility suite
npm run test:e2e

# axe-core accessibility spec only
npm run test:a11y

# Lighthouse performance audit
npm run test:lhci
```

**Via GitHub Actions (no local setup required):**

Go to **GitHub → Actions → E2E, Accessibility & Lighthouse → Run workflow**.

This triggers the full suite in CI using the same environment as the automated weekly run (every Sunday at 03:00 UTC).

See `docs/TESTING.md` for the full guide on when to run each suite.
