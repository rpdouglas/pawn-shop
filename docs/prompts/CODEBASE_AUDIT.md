# Codebase & Documentation Audit — The Pawn Shop
**Version:** 1.0 · **Run when onboarding a new AI session to an existing codebase, or after a long gap between sessions.**

---

## Role

Principal Architect — deep ingestion and gap analysis only. No code changes.

**Purpose:** Build a verified mental model of the current codebase, then compare it against the docs to identify drift. Produce a gap report. Do not fix anything during this pass — get approval first.

---

## Phase 1 — Codebase Ingestion

### 1.1 Architecture Trace

Start from the app entry points and trace the key paths:

**Entry:**
- `index.html` → `src/main.tsx` → `src/App.tsx`
- How are routes structured? What wraps them? (`ViewContext`? `AuthContext`? `ProtectedRoute`?)

**View routing:**
- How does the app determine which view is active (`/pawn`, `/cannabis`, `/fireworks`)?
- Where does the `.view-pawn` / `.view-cannabis` / `.view-fireworks` CSS class get applied to the root element?
- Where are the age gates implemented? Are they at the router level or component level?

**Auth:**
- How does `AuthContext` provide role data?
- Where are custom claims (`admin`, `manager`, `inventory_staff`, `marketing_staff`, `customer`) checked?
- Where is MFA enforced for staff?

**AI pipeline:**
- Where are Cloud Functions that call Gemini? List function names and their triggers.
- Confirm: are any AI API keys present in `src/`? (They must not be.)
- Where is `aiDescription` written, and what prevents it from reaching customer-facing views?

### 1.2 Feature Map

For each major feature area, identify:
- The React component(s) responsible for the UI
- The hook(s) managing data
- The Firestore collection(s) it reads/writes
- The Cloud Function(s) involved (if any)
- The security rules that govern it

Map these areas:
1. Inventory browse (public)
2. Item detail page
3. Pawn request form
4. Age gate (cannabis + fireworks)
5. Staff inventory intake
6. AI description generation (E18)
7. Saved searches + alert dispatch (E12)
8. Click-and-collect / reservations (E08)
9. Auth + MFA (E03)
10. Admin role management

### 1.3 Firestore Rules Audit

Read `firestore.rules`. For each collection in `docs/firestore-schema.md`, confirm:
- Is there a rule for this collection?
- Does the public read rule include `status == 'active' && policeHold != true` on `items`?
- Is `auditLogs` write-only for the client (no update, no delete)?
- Are staff-only fields (`policeHold`, `rare-find`, `limited-edition`) protected from customer writes?

---

## Phase 2 — Documentation Comparison

### 2.1 Schema Drift

Compare `docs/firestore-schema.md` against the actual Firestore writes found in `src/` and `/functions/`:

For each collection:
- Are all fields in the code present in the schema doc?
- Are all fields in the schema doc still used in the code (or should they be marked deprecated)?
- Are sub-fields of map types documented? (e.g., `aiPriceSuggestion.low`, `aiPriceSuggestion.source`)

### 2.2 CONTEXT.md Drift

Does `docs/CONTEXT.md` accurately describe:
- The current stack versions?
- The current Firestore collections? (Compare against the schema doc)
- The current role names?
- The compliance rules as implemented?

### 2.3 EPICS.md Drift

Does `docs/EPICS.md` reflect the current state of work?

- Tasks that are actually complete but marked `[ ]`
- Tasks that are in progress but have no tracking indication
- Epics whose dependencies have changed (a later epic now unblocked by earlier work)

### 2.4 PERSONAS.md Drift

Does `docs/PERSONAS.md` match how the platform actually serves each persona?

Flag any persona whose primary epic has been significantly built or changed since PERSONAS.md was last updated — their UX constraint rules may need updating to reflect the real system.

---

## Phase 3 — Gap Report

Produce a structured report. **Do not make changes.** Present findings and wait for approval.

### Format

```
## Gap Report — The Pawn Shop Codebase Audit
Date: [YYYY-MM-DD]

### 1. Schema Drift
| Collection | Field | Issue | Severity |
|---|---|---|---|
| items | [fieldName] | In code but not in schema doc | High |
| users | [fieldName] | In schema but not found in code | Low |

### 2. Architecture Gaps
- [Gap: e.g., "Age gate on /cannabis is implemented at component level, not router level — compliance risk"]
- [Gap: e.g., "AI API key found in src/lib/gemini.ts — must move to Cloud Function"]

### 3. Documentation Gaps
- [Gap: e.g., "E03 Auth tasks are complete in code but not ticked in EPICS.md"]
- [Gap: e.g., "DECISIONS.md missing entry for Firestore prefix search decision"]

### 4. Compliance Gaps
- [Gap: e.g., "auditLogs write for age_gate_fail not found in cannabis route handler"]

### 5. Tech Debt Inventory
- [file:line] — [issue] — [severity: blocking | non-blocking]

### Recommended Priorities
1. [Highest severity gap]
2. [Second priority]
3. [Third priority]
```

### Sign-Off

> **AUDIT COMPLETE.** Gap report delivered above. No changes made.
> Awaiting approval on which gaps to address and in what order.

---

*The Pawn Shop · docs/prompts/CODEBASE_AUDIT.md · v1.0*
