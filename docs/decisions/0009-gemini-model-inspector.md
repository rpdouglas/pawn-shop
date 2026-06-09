# Decision 0009 — E101 Gemini Model Inspector: REST API + functions/.env Pattern

**Date:** 2026-06-09
**Epic:** E101 · Gemini Model Inspector (Developer Tool)
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

The project had no local developer tool for:
1. Verifying a Gemini API key before deploying
2. Discovering which model IDs Google currently exposes
3. Cross-checking `docs/AI_MODELS.md` against live availability

The invalid model ID `gemini-3.1-pro` caused a production 500 incident. A lightweight inspection
tool reduces the risk of shipping non-existent or deprecated model IDs.

Two questions required decisions:
- **Where to store the developer API key** (local, gitignored, not Secret Manager)
- **How to query the model list** (SDK vs. REST)

---

## Decision 1 — Key Location: `functions/.env`

The Gemini API key for developer tooling is stored in `functions/.env`.

**Rationale:**
- Already listed in `.gitignore` as `functions/.env` — key is never accidentally committed.
- This is the Firebase-standard location for local function environment variables used by the emulator.
- Firebase's own `defineSecret` reads from `functions/.env` when running locally with `firebase emulators:start`.
- Consistent with the existing pattern; no new gitignore entries needed.

**Alternatives rejected:**
- Root `.env` — not currently in `.gitignore`; requires a gitignore change and risks key exposure.
- `scripts/.env` — creates a new pattern with no gitignore coverage; easily forgotten.
- Hard-coded in script — never acceptable.

---

## Decision 2 — Model List Query: Gemini REST API (not SDK)

The script calls `GET https://generativelanguage.googleapis.com/v1beta/models` directly via Node's native `fetch`.

**Rationale:**
- The `@google/generative-ai` SDK (`v0.24.x`) does not expose a `listModels()` method.
- The REST API is stable, well-documented, and returns the canonical model list with full metadata (token limits, generation methods, version, display name).
- Using `fetch` directly adds zero new npm dependencies.
- The script is a developer tool, not production code — using the REST API directly is appropriate.

**Alternatives rejected:**
- `@google/cloud-aiplatform` — much heavier SDK for Vertex AI; wrong package for the Gemini API used in this project.
- Scraping the Gemini docs — brittle and not machine-readable.

---

## Compliance Notes

- `functions/.env` is gitignored — no key commits possible.
- Script is developer-local; runs on the developer's machine, not in the browser.
- Output is model metadata only — no user data, no PII.
- `docs/AI_MODELS.md` is not auto-written by the script — developer reviews output and updates manually.

---

## Files Introduced

| File | Purpose |
|------|---------|
| `scripts/list-gemini-models.mjs` | Model inspector script — reads key, queries REST API, outputs annotated table |

---

*The Pawn Shop · docs/decisions/0009-gemini-model-inspector.md · 2026-06-09*
