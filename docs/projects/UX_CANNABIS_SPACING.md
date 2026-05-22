# Project Spec: UX Cannabis Spacing Refinement

## Epic
UX Refinements (Cannabis Vertical)

## Description
The user has requested reducing the dead space between the `<CinematicHero>` subheader ("presented with discretion") and the "Shop by Mood" title by 75%.

## Scope
- Modify the padding of the `<section id="cannabis-collections">` in `src/pages/CannabisPage.tsx`.
- The current top padding is `var(--space-12)` (48px). A 75% reduction target is 12px.
- Ensure no regressions occur in the bottom padding or horizontal padding.

## Persona Impact
Primarily impacts **Marie (The Wellness Seeker)** by tightening the visual hierarchy and bringing the main shopping interactions higher above the fold without sacrificing the cinematic feel.

## Compliance & Security
- Age Gate: No changes to the existing cannabis age gate.
- Audit Logs: No impact.
- PII / Police Hold: N/A
- Schema: No impact on Firestore schema.

## Acceptance Criteria
- [ ] Top padding on the `cannabis-collections` section is reduced by roughly 75%.
- [ ] The page builds without compiler errors or type warnings.
