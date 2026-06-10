# Epic E34: Cloud Functions Modular Refactor

## 1. Business Objective
Currently, all 30+ Cloud Functions are exported from a single monolithic `functions/src/index.ts` file and deployed as a single "default" codebase. As the platform has grown, this results in extended deployment times (5+ minutes) and a large blast radius. Even a minor copy change to an AI prompt requires a full bundling and deployment of the entire backend.
The objective is to group Cloud Functions by business domain and configure Firebase to deploy them as independent modular codebases, significantly reducing deployment time and CI/CD blast radius.

## 2. Current State
- `functions/src/index.ts` exports 24 individual modules.
- `firebase.json` defines a single functions codebase: `"codebase": "default"`.
- `deploy:fn` script deploys all functions simultaneously.

## 3. Target State
- Functions are organized into logical groups (e.g., `inventory`, `crm`, `ecommerce`, `ai`, `core`).
- `firebase.json` defines multiple `codebase` entries mapped to these groups.
- Deployment scripts in `package.json` support targeted deployments (e.g., `npm run deploy:fn:ai`).
- GitHub Actions workflows are updated to support targeted deployments.

## 4. Key Constraints & Persona Impact
- **Developer/Staff:** Deployment times must drop significantly. The developer experience should be seamless.
- **Compliance:** Refactoring must not alter the existing CF logic or names. The emulator suite must pass regression tests before shipping.
- **Architecture:** Must remain compatible with Firebase v2 concurrent instances.
