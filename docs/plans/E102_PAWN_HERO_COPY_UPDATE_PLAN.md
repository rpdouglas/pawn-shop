# E102 — Pawn Hero Copy & CTA Update · Plan
**Epic:** E102 (Vertical Hero Sections) · **Status:** AWAITING APPROVAL

---

## 1. Problem & Objectives
The current text in `PawnHero.tsx` focuses on high-end curated heirlooms, which is misleading because the store primarily sources and sells high-utility liquidation items at rock-bottom prices. We need to update this copy to reflect the liquidation-focused business model while retaining our **Dapper, Debonair, and Distinctly Akwesasne** brand voice.

### User Decisions (from `/grill-me` session):
* **Selected Copy Direction:** Option 3: The Direct Pipeline
  * **Headline:** Clear Freight. Direct Trade.
  * **Subheading:** Sourcing bulk liquidation stock and clearing the floor at rock-bottom prices. High utility, zero markup—Akwesasne’s direct pipeline to smart savings.
* **Selected CTA Update:** Primary CTA updated to "Browse Liquidations"; secondary CTA remains "Pawn or Sell" to allow buy-ins/trade-ins.

---

## 2. Persona Impact Statement
* **Dale (Primary Hunter):** High impact. The updated copy immediately communicates that the store deals in liquidation items at low margins, which aligns perfectly with Dale's bargain-seeking behavior and builds pricing trust.
* **Sandra (Primary Discovery):** High impact. The "Direct Pipeline" concept creates curiosity about what liquidation freight has arrived, driving her to scroll down to the masonry grid.
* **Makoonsii (Reserve Regular):** Medium impact. Reaffirming that the cargo pipeline benefits the local community via "smart savings" maintains the Akwesasne identity.
* **Marcus (Dapper Connoisseur):** Medium impact. The clean, direct terms ("Clear Freight," "Direct Trade") present liquidation with masculine, dapper confidence rather than sounding like a cheap discount bin.

---

## 3. Compliance Checklist & Anti-Regression
* **Zero Hardcoded CSS Values:** No inline hex colors, pixel values, or custom transition timings should be added.
* **Accessibility:** The primary button must continue to use `scrollToDiscovery` to target `#masonry-section` with smooth scrolling. Min touch target size must remain ≥48px.
* **Brand Alignment:** Maintain the existing `.pawn-hero-content` cinematic staggered animation cascade classes.
* **Language Gate:** No Kanien'kéha words are introduced, satisfying the linguistic security gate.

---

## 4. Schema Audit
* No new database fields are required for this text update. The current static text in [PawnHero.tsx](file:///workspaces/pawn-shop/src/components/pawn/PawnHero.tsx) is being updated directly in the component file.
* If dynamic store settings are introduced in the future, they will map to the existing `config/shopInfo` schema structure.

---

## 5. Three Strategies

### Strategy A — Direct Static Update (Recommended)
* **Description:** Directly replace the hardcoded headline, subheading, and primary button text in [PawnHero.tsx](file:///workspaces/pawn-shop/src/components/pawn/PawnHero.tsx).
* **Pros:** Simplest implementation, zero performance impact, zero dependencies.
* **Cons:** Future text edits will require another code deploy.

### Strategy B — Hybrid Localized Copy Constant
* **Description:** Move the text options to a dedicated local configuration object/constant file in `src/lib/constants.ts` or similar, importing them into the component.
* **Pros:** Keeps all storefront copy in one clean, centralized constants file.
* **Cons:** Overkill for a single-component text change.

### Strategy C — Config-Driven Copy
* **Description:** Wire the Pawn Hero copy to the Firestore `config/shopInfo` document (under a new `heroData.pawn` schema map).
* **Pros:** Allows staff to edit the copy from the Firestore console or an Admin page without a redeploy.
* **Cons:** Increases page load Firestore read dependency and introduces layout shift/LCP latency if the config document loads slowly.

---

## 6. Recommended Strategy: Strategy A
We recommend **Strategy A** because it is clean, high-performance (zero LCP latency), and enforces the brand voice at code-review level (preventing non-debonair text from being set through staff mistakes).

---

*The Pawn Shop · docs/plans/E102_PAWN_HERO_COPY_UPDATE_PLAN.md*
