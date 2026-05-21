# Implementation Plan: Mobile Card Height Adjustment (01_MOBILE_CARDS)

## Phase 1 — Persona & Compliance Gate

**1.1 Identify the Persona**
- **Primary persona:** Mobile users viewing the Pawn Shop homepage (needs tappable, clear navigation).
- **Secondary personas:** N/A (no personas harmed).

**Tests Applied:**
- **Makoonsii Trust Test:** The layout must maintain a clean, trustworthy UI without becoming cluttered.
- **Kevin Speed Test:** Tap targets must be generously sized and easy to act on quickly.

**1.2 Compliance Gate**
- [x] Age gate required? N/A (CSS change only).
- [x] `auditLogs` event defined? N/A.
- [x] PII excluded from all logs and analytics? Yes.
- [x] `policeHold` logic respected? N/A.
- [x] `aiDescription` kept separate from `description`? N/A.
- [x] All AI API calls going through Cloud Functions? N/A.

---

## Phase 2 — Schema Audit

Collections impacted:
- NONE

New fields required: NONE

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimal Padding Increase
**Summary:** Increase the vertical padding on `.portal-card` in the mobile media query by swapping the undefined `var(--space-3)` for `var(--space-4)`.
**Architecture:**
- Update `src/index.css` inside `@media (max-width: 480px)`.
- Change `padding: var(--space-3) var(--space-4);` to `padding: var(--space-4) var(--space-4);`.
**Persona Lens:**
- Improves tap targets slightly for Kevin, but may not hit the full 25% requested increase.
**Compliance:**
- Satisfies all compliance requirements.
**Trade-offs:**
- Gains simplicity, but sacrifices the precise 25% height increment requested.
**Estimated scope:** Small — 1 file.

### Strategy B — Recommended `min-height` & Token Padding
**Summary:** Update vertical padding to `var(--space-4)` and introduce a `min-height: 5rem;` (or use `min-height: calc(var(--space-16) + var(--space-4))` approx 80px) to guarantee a 25% height increase.
**Architecture:**
- Update `src/index.css` inside `@media (max-width: 480px)`.
- Change `.portal-card` to use `padding: var(--space-4);` and add `min-height: 5rem;` (or equivalent token usage like `min-height: var(--space-24);` adjusted for the card).
**Persona Lens:**
- Perfectly satisfies Kevin Speed Test by guaranteeing uniform, larger tap targets regardless of content wrapping.
**Compliance:**
- Satisfies all compliance requirements.
**Trade-offs:**
- Gains reliable visual consistency and exact adherence to the +25% requirement; sacrifices slight brevity by adding a new property.
**Estimated scope:** Small — 1 file.

### Strategy C — Robust Token Expansion
**Summary:** Introduce a new spacing token `--space-5: 20px` in the root and apply it to `.portal-card` vertical padding to scale it proportionally without forcing a `min-height`.
**Architecture:**
- Add `--space-5: 20px` to `:root` in `src/index.css`.
- Update `.portal-card` padding to `padding: var(--space-5) var(--space-4);`.
**Persona Lens:**
- Helps Kevin with larger targets and preserves fluid scaling for Makoonsii.
**Compliance:**
- Satisfies all compliance requirements.
**Trade-offs:**
- Gains a new reusable spacing token that perfectly splits the difference between space-4 and space-6, but slightly increases the global token surface area.
**Estimated scope:** Small — 1 file.

### Recommendation
**Strategy B** is recommended. Introducing a `min-height` ensures that every card provides a uniform, generously sized tap target that satisfies the Kevin Speed Test, regardless of text wrap. It relies on existing CSS capabilities and standard relative units (`rem`) without unnecessarily expanding the global token root (as Strategy C would), cleanly meeting the 25% height increase request.

---

## Phase 4 — Anti-Regression Protocol

1. **The Hardcoded Hex Trap:** No colors are being modified; no hex values used.
2. **The Firestore Field Invention Trap:** No schema changes.
3. **The Client-Side AI Key Trap:** N/A.
4. **The Scarcity Manufacture Trap:** N/A.
5. **The PII Log Trap:** N/A.
6. **The Age Gate Bypass Trap:** N/A.
7. **The Motion Trap:** No new animations are introduced.
8. **The Typography Scale Trap:** No typography sizes are changed. Height adjustment relies on `rem` or padding tokens.
9. **The Brand Voice Trap:** N/A (no copy changes).
