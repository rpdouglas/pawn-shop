# QA Report — E123 · Cannabis Vertical Suspension (Legal Hold)

**Date:** 2026-06-13
**Cycle:** 33
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |

---

## Schema Audit

No Firestore reads or writes. No new collections. No schema changes.

**Schema sync: complete — no changes to `docs/firestore-schema.md` required.**

---

## Token Compliance Audit

| Category | Rule | Result |
|----------|------|--------|
| Colours | No hardcoded hex in new code | ✅ Changes are source comments only |
| Spacing | No hardcoded px/spacing values | ✅ No new inline styles |
| Font sizes | No hardcoded px font sizes | ✅ No new inline styles |
| Motion | No unapproved motion patterns | ✅ No animation added |
| `any` types | None | ✅ No new TypeScript code |
| `console.log` | None | ✅ Comments only |
| Unused imports | None | ✅ No imports changed |

---

## Entry Point Verification

All three public entry points to the Cannabis vertical confirmed absent:

| Entry Point | File | Status |
|---|---|---|
| `/cannabis` route | `src/main.tsx` lines 46–60 | ✅ Commented out — `// CANNABIS SUSPENDED — E123` |
| `/cannabis/collections/:mood` route | `src/main.tsx` lines 54–60 | ✅ Commented out — `// CANNABIS SUSPENDED — E123` |
| Homepage Cannabis card | `src/pages/HomePage.tsx` lines 19–27 | ✅ Commented out — `{/* CANNABIS SUSPENDED — E123 */}` |
| Nav drawer Cannabis link | `src/components/layout/NavigationDrawer.tsx` line 16 | ✅ Commented out — `// CANNABIS SUSPENDED — E123` |
| Nav drawer Cannabis page-title label | `src/components/layout/NavigationDrawer.tsx` line 43 | ✅ Commented out — `// CANNABIS SUSPENDED — E123` |

No live `/cannabis` links remain in any customer-facing page outside cannabis-specific source files.

---

## Persona Compliance Tests

### Marie (Primary — Compliance Anchor)
- `/cannabis` absent from router — React Router serves `<NotFoundPage />` for any direct navigation. ✅
- `AgeGate` for cannabis never instantiated — age gate machinery is not triggered. ✅
- No `auditLogs` entries for cannabis age gate pass/fail created while suspended — correct behaviour. ✅
- No cannabis-specific data surfaced on any public page. ✅

### Jordan (Secondary — Editorial Brand Quality)
- Homepage renders coherently with 3 cards (Pawn, Fireworks, Tobacco) — no empty slot in `home-grid`. ✅
- Nav drawer shows 4 items (Home, Pawn, Fireworks, Tobacco) — no gap or broken layout. ✅
- `aiDescription` not touched. ✅

### Makoonsii (Secondary — Accessibility + Trust)
- No new interactive elements introduced — no new 48px target requirements. ✅
- `repeat(2, 1fr)` grid with 3 cards: row 1 = Pawn + Fireworks, row 2 = Tobacco (left-aligned). Standard CSS grid auto-placement — no ghost slot. ✅
- Tab order clean — no broken links. ✅
- No Kanien'kéha present. ✅

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| Cannabis routes absent from router | ✅ |
| Cannabis homepage card absent | ✅ |
| Cannabis nav link absent | ✅ |
| All Cannabis source files preserved intact | ✅ |
| Re-enable instructions present in each comment block | ✅ |
| Age gates for remaining regulated verticals intact (Fireworks 18+, Tobacco 19+) | ✅ |
| `auditLogs` not modified | ✅ |
| No PII in any output | ✅ |
| No AI API keys on client | ✅ |
| No hardcoded hex/px/spacing values introduced | ✅ |
| No `any` types introduced | ✅ |
| No Firestore reads or writes | ✅ |
| No new Firestore fields | ✅ |
| `policeHold` behaviour unaffected | ✅ |
| `rare-find` / `limited-edition` unaffected | ✅ |
| `aiDescription` unaffected | ✅ |

---

## Files Changed

| File | Change |
|------|--------|
| `src/main.tsx` | 2 cannabis route objects commented out |
| `src/pages/HomePage.tsx` | Cannabis `<PortalCard>` commented out |
| `src/components/layout/NavigationDrawer.tsx` | Cannabis LINKS entry + `getPageTitle` case commented out |
| `docs/decisions/0040-e123-cannabis-suspension.md` | Decision log — strategy B selection + re-enable instructions |
| `docs/projects/E123_CANNABIS_VERTICAL_SUSPENSION.md` | Status → CLOSED, Gate Results added |
| `docs/EPICS.md` | E123 entry added and CLOSED |
| `docs/ACTIVE_CYCLE.md` | E123 row added to Completed This Cycle |
| `user-guide/getting-started.md` | Updated vertical count and nav drawer description |
| `user-guide/cannabis/overview.md` | Suspension notice added |

**Files NOT modified (all Cannabis source preserved):**
- `src/pages/CannabisPage.tsx`
- `src/pages/cannabis/MoodCollectionPage.tsx`
- `src/components/cannabis/` (all)
- `docs/firestore-schema.md`
- `firestore.rules`
- `firestore.indexes.json`
- Any Cloud Functions

---

## Sign-Off

All compiler gates pass. All three entry points to the Cannabis vertical confirmed absent from public surfaces. All Cannabis source files preserved intact for reinstatement. Re-enable path is clear: search `CANNABIS SUSPENDED — E123`, uncomment 3 comment blocks, run gates, commit, deploy.

**QA PASSED. E123 ready to merge.**

---

*The Pawn Shop · docs/reports/E123_QA_REPORT.md · 2026-06-13*
