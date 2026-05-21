# Implementation Plan: Cannabis Mobile Mood Pills (02_CANNABIS_MOBILE_PILLS)

## Phase 1 — Persona & Compliance Gate

**1.1 Identify the Persona**
- **Primary persona:** Marie — The Wellness Seeker (requires a premium, clean, uncluttered interface).
- **Secondary persona:** Kevin — The Reseller (requires fast, easily tappable filters).

**Tests Applied:**
- **Marie Discretion Test:** The pills must look sophisticated, using subtle borders and the `.view-cannabis` primary color for active states. They cannot look like standard budget buttons.
- **Kevin Speed Test:** The pills must have sufficient padding to ensure easy tap targets on mobile screens.

**1.2 Compliance Gate**
- [x] Age gate required? Yes, but already enforced at router level for `/cannabis`.
- [x] `auditLogs` event defined? N/A (UI change only).
- [x] PII excluded from logs? Yes.
- [x] `policeHold` logic respected? N/A.
- [x] All AI API calls through CFs? N/A.

---

## Phase 2 — Schema Audit

Collections impacted:
- NONE

New fields required: NONE

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — CSS-Based Responsive Display (DOM Duplication)
**Summary:** Render both the `MoodPillStrip` and the `MoodCard` grid in the DOM, but use CSS media queries (e.g., `display: none`) to show the pills on mobile and the cards on desktop.
**Architecture:**
- Create `src/components/cannabis/MoodPillStrip.tsx` using `var(--color-primary)` and `var(--space-*)`.
- In `CannabisPage.tsx`, wrap the `MoodPillStrip` in a `<div className="mobile-only">` and the `MoodCard` grid in a `<div className="desktop-only">`.
**Persona Lens:**
- Delivers the exact UI required for Marie on mobile, maintaining desktop grandeur.
**Compliance:** Satisfies all requirements.
**Trade-offs:**
- Gains bulletproof Lighthouse performance (perfect for SSR, no layout shifts). Sacrifices slight DOM bloat by rendering both components invisibly.
**Estimated scope:** Medium — 2 files + CSS updates.

### Strategy B — JS-Based Responsive Display (`useMediaQuery` hook)
**Summary:** Create a `useMediaQuery` hook to check the viewport width in JavaScript, rendering only the `MoodPillStrip` on mobile and only the `MoodCard` grid on desktop.
**Architecture:**
- Create `src/hooks/useMediaQuery.ts`.
- In `CannabisPage.tsx`: `const isMobile = useMediaQuery('(max-width: 768px)')`. Conditionally return the correct component.
**Persona Lens:**
- Delivers the exact UI required for Marie on mobile.
**Compliance:** Satisfies all requirements.
**Trade-offs:**
- Gains a cleaner DOM tree; sacrifices SSR compatibility (will cause a layout shift or hydration mismatch on mobile devices until the JS executes).
**Estimated scope:** Medium — 3 files.

### Strategy C — Universal Pill Strip (Replace Cards entirely)
**Summary:** Completely replace the `MoodCard` grid with a luxurious, centrally aligned `MoodPillStrip` for ALL viewports, completely unifying the design.
**Architecture:**
- Replace the entire `ALL_MOODS.map(MoodCard)` block in `CannabisPage.tsx` with `<MoodPillStrip />`.
- Style it to scale elegantly on desktop.
**Persona Lens:**
- Unifies the experience but loses the rich, imagery-based `MoodCard` layout that Marie might enjoy on large screens.
**Compliance:** Satisfies all requirements.
**Trade-offs:**
- Gains ultimate simplicity and minimum code; sacrifices the grand cinematic presentation of the mood cards on desktop.
**Estimated scope:** Small — 2 files.

> [!TIP]
> ### Recommendation
> **Strategy A** is highly recommended. It perfectly preserves the luxurious cinematic `MoodCard` layout on desktop while solving the vertical space issue on mobile. By using CSS media queries (`display: none`), we ensure zero hydration mismatches or layout shifts, keeping our Lighthouse scores high (a key requirement for the E37 SSR epic).

---

## Phase 4 — Anti-Regression Protocol

1. **The Hardcoded Hex Trap:** `MoodPillStrip` will strictly use `var(--color-border)`, `var(--color-primary)`, and `var(--color-bg)`.
2. **The Firestore Field Invention Trap:** N/A.
3. **The Client-Side AI Key Trap:** N/A.
4. **The Scarcity Manufacture Trap:** N/A.
5. **The PII Log Trap:** N/A.
6. **The Age Gate Bypass Trap:** Unaffected.
7. **The Motion Trap:** We will use standard `transition: all var(--motion-speed-fast) var(--motion-easing);` on the pills, matching approved patterns.
8. **The Typography Scale Trap:** We will use `var(--text-body)` or `var(--text-small)` for the pill text.
9. **The Brand Voice Trap:** Label text remains the approved "Relax, Focus, Social, Ceremony".
