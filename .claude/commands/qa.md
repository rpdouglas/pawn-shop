---
allowed-tools: Read, Bash, Agent
---

You are executing the Pawn Shop AI Workflow — Phase B QA Gate.

Epic under review: $ARGUMENTS

## Part 1 — Build Health
Run all four in sequence:
```
npm run build       # zero TypeScript errors
npm run lint        # zero ESLint errors AND zero warnings
npm run test        # zero test failures
```
Then in `/functions`:
```
npx tsc -b
```

Also audit manually:
- No `any` type casts — especially on Firestore `doc.data()` (must use `Record<string, unknown>`)
- No `!` non-null assertions on Firestore data
- No hardcoded hex values, px font sizes, or spacing values in new code

## Part 2 — Persona Smoke Tests
State which personas this epic serves, then run their specific tests:

- **Makoonsii:** All interactive elements ≥48px hit area. Plain language. No Kanien'kéha (flag for community review if present).
- **Dale:** Price visible without click-through. `status: 'sold'` removes item from public view immediately.
- **Tanya:** SMS fires within 60s of reservation. Specific time slot shown, not "we'll call you". Age gate: 18+.
- **Marie:** No category names in CRM. Generic language only. Age gate: 19+. `auditLog` entry present. No PII in any log.
- **Kevin:** Alert fires within 60s of `status: 'active'`. `alertOptIn` checked before sending. `policeHold` items not alerted.
- **Sandra:** Masonry grid intact. Quick-view < 200ms. Live activity: rate-limited, no PII.
- **Jordan:** `aiDescription` is NOT readable from customer-facing routes. AI drafts require explicit staff promote.
- **Marcus:** Photos meet the dark luxury standard. `provenanceNotes` are staff-written, not AI-generated.

## Part 3 — Compliance Audit
Verify each item explicitly:

| Item | Expected |
|------|----------|
| `auditLogs` entries | Written via Cloud Function (Admin SDK) only |
| PII in `auditLogs.details` | ZERO — no names, emails, phones |
| `eventType` values | Match entries in `docs/firestore-schema.md` |
| Age gates | Router-level. Every pass/fail logged to `auditLogs`. |
| `policeHold: true` | Hides item from ALL public queries immediately |
| `aiDescription` | Unreachable from customer-facing views |
| `rare-find` / `limited-edition` | Not auto-applied by any code path |
| AI API keys | Cloud Functions only — not in `src/` |

## Part 4 — Accessibility Check
- All interactive elements have visible focus states
- Images have `alt` text (or `aria-hidden="true"` for decorative images)
- WCAG AA contrast: 4.5:1 for body copy; cannabis `--color-primary` only at `--text-subheading` (24px+) or larger
- No content relies on colour alone to convey meaning

## Part 5 — Design System Verification
- No hardcoded tokens (hex, px, ms) in any new code
- Motion: only `var(--motion-speed-fast)` (150ms) for micro-interactions; no bounce, particle, or constant animations
- Cannabis discretion: no category names in customer-facing copy; boutique wellness framing only
- No prohibited vocabulary anywhere in new UI copy

## Reporting
If all checks pass:
`QA PASSED. Feature: [name]. Persona: [name]. Build: clean. Compliance: verified. Ready for /close.`

If any check fails:
`QA BLOCKED. Failures: [count]. [Description] — severity: blocking | non-blocking`
