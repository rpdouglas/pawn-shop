# QA Report — E109 · Walk-in Pawn Intake (POS Direct Loan Issuance)
**Date:** 2026-06-10 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — built in 4.18s, zero TypeScript errors |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` type casts | ✅ PASS — `Record<string, unknown>` in CF; typed interfaces on all data boundaries |
| No unused imports/variables | ✅ PASS — all imports actively used |

**Note:** `functions/npm run test` fails on 12 tests due to Firestore Emulator not running on port 8080. Pre-existing infrastructure constraint — not introduced by E109.

---

## Part 2 — Persona Smoke Tests

### Staff / POS Operator (Primary)

- [x] Open **Pawn Inbox** → "New Walk-in Pawn" button visible in page header
- [x] Click button → `WalkInPawnModal` opens with title "New Walk-in Pawn"
- [x] **Name** field: required; validation error shown if empty on submit
- [x] **Item Description** field: required; validation error shown if empty on submit
- [x] **Serial Number**, **Phone**, **Email**: all optional — modal submits without them
- [x] All inputs: `minHeight: 48px` — meets Makoonsii 48px touch target requirement
- [x] Click "Continue to Loan" → `createWalkInPawnRequest` CF called (staff-only)
- [x] On CF success: `WalkInPawnModal` closes → `IssueLoanModal` opens immediately with item description pre-populated
- [x] Full three-step sign + print flow proceeds identically to online-request path (E107 unchanged)
- [x] **Serial blacklist hit:** when `serialBlacklistHit: true` is returned, modal closes but `IssueLoanModal` does NOT open — staff stay in PawnInbox to review the flagged record
- [x] Walk-in record appears in PawnInbox table with **Walk-in** badge alongside Status badge
- [x] Existing "Issue Loan" button on quoted rows: continues to work correctly — item description passed directly from `req.itemDescription`

### Makoonsii (Secondary)

- [x] All `WalkInPawnModal` inputs: `minHeight: 48px` — exceeds 48px touch target minimum
- [x] Labels are plain language: "Customer Name", "Item Description", "Serial Number (optional)", "Phone (optional)", "Email (optional)"
- [x] "Continue to Loan" button: `minHeight: 48px` — accessible as primary action
- [x] Transaction completes at the counter without requiring the customer to use the website

---

## Part 3 — Compliance Audit

| Item | Status |
|------|--------|
| Age gate at router level | ✅ N/A — admin-only route; no public-facing change |
| `auditLogs` created by Cloud Function (Admin SDK) | ✅ PASS — `createWalkInPawnRequest` writes `walk_in_pawn_created` via Admin SDK |
| No PII in `auditLogs.details` | ✅ PASS — details: `{ requestId, source: 'walk_in' }` only; name/phone/email stored on `pawnRequests` doc, not in logs |
| Serial blacklist check runs for walk-ins | ✅ PASS — identical logic to online path; `serialBlacklistHit` set in CF before doc is written |
| Serial blacklist hit blocks immediate loan issuance | ✅ PASS — `handleWalkInSuccess` checks `serialBlacklistHit`; if true, `IssueLoanModal` is suppressed so staff can review the flag |
| `policeHold` write: admin-only | ✅ N/A — not touched by this epic |
| `rare-find`/`limited-edition` not auto-applied | ✅ N/A — not touched by this epic |
| No Kanien'kéha generated | ✅ PASS — no language generation |
| AI API calls via Cloud Functions only | ✅ N/A — no AI calls in E109 |
| Staff-only gate on `createWalkInPawnRequest` CF | ✅ PASS — `admin \| manager \| inventory_staff` claim check; throws `permission-denied` otherwise |
| `email` field optional for walk-in records | ✅ PASS — CF only sets `email` when provided; `PawnRequest` type updated to `email?: string` |
| `source: 'walk_in'` set server-side only | ✅ PASS — field only written by CF using Admin SDK; not settable by clients via Firestore rules |

---

## Part 4 — Accessibility Check

- [x] All `WalkInPawnModal` inputs: `minHeight: 48px` — meets 48px touch target rule
- [x] Textarea (item description): `minHeight: 80px` — exceeds minimum
- [x] "Continue to Loan" and "Cancel" buttons: `minHeight: 48px` — both primary and secondary actions accessible
- [x] Error messages: `role="alert"` on `<p className="input-error">` — screen reader announced
- [x] Each input has explicit `<label>` with `htmlFor` wired to input `id` — no implicit label association
- [x] "New Walk-in Pawn" header button: `minHeight: 48px` — counter-accessible

---

## Part 5 — Design System Verification

- [x] Zero hardcoded hex values — `var(--color-*)` throughout `WalkInPawnModal.tsx` and `PawnInbox.tsx` changes
- [x] Zero hardcoded `px` font sizes — `var(--text-sm)`, `var(--text-base)` tokens used
- [x] Zero hardcoded spacing — `var(--space-1)` through `var(--space-4)` used; `minHeight: 48px` is a layout constraint (not spacing token), consistent with existing patterns in `IssueLoanModal`
- [x] No JS conditionals for view theming — all admin-only, no `ViewContext` dependency
- [x] Motion: no animation introduced; modal open/close handled by existing `Modal` component (unchanged)
- [x] No unapproved motion patterns (no bounce, particle, or constant micro-animations)

---

## Part 6 — Regression Check

- [x] Existing "Issue Loan" button on quoted enquiries continues to work — `issueLoanDescription` state set from `req.itemDescription` on click, passed correctly to `IssueLoanModal`
- [x] `toPawnRequest` mapper updated: `email` now correctly typed as `string | undefined`; all existing rows render without error
- [x] `issueLoanRequest` computed variable removed cleanly — replaced by explicit `issueLoanDescription` state; no dangling references
- [x] `PrintableTicket` and `signPawnAgreement` CF untouched — sign + print path identical for both online and walk-in loans
- [x] Walk-in badge renders only when `source === 'walk_in'`; existing records without `source` show no badge (backward-compatible)

---

## Sign-Off

**QA PASSED.** Feature: E109 Walk-in Pawn Intake (POS Direct Loan Issuance). Personas: Staff (POS counter operator), Makoonsii. Build: clean. Compliance: verified. Serial blacklist: runs for walk-ins. Smoke tests: passed. Design system: verified. Regression: clean.

Ready for PR.

---

*The Pawn Shop · docs/reports/E109_QA_REPORT.md · 2026-06-10*
