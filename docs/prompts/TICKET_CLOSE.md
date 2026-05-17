# Ticket Close & Drift Detection — The Pawn Shop
**Version:** 1.0 · **Run after QA passes on any feature or bug fix, before opening a PR.**

---

## Role

Senior Technical Writer & Systems Architect. Ensure the map (docs) matches the territory (code) before moving on.

**Rule:** A feature is not done when the code works. It is done when every doc that describes the system reflects the new reality.

---

## Input

```
What we just finished: [one sentence — e.g., "E03 Auth — implemented Firebase Auth email/password + Google SSO with five custom claims"]
Files changed: [list]
New Firestore fields added: [list, or NONE]
New Cloud Functions added: [list, or NONE]
New decisions made: [list, or NONE]
```

---

## Phase 1 — The Four-Point Drift Checklist

Work through each check. For each one that has drift, state what needs to change.

### 1. Schema Drift

**Question:** Does `docs/firestore-schema.md` perfectly reflect the current Firestore data model?

Check:
- Every field written or read in the new code — does it exist in the schema doc with the correct type?
- Any field that was removed or deprecated — is it still in the schema doc (should be removed or marked deprecated)?
- Any map sub-fields (e.g., `aiPriceSuggestion.low`) — are they documented?

> **Result:** Schema doc is current | Schema drift detected — updates required: [list]

### 2. DECISIONS.md Drift

**Question:** Does `docs/DECISIONS.md` reflect every meaningful architectural or technical choice made in this ticket?

A decision worth logging is any choice where a reasonable engineer could have chosen differently and the reasoning isn't obvious from the code.

Examples:
- Chose Cloud Function trigger over scheduled job — why?
- Chose Firestore prefix tokens over Algolia for search — why?
- Chose session-scoped age gate over persistent cookie — why?

Format for new entries:
```
YYYY-MM-DD — [Decision]. [One-sentence reason].
```

> **Result:** DECISIONS.md is current | New entries required: [list decisions]

### 3. EPICS.md Drift

**Question:** Are the tasks completed in this ticket ticked off in `docs/EPICS.md`?

Walk through the relevant epic section. For each task that was completed, confirm it can be marked `[x]`.

> **Result:** EPICS.md is current | Tasks to tick: [list]

### 4. Tech Debt Sweep

**Question:** Did we leave any tech debt footprints in the delivered code?

Check the changed files for:
- [ ] `console.log` statements in production code paths
- [ ] `// TODO` or `// FIXME` comments added during implementation
- [ ] `eslint-disable` comments added to suppress a real issue
- [ ] Commented-out legacy code left behind
- [ ] `any` types introduced and not yet resolved
- [ ] Hardcoded hex values instead of CSS token references
- [ ] Fields referenced in code that aren't in `docs/firestore-schema.md`

> **Result:** Clean | Tech debt found: [list items with file:line references]

---

## Phase 2 — Compliance Verification

Run through the compliance items relevant to this ticket. Flag any that were not addressed.

| Item | Status |
|---|---|
| Age gate enforced at router level (not just component) | Verified / N/A |
| Every age gate event logged to `auditLogs` | Verified / N/A |
| No PII in `auditLogs.details`, analytics, or console | Verified / N/A |
| `policeHold: true` hides item from all public queries | Verified / N/A |
| `aiDescription` unreachable from customer-facing views | Verified / N/A |
| `rare-find` / `limited-edition` not auto-applied by code | Verified / N/A |
| No Kanien'kéha generated or hard-coded without review flag | Verified / N/A |
| AI API calls go through Cloud Functions only | Verified / N/A |
| CASL `alertOptIn` checked before every CRM send | Verified / N/A |

---

## Phase 3 — Sync Script

Based on the drift detected above, list the exact updates needed. These should be applied before opening the PR.

```
UPDATES REQUIRED:

docs/firestore-schema.md:
  - Add field: [collection] / [fieldName] — [type] — [description]
  - Remove field: [collection] / [fieldName] (deprecated in this ticket)

docs/DECISIONS.md:
  - Add: "[YYYY-MM-DD] — [Decision]. [Reason]."

docs/EPICS.md:
  - Tick: Phase [N] > [Epic Name] > "[task text]" → change [ ] to [x]

Tech debt to resolve before PR:
  - [file:line] — [issue]
  - [file:line] — [issue]
```

If there is no drift and no tech debt:
> **CLEAN.** No doc updates required. All compliance items verified. Ready to open PR.

---

## Phase 4 — PR Description Draft

Produce a PR description based on what was delivered:

```markdown
## Summary

- [Bullet: what was built]
- [Bullet: which persona this serves and how]
- [Bullet: compliance items addressed]

## Schema changes
[None | List new or modified fields]

## Decisions logged
[None | List decisions added to DECISIONS.md]

## Test plan
- [ ] npm run build — zero errors
- [ ] npm run lint — zero warnings
- [ ] [Persona-specific smoke test from TESTING.md]
- [ ] Firebase emulator — [specific test]
- [ ] auditLogs — [specific event verified]
```

---

## Phase 5 — Cycle Update

Run this phase whenever an epic closes (all tasks in `docs/EPICS.md` are `[x]`).

### 5.1 Close the current cycle

Update `docs/ACTIVE_CYCLE.md`:
- Move the completed epic's tasks to **Previous Cycle Summary** with completion dates.
- Add `**[EPIC ID] CLOSED**` as the final row. If any task was deferred, note it with the reason.
- Clear **In Progress** and **Completed This Cycle** tables.
- Increment **Cycle** number.
- Set the new **Cycle Goal** to the next epic in `docs/EPICS.md` (next unchecked epic, top to bottom).
- Update **Next Cycle Preview** to the epic after that.

### 5.2 Update the project spec

In `docs/projects/[ID]_[FEATURE].md`, update the **Status** line:
```
**Status:** Done — YYYY-MM-DD
```
If any tasks were deferred, note them:
```
**Status:** Done — YYYY-MM-DD (deferred: [item] — [reason], target: [when])
```

### 5.3 Add a deferred items entry (if applicable)

If any tasks were deferred rather than completed, add them to the **Deferred / Blocked** table in `ACTIVE_CYCLE.md` with a target cycle.

> **Result:** Cycle updated | No epic closed this ticket (skip Phase 5)

---

## Sign-Off

After all applicable phases are complete:

> **TICKET CLOSED.** Drift resolved. Compliance verified. EPICS.md updated. Ready to open PR.

or

> **TICKET BLOCKED.** Unresolved items:
> 1. [item]
> 2. [item]
> Resolve these before opening the PR.

---

*The Pawn Shop · docs/prompts/TICKET_CLOSE.md · v1.0*
