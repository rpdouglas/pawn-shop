# 02 — Cannabis Mobile Mood Pills: Implementation Plan

**Spec:** `docs/projects/02_CANNABIS_MOBILE_PILLS.md`
**Reference design:** `docs/reports/MoodPillStrip.jsx`
**Planned:** 2026-05-21

---

## Phase 1 — Persona & Compliance Gate

**Primary persona:** Marie — The Wellness Seeker. Stacked MoodCards on mobile create excessive vertical bulk before she can reach products. Horizontal pills keep the intent-navigation compact and elegantly out of the way.

**Secondary personas:** Makoonsii — 48px touch targets on every pill; single-thumb swipeable on 375px.

**Tests applied:**
- Marie Discretion Test: pill labels are plain mood names; no clinical/strain language
- Makoonsii Trust Test: 48px minimum height, one-thumb navigable, plain language

**Compliance:**
- Age gate: unchanged at router level (`main.tsx:42`). No new routes.
- `auditLogs`, PII, `policeHold`, AI: all N/A.

---

## Phase 2 — Schema Audit

```
Collections impacted: NONE
New fields required: NONE
```

Pure UI enhancement. No Firestore reads or writes.

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Text-Only Pills, CSS Visibility (Minimal)

**Summary:** Text-only `MoodPillStrip.tsx` (no icons), toggled with `@media` CSS classes.

**Architecture:**
- `src/components/cannabis/MoodPillStrip.tsx` — NEW, text labels only
- `src/pages/CannabisPage.tsx` — add `.mood-pills` / `.mood-cards` wrapper divs
- `src/index.css` — 3 CSS rules to show/hide at 768px breakpoint

**Persona Lens:** Marie: vertical bulk removed on mobile. Slightly less polished without icons.

**Compliance:** All gates pass.

**Trade-offs:** Simplest scope, but pills feel like generic filter chips — misses the premium brand marker that icon + label pairing provides.

**Estimated scope:** Small — 1 new file, 2 modified

---

### Strategy B — Icon Pills, CSS Visibility (Recommended)

**Summary:** `MoodPillStrip.tsx` with Tabler icons (CDN-loaded), "All" pill, token-only styling; CSS media classes toggle visibility between pills and cards.

**Architecture:**
- `src/components/cannabis/MoodPillStrip.tsx` — NEW
  - Props: `activeMood: MoodCategory | null`, `onChange: (mood: MoodCategory | null) => void`
  - 5 pills: All (`ti-circle`) + Relax (`ti-moon`) / Focus (`ti-bolt`) / Social (`ti-users`) / Ceremony (`ti-flame`)
  - Active state: `--color-accent` border + `color-mix(in srgb, var(--color-accent) 15%, transparent)` bg + `--color-text` label
  - Horizontal flex row, `overflowX: 'auto'`, pill border-radius `9999px` (visual constant, no token)
  - All sizing/spacing via `--space-*` tokens; transition via `--motion-speed-fast`
  - `minHeight: var(--space-12)` (48px) on every pill
- `src/pages/CannabisPage.tsx` — MODIFY: add `<MoodPillStrip activeMood={filters.mood} onChange={mood => setFilters(f => ({ ...f, mood }))} />` above MoodCards, wrap each in `.mood-pills` / `.mood-cards` divs
- `src/index.css` — MODIFY: 4 CSS rules in the cannabis section

```css
/* Mobile: show pills, hide cards */
.mood-pills { display: flex; }
.mood-cards { display: none; }

/* Tablet+: show cards, hide pills */
@media (min-width: 768px) {
  .mood-pills { display: none; }
  .mood-cards { display: grid; }
}
```

**Persona Lens:**
- Marie: icon-anchored pills are recognisable without reading — speed-browse by shape and label. "All" pill resets filter without hunting for a clear button.
- Makoonsii: 48px min-height, `aria-pressed` on each pill, icons `aria-hidden`, swipeable row.

**Compliance:** Pill labels: Relax/Focus/Social/Ceremony — no clinical terms. "All" clears `filters.mood` via same state path as FilterPanel.

**Trade-offs:** Both DOM nodes rendered (trivially small, zero performance concern). `index.css` grows by 8 lines.

**Estimated scope:** Small-Medium — 1 new file, 2 modified

---

### Strategy C — JS Breakpoint Hook, Exclusive Render (Robust)

**Summary:** `useMobileBreakpoint` hook conditionally renders either MoodPillStrip or MoodCards — never both.

**Architecture:**
- `src/hooks/useMobileBreakpoint.ts` — NEW, `window.matchMedia('(max-width: 767px)')` with listener cleanup
- `src/components/cannabis/MoodPillStrip.tsx` — NEW (same as Strategy B)
- `src/pages/CannabisPage.tsx` — `const isMobile = useMobileBreakpoint()` conditional render

**Persona Lens:** Identical UX to Strategy B.

**Trade-offs:** Clean DOM but introduces JS for a purely visual concern; requires `typeof window !== 'undefined'` guard if E37 SSR ships; duplicates AdminLayout pattern without a shared abstraction.

**Estimated scope:** Medium — 2 new files, 1 modified

---

### Recommendation

**Strategy B.** Responsive visibility is a CSS concern. Both components are trivially small — rendering both in the DOM has zero cost. Strategy C introduces JS for something CSS handles natively and would break under E37 SSR without guards. Strategy A omits icons that meaningfully elevate the pill strip from a filter chip to a premium navigation element. Strategy B is CSS-idiomatic, delivers the full reference-design intent, and keeps scope minimal.

---

## Phase 4 — Anti-Regression Protocol

| Check | Ruling |
|---|---|
| Hardcoded hex | Reference uses `#888`, `#111`, `rgba(0,0,0,0.15)` — all replaced with `var(--color-text-muted)`, `var(--color-text)`, `var(--color-border)`, `var(--color-accent)` |
| px spacing | `gap: 7px` → `var(--space-2)`, `padding: 6px 13px` → `var(--space-2) var(--space-4)`, `font-size: 13px` → `var(--text-small)`. `border-radius: 9999px` is an acceptable visual constant (pill shape; no token). |
| Firestore field invention | N/A |
| Client-side AI keys | N/A |
| Scarcity manufacture | N/A |
| PII in logs | N/A |
| Age gate bypass | No new routes. `/cannabis` router guard untouched. |
| Motion trap | `transition: all 0.15s` → `all var(--motion-speed-fast) var(--motion-easing)`. No bounce, no particles. |
| Cannabis contrast | Active pill: `--color-text` (near-white `#F0EAF8`) on `color-mix(in srgb, var(--color-accent) 15%, transparent)` → near-white on dark surface ≫ 4.5:1 ✓. `--color-primary` is NOT used for text on pills. |
| Brand voice | Labels: All / Relax / Focus / Social / Ceremony — plain language, no strain jargon, no clinical terms. |
| Pre-existing MoodCard violations | `MoodCard.tsx` has hardcoded `28px`, `15px`, `13px`, `32px 24px` etc. Out of scope for this ticket — pre-existing. |

---

*The Pawn Shop · docs/plans/02_CANNABIS_MOBILE_PILLS_PLAN.md · v1.0*
