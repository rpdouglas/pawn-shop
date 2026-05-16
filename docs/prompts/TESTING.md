# QA & Verification Prompt — The Pawn Shop
**Version:** 1.0 · **Run after `APPROVAL.md` delivers code. Before any PR is opened.**

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
- [ ] **The PWA Lighthouse Test:** Run Lighthouse in Chrome DevTools on the deployed dev URL. Scores: Performance ≥90, Accessibility ≥90, SEO ≥95.
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

- [ ] Run axe-core in browser DevTools. Zero failures on all new UI.
- [ ] All new interactive elements have visible focus states.
- [ ] All images have descriptive `alt` text (or `alt=""` if decorative).
- [ ] Colour is not the sole means of conveying information (use text labels + colour).
- [ ] All new text meets WCAG AA contrast (4.5:1 minimum).

---

## Part 5 — QA Sign-Off

If all checks pass, reply:

> **QA PASSED.** Feature: [name]. Persona: [name]. Build: clean. Compliance: verified. Smoke tests: passed. Ready for `TICKET_CLOSE.md`.

If any check fails, list the failures in a numbered list and do not sign off until each is resolved:

> **QA BLOCKED.** Failures:
> 1. [Failure description] — severity: [blocking | non-blocking]
> 2. [Failure description] — severity: [blocking | non-blocking]

Non-blocking failures may be tracked as GitHub Issues and resolved in the next cycle if agreed with the developer. Blocking failures must be resolved before the PR is opened.

---

*The Pawn Shop · docs/prompts/TESTING.md · v1.0*
