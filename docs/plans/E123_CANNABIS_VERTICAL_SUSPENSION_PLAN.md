# E123 — Cannabis Vertical Suspension — Implementation Plan
**Date:** 2026-06-13
**Status:** Awaiting approval
**Spec:** `docs/projects/E123_CANNABIS_VERTICAL_SUSPENSION.md`

---

## Context

Legal counsel requires the Cannabis vertical to be removed from public access. The suspension must be:
1. **Complete** — no public entry point remains (route, homepage card, nav drawer link)
2. **Non-destructive** — all Cannabis source files are preserved; no code is deleted
3. **Reversible** — re-enabling requires touching only the flag(s) changed during suspension
4. **Auditable** — the mechanism and intent are clear to any future developer reading the code

---

## Persona Gate

| Persona | Relevance | Test |
|---|---|---|
| Marie | Compliance anchor — route must not be reachable | Direct navigation to `/cannabis` returns 404 or redirect |
| Jordan | Brand quality — homepage and nav must remain coherent | Homepage renders cleanly with 3 cards; no empty slot |
| Makoonsii | Accessibility — nav and homepage remain keyboard-navigable | Tab order clean, no broken links |
| Staff | Operational clarity — no ambiguity about why the vertical is absent | Feature flag comment explains the reason |

---

## Schema Audit

No Firestore reads or writes. No schema changes required. No new fields.

---

## Strategy A — Environment Variable Feature Flag (Recommended)

### Architecture

Introduce a single `VITE_CANNABIS_ENABLED` environment variable (boolean string `"true"` / `"false"`). Default: `"false"` (suspended). When `"true"`, the route, homepage card, and nav link are all restored.

**Files touched (3):**
- `src/main.tsx` — guard the two cannabis routes behind the flag
- `src/pages/HomePage.tsx` — conditionally render the Cannabis `<PortalCard>`
- `src/components/ui/NavigationDrawer.tsx` — conditionally include the Cannabis nav link

**Re-enable mechanism:** Set `VITE_CANNABIS_ENABLED=true` in `.env.local` (dev) or GitHub Secrets (CI/CD), then redeploy. One-line change per environment.

**Route behaviour when disabled:** The two `cannabis` paths are simply absent from the router — React Router returns the `*` catch-all, which renders `<NotFoundPage />`. No redirect needed; no new components needed.

### Persona Lens
- **Marie:** `/cannabis` and `/cannabis/collections/:mood` are completely absent from the router when flag is `false`. `AgeGate` logic for cannabis is not triggered — there is nothing to gate.
- **Jordan:** Homepage grid renders 3 cards (Pawn, Fireworks, Tobacco) with no empty slot. Nav drawer shows 3 vertical links. Both look intentional.
- **Makoonsii:** 3-card grid is still a valid grid layout (`repeat(2, 1fr)` means the last card occupies the left cell; this is standard grid behaviour). Tab order is clean.

### Compliance
- Age gate: moot — the route doesn't exist. No audit log entries for cannabis age gate pass/fail will occur (correct — those entries should not exist for a suspended vertical).
- No PII impact. No Firestore rules changes needed.

### Trade-offs
- **Pro:** Perfectly reversible. No code deleted. CI/CD can re-enable without a code PR — just a secrets change + deploy.
- **Pro:** Zero risk of accidentally breaking Cannabis source files.
- **Pro:** The flag name (`VITE_CANNABIS_ENABLED`) is self-documenting.
- **Con:** If `.env.local` is lost, someone might wonder why cannabis is absent and have to read the code to find the flag. (Mitigated by a comment in `main.tsx`.)
- **Estimated scope:** Small — 3 files, ~8 lines changed.

### Anti-Regression Check
- No hardcoded hex values introduced ✓
- No Firestore fields invented ✓
- No AI API keys on client ✓
- No auto-applied scarcity tags ✓
- No PII in logs ✓
- Age gate remains router-level (cannabis routes simply absent) ✓
- No unapproved motion patterns ✓

---

## Strategy B — Source-Comment Toggle (Code-only, no env var)

### Architecture

Replace the cannabis route entries in `main.tsx` and the cannabis UI elements in `HomePage.tsx` and `NavigationDrawer.tsx` with commented-out blocks marked `// CANNABIS SUSPENDED — E123`. Re-enabling requires a developer to uncomment the blocks and redeploy.

**Files touched (3):** Same as Strategy A.

**Re-enable mechanism:** Uncomment 3 blocks across 3 files, commit, push, deploy.

### Trade-offs
- **Pro:** No env var infrastructure required. The "flag" is visible in the source.
- **Con:** Re-enabling requires a code commit and PR — cannot be done via CI/CD secrets alone.
- **Con:** If two routes and two UI blocks are commented separately, there is risk that a future developer uncomments only some of them.
- **Estimated scope:** Small — 3 files, ~8 lines commented.

---

## Strategy C — Redirect to 404 (Route Preserved, Access Blocked)

### Architecture

Keep the cannabis routes in the router but replace their `element` with a redirect to `<NotFoundPage />` or a dedicated `<VerticalUnavailablePage />` with a brief "This section is temporarily unavailable" message.

**Files touched (2–4):** `main.tsx` + optional new `VerticalUnavailablePage.tsx` + optional `HomePage.tsx` + `NavigationDrawer.tsx`.

### Trade-offs
- **Pro:** The route still exists — direct links won't break silently; users get a clear message.
- **Con:** The homepage card and nav link still need to be removed (or shown with a "coming soon" state) — complicates the "one flag" ideal.
- **Con:** A dedicated unavailable page adds a file that serves a temporary purpose.
- **Con:** Re-enabling requires code changes in multiple places.
- **Estimated scope:** Small–Medium — 3–4 files.

---

## Recommended Strategy: A

Strategy A (env var) is the cleanest reversible mechanism for a legally-motivated suspension:
- No source code deletion
- Re-enablement is a GitHub Secrets change + deploy trigger — no code PR required
- The flag name is self-documenting

---

## Implementation Tasks (Strategy A)

1. Add `VITE_CANNABIS_ENABLED` env var (`false` by default) — document in `.env.example` if it exists
2. `src/main.tsx` — guard cannabis routes with `import.meta.env.VITE_CANNABIS_ENABLED === 'true'`
3. `src/pages/HomePage.tsx` — conditionally render Cannabis `<PortalCard>`
4. `src/components/ui/NavigationDrawer.tsx` — conditionally include Cannabis nav link and page-title logic
5. Run `npm run build` — zero errors/warnings
6. Log decision as `0040-e123-cannabis-suspension.md`
7. Add epic entry to `docs/EPICS.md`

---

## Files Modified

| File | Change |
|---|---|
| `src/main.tsx` | Wrap 2 cannabis routes in flag guard |
| `src/pages/HomePage.tsx` | Conditionally render Cannabis `<PortalCard>` |
| `src/components/ui/NavigationDrawer.tsx` | Conditionally include Cannabis link + page-title label |
| `docs/decisions/0040-e123-cannabis-suspension.md` | Decision log |
| `docs/EPICS.md` | Add E123 entry |

**Files NOT modified (preserved):**
- `src/pages/CannabisPage.tsx`
- `src/pages/cannabis/MoodCollectionPage.tsx`
- `src/components/cannabis/` (all)
- `firestore-schema.md`
- `firestore.rules`
- Any Cloud Functions

---

*E123 Plan · The Pawn Shop · 2026-06-13*
