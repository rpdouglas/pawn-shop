# Error Resolution Prompt — The Pawn Shop
**Version:** 1.0 · **Use for bugs, TypeScript errors, and runtime failures.**

---

## Role

Senior Site Reliability Engineer. Restore stability with zero collateral damage.

**Objective:** Fix the exact error. Do not rename variables, clean up surrounding code, or refactor anything outside the direct error scope. Leave the file better than you found it, not different from how you found it.

---

## Input Required

Paste both before asking for a fix:

```
## Error Log
[paste full error — TypeScript error, console error, Firebase error, build error, etc.]

## File to Fix
[paste complete current file contents, or the specific function if the file is very large]
```

### The Diagnostic Step (For TS/ESLint Errors)
1. Read the EXACT line of code causing the error, AND the 10 lines above and below it.
2. Read the import block at the top of the file to check for namespace collisions (e.g., importing `User` from Firebase Auth vs `User` from local types).
3. Do not propose a "blind replace" without verifying the surrounding context first.

---

## The Surgical Protocol

### Step 1 — Identify

State:
- The exact file and line number where the error originates
- Why the error is occurring (one sentence, the root cause — not a description of the symptom)

### Step 2 — Constraint Check

Before proposing a fix, confirm:

- **No sweeping refactoring.** If the fix requires changing something outside the direct error scope, flag it as a separate issue rather than fixing it now.
- **No deletion** of helper functions or types unless they are the direct cause of the error.
- **No new `any` types.** If fixing a type error, use a specific interface or `unknown`, never `any`.
- **Schema fidelity.** If the error involves a Firestore field, verify the field exists in `docs/firestore-schema.md` before using it in the fix.
- **Compliance fidelity.** If the error is in an age gate, audit log write, or police hold check — the fix must preserve the compliance behaviour, not work around it.

### Step 3 — Diff Plan

Before writing the fix, state exactly what will change:

```
REMOVE (line N):
  [exact code being removed]

ADD (line N):
  [exact code being added]

REASON: [one sentence]
```

If more than 5 lines change, explain why the broader change is necessary and confirm it does not affect any persona's UX constraints or compliance behaviour.

### Step 4 — The Fix

Provide the corrected code. For small fixes (under 20 lines changed), provide the corrected section with 5 lines of surrounding context on each side for precise location.

For larger fixes, provide the complete corrected file.

### Step 5 — Verification Command

State the exact command to verify the fix:

```bash
npm run build          # TypeScript compile check
npm run lint           # ESLint
firebase emulators:start  # If fix involves Firestore rules or Cloud Functions
```

---

## Common Fix Patterns

### TypeScript Type Errors

```typescript
// WRONG — introduces any
const item = snapshot.data() as any;

// CORRECT — use the schema interface
import type { Item } from '../lib/types';
const item = snapshot.data() as Item;
```

### Firestore Field Access

Always check `docs/firestore-schema.md` before accessing a field. If the field doesn't exist in the schema, the fix is wrong even if it resolves the TypeScript error.

### CSS / Theme Errors

```css
/* WRONG — hardcoded value */
color: #C8A14A;

/* CORRECT — token reference */
color: var(--color-primary);
```

### Age Gate Bypass

If a fix involves simplifying route logic that happens to remove an age gate, stop. The gate must be preserved. Flag it separately and fix the original error differently.

### auditLogs Write

If the error is in an audit log write, the fix must not move the write to the client side. Audit log writes go through Cloud Functions via Firebase Admin SDK only.

---

## What NOT to Fix In This Pass

If you notice any of the following during the fix, **flag them as separate issues** but do not fix them now:

- `console.log` statements in production paths
- Unused imports unrelated to the error
- Variable names that could be clearer
- Logic that works but could be simplified
- Missing error handling in unrelated functions

Fixing one thing at a time keeps the diff reviewable and the regression surface small.

---

*The Pawn Shop · docs/prompts/FIX.md · v1.0*
