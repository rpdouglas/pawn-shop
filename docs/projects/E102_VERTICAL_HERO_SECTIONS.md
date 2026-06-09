# E102 — Vertical Hero Sections
**Status:** 🔄 IN PROGRESS
**Priority:** MEDIUM
**Effort:** TBD — pending strategy approval
**Cycle:** TBD

---

## Problem

Each vertical currently has a minimal header section, not a proper hero:

| Vertical | Current State | Design System Spec |
|---|---|---|
| Pawn | `PawnHero` — 50vh, text-only | ≥80vh, art-deco shimmer headline, dual CTAs |
| Cannabis | `CinematicHero` — 20vh min, text/image | 100vh, full-bleed, single CTA, mood tagline |
| Fireworks | Inline `<section>` — 30vh, countdown only | Full-screen, countdown + event nav |
| Tobacco | `PortalLayout` — no hero at all | No spec yet (`.view-tobacco` tokens missing) |

Staff want a richer above-the-fold experience for each vertical that communicates what the section offers, with an image carousel or embedded YouTube video sitting above the inventory listings.

## Personas Served

| Persona | Relevance | Specific Test |
|---|---|---|
| **Sandra** (Primary) | Pawn hero is her 10-second make-or-break. Visual richness creates impulse. | Does the hero create "I could find something here" in 10 seconds? |
| **Jordan** (Primary) | Cross-view editorial coherence. Brand narrative visible above fold on all three views. | Would Jordan screenshot and share this hero? |
| **Marcus** | Hero photography must meet dark luxury standard. One bad image ends the session. | Marcus Photography Test — all hero images shot to standard before shipping |
| **Tanya** | Fireworks hero should surface the seasonal narrative prominently. | Countdown timer remains present, not buried below new hero content |
| **Marie** | Cannabis hero must remain discreet — no hard sell, no clinical language | Marie Discretion Test — boutique wellness tone only |
| **Makoonsii** | Accessible touch targets, plain language CTAs, 48px minimum. | 48px CTA targets, captions on all media, keyboard navigable |

## Compliance Gates

- [ ] No age gates in this component — already enforced at router level (no regression)
- [ ] Cannabis hero copy: boutique wellness tone only. No hard sell, no category disclosure
- [ ] No PII in hero content
- [ ] YouTube embeds: use `youtube-nocookie.com` (privacy-enhanced mode, no third-party cookies without consent)
- [ ] Carousel motion: slow-fade only (approved pattern). No bounce, no slide-in-from-sides, no particle effects
- [ ] All design tokens — zero hardcoded hex, px, or ms values
- [ ] Hero images must have descriptive `alt` text
- [ ] Hero images must be staff-photographed to dark luxury standard (Marcus Photography Test)

## Known Pre-Conditions

**Tobacco vertical is blocked for Phase 1:**
- `.view-tobacco` CSS tokens are NOT defined anywhere in `src/index.css` or `src/App.css`
- Without `--color-primary`, `--color-bg`, `--font-display` etc. for tobacco, any hero component renders incorrectly
- Tobacco hero is deferred to Phase 2 of this epic, after view-tobacco token definition

## Out of Scope

- Staff intake for hero images (handled via Firebase Storage upload or admin Firebase console)
- Tobacco view-token definition (separate prerequisite task)
- Age gate changes (none needed — hero renders post-gate on cannabis/fireworks)
- New item carousel (Staff Picks section already handles this)
