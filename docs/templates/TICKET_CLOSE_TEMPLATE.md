# Ticket Close Template — [EPIC CODE] · [Epic Name]
**Version:** 1.0 · **Run when all tasks pass verification, before closing the epic.**

---

## Input

```
What we just finished: [Summary of the work completed in this epic]

Files changed:
  - [List key files changed]

New Firestore fields added: [List any new fields or state NONE]
New Cloud Functions added: [List any new functions or state NONE]
New decisions made: [List key architectural decisions to log]
```

---

## Phase 1 — The Four-Point Drift Checklist

### 1. Schema Drift
**Question:** Does `docs/firestore-schema.md` perfectly reflect the current Firestore data model?
> **Expected result:** Schema doc is current — no updates required.

### 2. DECISIONS.md Drift
**Question:** Does `docs/DECISIONS.md` reflect every meaningful architectural choice made?
> **Result:** Log any missing decisions to `docs/DECISIONS.md` before opening PR.

### 3. EPICS.md Drift
**Question:** Are all tasks ticked in `docs/EPICS.md`?
> **Result:** Tick all completed tasks in `docs/EPICS.md` before opening the PR.

### 4. Tech Debt Sweep
- [ ] No `console.log` in any Cloud Function or src file
- [ ] No `// TODO` or `// FIXME` left unaddressed
- [ ] No real API keys or service account JSON committed

---

## Phase 2 — Compliance Verification

| Item | Status |
|---|---|
| Age gate enforced at router level | [PASS / FAIL / NA] |
| Every age gate event logged to `auditLogs` | [PASS / FAIL / NA] |
| No PII in `auditLogs.details`, analytics, or console | [PASS / FAIL / NA] |
| `policeHold: true` hides item from all public queries | [PASS / FAIL / NA] |
| `aiDescription` unreachable from customer-facing views | [PASS / FAIL / NA] |
| `rare-find` / `limited-edition` not auto-applied by code | [PASS / FAIL / NA] |
| No Kanien'kéha generated or hard-coded without review flag | [PASS / FAIL / NA] |
| AI API calls go through Cloud Functions only | [PASS / FAIL / NA] |

---

## Phase 3 — Sync Script

```
docs/EPICS.md:
  - Tick: Phase X > Epic Name > all tasks

docs/ACTIVE_CYCLE.md:
  - Move Epic to completed
  - Update "Next Cycle Preview"
```

---

## Sign-Off
> **TICKET CLOSED.** Drift resolved. Compliance verified. EPICS.md tasks ticked. ACTIVE_CYCLE.md updated. Ready to open PR.
