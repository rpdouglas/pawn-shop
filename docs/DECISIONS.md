# Decisions

> One-liner log of technical and architectural decisions.
> Add a line whenever you make a meaningful choice. Date it. That's it.
> Replaces formal ADR documents.

---

## Format

```
YYYY-MM-DD — Decision. Brief reason.
```

---

## Log

2026-05-16 — Primary dev environment is GitHub Codespaces. No local setup required or assumed.

2026-05-16 — Firestore prefix tokens (`searchTokens[]`) for search instead of Algolia. Revisit if search UX becomes a problem.

2026-05-16 — Two Firebase projects: `nats-rack` (dev) and `the-addicts-agenda` (prod). No staging — overkill for one developer.

2026-05-16 — GitHub Issues as a simple numbered task list. No labels, no milestones, no Projects board.

2026-05-16 — No Storybook. Build components in context, iterate in the app.

2026-05-16 — `deploy-prod.yml` requires typing "DEPLOY" as confirmation. Intentional friction — prod deploys should be deliberate.

2026-05-16 — `aiDescription` is draft-only, never customer-facing, enforced by Firestore security rules. Staff must promote to `description` before publishing.

2026-05-16 — All AI API calls (Claude/Gemini) go through Cloud Functions. API keys never on the client.

2026-05-16 — Prices stored in CAD cents (integer) to avoid floating-point errors.

2026-05-16 — firebase.json emulators bound to `0.0.0.0` so they are reachable from Codespaces port forwarding.

2026-05-17 — Vite chosen as the build tool. Fast HMR, native ESM, TypeScript out of the box — no CRA or Next.js overhead needed for this app's routing model.

2026-05-17 — deploy-dev.yml skips all steps when package.json is absent. Prevents CI failures before the Vite app is scaffolded.

2026-05-17 — aiDescription and aiPriceSuggestion moved to items/{id}/internal/ai subcollection. Firestore rules are document-level — field-level hiding on the parent document is not enforceable at the rules layer.

2026-05-17 — View-scoped CSS tokens defined as custom properties on `.view-*` selectors, not in Tailwind `@theme` (E02). `@theme` defines globally-fixed values — putting `--color-primary` there would mean one value for the entire app. `.view-*` selectors allow the same token name to cascade differently per view at runtime without JavaScript.

2026-05-17 — Self-hosted fonts via @fontsource npm packages (E02). No CDN requests at runtime. Fonts bundled with the Vite build. Packages: playfair-display, im-fell-english, cormorant-garamond, dm-sans, bebas-neue, oswald.

2026-05-17 — react-router-dom installed in E02, not deferred to E03. ViewContext uses useLocation() — building on window.location would require rewrite when ProtectedRoute (E03) needs the router.

2026-05-17 — PWA manifest uses a single manifest.json with per-view shortcuts. Dynamic per-view theme-color is handled by ViewLayout updating the <meta name="theme-color"> tag on route change. Full per-view manifest files (Strategy C) deferred until brand icon assets exist.

2026-05-17 — TOTP MFA requires Firebase Identity Platform upgrade before production staff accounts are created (E03). TotpMultiFactorGenerator is available in firebase/auth v12 SDK but server-side TOTP enforcement (bypass-impossible) requires Identity Platform. Client-side ProtectedRoute gate and enrollment UI are in place; Identity Platform upgrade is a pre-prod compliance gate (E09/E11).

2026-05-17 — MfaEnrollPage is not wrapped in ProtectedRoute (E03). Wrapping it causes an infinite redirect loop: staff without MFA → /auth/mfa-enroll → ProtectedRoute checks mfaEnrolled → redirect back to /auth/mfa-enroll. The page handles its own auth guard inline instead.

---

*Add new entries above this line.*
