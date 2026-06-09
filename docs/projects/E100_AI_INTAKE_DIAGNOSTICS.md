# E100 — AI Intake Pipeline Diagnostics
**Status:** ✅ CLOSED — 2026-06-09
**Priority:** HIGH (blocking staff intake workflows)
**Effort:** Small (0.5 developer-days)
**Cycle:** 32

---

## Problem

The AI inventory intake process (photo → Gemini extraction → form hydration) is not returning data. Staff cannot determine whether the failure is:
1. The `processUploadedImage` CF not being called with `extractData: true`
2. Gemini receiving/returning unexpected output
3. A JSON parse failure on the response
4. A Firestore write failure (data extracted but not persisted)
5. The frontend Firestore listener not receiving the write

The Cloud Function success path is currently silent — there are `console.warn` on fallback and `console.error` on failure, but no structured logging on the happy path. This makes remote diagnosis via Firebase Cloud Logging impossible.

## Goal

Add structured diagnostic `console.log` breadcrumbs to:
- `processUploadedImage` CF — at each pipeline stage
- `extractIntakeData` — model selection, raw response, parse result, Firestore write

No new Firestore fields. No schema changes. No UI changes (frontend already has `[AI Intake]` tagged logs).

## Personas Served

- **Staff** — inventory_staff, manager, admin who use the intake flow directly
- No customer-facing persona is directly served by this diagnostic work

## Compliance

- No PII in any log line — item IDs, model names, and byte counts only
- No new Firestore fields — reads/writes are unchanged
- No age gate changes
- No AI API key exposure (keys stay in CF via `defineSecret`)

## Files Changed

| File | Change |
|------|--------|
| `functions/operations/src/inventory.ts` | Added 6 `console.info` breadcrumbs to `processUploadedImage` |
| `functions/operations/src/ai.ts` | Added 7 `console.info` breadcrumbs to `extractIntakeData` |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (Vite + tsc) | ✅ PASS — `built in 4.74s` |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| No hardcoded hex values | ✅ PASS — logging only, no UI changes |
| No PII in log lines | ✅ PASS — item IDs, buffer sizes, model names only |
| No new Firestore fields | ✅ PASS — schema unchanged |
| No AI API keys on client | ✅ PASS — CF-only changes |

---

*The Pawn Shop · docs/projects/E100_AI_INTAKE_DIAGNOSTICS.md · 2026-06-09*
