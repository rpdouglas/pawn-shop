# QA & Verification Prompt — The Pawn Shop
**Version:** 1.1 · **Run after `APPROVAL.md` delivers code. Before any PR is opened.**

---

## Role

Senior QA Engineer. Verify the delivered feature against: persona constraints, compliance rules, and build health.

---

## Input

```
Project: [Epic ID and name, e.g., "E03 Auth & Staff Roles"]
Phase: [Phase number from the project spec]
Primary Persona: [name]
Feature Delivered: [one sentence description of what was built]
```

---

## Part 1 — Build Health (The Engine)

Verify these pass before anything else:

```bash
npm run build    # Zero TypeScript errors
npm run lint     # Zero ESLint warnings or errors
```

If either fails, stop QA and run `FIX.md` first.

### TypeScript Checks

Confirm for all new code:
- [ ] No `any` types introduced
- [ ] All new props and function parameters have explicit types
- [ ] All Firestore document reads use a typed interface from `src/lib/types.ts`
- [ ] Prices are integers (CAD cents), never floats

### Bundle Architecture Checks

The main bundle must stay lean. Check after any new page, context, or layout component is added:

- [ ] **New pages lazy-loaded:** Every new route in `main.tsx` uses `lazy()` — never a static import.
- [ ] **No eager Firebase full imports in layout/context:** `src/App.tsx`, `src/context/`, and `src/components/layout/` must not import from `src/lib/firebase.ts`. They may import from `src/lib/firebase-core.ts` (auth + functions only). Any Firestore/Storage write in an eagerly-loaded component must use a dynamic `import('../lib/firebase')`.
- [ ] **Main bundle size check:** After `npm run build`, the `dist/assets/index-*.js` chunk must be under 500 KB unminified (≈150 KB gzip). If it exceeds this, something is pulling `firebase.ts` into the eager path — investigate before continuing.

### Firebase Checks

If Firestore rules were modified:
```bash
firebase emulators:start
# Run the relevant emulator test suite
```

Confirm:
- [ ] Public reads blocked on `policeHold: true` items
- [ ] Age-gated collection writes blocked for unauthenticated users
- [ ] `auditLogs` write blocked from client (admin SDK only)
- [ ] Staff-only fields (`policeHold`, `rare-find`, `limited-edition`) blocked for non-staff writes

---

## Part 2 — Persona Smoke Tests (The UX)

Run the smoke tests relevant to the primary persona of this feature. These are pass/fail tests, not guidelines.

### For Makoonsii — Reserve Regular

- [ ] **The 48px Test:** Are all interactive elements at least 48px tall/wide in mobile viewport (375px)? Open browser DevTools, inspect touch targets.
- [ ] **The One-Thumb Test:** Can the entire feature flow be completed one-handed in portrait mode? Walk through it.
- [ ] **The Plain Language Test:** Does any copy use jargon, retail buzzwords, or language that would alienate a community elder? Read every label and heading out loud.
- [ ] **The Kanien'kéha Audit:** Does any new copy, heading, or label use Kanien'kéha? If yes, flag for community review. Do not ship without `indigenousLanguageReviewed: true`.

### For Dale — Cross-Border Bargain Hunter

- [ ] **The Price Visibility Test:** Is the CAD price visible on the item card without any click-through?
- [ ] **The Condition Clarity Test:** Is the condition grade (new/like-new/good/fair/poor) displayed with a tooltip definition?
- [ ] **The Stale Inventory Test:** Change an item `status` to `'sold'` in the emulator. Does it disappear from the public listing within one page refresh? No lag is acceptable.
- [ ] **The Search Speed Test:** Does the search return results within 300ms? Use browser Network tab to check.

### For Tanya — Seasonal Celebrator

- [ ] **The Confirmation Test:** Create a reservation in the emulator. Does an SMS alert fire (or is the Cloud Function triggered) within 60 seconds?
- [ ] **The Pickup Window Test:** Is the pickup window displayed as a specific time slot, not a vague "we'll contact you"?
- [ ] **The CRM Language Test:** Check the SMS/email template. Does it say "The Pawn Shop Update" with no mention of "fireworks"?
- [ ] **The Age Gate Test (18+):** Navigate directly to `/fireworks` without age acknowledgment. Is the gate enforced at the router level before any fireworks data renders?

### For Marie — Wellness Seeker

- [ ] **The Discretion Test:** Check every CRM template triggered by this feature. Do any subject lines, SMS bodies, or push notification titles contain the word "cannabis," "flower," "vape," or any category-specific language?
- [ ] **The 19+ Gate Test:** Navigate directly to `/cannabis` without age acknowledgment. Is access blocked at the router, not just at the component level?
- [ ] **The auditLog Test:** Complete an age gate pass and fail. Check the emulator Firestore — do `age_gate_pass` and `age_gate_fail` events exist in `auditLogs`?
- [ ] **The Anonymous Enquiry Test:** Can a user initiate a WhatsApp enquiry from the cannabis product page without creating an account?

### For Kevin — Reseller & Picker

- [ ] **The 60-Second Alert Test:** Create a new item in the emulator with `status: 'active'`, matching an existing saved search. Does the Cloud Function dispatch an alert within 60 seconds? Check function logs.
- [ ] **The CASL Gate Test:** Create a saved search with `alertOptIn: false`. Create a matching item. Confirm no alert is dispatched.
- [ ] **The Police Hold Alert Test:** Create a new item with `policeHold: true`. Confirm no alert is dispatched even if it matches a saved search.
- [ ] **The Stale Alert Test:** Mark an item as sold before the alert fires. Does the alert still fire? (It should not — or it should include the current status if it does fire.)

### For Sandra — Curious Passerby

- [ ] **The Masonry Test:** Does the Pawn homepage use a masonry (non-uniform) grid, not a standard uniform grid?
- [ ] **The Quick-View Speed Test:** Hover or tap an item card. Does the quick-view modal open within 200ms?
- [ ] **The Live Activity Audit:** Does the live activity feed show city-level data only? No names, no UIDs, no emails in the activity stream?
- [ ] **The Staff Picks Voice Test:** Read the Staff Pick copy. Is it written in a curator's first-person voice, or does it read like a generated product bullet list?

### For Jordan & Marcus — All Views

- [ ] **The aiDescription Firewall Test:** Find an item with an `aiDescription` in the emulator. Is it readable from the customer-facing product page? It must not be.
- [ ] **The PWA Lighthouse Test:** Run `npm run test:lhci` against the deployed dev URL (`https://nats-rack.web.app`). Thresholds enforced by `lighthouserc.json`: Accessibility ≥90, SEO ≥95, Performance ≥50. Note: Performance ≥90 requires SSR — backlogged. Do not lower the Accessibility or SEO thresholds without a recorded decision in `DECISIONS.md`.
- [ ] **The Marcus Photography Test:** View the feature on a product detail page. Is the primary image shot to dark luxury standard (macro, dark background, well-lit)? If a placeholder or poorly lit image is displayed, flag it before shipping.
- [ ] **The Cross-View Coherence Test:** Navigate between `/pawn`, `/cannabis`, and `/fireworks`. Does the brand voice, typography, and editorial quality feel consistent (only accent colour and font should differ)?

---

## Part 3 — Compliance Audit

### auditLogs Verification

For every `auditLogs` entry written by this feature:

- [ ] Entry is written via Cloud Function (Firebase Admin SDK), not client-side
- [ ] `details` map contains zero PII (no names, emails, phone numbers, UIDs in readable form)
- [ ] `eventType` matches an approved type from `docs/firestore-schema.md`
- [ ] Entry cannot be deleted or updated — verify rule is in place

### Required auditLog events by feature type

| Feature | Required auditLog events |
|---|---|
| Age gate (any view) | `age_gate_pass`, `age_gate_fail` |
| Auth | `login`, `logout`, `mfa_enrolled` |
| Role change | `role_change` |
| Item publish | `item_published` |
| Police hold set | `police_hold_set` |
| Price override | `price_override` |

---

## Part 4 — Accessibility Check

- [ ] **Automated axe-core sweep:** Run `npm run test:a11y` (Playwright + axe-core against the deployed dev URL). Zero violations required. If a violation is introduced, the suite catches it before any manual review is needed.
- [ ] **Manual supplement for new UI:** If new interactive elements were added that are not yet covered by `e2e/accessibility.spec.ts`, verify them with axe-core in browser DevTools and add a test case to the spec.
- [ ] All new interactive elements have visible focus states.
- [ ] All images have descriptive `alt` text (or `alt=""` if decorative).
- [ ] Colour is not the sole means of conveying information (use text labels + colour).
- [ ] All new text meets WCAG AA contrast (4.5:1 minimum).

> **Note on reduced-motion:** The Playwright config runs with `reducedMotion: 'reduce'`. New CSS animations must honour `@media (prefers-reduced-motion: reduce)` — `animation: none !important` is already in `src/index.css`. Any animation added outside of that global rule needs its own reduced-motion override.

---

## Part 5 — Design System Verification

Reference: `docs/design-system.md`. Check every new UI component delivered in this cycle.

### Tokens & Typography

- [ ] All font sizes use `--text-*` tokens — no hardcoded `px` or `rem` values.
- [ ] All spacing uses `--space-*` tokens — no hardcoded pixel values in style props or CSS.
- [ ] Display font (`--font-display`) used for headings and product names; body font (`--font-body`) for copy, labels, inputs.
- [ ] **Cannabis contrast check:** Any `--color-primary` text in the cannabis view is at `--text-subheading` (24px) or larger only. Not used for body copy, captions, or labels. (`#7B4FA0` on `#1A0D2E` = 2.8:1 — fails WCAG AA at body size.)
- [ ] All colour references use CSS tokens — no hardcoded hex values anywhere in new code.

### Motion

- [ ] Any new animation uses only an approved pattern from `docs/design-system.md §4.2`.
- [ ] Transition timing uses `--motion-speed-*` tokens — not hardcoded `ms` values.
- [ ] **Prohibited pattern check:** No bounce, no particle effects, no slide-in-from-sides, no constant micro-animations present in delivered code. (These are QA blockers.)
- [ ] Quick-view modal (if present): opens in **< 200ms**. Verify with browser Performance tab.

### Component Specifications

- [ ] Product Card image ratio: 4:3 standard · 16:9 for Marcus Standard items.
- [ ] Product Card hover: `scale(1.02)` over 300ms — not a larger scale, not a shorter duration.
- [ ] Marcus Standard items: all five shot types present before publishing (Hero, Detail, Texture, Lifestyle, Scale). Missing shots are a publishing blocker.
- [ ] Navigation header: 64px desktop · 56px mobile. Verified in DevTools.
- [ ] All primary and secondary buttons: **44px min-height** (48px for Makoonsii primary flows).

### Brand Voice

- [ ] No prohibited vocabulary in any new copy: Cheap, Junk, BUY NOW!!!, SALE, Clearance, Liquidation, Budget bin.
- [ ] Cannabis copy check: zero medical claims, zero clinical terminology, zero youth-oriented language.
- [ ] CRM / notification text (if any): generic "The Pawn Shop Update" — cannabis category never in subject line, SMS body, or push preview.

### Photography (if this feature surfaces images to customers)

- [ ] No flat white backgrounds or unedited supplier images.
- [ ] Hero images: ≥1600px wide · product cards: ≥800px · thumbnails: ≥400px.
- [ ] Alt text present and descriptive on every product image.

> **Design System Result:** Pass | **Fail — list each item with file:line reference**

---

## Part 6 — QA Sign-Off

If all checks pass, reply:

> **QA PASSED.** Feature: [name]. Persona: [name]. Build: clean. Compliance: verified. Smoke tests: passed. Design system: verified. Ready for `TICKET_CLOSE.md`.

If any check fails, list the failures in a numbered list and do not sign off until each is resolved:

> **QA BLOCKED.** Failures:
> 1. [Failure description] — severity: [blocking | non-blocking]
> 2. [Failure description] — severity: [blocking | non-blocking]

Non-blocking failures may be tracked as GitHub Issues and resolved in the next cycle if agreed with the developer. Blocking failures must be resolved before the PR is opened.

---

*The Pawn Shop · docs/prompts/TESTING.md · v1.1 · Updated Cycle 21: bundle architecture checks, automated a11y, LHCI thresholds*
