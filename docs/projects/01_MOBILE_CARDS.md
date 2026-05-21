# Project Spec: Mobile Card Height Adjustment (01_MOBILE_CARDS)

## 1. Feature Description
The user has requested to increase the height of the navigation cards on the homepage in mobile view by 25%.

## 2. Personas
- **Primary:** Mobile users viewing the Pawn Shop homepage (needs tappable, clear navigation).
- **Tests Applied:** Makoonsii Trust Test (clean UI), Kevin Speed Test (easy tap targets).

## 3. Compliance Requirements
- No PII involved.
- No age gates directly impacted (router-level handles it).
- No hardcoded hex values (use `var(--space-*)` or standard css padding/min-height adjustments instead of explicit px sizes if possible, or relative units).

## 4. Technical Scope
- File to check: `src/index.css` (mobile media query for `.portal-card`).
- Adjust padding or `min-height` by roughly 25%.
