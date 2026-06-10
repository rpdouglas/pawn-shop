# E109 — Walk-in Pawn Intake (POS Direct Loan Issuance)

**Status:** ✅ CLOSED — 2026-06-10
**Priority:** HIGH
**Effort:** Small (~4 files)
**Cycle:** 32

---

## Problem

The existing pawn loan issuance flow (`PawnInbox` → `IssueLoanModal`) requires an existing
`pawnRequest` document in status `quoted`. That document is only created when a customer
submits the online pawn enquiry form.

There is no path for a staff member to issue a loan to a customer who walks in without having
used the online form. This is the primary real-world use case at the Cornwall Island counter —
most customers arrive in person.

Staff currently have no way to:
1. Record a walk-in customer's details and item description
2. Immediately issue them a loan ticket
3. Collect their signature and print their ticket

---

## Personas

**Primary:** Staff (inventory_staff / manager / admin) — POS counter operator  
**Secondary:** Makoonsii — community member pawning an item in person (48px touch targets, plain language)

---

## Scope

1. "New Walk-in Pawn" button added to the top of `PawnInbox`
2. Small `WalkInPawnModal` collects: name, phone (optional), email (optional), item description, serial number (optional)
3. New CF `createWalkInPawnRequest` creates `pawnRequest` with `status: 'quoted'` and `source: 'walk_in'`; serial blacklist check still fires
4. On CF success, `IssueLoanModal` opens immediately with the returned `pawnRequestId`
5. Full sign + print flow proceeds identically to the existing online-request path
6. Schema: add `source: 'online' | 'walk_in'` field to `pawnRequests/{id}`

---

## Gate Results

| Gate | Result |
|---|---|
| `npm run build` | ✅ PASS — built in 4.18s, zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero errors, zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests, 8 test files |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| No `any` types | ✅ PASS — `Record<string, unknown>` throughout; typed CF interfaces |
| No hardcoded hex / px / spacing | ✅ PASS — all `var(--color-*)`, `var(--text-*)`, `var(--space-*)` |
| No PII in `auditLogs` | ✅ PASS — `walk_in_pawn_created` stores only `{ requestId, source }` |
| Staff auth gate on CF | ✅ PASS — `admin \| manager \| inventory_staff` claim check |

---

*The Pawn Shop · docs/projects/E109_WALK_IN_PAWN_INTAKE.md · 2026-06-10*
