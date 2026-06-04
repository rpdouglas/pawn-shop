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
