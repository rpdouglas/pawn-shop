# Project Spec: UX Cannabis CTA Refinement

## Epic
UX Refinements (Cannabis Vertical)

## Description
The user has requested the removal of the "Explore collections" CTA button on the `CannabisPage.tsx` (`<CinematicHero />` component) as it takes up too much space and serves little practical purpose.

## Scope
- Modify `src/pages/CannabisPage.tsx` to remove the `ctaLabel` and `onCtaClick` props from `<CinematicHero />`.
- Ensure no regressions occur in layout or visual hierarchy.

## Persona Impact
Primarily impacts **Marie (The Wellness Seeker)** by streamlining the cinematic entry experience into the cannabis section without forcing a redundant jump link.

## Compliance & Security
- Age Gate: No changes to the existing cannabis age gate.
- Audit Logs: No impact.
- PII / Police Hold: N/A
- Schema: No impact on Firestore schema.

## Acceptance Criteria
- [ ] The "Explore collections" button is no longer visible on the Cannabis hero section.
- [ ] The page builds without compiler errors or type warnings.
