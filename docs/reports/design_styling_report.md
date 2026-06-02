# Design & Styling Architecture Report
**Platform:** The Pawn Shop (Multi-Vertical)

## 1. Architecture & Token System
The platform employs a robust, CSS-variable-driven theming architecture designed to support multiple business verticals within a single codebase.

### Technical Implementation
- **Framework:** Vanilla CSS custom properties (`var(--)`) with Tailwind CSS.
- **Scope Pattern:** Global tokens (spacing, typography scale, motion bases) are defined in `:root`. View-specific palettes and typography overrides are applied via top-level CSS classes (`.view-pawn`, `.view-cannabis`, `.view-fireworks`, `.view-tobacco`) cascading down from the `ViewContext`.
- **Constraint:** There is a strict rule against using JavaScript conditionals for styling. All thematic shifts are handled purely through CSS cascade.
- **Hardcoded Hex Ban:** The anti-regression protocol strictly bans hardcoded hex values in component code. Everything must map to semantic variables like `var(--color-primary)`.

---

## 2. Multi-Vertical Themes

The system currently supports four distinct storefronts, each with tailored palettes, typography, and motion easing.

### 🏺 Pawn Shop (Core)
- **Palette:** Gold (`#C8A14A`) on Near-Black (`#080706`) with Brass accents.
- **Typography:** *Playfair Display* (Display) paired with *IM Fell English* (Body).
- **Motion:** Standard (400ms) with a cubic-bezier optimized for deliberate pacing.
- **Tone:** Cinematic luxury, storytelling, deep shadow pools.

### 🌿 Cannabis
- **Palette:** Purple (`#7B4FA0`) on Deep Purple (`#1A0D2E`) with Lavender accents.
- **Typography:** *Cormorant Garamond* (Display) paired with *DM Sans* (Body).
- **Motion:** Slow (600ms) to evoke a calming, deliberate, and relaxed atmosphere.
- **Compliance Constraint:** Purple on Deep Purple is strictly limited to large text (24px+) to maintain WCAG AA contrast ratios (2.8:1).

### 🎆 Fireworks
- **Palette:** Red (`#C0392B`) on Dark Red (`#1A0A0A`) with Amber accents.
- **Typography:** *Bebas Neue* (Display) paired with *Oswald* (Body).
- **Motion:** Fast and energetic (300ms) with bouncy easing.
- **Tone:** Celebratory, urgent, high contrast.

### 🍂 Tobacco
- **Palette:** Deep Gold (`#D4AF37`) on Dark Brown (`#1A1108`) with Bronze accents.
- **Typography:** *Oswald* (Display) paired with *DM Sans* (Body).
- **Motion:** Standard (400ms).

---

## 3. Typography & Spacing Scale

### Typography System
The system relies on an 8-step fluid typography scale:
- `--text-hero` (72px): Above-the-fold impact.
- `--text-display` (48px): Section headlines.
- `--text-heading` (32px) to `--text-xs` (12px): Standard scale.
*Note: Font sizes are never hardcoded in pixels within components; they strictly consume the `--text-*` variables.*

### Spatial System
The padding/margin system uses an 8-step spatial scale ranging from `--space-1` (4px) to `--space-24` (96px). This ensures consistent rhythm across layouts, from tight component padding to generous luxury editorial breathing room.

---

## 4. Component Standards

### Buttons and Interactive Elements
- **Touch Targets:** All interactive touch targets must have a minimum height of **44px** to satisfy WCAG 2.5.5.
- **The Makoonsii Check:** Primary conversion actions are boosted to **48px** for optimal accessibility.
- **Variants:** Primary, Secondary, Ghost, and Urgency (exclusive to the Fireworks view).
- **States:** Comprehensive focus-visible (2px offset ring), hover, and disabled state styling implemented natively in CSS.

### Motion Constraints
Prohibited motion patterns across all views:
- Flashy slide-ins or page flips
- Excessive bouncy physics
- Gamification motion (XP bars) or cheap particle effects
*Approved patterns include slow fades, cinematic reveals, and ambient glows.*

---

## 5. Accessibility & UX Gates

- **Contrast:** Strict WCAG AA minimums (4.5:1 body, 3:1 large).
- **Performance:** Quick-view modals must trigger in under 200ms. Algolia search must resolve under 300ms.
- **Age Gating:** Fully styled, immersive, full-screen compliance gates block access to Cannabis and Fireworks without bypass mechanisms, styled natively to their respective themes.
