# Plan — E101 · Gemini Model Inspector (Developer Tool)
**Status:** AWAITING APPROVAL
**Date:** 2026-06-09

---

## Context

`docs/AI_MODELS.md` is the source of truth for Gemini model IDs. It is manually maintained and
has already caused one production 500 incident (`gemini-3.1-pro` — a model ID that never existed).
The developer needs a local way to verify a key, discover live models, and cross-check the doc.

**`functions/.env`** is already gitignored. It's the standard Firebase local dev env file and the
correct location to store a local API key for script use.

---

## Persona Gate

- **Jordan** — system quality. Accurate `AI_MODELS.md` = fewer broken deploys.
- **Developer** — primary user; never has to manually curl the Gemini API again.

## Schema Audit

No Firestore reads or writes. No schema changes. No new fields.

---

## Strategy A — List-Only Script (Recommended)

**Architecture:**
- `scripts/list-gemini-models.mjs` — ESM Node script, no new npm deps
- Reads `functions/.env` manually (20-line dotenv parser, no package needed)
- Calls `GET https://generativelanguage.googleapis.com/v1beta/models` REST endpoint
- Formats output as a console table with model ID, display name, input/output token limits,
  supported generation methods, and an annotation column cross-referencing AI_MODELS.md categories
- Prints setup instructions if `GEMINI_API_KEY` is missing or empty
- Usage: `node scripts/list-gemini-models.mjs`

**Persona Lens:** Jordan gets a 30-second CLI audit of model availability. Prevents
shipping invalid model IDs. Script is self-documenting for any future dev.

**Compliance:**
- `functions/.env` already gitignored — key never commits
- Script is developer-local — does not run in browser, not on the client
- No PII, no Firestore, no audit log, no age gate changes

**Trade-offs:**
- ✅ Zero new npm dependencies (reads .env manually with 10 lines of fs code)
- ✅ No production code touched
- ✅ Output directly usable to update AI_MODELS.md
- ⚠️  List-only: does not confirm a model actually accepts prompts (just that it exists in the API)

**Estimated Scope:** Small — 1 new file (~80 lines)

---

## Strategy B — List + Smoke Test (One call per model)

**Architecture:**
- Same as A, but after listing models that support `generateContent`, sends a minimal
  test prompt (`"Respond with the single word: OK"`) to each model
- Captures pass/fail and approximate latency in milliseconds
- Prints an extended table: model ID | token limits | latency | smoke test result

**Persona Lens:** Confirms key is truly functional (not just format-valid) and gives latency
data to inform model selection in the fallback chain.

**Compliance:** Same as A.

**Trade-offs:**
- ✅ Proves key actually works end-to-end
- ✅ Latency data useful for choosing fallback order
- ⚠️  Makes N API calls (1 per model) — costs quota and takes longer (~30–60s depending on model count)
- ⚠️  Free-tier key may hit rate limits mid-run, producing misleading failures

**Estimated Scope:** Small-Medium — 1 new file (~130 lines)

---

## Strategy C — List + AI_MODELS.md Drift Report

**Architecture:**
- Same as A (list only), but adds a second output block: a diff report comparing live model IDs
  against the three tables in `docs/AI_MODELS.md` (Stable GA, Preview, Deprecated)
- Flags:  🆕 New models not yet in the doc | ⚠️  Stable GA models absent from API response | ✅ Match
- Optionally writes a suggested `AI_MODELS.md` update block to stdout

**Persona Lens:** Turns the script into a living governance tool that keeps AI_MODELS.md
honest over time as Google releases and retires models.

**Compliance:** Same as A. Script reads but never auto-writes `docs/AI_MODELS.md`.

**Trade-offs:**
- ✅ Most complete governance value
- ✅ Makes it easy to run before any AI function deploy
- ⚠️  Needs to parse `docs/AI_MODELS.md` (fragile against doc format changes)
- ⚠️  More complex than either A or B for a one-time tooling task

**Estimated Scope:** Medium — 1 new file (~180 lines)

---

## Anti-Regression Check (All Strategies)

| Check | All Strategies |
|-------|---------------|
| Hardcoded hex values | ✅ PASS — no UI |
| Invented Firestore fields | ✅ PASS — no Firestore |
| AI API keys on client | ✅ PASS — local dev script, not browser code; `functions/.env` gitignored |
| Auto-applied scarcity tags | ✅ PASS — not applicable |
| PII in logs | ✅ PASS — model metadata only |
| Age gates at component level | ✅ PASS — not applicable |
| Unapproved motion patterns | ✅ PASS — CLI script, no UI |

---

## Recommendation

**Strategy A** for immediate value with zero risk. The list-only output is sufficient to
update `AI_MODELS.md` and the key validation (if the API returns 200, the key works). If latency
data is later needed, Strategy B can be run on demand by extending the same script.

---

*The Pawn Shop · docs/plans/E101_GEMINI_MODEL_INSPECTOR_PLAN.md · 2026-06-09*
