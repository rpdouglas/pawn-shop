# E53_NATIVE_SHARE_PLAN

## Phase 1 — Persona & Compliance Gate
- **Primary Personas:** Sandra (Pawn) and Tanya (Fireworks). Sharing cool or unique finds is a key organic growth driver.
- **Compliance Audit:** When users share a link to a cannabis, tobacco, or fireworks item, the link itself contains no restricted imagery. The recipient clicking the link will be intercepted by the existing router-level age gate (19+ or 18+). This perfectly adheres to regulatory requirements. No PII is captured or exposed during the native share action.

## Phase 2 — Schema Audit
- **Collections Impacted:** None. This is entirely a client-side feature leveraging Web APIs.
- *(Optional extension: we could add a `shareCount` integer to `items/{id}` if we wanted to track virality, but keeping it simple for MVP).*

## Phase 3 — Three-Strategy Proposal

### Strategy A: Minimal (Native Web Share Only)
Implement a Share button that simply calls `navigator.share({ title, url })`. If the browser doesn't support it (like some older desktop browsers), the button is hidden.
* **Persona:** Good for mobile, invisible to desktop users.
* **Compliance:** Passes.
* **Scope:** Small.

### Strategy B: Recommended (Native Share + Clipboard Fallback)
Implement a Share button across all item detail pages (`ItemQuickView` / `LuxuryProductCard` etc). It attempts to use `navigator.share()`. If the API is unsupported, it falls back to copying the URL to the clipboard and showing a brief "Link copied!" toast or alert.
* **Persona:** Excellent. Guarantees every user (desktop or mobile) has a way to share the item.
* **Compliance:** Passes.
* **Scope:** Small-Medium. Requires a new reusable `ShareButton` component.

### Strategy C: Robust (Full Social Modal + Native Share + UTM Tracking)
Build a custom modal containing distinct buttons for WhatsApp, Facebook, Email, Copy Link, and Native Share. Append `?utm_source=user_share` to the URL.
* **Persona:** Overwhelming. Most mobile users just want the native share sheet.
* **Compliance:** Passes, but adds unnecessary complexity.
* **Scope:** Large.

**Recommendation:** Strategy B. It's resilient, uses the exact OS-level share sheet the user is already comfortable with, and cleanly handles desktop fallbacks without building an over-engineered modal.

## Phase 4 — Anti-Regression Protocol
- Age gates remain firmly at the router level (the shared URL goes to the router, which intercepts).
- Brand voice: "Share" instead of marketing jargon like "Tell your friends!"
- No hardcoded hexes for the new button.
