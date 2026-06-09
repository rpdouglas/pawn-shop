# Decision 0010 — Hero Media Configuration via `config/shopInfo`

**Date:** 2026-06-09
**Epic:** E102 — Vertical Hero Sections
**Status:** Accepted

## Decision

Hero media (YouTube video IDs and carousel image arrays) for the Pawn, Cannabis, and Fireworks verticals is stored in the existing `config/shopInfo` Firestore document under a new `heroData` map field. Hero layout, copy, and CTAs remain static in React components (code-controlled).

## Rationale

- **LCP protection:** Static copy renders above the fold with zero Firestore latency. Media injects asynchronously after the shopInfo cache resolves — no blocking on LCP.
- **Compliance:** Critical cannabis hero copy (heading, subheading, CTA) is code-controlled, preventing staff from accidentally introducing non-compliant language. Only media URLs are staff-editable.
- **Minimum surface area:** Extends the existing `config/shopInfo` document (already public-read). No new Firestore collection, no new security rules.
- **TanStack Query deduplication:** Multiple components reading `shopInfo` (YearsInBusinessBadge, CannabisPage, hero components) share one cache entry — no extra network requests.
- **Graceful degradation:** If `heroData` is absent or `mediaType === 'none'`, each vertical hero renders correctly as a text-only section.

## Alternatives Considered

- **Strategy A (static heroes):** Fastest to ship but requires code deploy to update any media.
- **Strategy B (Firestore Hero CMS):** Full staff control but larger scope, LCP risk from above-fold Firestore read, and removes code-enforced compliance for cannabis copy.

## Tobacco Note

Tobacco vertical hero is deferred. `.view-tobacco` CSS tokens are not defined. A separate task must define them before a tobacco hero can be shipped.
