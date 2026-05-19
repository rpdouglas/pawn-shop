# Implementation Plan — E27 · Homepage Logo Integration

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona
- **Primary persona:** **Makoonsii**. The logo provides immediate brand recognition and trust upon landing on the homepage. It must be appropriately sized for a mobile viewport and navigable within 3 taps (no blocking interactions).
- **Secondary persona:** **Jordan**. The performance standard (PWA Lighthouse ≥90) means we cannot serve a raw 2.3MB PNG. The image must be optimized and prevent Cumulative Layout Shift (CLS).

### 1.2 Compliance Gate
- [x] **Age gate required?** No (Homepage).
- [x] **`auditLogs` event defined?** No.
- [x] **PII excluded from all logs and analytics?** Yes.
- [x] **`policeHold` logic respected?** N/A.
- [x] **`aiDescription` kept separate?** N/A.
- [x] **All AI API calls go through Cloud Functions?** N/A.

---

## Phase 2 — Schema Audit

**Collections impacted:** NONE.

**New fields required:** NONE.

---

## Phase 3 — Three-Strategy Proposal

### Strategy A — Minimal (Raw Embed)
**Summary:** Insert `<img src="/branding/logo_pc.png">` directly into `HomePage.tsx`.
- **Architecture:** Basic React image element with CSS max-width.
- **Estimated scope:** Small.
- **Trade-offs:** Delivers a massive 2.3MB unoptimized PNG. Fails Jordan's Lighthouse >90 performance standard and slows down mobile loading (anti-Makoonsii).

### Strategy B — Recommended (Pre-Optimized WebP)
**Summary:** Manually convert `logo_pc.png` to a highly compressed `logo.webp` using a temporary Node script (via `sharp`). Insert the optimized WebP with explicit `width` and `height` attributes to prevent Layout Shift.
- **Architecture:** `sharp` optimization + semantic `<img src="/branding/logo.webp">`.
- **Estimated scope:** Small (1 script run + `HomePage.tsx` update).
- **Trade-offs:** Solves the 2.3MB bloat and guarantees Lighthouse performance, while keeping the codebase lightweight without introducing complex build-time image plugins.

### Strategy C — Robust (Vite Image Pipeline)
**Summary:** Install `vite-imagetools` to automatically convert and resize images at build time via `<picture>` tags.
- **Architecture:** Vite plugin + responsive `<source>` tags.
- **Estimated scope:** Medium.
- **Trade-offs:** Best automated performance for future static assets, but introduces unnecessary build dependencies for what is currently a single static logo (inventory images are dynamic and unaffected by this).

---

## Phase 4 — Anti-Regression Protocol

1. **The Hardcoded Hex Trap:** Verified. The logo container will use layout logic only, inheriting background from `.view-*` classes.
2. **The Firestore Field Invention Trap:** N/A.
3. **The Client-Side AI Key Trap:** N/A.
4. **The Scarcity Manufacture Trap:** N/A.
5. **The PII Log Trap:** N/A.
6. **The Age Gate Bypass Trap:** N/A.
7. **The Motion Trap:** N/A.
8. **The Typography Scale Trap:** N/A.
9. **The Brand Voice Trap:** N/A.

---

## Recommendation

I recommend **Strategy B**. Because dynamic inventory images are optimized via Firebase Cloud Functions (server-side), adding a heavy Vite image plugin (Strategy C) solely for a few static site logos is unnecessary bloat. Pre-optimizing the logo to WebP manually resolves the 2.3MB performance issue immediately and keeps the application bundle clean.

---
*The Pawn Shop · docs/plans/E27_Homepage_Logo_PLAN.md · v1.0*
