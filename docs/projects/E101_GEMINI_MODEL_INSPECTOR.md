# E101 — Gemini Model Inspector (Developer Tool)
**Status:** ✅ CLOSED — 2026-06-09
**Priority:** LOW (developer quality-of-life)
**Effort:** Small (0.5 developer-days)
**Cycle:** 32

---

## Problem

The project has no local way to:
1. Verify a Gemini API key is valid before deploying
2. Discover which models are currently available from Google's API
3. Cross-check `docs/AI_MODELS.md` against live model availability

Developers must manually query the Gemini API or visit docs to determine which model IDs are safe
to use. This led directly to the `gemini-3.1-pro` production 500 incident (non-existent model ID).

## Goal

Create a standalone developer script that:
- Reads a `GEMINI_API_KEY` from `functions/.env` (already gitignored)
- Calls the Gemini REST API to list all currently available models
- Annotates each model against the categories in `docs/AI_MODELS.md`
- Outputs a formatted console table the developer can use to update `AI_MODELS.md` confidently

No Cloud Functions changes. No Firestore. No frontend changes.

## Personas Served

- **Jordan** — editorial and system quality. Making AI model governance more rigorous and auditable
  reduces risk of shipping broken or deprecated model IDs.
- **Developer** (implicit) — primary user of this tool.

## Compliance

- No PII — script outputs model metadata only, no user data
- No client-side API key exposure — this is a local developer script, not browser code
- `functions/.env` is already listed in `.gitignore` — key never committed
- No Firestore reads or writes
- No age gate changes
- No `auditLogs` changes

## Schema Audit

No Firestore fields read or written. No `docs/firestore-schema.md` changes required.

## Files to Create

| File | Purpose |
|------|---------|
| `scripts/list-gemini-models.mjs` | The model inspector script |

## Files to Update

| File | Change |
|------|--------|
| `functions/.env` (local only, gitignored) | Add `GEMINI_API_KEY=...` entry |
| `docs/AI_MODELS.md` | Update with findings after running the script |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (Vite + tsc) | ✅ PASS — `built in 4.43s` |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest frontend) | ✅ PASS — 29/29 tests, 8 test files |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| No hardcoded hex values | ✅ PASS — CLI script, no UI |
| No PII in output | ✅ PASS — model metadata only |
| No new Firestore fields | ✅ PASS — schema unchanged |
| No AI API keys on client | ✅ PASS — developer script only; `functions/.env` gitignored |
| Key missing → setup instructions | ✅ PASS — prints instructions and exits cleanly |
| Zero new npm dependencies | ✅ PASS — uses Node built-ins only (`fs`, `path`, `fetch`) |

---

*The Pawn Shop · docs/projects/E101_GEMINI_MODEL_INSPECTOR.md · 2026-06-09*
