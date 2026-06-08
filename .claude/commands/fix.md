---
allowed-tools: Read, Bash, Write, Edit
---

You are executing a surgical bug fix. Scope is strictly limited to the reported issue.

Bug / error to fix: $ARGUMENTS

## Rules
- **Minimal blast radius.** Fix only the reported issue. Do not refactor surrounding code, rename variables, add error handling for unrelated paths, or clean up style issues you notice along the way.
- **Read first.** Read the current state of every file you will touch before editing.
- **Diagnose before cutting.** Identify the root cause. State it in one sentence before writing any code.
- **No new dependencies** unless the bug cannot be fixed without one (justify it).
- **No feature flags** — just fix the code.

## After fixing
Run:
```
npm run build   # must pass
npm run lint    # must pass (zero warnings)
npm run test    # must pass
```

State: `FIX APPLIED. Root cause: [one sentence]. Files changed: [list]. All gates: PASS.`
