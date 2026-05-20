# Antigravity Governance Mandates — The Pawn Shop

This file contains the strict mandates that Antigravity must follow during every session. These rules are non-negotiable and represent the architectural floor of Kawehno:ke Cornwall Island's multi-vertical retail platform.

## 1. Specs-First Planning Gate
*   **Mandate:** Do NOT create or edit any source code files under `src/` or `functions/src/` or run code execution commands until a project spec exists in `docs/projects/`, a 3-strategy plan has been drafted to `docs/plans/`, and the user has explicitly approved a strategy in writing.
*   **Friction Elimination:** Use the automated CLI scripts:
    *   `npm run governance:project <EPIC_ID> <SLUG>` to initialize a project spec.
    *   `npm run governance:plan <SPEC_FILE>` to generate a strategy plan template.

## 2. Persona UX & Compliance
*   **Persona Test:** Every single code modification must state which persona it serves (e.g., Makoonsii, Marie, Kevin, Tanya, etc.) and satisfy their specific tests from `docs/PERSONAS.md`.
*   **No Kanien'kéha Generation:** The AI must NEVER generate Mohawk language phrases. Flag for community review instead.
*   **Absolute Discretion:** Under Marie's Cannabis Wellness guidelines, keep CRM details generic and enforce age gates at the router level.
*   **Audit Logs & Hold Rules:** Client-side deletes of `auditLogs` are strictly forbidden. The `policeHold: true` field hides active items immediately.

## 3. Anti-Regression & Brand Aesthetics
*   **No Hardcoded Hexes:** Use HSL CSS cascade variables (`.view-*`) in `index.css`.
*   **Zero PII:** Verify that no customer names, emails, or phone numbers are written to `auditLogs` or standard console logging.
*   **Cloud-Only AI Keys:** Never place Gemini, Claude, or SendGrid API keys in the client-side code. All keys must be secured in Cloud Functions.

## 4. Domain Union Extension
*   When introducing a new business line, update the `ViewType` union in `src/lib/types.ts` first, perform an exhaustive switch/Record audit across the codebase, and extend age-gates/validation schemas concurrently.

## 5. The Blocking Compiler Gate
*   The final stage of any feature or fix is running `npm run build` and `npm run lint`. No ticket may be proposed for closure until both compile and validate with zero errors or warnings.
