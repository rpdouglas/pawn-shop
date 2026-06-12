# E120 — Fireworks Campaign Countdown: Planning Document

**Generated:** 2026-06-12
**Phase A gate — awaiting strategy approval**

---

## Step 1 — Persona Gate

**Primary:** Tanya — The Seasonal Purchaser `[Tanya]`
> Tanya plans around events — Canada Day is her peak buying moment. A live countdown on the fireworks page tells her exactly how long she has to place a pre-order, converting browsing urgency into a confirmed order. Her core need: a specific time window, not vague "coming soon" copy.

**Primary:** Staff (Fireworks Operations) `[Staff]`
> Staff need to activate a Canada Day countdown from `/admin/campaigns` without touching the Firestore console. The current "Create" only flow leaves campaigns stuck at `active: false` until the 5-minute CF picks them up — there is no manual override.

**Secondary:** Jordan — The Editorial Brand Quality Driver `[Jord]`
> The countdown must look like it belongs on the dark luxury platform. Hardcoded px values in `CountdownTimer.tsx` are currently a QA blocker and produce output the design system does not govern. Jordan's test: the countdown looks like it was designed, not hacked in.

**Secondary:** Sandra — The Visual Discovery Shopper `[Sand]`
> A ticking countdown is a high-signal engagement element. Sandra will notice it during browsing and it reinforces the seasonal inventory story without manufactured urgency copy.

---

## Step 2 — Schema Audit

**No new fields are required.** All collections and fields used by this epic already exist in `docs/firestore-schema.md`.

| Collection | Operation | Fields |
|---|---|---|
| `campaigns/{id}` | `getDocs` query on `active: true` | `title`, `viewTag`, `active`, `countdownEnabled`, `startDate`, `endDate`, `bannerCopy`, `discountRule` |
| `campaigns/{id}` | `updateDoc` (activate/deactivate toggle) | `active`, `updatedAt` |
| `auditLogs/{id}` | No new writes from this epic — `activateCampaigns` CF already writes `campaign_activated`; client-side toggle writes none (auditing remains CF-only) | — |

**Firestore rules:** `campaigns/{id}` already has `allow write: if isStaff()` — client-side `updateDoc` for `active` is permitted for staff without a new CF.

**No schema changes, no new CFs, no new Firestore indexes.**

---

## Step 3 — Three Strategy Proposal

---

### Strategy A: Token Fix + Manual Activate/Deactivate (Recommended)

**Architecture:**
- `src/components/fireworks/CountdownTimer.tsx` — replace all 7 hardcoded `px` values with design tokens
- `src/pages/admin/CampaignAdminPage.tsx` — add Activate / Deactivate buttons to each campaign row using direct `updateDoc` (permitted by existing `isStaff()` rule). Buttons only visible to staff.
- No new files, no new CFs, no schema changes.
- The countdown position in `FireworksHero.tsx` is already correct — it renders above the video when a fireworks campaign has `active: true && countdownEnabled: true`.

**Countdown token map (CountdownTimer.tsx):**

| Hardcoded | Token |
|---|---|
| `gap: '8px'` | `var(--space-2)` |
| `fontSize: '12px'` (label, unit letters) | `var(--text-xs)` |
| `fontSize: '24px'` (expired text) | `var(--text-subheading)` |
| `fontSize: '48px'` (digit numerals) | `var(--text-display)` |
| `fontSize: '28px'` (colon separator) | `var(--text-heading)` |
| `gap: '4px'` / `marginRight: '4px'` | `var(--space-1)` |
| `marginLeft: '2px'` (unit label) | `0` (no token for 2px; remove micro-spacing) |

**Persona Lens:**
- Tanya: countdown goes live within seconds of staff clicking "Activate" — no waiting for CF sweep
- Staff: one-click activate, one-click deactivate from `/admin/campaigns`
- Jordan: all countdown sizing governed by design tokens; typography consistent with system scale

**Compliance:**
- No age gates involved (admin page is `ProtectedRoute staffOnly`; fireworks page age gate is at router level, unchanged)
- Client-side `updateDoc` for `active` field is permitted by existing `isStaff()` Firestore rule
- No PII in any field touched
- No AI API keys
- No `auditLogs` write from client (this is correct — CF auto-activation writes the audit log; the manual override does not, which is acceptable since staff auth is already captured in the rule evaluation)

**Trade-offs:**
- ✅ Smallest scope — 2 files, ~25 lines total
- ✅ Fixes the QA-blocking token violations immediately
- ✅ Canada Day campaign can be live in minutes
- ✅ No new dependencies, CFs, or schema changes
- ⚠️ Manual activate does not write an `auditLogs` entry — the CF auto-activate does. This is a minor audit gap for immediate manual activations.
- ⚠️ `CountdownTimer` colon at 28px has no exact token — `var(--text-heading)` (32px) is the closest and produces a slightly larger colon, which is visually acceptable.

**Estimated Scope:** Small — 2 files

---

### Strategy B: Token Fix + Activate Controls + Dedicated Countdown Block

**Architecture:**
- All of Strategy A
- `src/components/fireworks/FireworksHero.tsx` — restructure the hero layout. Extract the `<CountdownTimer>` out of the `cinematic-hero-content` div and give it a dedicated full-width centered block positioned between the hero text content and the video. This creates a clear visual hierarchy: Hero Text → Countdown Block → Video, rather than hero text ending with the timer.
- The dedicated block uses `var(--space-8)` top padding to visually separate it from the tagline and `var(--space-6)` bottom padding to breathe above the video frame.
- No new component needed — restructures existing JSX only.

**Persona Lens:**
- Tanya: the countdown becomes the primary visual CTA in the page, not subordinate to the headline text
- Jordan: cleaner visual hierarchy — the headline/tagline reads as one unit, the countdown reads as a second distinct element
- Sandra: more dominant visual presence on scroll

**Compliance:** Same as Strategy A.

**Trade-offs:**
- ✅ Better visual hierarchy — countdown stands on its own between text and video
- ✅ Trivial additional scope (~15 extra lines in FireworksHero)
- ⚠️ Slightly more JSX restructuring — regression risk on FireworksHero layout, need visual check
- ⚠️ The current layout is already functional and "right above the video" — this is a polish improvement, not a functional fix

**Estimated Scope:** Small — 3 files

---

### Strategy C: Token Fix + Activate Controls + Campaign Edit Capability

**Architecture:**
- All of Strategy A
- `src/pages/admin/CampaignAdminPage.tsx` — add an Edit inline panel per campaign. When "Edit" is clicked, expand the campaign row to show editable fields: title, banner copy, start/end dates, countdownEnabled toggle, discount rule. Save via `updateDoc`. Cancel to collapse.
- Staff can fix typos, extend end dates, or change the countdown toggle on existing campaigns without deleting and recreating.
- No new CFs or schema changes (all fields already exist).

**Persona Lens:**
- Staff: can adjust Canada Day campaign details post-creation without losing the campaign record
- Jordan: banner copy can be refined after creation without losing the campaign history

**Compliance:** Same as Strategy A.

**Trade-offs:**
- ✅ Most complete admin workflow — create, activate, edit, deactivate, re-edit for next season
- ✅ No schema changes needed
- ⚠️ Largest scope — `CampaignAdminPage.tsx` grows significantly with edit state management
- ⚠️ Edit UI adds complexity (per-row edit state, form validation) that may have edge cases
- ⚠️ Not needed for Canada Day — staff can delete and recreate if a typo exists; edit is a nice-to-have

**Estimated Scope:** Medium — 2 files (~80–100 lines added to CampaignAdminPage)

---

## Step 4 — Anti-Regression Check

All three strategies:

| Check | Strategy A | Strategy B | Strategy C |
|---|---|---|---|
| Hardcoded hex values | ✅ None — tokens only | ✅ None | ✅ None |
| Invented Firestore fields | ✅ None | ✅ None | ✅ None |
| AI API keys on client | ✅ None | ✅ None | ✅ None |
| Auto-applied scarcity tags | ✅ Not applicable | ✅ Not applicable | ✅ Not applicable |
| PII in logs | ✅ None | ✅ None | ✅ None |
| Age gates at component level | ✅ Router-level only (unchanged) | ✅ Same | ✅ Same |
| Unapproved motion patterns | ✅ `setInterval` 1s tick is approved — CountdownTimer already exists | ✅ Same | ✅ Same |
| CountdownTimer hardcoded px | Resolved ✅ | Resolved ✅ | Resolved ✅ |

---

## Step 5 — State of the System (Key Discovery)

The campaign system is **already fully built**. Staff do not need to wait for this epic to create a Canada Day campaign — they can do it now via `/admin/campaigns`. The campaign will auto-activate via the `activateCampaigns` CF within 5 minutes of its `startDate`. The countdown will appear above the video in `FireworksHero` automatically.

The work in this epic is:
1. **Fix a QA blocker** (`CountdownTimer.tsx` token violations)
2. **Add an immediate-activate button** so staff don't need to wait for the CF sweep

---

## Recommendation

**Strategy A** — Token Fix + Manual Activate/Deactivate.

The countdown placement above the video in `FireworksHero.tsx` is already correct. The system is already wired. Canada Day is 19 days away. The only gates blocking the countdown from being live are the token violations in `CountdownTimer.tsx` (a QA blocker) and the lack of an immediate-activate button in the admin UI. Both are small surgical fixes.

Strategy B's layout restructure is a cosmetic improvement but the current position already satisfies "right above the video." Strategy C's edit capability is useful long-term but not needed for Canada Day.

---

## Awaiting Approval

Post this summary in chat and wait for the developer to approve a strategy before writing any source code.

---

*The Pawn Shop · docs/plans/E120_FIREWORKS_CAMPAIGN_COUNTDOWN_PLAN.md · 2026-06-12*
