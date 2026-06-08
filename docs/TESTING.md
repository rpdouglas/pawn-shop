# Testing Guide

## What runs in CI on every push

| Gate | Command | Speed |
|---|---|---|
| Lint | `npm run lint` | ~20s |
| Unit tests | `npm run test` | ~30s |
| Build | `npm run build` | ~60s |

These run automatically on every push to `dev` or `main`.

## What does NOT run on every push

Accessibility, E2E, and Lighthouse audits are **not** in the push pipeline — they require Playwright + Firebase Emulators and add 8–12 minutes per push.

They run via a separate workflow: `.github/workflows/e2e.yml`.

---

## Running E2E / A11y / LHCI locally

Requires the Firebase Emulator Suite to be running. Start it first:

```bash
npm run dev:full
```

Then in a separate terminal:

```bash
# Full E2E + accessibility suite
npm run test:e2e

# Accessibility (axe-core) spec only
npm run test:a11y

# Lighthouse performance audit
npm run test:lhci

# Everything — lint, unit, e2e
npm run lint && npm run test && npm run test:e2e
```

---

## When to run before committing

| Change type | Run |
|---|---|
| Route, navigation, or age gate change | `test:a11y` |
| New page, major component, or layout change | `test:e2e` |
| Bundle size, lazy loading, or image pipeline | `test:lhci` |
| Large feature close (before merging to main) | `test:e2e` |
| Pre-release to prod | `test:e2e` (or trigger via GitHub Actions UI) |

For routine fixes, typos, and config changes — lint + unit tests are sufficient.

---

## Triggering the CI E2E workflow manually

Go to **GitHub → Actions → E2E, Accessibility & Lighthouse → Run workflow**.

This runs the full suite in CI using the same environment as the automated weekly run. Use this before any significant release or when you want a second opinion on E2E health without a local emulator setup.

The workflow also runs automatically every **Sunday at 03:00 UTC** as a passive regression catch.
