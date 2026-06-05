# 3-Strategy Plan: Remove Cannabis Page CTA

## Context
The "Explore collections" button on the `CannabisPage.tsx` takes up too much space and the user has requested its removal to streamline the UI.

---

### Strategy A: Minimal (Recommended)
Simply remove the `ctaLabel` and `onCtaClick` properties from the `<CinematicHero>` invocation in `src/pages/CannabisPage.tsx`. Since `<CinematicHero>` treats the CTA as optional, this is the most surgical and direct approach.
- **Persona Impact (Marie - The Wellness Seeker):** Reduces visual clutter, letting the cinematic visuals speak for themselves.
- **Compliance Checklist:** Age gate maintained, zero PII impact, zero police hold impact, zero audit log impact.
- **Schema Audit:** No Firestore collections or fields impacted.

### Strategy B: Refactor CinematicHero Component
Remove the `ctaLabel` prop entirely from the `<CinematicHero>` component's definition if it's unused elsewhere, making the hero purely presentational across the app.
- **Persona Impact (Marie):** Same as A.
- **Compliance Checklist:** Age gate maintained, zero PII impact, zero police hold impact, zero audit log impact.
- **Schema Audit:** No Firestore collections or fields impacted.
- **Drawback:** Could break other views if they rely on the CTA in their hero sections. Requires a broader codebase audit.

### Strategy C: Conditional CTA Rendering
Keep the CTA properties but allow the `<CinematicHero>` to conditionally render it based on viewport size (e.g., hide on mobile to save space, but show on desktop).
- **Persona Impact (Marie):** Inconsistent experience across devices.
- **Compliance Checklist:** Age gate maintained, zero PII impact, zero police hold impact, zero audit log impact.
- **Schema Audit:** No Firestore collections or fields impacted.
- **Drawback:** The user explicitly stated it is "pointless," so hiding it only on mobile doesn't fully resolve the user's core feedback.

---

**Approval Required:** Please confirm if we should proceed with **Strategy A** (surgical removal).
