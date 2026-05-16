# Read State & Context Alignment — The Pawn Shop
**Version:** 1.0 · **Run BEFORE `PLANNING.md` for any non-trivial feature or complex bug.**

---

## Role

Principal Architect — context verification only. No code, no plans yet.

**Purpose:** Force the AI to prove it has an accurate mental model of the target area before planning begins. An AI that cannot accurately describe the current state of the code will generate a plan that breaks the codebase. This prompt prevents that.

---

## Input

State the target area for the upcoming work:

```
Target area: [e.g., "The age gate system", "E12 saved searches and alert dispatch", "Inventory intake Cloud Function"]
```

---

## Your Task

Do **NOT** generate any code or plans. Provide a "Mental Model Dump" that proves you understand the current state of the system in the target area.

### 1. Schema Check

For each Firestore collection involved in the target area, state:
- The collection path
- Every field relevant to this feature, with its exact type and any important constraints
- Any security rules that govern reads/writes on this collection

Quote directly from `docs/firestore-schema.md`. Do not paraphrase or infer.

```
Collection: items/{id}
Relevant fields:
  - status: string — 'active' | 'reserved' | 'sold' | 'archived'
  - policeHold: boolean — admin-only write. Hides from public immediately.
  - searchTokens: array<string> — prefix tokens from title + category
Security: public read only when status == 'active' AND policeHold != true
```

### 2. Data Flow Check

Explain step-by-step how data moves through the target area:

- What triggers the flow? (User action, Cloud Function, scheduled job, Firestore trigger)
- What reads from Firestore, and with what query?
- What writes to Firestore, and from what context? (client hook / Cloud Function / admin SDK)
- What side effects occur? (auditLog write, alert dispatch, email send, etc.)

### 3. Persona & Compliance Check

State which persona(s) the target area primarily serves and which compliance rules apply:

- Which persona's hard UX constraints govern this area?
- Which `auditLogs` events are written in this flow?
- Are there age gates, police hold checks, or PII exclusion rules that must be respected?

### 4. Dependency Check

List the exact names of:
- React context providers this area depends on (e.g., `ViewContext`, `AuthContext`)
- Custom hooks involved (e.g., `useInventory`, `useSavedSearches`)
- Cloud Functions that are called or triggered
- Firestore security rules that must be updated

### 5. Missing Information Inventory

For any file, hook, or rule you are uncertain about:

> *"I do not have confirmed current contents of `[filepath]`. I need it pasted before I can proceed to planning."*

List every file you need before planning can safely begin.

---

## Output

Provide the Mental Model Dump (sections 1–5), ending with one of:

**A — Confirmed ready:**
> "Mental model verified. All target files confirmed. Ready to proceed to `PLANNING.md`."

**B — Missing context:**
> "Mental model incomplete. I need the following before planning can proceed: [list files]. Please paste them below."

---

## Why This Step Matters

The most common source of regressions in AI-assisted development is a plan built on a stale or hallucinated mental model of the codebase. This prompt creates a forcing function: the AI must demonstrate what it knows before it's trusted to plan.

If the AI cannot accurately describe the current `auditLogs` event types, the `policeHold` write rule, or the exact Firestore path for `savedSearches/{id}`, it will generate a plan that either breaks existing behaviour or introduces a compliance gap. Run this prompt. It takes two minutes and saves hours.

---

*The Pawn Shop · docs/prompts/READ_STATE.md · v1.0*
