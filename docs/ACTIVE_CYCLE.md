# Active Cycle — The Pawn Shop

> **Sprint tracking file.** Update at the start and end of every work cycle.
> Referenced by `docs/prompts/INITIALIZATION.md` on session load.

---

## Current Cycle

**Cycle:** 02
**Started:** 2026-05-17
**Target close:** TBD
**Deploy target:** dev

---

## Cycle Goal

Deliver E03 · Auth & Staff Roles: Firebase Auth (email/password + Google SSO), five custom claims, MFA enforcement for staff, `AuthContext`, `ProtectedRoute`, and `auditLogs` events for auth actions.

---

## In Progress

| Task | Epic | Persona | Owner | Notes |
|---|---|---|---|---|
| — | — | — | — | No tasks in flight |

---

## Completed This Cycle

| Task | Epic | Completed |
|---|---|---|
| — | — | — |

---

## Deferred / Blocked

| Item | Reason | Target cycle |
|---|---|---|
| WCAG AA axe-core browser verification | Requires running browser session on `/pawn`, `/cannabis`, `/fireworks` | Before E02 fully closes |

---

## Open Decisions Needed

| Question | Context | Urgency |
|---|---|---|
| Legal counsel on cannabis/fireworks regulation | Required before E09/E11 features ship to prod | Before prod deploy |
| Kanien'kéha community review process | Required before E19 (Akwesasne Identity System) begins | Before E19 starts |

---

## Previous Cycle Summary

**Cycle 01** (2026-05-16 → 2026-05-17) — Closed E01 (dev environment) and E02 (three-view design system).

| Task | Epic | Completed |
|---|---|---|
| Firebase project setup verified (nats-rack / the-addicts-agenda) | E01 | 2026-05-16 |
| `docs/PERSONAS.md` created — all 8 personas | E01 | 2026-05-16 |
| `docs/AI_WORKFLOW.md` created | E01 | 2026-05-16 |
| `docs/prompts/` created — 10 prompt files | E01 | 2026-05-16 |
| `docs/projects/00_TEMPLATE.md` created | E01 | 2026-05-16 |
| `docs/EPICS.md` updated — persona tags on all tasks | E01 | 2026-05-16 |
| `docs/CONTEXT.md` updated — persona + AI workflow sections | E01 | 2026-05-16 |
| `docs/ACTIVE_CYCLE.md` created | E01 | 2026-05-16 |
| `firestore.rules` compliance fix — `aiDescription` moved to `items/{id}/internal/ai` subcollection | E01 | 2026-05-17 |
| `docs/firestore-schema.md` updated — subcollection documented | E01 | 2026-05-17 |
| Emulator rules verification — 7/7 tests passed | E01 | 2026-05-17 |
| **E01 CLOSED** | E01 | 2026-05-17 |
| Tailwind v4 token system — all three view palettes | E02 | 2026-05-17 |
| `ViewContext` + `ViewLayout` — URL-driven, injects `.view-*` class | E02 | 2026-05-17 |
| `react-router-dom` route structure (`/pawn`, `/cannabis`, `/fireworks`) | E02 | 2026-05-17 |
| Self-hosted fonts via @fontsource (6 typefaces) | E02 | 2026-05-17 |
| Core component library: Button, Badge, Card, Modal, Input, Table | E02 | 2026-05-17 |
| Cannabis variants: CinematicHero, MoodCard, LuxuryProductCard | E02 | 2026-05-17 |
| Fireworks variants: CountdownTimer, BundleCard, UrgencyBadge | E02 | 2026-05-17 |
| PWA manifest with per-view shortcuts and theme colours | E02 | 2026-05-17 |
| `src/lib/types.ts` — shared TypeScript types | E02 | 2026-05-17 |
| `src/lib/format.ts` — `formatPrice()` CAD cents utility | E02 | 2026-05-17 |
| QA fixes: input focus-visible, table keyboard nav, interactive card focus | E02 | 2026-05-17 |
| `docs/projects/E02_Three_View_Design_System.md` — project spec created | E02 | 2026-05-17 |
| **E02 CLOSED** (pending axe-core browser run) | E02 | 2026-05-17 |

---

## Next Cycle Preview

Start E03 · Auth & Staff Roles. The `react-router-dom` router and `ViewContext` are already in place — `ProtectedRoute` can be built immediately using `useLocation` and `useView`. Begin with Firebase Auth setup, then custom claims Cloud Function, then `AuthContext` and `ProtectedRoute`.

---

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-05-17*
