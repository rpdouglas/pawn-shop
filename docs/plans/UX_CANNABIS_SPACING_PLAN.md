# 3-Strategy Plan: Reduce Cannabis Page Spacing

## Context
The user wants to reduce the dead space between the Cinematic Hero subheader and the "Shop by Mood" section title by 75%. The current top padding is `var(--space-12)` (48px). A 75% reduction means the new top padding should be 12px.

---

### Strategy A: Design System Token Approximation (Recommended)
Change the `padding` inline style of the `<section id="cannabis-collections">` in `src/pages/CannabisPage.tsx` from `var(--space-12) var(--space-6)` to `var(--space-4) var(--space-6) var(--space-12)`.
- `var(--space-4)` is 16px (a 66.7% reduction, very close to 75% while strictly adhering to existing design system tokens).
- **Persona Impact (Marie):** Brings content closer while maintaining established spacing rhythm.
- **Compliance/Schema:** Zero impact.

### Strategy B: Exact Pixel Match
Change the inline style to `padding: '12px var(--space-6) var(--space-12)'`.
- Achieves exactly a 75% reduction from 48px to 12px.
- **Persona Impact (Marie):** Exact spacing as requested.
- **Compliance/Schema:** Zero impact.
- **Drawback:** Introduces a hardcoded magic number (`12px`) instead of using the token system.

### Strategy C: New Design System Token
Add `--space-3: 12px;` to `index.css` and use it for the padding: `var(--space-3) var(--space-6) var(--space-12)`.
- **Persona Impact (Marie):** Exact spacing while adhering to a token system.
- **Compliance/Schema:** Zero impact.
- **Drawback:** Requires modifying global CSS variables for a single view's tweak, slightly expanding the token surface area.

---

**Approval Required:** Please confirm if we should proceed with **Strategy A** (closest existing token, 16px) or **Strategy B/C** for an exact 12px reduction.
