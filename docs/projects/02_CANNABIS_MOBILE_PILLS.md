# Project Spec: Cannabis Mobile Mood Pills (02_CANNABIS_MOBILE_PILLS)

**Status:** Done — 2026-05-21

## 1. Feature Description
The current cannabis page (`/cannabis`) uses a grid of `MoodCard` components for the 4 categories (Relax, Focus, Social, Ceremony). On mobile, these cards stack and consume excessive vertical space. The goal is to replace these cards with a horizontal "pill strip" layout (similar to `MoodPillStrip.jsx`) specifically for mobile view, using our premium design system tokens.

## 2. Personas
- **Primary:** Marie — The Wellness Seeker. Appreciates an uncluttered, elegant, and premium mobile shopping experience.
- **Secondary:** Kevin — The Picker. Needs fast, reliable tap targets.

## 3. Compliance Requirements
- **Age Gate:** Remains at the router level for `/cannabis`.
- **PII:** N/A.
- **Hex Codes:** Must strictly use `.view-cannabis` tokens (`var(--color-primary)`, `var(--color-bg)`, etc.)—no hardcoded hexes.
- **Brand Voice:** Pill labels must match the exact mood categories (Relax, Focus, Social, Ceremony).

## 4. Technical Scope
- Create a new `MoodPillStrip.tsx` component.
- Integrate into `src/pages/CannabisPage.tsx` alongside the existing `MoodCard` grid, using responsive techniques to show pills on mobile and cards on desktop.
