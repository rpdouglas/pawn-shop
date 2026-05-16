# Execution Prompt — The Pawn Shop
**Version:** 1.0 · **Run ONLY after a plan from `PLANNING.md` has been reviewed and approved.**

---

## Pre-Execution Gate

Before writing a single line of code, complete this checklist. If any item fails, stop and resolve it first.

### Gate 1 — Plan Approval Confirmed

State which strategy was approved (A, B, or C) and summarise what it involves in one sentence.

> "Strategy B was approved: [one sentence summary]."

### Gate 2 — File Verification (The Read Gate)

For every file you intend to modify:

- Read its current contents now, in this session, using the available tool.
- Do **not** rely on prior session memory or a codebase dump from an earlier conversation.
- If a file cannot be read, stop and request it before proceeding.

Reply format for each file:
> "Read `[filepath]` — [N] lines. Key interfaces/functions noted: [brief summary]."

If you cannot confirm the current contents of a file you plan to modify:
> *"I need the exact current contents of `[filename]`. Please paste it below before I proceed."*

### Gate 3 — Scope Lock

State the exact list of files that will be created or modified. Do not touch files outside this list without explicit approval.

```
Files to CREATE:
- src/components/[name].tsx
- functions/src/[name].ts

Files to MODIFY:
- src/[file].tsx — adding [specific change]
- firestore.rules — adding [specific rule]
- docs/firestore-schema.md — adding [new fields if any]
- docs/DECISIONS.md — logging [decision]
```

---

## Execution Protocol

### Code Quality Rules (enforced on every file)

- **No `any` types.** Use specific interfaces from `src/lib/types.ts` or `unknown`. If a type is needed and doesn't exist, define it first.
- **No hardcoded hex values.** Use `var(--color-primary)` and `.view-*` CSS classes.
- **No unused imports.** Remove them before delivering.
- **No unused variables.** Prefix intentionally unused args with `_`.
- **Prices in CAD cents (integer).** Never floating-point arithmetic on prices.
- **Dates:** Firestore returns `Timestamp`. UI expects JS `Date`. State explicitly where `toDate()` conversion occurs.
- **No console.log** in production code paths.

### Compliance Execution Checks

For every compliance-sensitive item in the approved plan:

- [ ] Age gate implemented at **router level**, not component level
- [ ] `auditLogs` write implemented via Cloud Function (Firebase Admin SDK), not client-side
- [ ] No PII in any `auditLogs.details`, analytics event, or error log
- [ ] `policeHold: true` check included in any public-read Firestore query
- [ ] `aiDescription` write goes to draft field only — no path to `description` without explicit staff action
- [ ] AI Cloud Function includes staff-role auth check before calling Gemini API

### Delivery Format

For each file:
1. State the file path
2. State what changed and why (one line)
3. Provide the complete, correctly typed implementation

Do not provide diffs or partial snippets for new files. Provide the full file.
For modifications to existing files, provide the specific changed section with enough surrounding context to locate it precisely.

---

## Post-Execution Checklist

After all code is delivered, confirm each item:

- [ ] All new Firestore fields added to `docs/firestore-schema.md`
- [ ] Any new architectural decisions logged in `docs/DECISIONS.md` with today's date
- [ ] Relevant task in `docs/EPICS.md` can be ticked
- [ ] `firestore.rules` updated if new collections or write conditions were added
- [ ] `firestore.indexes.json` updated if new queries require composite indexes
- [ ] No files were modified outside the approved scope list

If any post-execution item cannot be confirmed, flag it explicitly:
> *"UNRESOLVED: `docs/DECISIONS.md` needs a new entry for [decision]. Please add: `[date] — [decision]. [reason].`"*

---

## Hand-off

End your delivery with:

> **Ready for QA.** Run `TESTING.md` to verify. Suggested smoke tests: [list 2–3 specific tests relevant to the feature and primary persona].
> Run `TICKET_CLOSE.md` after QA passes.

---

*The Pawn Shop · docs/prompts/APPROVAL.md · v1.0*
