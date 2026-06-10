# E73 — Architecture Modernization & Optimization — Plan

**Status:** 🔄 IN PROGRESS
**Cycle:** 32
**Date:** 2026-06-10
**Planner:** Claude (Phase A — awaiting approval)

---

## Context

Three confirmed build issues found via `npm run build`:

| Issue | Severity | Evidence |
|---|---|---|
| 3× `INEFFECTIVE_DYNAMIC_IMPORT` warnings | Medium | Rolldown warnings in build output |
| Main bundle 1,019 kB (> 500 kB threshold) | High | Build chunk size warning |
| `useItems.ts` — no `withConverter` | Low | Code review — manual `as Type` casts |
| `IntakeForm.tsx` — 817 lines, render thrash | Medium | 3 concurrent `onSnapshot` + 20+ `useState` |

Persona gate: **Jordan** (primary — Lighthouse performance), **Staff** (secondary — intake efficiency),
**Makoonsii** (indirect — mobile load time).

---

## Strategy A — Quick Wins Only (Recommended)

**Scope:** Small · 4 files

### What it does
Fix the three build-output issues without touching IntakeForm or adding any new dependencies.

### Tasks

#### Task A1 — Fix Ineffective Dynamic Imports (2–3 files)

**Root cause:** `ConsentBanner.tsx`, `ViewContext.tsx`, and `analytics.ts` call `import(...)` on
`firebase.ts`, `firebase/firestore`, and `firebase/analytics`. Because the majority of the app already
imports these statically, Rolldown cannot move them into a separate async chunk — the dynamic imports
do nothing except generate warnings.

**Fix:** Convert all three dynamic calls to top-level static imports. The modules are already in the
main bundle; removing the dynamic wrappers silences the warnings without any runtime behaviour change.

Files changed:
- `src/components/ConsentBanner.tsx` — convert `import('../lib/firebase').then(m => m.db)` and
  `import('firebase/firestore')` to static imports
- `src/context/ViewContext.tsx` — same pattern
- `src/lib/analytics.ts` — convert `import('./firebase').then(m => m.analytics)` and
  `import('firebase/analytics')` to static imports

#### Task A2 — Add `manualChunks` to `vite.config.ts`

**Root cause:** All vendor code, Firebase SDK, React DOM, TanStack Query land in one 1,019 kB chunk.
Vite/Rolldown can split these into stable, cache-able chunks if we declare groups explicitly.

**Fix:** Add `build.rollupOptions.output.manualChunks` to split into:
- `vendor-react` — `react`, `react-dom`, `react-router-dom`
- `vendor-firebase` — all `firebase/*` packages
- `vendor-tanstack` — `@tanstack/react-query`, `@tanstack/react-table`

Expected outcome: main `index.js` drops significantly; vendor chunks are long-cached by browsers on
repeat visits.

File changed:
- `vite.config.ts`

#### Task A3 — Add `withConverter` to `useItems.ts`

**Root cause:** `docToItem()` uses raw `as Type` casts for every field. TypeScript cannot validate
field names at compile time.

**Fix:** Extract the existing `docToItem` function into a Firestore converter object:
```ts
const itemConverter = {
  toFirestore: (item: Item) => item,
  fromFirestore: (snap: QueryDocumentSnapshot) => docToItem(snap),
}
```
Apply via `collection(db, 'items').withConverter(itemConverter)`. No behaviour change — same data,
same types, better compile-time safety.

File changed:
- `src/hooks/useItems.ts`

### Architecture
- No Cloud Functions touched
- No Firestore rules touched
- No new npm dependencies
- No schema changes

### Persona Lens
- **Jordan:** Main bundle split removes the most significant blocking load for PWA performance
- **Makoonsii:** Smaller initial JS download on 3G connection
- **Staff:** No change to their intake workflow — zero regression risk

### Compliance
- No age gate changes
- No auditLogs changes
- No PII in any changed file
- No AI API key exposure (not touching functions)
- No `rare-find`/`limited-edition` logic touched

### Trade-offs
| Benefit | Cost |
|---|---|
| Silences all 3 build warnings | None — pure cleanup |
| Main bundle shrinks significantly | None |
| Better TS compile-time safety on items | None |
| Zero regression risk | Doesn't address IntakeForm render thrash |

### Anti-Regression Checks
- ✅ No hardcoded hex values introduced
- ✅ No invented Firestore fields
- ✅ No AI API keys on client
- ✅ No scarcity tag logic touched
- ✅ No PII in logs
- ✅ Age gates untouched
- ✅ No motion patterns added

### Estimated Scope: **Small — 4 files, ~50 lines changed**

---

## Strategy B — Quick Wins + IntakeForm Sub-Component Decomposition

**Scope:** Medium · 8–10 files

### What it does
Everything in Strategy A, plus decompose the remaining monolithic sections of `IntakeForm.tsx`
into domain sub-components — without introducing a new form library.

### Additional Tasks Beyond Strategy A

#### Task B1 — Extract `PricingFields` component
Extract: `priceInput`, `costInput`, `quantityInput`, `provenanceNotes`, markdown config controls
from `IntakeForm.tsx` into `src/components/admin/intake/PricingFields.tsx`.
Props: controlled inputs via `value`/`onChange`. No new state management.

#### Task B2 — Extract `MetaFields` component
Extract: `title`, `category`, `description`, `serialNumber`, `condition`, `isSeasonalItem`,
`merchandisingTags` into `src/components/admin/intake/MetaFields.tsx`.

#### Task B3 — Slim `IntakeForm.tsx` to orchestrator
After extraction, `IntakeForm.tsx` becomes a thin orchestrator: manages state and Firestore sync,
renders `MetaFields`, `PricingFields`, `CannabisFields`, `FireworksFields`, `ImageUploadZone`.
Target: ~300 lines (from 817).

### Architecture
- Same as Strategy A for the quick wins
- No new npm dependencies
- No schema changes
- `CannabisFields` and `FireworksFields` already exist — this follows the same pattern

### Persona Lens
- **Jordan:** All Strategy A benefits plus cleaner codebase
- **Staff:** Easier to scan and edit individual form sections — less cognitive load

### Compliance
Same as Strategy A — no compliance-sensitive logic moves.

### Trade-offs
| Benefit | Cost |
|---|---|
| All Strategy A benefits | ~2–3 extra hours of careful extraction |
| IntakeForm shrinks from 817 → ~300 lines | Must validate AI extraction listener still works |
| Sets up for future react-hook-form migration | Extraction must not break 29/29 tests |
| No new dependencies | Render thrash reduced but not eliminated (state still in parent) |

### Anti-Regression Checks
Same as Strategy A, plus:
- ✅ AI extraction `onSnapshot` listeners remain in parent — not split
- ✅ `aiEnabled` sessionStorage toggle remains in parent
- ✅ `ensureItemCreated` flow untouched

### Estimated Scope: **Medium — 8–10 files, ~200 lines changed**

---

## Strategy C — Quick Wins + `react-hook-form` Migration

**Scope:** Large · 12–15 files + new dependency

### What it does
Everything in Strategy A, plus migrate `IntakeForm.tsx` and its sub-components to `react-hook-form`,
eliminating the 20+ individual `useState` fields and the re-render-per-keystroke pattern.

### Additional Tasks Beyond Strategy A

#### Task C1 — Install `react-hook-form`
`npm install react-hook-form` (no `@hookform/resolvers` needed unless we add Zod — out of scope here)

#### Task C2 — Migrate `IntakeForm` state to `useForm`
Replace `useState<FormState>(EMPTY_FORM)` + 20+ individual `set()` calls with `useForm<FormState>`.
Use `Controller` for: `ConditionSelector`, `MerchandisingTagSelector`, `ImageUploadZone` (custom
components that don't natively use `ref`).

#### Task C3 — Migrate AI hydration listeners to `setValue`
The three `onSnapshot` listeners (images, AI extraction, initial load) currently call
`setFormState(prev => ...)`. With react-hook-form, replace with `setValue('fieldName', value)`.
This is the trickiest part — the AI extraction listener does multi-field batch updates.

#### Task C4 — Update `IntakeForm.test.tsx`
react-hook-form's `Controller` components require `act()` wrapping in RTL. Update all 7 existing
AI toggle tests to work with the new form structure. Add tests for field hydration from `onSnapshot`.

### Architecture
- New dependency: `react-hook-form` (~25 kB gzip — similar size to what we're gaining from splitting)
- Same as Strategy A for quick wins
- No Cloud Function changes
- No schema changes

### Persona Lens
- **Jordan:** All Strategy A benefits plus measurable reduction in re-renders during typing
- **Staff:** Snappier form response, especially on multi-field AI hydration events

### Compliance
Same as Strategy A — no compliance-sensitive logic moves.

### Trade-offs
| Benefit | Cost |
|---|---|
| All Strategy A benefits | New dependency (~25 kB gzip) |
| Zero re-renders during typing | Highest migration risk (3 `onSnapshot` listeners to rewire) |
| Correct dirty-field tracking | `Controller` wrappers on 6+ custom components |
| Sets stage for E75 Zod validation | Test rewrites required — risks breaking existing coverage |

### Anti-Regression Checks
Same as Strategy A, plus:
- ⚠️ Must verify AI extraction multi-field batch `setValue` calls don't override user-edited fields
- ⚠️ Must verify `aiEnabled` toggle still locks after first photo upload
- ✅ No scarcity tag logic touched
- ✅ Age gates untouched

### Estimated Scope: **Large — 12–15 files, new dependency, ~300+ lines changed**

---

## Recommended Strategy: A

Strategy A is the correct choice for this cycle because:
1. It closes all three confirmed build issues with **zero regression risk**
2. The main bundle split (1,019 kB → expected ~300–400 kB entry + stable vendor chunks) is the
   highest-ROI single change available
3. IntakeForm render thrash is real but not a P0 — staff can use it today; the form
   works correctly. Strategy B/C can follow in a future cycle when there is time to validate
   the AI extraction listener rewire carefully
4. No new dependencies, no test rewrites

---

## Decision Reference

No new Firestore fields introduced. No `DECISIONS.md` entry required for pure build/DX changes.
If `manualChunks` configuration produces unexpected behaviour, log as `docs/decisions/0018-*.md`.

---

*The Pawn Shop · docs/plans/E73_ARCHITECTURE_MODERNIZATION_PLAN.md · 2026-06-10*
