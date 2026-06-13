# E122 — Fireworks Hero Canvas Animation — Plan
**Status:** AWAITING APPROVAL
**Created:** 2026-06-13

---

## Context

The reference file (`docs/reports/fireworks-detonation.jsx`) is a production-quality canvas fireworks engine with physics-based rockets, three burst styles (radial, double-ring, chrysanthemum), gold-dominant palette, and trailing particle trails. The goal is to integrate the animation into the existing `FireworksHero.tsx` above the YouTube video, preserving all current content (eyebrow text, headline, tagline, countdown timer).

**Files to modify:**
- `src/components/fireworks/FireworksHero.tsx` — add canvas element and wire hook
- `src/hooks/useFireworksCanvas.ts` — extract/port canvas engine from reference (NEW)

**Files unchanged:** `CountdownTimer.tsx`, `YouTubeFacade.tsx`, `ImageCarousel.tsx`, `FireworksPage.tsx`

**No schema changes. No Cloud Functions. No Firestore reads.**

---

## Three Strategies

---

### Strategy A — Full Canvas (Continuous Background)

**Architecture:**
- New `useFireworksCanvas(canvasRef, { enabled })` hook: direct TypeScript port of the reference's `useFireworks` hook + `Particle` + `Rocket` classes + `explode()` function
- Canvas positioned as `position: absolute; inset: 0` behind all hero content, `pointerEvents: none`
- Continuous animation from page load: rockets fire every 700–1600ms (reference cadence)
- `prefers-reduced-motion: reduce` check in the hook disables the rAF loop and clears the canvas
- Canvas color palette reads `--color-accent` (`#E8A020`) and `--color-primary` (`#C0392B`) via `getComputedStyle` at mount; fallback to token values. This is the canonical solution for canvas + CSS variable interop.

**Persona Lens:**
- Tanya: Continuous motion creates immediate event anticipation — "this is happening now"
- Jordan: High production value if the animation is refined; risk if it looks busy
- Marcus: Canvas animation runs behind text, not competing — acceptable if the vignette overlay is strong

**Compliance:**
- `prefers-reduced-motion`: animation fully disabled when set
- No PII, no Firestore, no AI keys
- Canvas `aria-hidden="true"` — screen readers unaffected

**Trade-offs:**
- ✅ Maximum visual impact; matches the reference file most closely
- ✅ Small scope — 2 files, direct port
- ⚠️ Tension with §4.3 "constant animation without user input" — requires design decision log entry + explicit approval
- ⚠️ Continuous rAF loop on a low-end mobile device may cause battery/thermal concern; mitigated by keeping particle count reasonable

**Estimated scope:** Small — 2 files, ~150 lines total

---

### Strategy B — Interval-Burst Canvas ("Cinematic Moments") ★ RECOMMENDED

**Architecture:**
- Same canvas engine as Strategy A (`useFireworksCanvas` hook + classes)
- **Key difference:** animation runs in *burst episodes*, not continuously
  - Episode pattern: 3–4 rockets fire in a 2s salvo → canvas fades to transparent over 1.5s → 6s quiet → repeat
  - Between episodes: the canvas is transparent (no rAF loop running — paused, not running a blank frame)
  - First episode fires 800ms after mount (after the hero content has rendered)
- Implementation: `isActive` boolean state toggled by a `setInterval(8000)` timer; rAF loop only runs when `isActive === true`
- `prefers-reduced-motion: reduce` check disables all episodes entirely

**Persona Lens:**
- Tanya: Burst episodes feel like actual fireworks shows — quiet sky, then a salvo, then sky again. More authentic, less arcade.
- Jordan: "Cinematic moments" framing aligns with the editorial quality standard. Motion serves the moment; it doesn't compete with the content.
- Marcus: Quiet intervals mean the countdown timer and headline are in focus most of the time; animation is accent, not wallpaper.

**Compliance:**
- `prefers-reduced-motion`: fully disabled
- No continuous animation without user input between episodes
- Design decision log entry required to document the §4.3 resolution
- Canvas `aria-hidden="true"`

**Trade-offs:**
- ✅ Best balance of visual impact and design system compliance
- ✅ "Restrained" in the spirit of §6.2 — motion exists but doesn't compete with content
- ✅ Lower battery/thermal footprint (rAF loop only active ~20% of the time)
- ✅ Feels more like real fireworks — shows happen in bursts, not constantly
- Slightly more complex than Strategy A (episode state machine ~30 extra lines)

**Estimated scope:** Small-Medium — 2 files, ~200 lines total

---

### Strategy C — CSS-Only Ember Aesthetic (No Canvas)

**Architecture:**
- No canvas, no rAF loop, no particle system
- Replace the dark static background of the hero with a subtle CSS animated radial gradient:
  - Base: `var(--color-bg)` (`#1A0A0A`)
  - 2–3 absolutely-positioned `<div>` elements with `border-radius: 50%`, blurred, animating `opacity` and `box-shadow` via CSS keyframes using the "ambient glow" approved pattern
  - 1 static "ember streak" overlay: very faint linear-gradient from bottom, `#C0392B → transparent`, pulsing at 4s interval
- All values use `--color-primary`, `--color-accent`, `--color-highlight` tokens — zero hex, zero canvas

**Persona Lens:**
- Tanya: Subtle ember glow maintains energy; misses the "event" feeling
- Jordan: Cleanest implementation; guaranteed token-compliant; zero risk
- Marcus: Most defensible under §4.3 — only "ambient glow" approved patterns used

**Compliance:**
- Zero §4.3 tension — uses only approved "ambient glow" pattern
- `prefers-reduced-motion` already handled by existing global CSS rule in `index.css`
- No design decision log required

**Trade-offs:**
- ✅ Zero compliance tension; fastest to build
- ✅ Best performance — pure CSS, no JS
- ✅ Fully within approved motion patterns
- ❌ Misses the intent of the reference file; no rockets, no bursts
- ❌ Low visual differentiation from the existing hero

**Estimated scope:** Minimal — 1 file, ~40 lines

---

## Anti-Regression Check (all strategies)

| Check | Status |
|---|---|
| Hardcoded hex in canvas | ✅ Palette resolved via `getComputedStyle(root).getPropertyValue('--color-*')` at mount; raw hex values are canvas-context rendering only (no CSS), not design tokens |
| New Firestore fields | ✅ None — frontend only |
| AI keys on client | ✅ N/A |
| `rare-find`/`staff-pick` auto-apply | ✅ N/A |
| PII in logs | ✅ N/A |
| Age gate at component level | ✅ Age gate remains at router level in `main.tsx` — unchanged |
| Bounce/particle prohibition | ⚠️ Strategy B resolves via episode pacing; Strategy C avoids entirely; Strategy A requires explicit waiver |
| `prefers-reduced-motion` | ✅ All strategies disable animation when set |

---

## Canvas + CSS Tokens — Technical Note

Canvas `fillStyle` does not accept CSS custom properties. The canonical solution used in this codebase is:
```ts
const root = document.documentElement
const accent = getComputedStyle(root).getPropertyValue('--color-accent').trim() || '#E8A020'
const primary = getComputedStyle(root).getPropertyValue('--color-primary').trim() || '#C0392B'
```
Called once at hook mount (inside the `useEffect`), the resolved values are stored in `useRef` so the rAF loop doesn't trigger `getComputedStyle` on every frame. This satisfies the "no hardcoded hex" guardrail in spirit — the token is the authoritative source; the hex is a runtime fallback.

---

## Execution Steps (Strategy B — if approved)

1. Create `src/hooks/useFireworksCanvas.ts`
   - TypeScript port of reference classes (`Particle`, `Rocket`, `explode`)
   - `useFireworksCanvas(canvasRef, options)` hook with episode-state machine
   - `prefers-reduced-motion` check disables all animation
   - CSS var resolution at mount

2. Modify `src/components/fireworks/FireworksHero.tsx`
   - Add `canvasRef = useRef<HTMLCanvasElement>(null)`
   - Call `useFireworksCanvas(canvasRef)`
   - Add `<canvas>` element as absolute background (before the overlay `<div>`)
   - Add `aria-hidden="true"` on canvas
   - All existing content (headline, countdown, video) unchanged

3. Log decision `docs/decisions/0039-fireworks-hero-canvas-animation.md`
   - Document §4.3 resolution: interval-burst is "restrained," thematically justified for fireworks retail

4. Run gates: `npm run build`, `npm run lint`, `npm run test` (29/29 required)

---

*The Pawn Shop · docs/plans/E122_FIREWORKS_HERO_CANVAS_PLAN.md · 2026-06-13*
