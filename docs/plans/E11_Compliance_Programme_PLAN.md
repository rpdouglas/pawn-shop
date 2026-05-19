# E11 — Compliance Programme: Implementation Plan

**Generated:** 2026-05-18
**Spec:** `docs/projects/E11_Compliance_Programme.md`
**Primary persona:** Marie — The Wellness Seeker
**Secondary personas:** Tanya (fireworks age gate), Makoonsii (accessibility)

---

## Phase 1 — Persona & Compliance Gate

### 1.1 Persona Identification

**Primary persona:** Marie — The Wellness Seeker
- This epic delivers the compliance infrastructure Marie requires to trust the cannabis view: a verifiable age gate, a privacy policy she can read, an anonymous enquiry path, and a PIPEDA consent trail.

**Secondary personas:**
- **Tanya** — fireworks 18+ age gate is audited alongside cannabis 19+. Legal disclosures apply to both.
- **Makoonsii** — NVDA + VoiceOver spot-check is Makoonsii's accessibility standard. All new UI must meet 48px touch targets and plain-language copy.

**Tests applied:**
- Marie Discretion Test — primary. Any new CTA, copy, or banner must use no category-disclosing language.
- Makoonsii Trust Test — always run. New AgeGate disclosure text must use plain English, no jargon.
- Kanien'kéha Rule — not applicable (no language content in E11).
- Marcus Photography Test — not applicable (no item imagery).
- Kevin Speed Test — not applicable (no alert flow).

### 1.2 Compliance Gate

- [x] **Age gate required?** — Yes. Existing `AgeGate` component enforces at router level. E11 adds legal disclosure links inside the existing gate UI — no structural change to enforcement.
- [x] **`auditLogs` events defined?** — `age_gate_pass` and `age_gate_fail` already exist and are already being written by `logAgeGate` CF (verified in code review). No new event types required.
- [x] **PII excluded?** — `consentAcceptedAt` (timestamp) and `consentVersion` (string) contain no PII. `auditLogs` for consent is not written (consent is stored on `users/{uid}` only). WhatsApp enquiry has no Firestore write.
- [x] **`policeHold` respected?** — E11 introduces no inventory queries. N/A.
- [x] **`aiDescription` draft-only?** — No AI description paths in E11. N/A.
- [x] **AI API security?** — No Gemini calls. N/A.
- [x] **CASL compliance?** — No new alert or notification sends. `alertOptIn` is unchanged. Consent here is PIPEDA data collection acknowledgment, separate from CASL marketing opt-in.
- [x] **Scarcity integrity?** — No urgency mechanics. N/A.

---

## Phase 2 — Schema Audit

```
Collections impacted:

- users/{uid}
  Fields read:    mfaEnrolled, alertOptIn, role
  Fields written: consentAcceptedAt (NEW), consentVersion (NEW)

- auditLogs/{id}
  Event types used: age_gate_pass, age_gate_fail — EXISTING, verification only

- config/shopInfo
  Fields read:  phoneNumber (NEW — added pre-planning)
  Fields written: NONE (admin-only write, E11 does not write this)
```

**New fields required:**

| Field | Collection | Type | Status |
|---|---|---|---|
| `consentAcceptedAt` | `users/{uid}` | timestamp | Must add to schema before implementation |
| `consentVersion` | `users/{uid}` | string | Must add to schema before implementation |
| `phoneNumber` | `config/shopInfo` | string (E.164) | Already added to schema pre-planning |

**Code review pre-flight findings — scope impact:**

The following EPICS.md tasks are already met by existing code and require **verification only**, not new code:

| EPICS.md task | Finding |
|---|---|
| Age gate audit log entries confirmed working | `logAgeGate` CF is fully implemented and exported. `AgeGate.tsx` calls it for both pass and fail with correct arguments. Emulator verification is the only remaining step. |
| `purgeExpiredData` schedule documented in `DECISIONS.md` | E09 entry already exists in `DECISIONS.md` (2026-05-18). Task is complete. |
| `/accessibility` page confirmed live | Route exists at `accessibility` in `main.tsx`. `AccessibilityPage` component is imported. Task is complete. |

**WhatsApp deep link pre-existing state:**
The anonymous WhatsApp enquiry section already exists in `CannabisPage.tsx` (lines 186–230) using `VITE_WHATSAPP_NUMBER` env var. E11 migrates this to read `config/shopInfo.phoneNumber` from Firestore — making the number admin-configurable without redeployment and fixing a silent failure where an unset env var produces a broken `https://wa.me/` href.

---

## Phase 3 — Three-Strategy Proposal

---

## Strategy A — Minimal: Disclosures + Static Routes Only

**Summary:** Close all EPICS.md verification tasks, add legal disclosure links to both age gate modals, create `/privacy` and `/terms` placeholder pages, and document the MFA enforcement path — no PIPEDA consent UI and no WhatsApp migration.

**Architecture:**
- Where does logic live? Client-only. No Cloud Function changes.
- Firestore operations: None.
- Cloud Functions created or modified: None.
- Security rules affected: None.

**Files touched:**
- `src/components/age-gate/AgeGate.tsx` — add privacy + terms links below confirm button
- `src/pages/PrivacyPage.tsx` — new static page (placeholder, [LEGAL REVIEW REQUIRED])
- `src/pages/TermsPage.tsx` — new static page (placeholder, [LEGAL REVIEW REQUIRED])
- `src/main.tsx` — add `/privacy` and `/terms` routes

**Persona Lens:**
- Marie: Legal disclosure links give her a path to the privacy policy before confirming her age. Anonymous enquiry remains via existing WhatsApp section (env var unchanged). No consent audit trail — this is the primary gap.
- Makoonsii: New links must meet 48px touch target and `--text-xs` size token.

**Compliance:**
- Closes age gate audit task (verification only).
- Closes purgeExpiredData task (already in DECISIONS.md).
- Closes `/accessibility` task (route already live).
- No PIPEDA consent trail — `consentAcceptedAt` is never written. If legal review finds this insufficient, it is a pre-prod blocker.

**Trade-offs:**
- Gain: Very small scope. All five EPICS tasks closeable. Zero backend risk.
- Sacrifice: No PIPEDA consent audit trail. WhatsApp number remains in env var — silent breakage if var is unset. No MFA code enforcement.

**Estimated scope:** Small — 4 files (2 new, 2 modified)

---

## Strategy B — Recommended: Full PIPEDA + WhatsApp Migration + MFA Check

**Summary:** Deliver the complete E11 spec: PIPEDA consent checkbox on sign-up, soft consent banner for existing users, legal disclosures on age gates, `/privacy` + `/terms` routes, WhatsApp number migrated to `config/shopInfo`, and MFA `sign_in_second_factor` claim check added to the highest-stakes staff Cloud Functions.

**Architecture:**
- **PIPEDA consent:** Client-side. `SignUpPage.tsx` gains a consent checkbox (required field, blocks form submission). On account creation success, `updateDoc` writes `consentAcceptedAt: serverTimestamp()` and `consentVersion: '2026-05-01'` to `users/{uid}`. The user writes their own document — covered by existing Firestore user write rule (`request.auth.uid == uid`). No new CF required.
- **Existing users:** `ConsentBanner.tsx` — a non-blocking banner rendered inside `GlobalHeader.tsx`. Reads `users/{uid}.consentAcceptedAt` on authenticated load. If null, shows banner with privacy policy link and single "I acknowledge" button that writes the consent fields. Disappears on acknowledgment. Uses approved slow-fade motion pattern.
- **WhatsApp migration:** `CannabisPage.tsx` replaces `VITE_WHATSAPP_NUMBER` env var with a `getDoc(doc(db, 'config', 'shopInfo'))` call (same pattern as `YearsInBusinessBadge`). Renders the enquiry link only when `phoneNumber` is present. Silent null-guard: no enquiry link displayed if shopInfo is not configured (graceful degradation).
- **MFA CF check:** A shared `assertMfaEnrolled(request)` helper added to `functions/src/auth.ts`. Called at the top of `assignRole`, `setPoliceHold`, `addSerialToBlacklist`, and `removeSerialFromBlacklist` — the four CFs where a non-MFA staff account causes the highest risk. Throws `HttpsError('unauthenticated', 'MFA required')` if `request.auth.token.firebase.sign_in_second_factor` is absent.
- **Legal disclosures:** `AgeGate.tsx` gains a disclosure paragraph below the confirm button with `<Link>` to `/privacy` and `/terms`. Both routes added to `main.tsx`.

**Firestore operations:**
- `users/{uid}` — one `updateDoc` on account creation (consent write); one `getDoc` per authenticated session (consent banner read)
- `config/shopInfo` — one `getDoc` per cannabis page load (already happening for `YearsInBusinessBadge`)

**Cloud Functions created or modified:**
- `functions/src/auth.ts` — add `assertMfaEnrolled` helper; call it in `assignRole`, `setPoliceHold`, `addSerialToBlacklist`, `removeSerialFromBlacklist`

**Security rules affected:** None. User writes to own `users/{uid}` document are already permitted.

**Files touched:**
- `docs/firestore-schema.md` — add `consentAcceptedAt`, `consentVersion` to `users/{uid}`
- `src/lib/types.ts` — add `phoneNumber?: string` to `ShopInfo`; add `consentAcceptedAt`, `consentVersion` to a new `UserProfile` interface (not `AuthUser` — keeps auth token claims separate from Firestore user data)
- `src/components/age-gate/AgeGate.tsx` — add legal disclosure links
- `src/pages/auth/SignUpPage.tsx` — add consent checkbox, `updateDoc` on success
- `src/components/ConsentBanner.tsx` — new component
- `src/components/GlobalHeader.tsx` — render `ConsentBanner` for authenticated users
- `src/pages/CannabisPage.tsx` — migrate WhatsApp from env var to shopInfo read
- `src/pages/PrivacyPage.tsx` — new static placeholder
- `src/pages/TermsPage.tsx` — new static placeholder
- `src/main.tsx` — add `/privacy`, `/terms` routes
- `functions/src/auth.ts` — `assertMfaEnrolled` helper + 4 CF call sites

**Persona Lens:**
- Marie: Age gate shows legal disclosure before entry. Privacy policy is reachable within 2 taps. Anonymous WhatsApp enquiry works when `shopInfo.phoneNumber` is set in Firestore. PIPEDA consent is recorded with timestamp for audit.
- Tanya: Fireworks gate receives same disclosure treatment as cannabis.
- Makoonsii: Consent banner uses plain language. Single "I acknowledge" action. Meets 48px target. VoiceOver-friendly (banner is a `role="alert"` region).

**Compliance:**
- PIPEDA: consent timestamp written per user. Version string enables re-consent detection if policy changes.
- Age gate: legal disclosure links visible before user confirms age.
- MFA: server-side claim check on four highest-risk CFs closes the "MFA bypass confirmed impossible" DECISIONS.md gate (for callable CFs — Identity Platform upgrade remains the pre-prod gate for auth-level enforcement).
- All five EPICS.md tasks closeable.

**Trade-offs:**
- Gain: Full PIPEDA consent audit trail. WhatsApp number is admin-configurable via Firestore console. MFA claim check is a genuine server-side enforcement layer for the most dangerous staff operations. All spec phases delivered.
- Sacrifice: ~11 files touched. Consent banner adds UI surface that must be carefully designed to avoid being intrusive.

**Estimated scope:** Medium — 11 files (3 new, 8 modified)

---

## Strategy C — Robust: Consent + Hard MFA Gate + Admin Compliance View

**Summary:** Everything in Strategy B, plus a hard MFA rejection applied to every staff CF (not just the four highest-risk ones), a `consentVersion` mismatch re-consent prompt, and a `/admin/compliance` page giving managers a live view of consent coverage and age gate event counts.

**Architecture:**
- **Hard MFA gate (expanded):** `assertMfaEnrolled` is called at the top of every CF that requires `isStaff()` (not just the four in Strategy B) — covering `createShift`, `updateShift`, `deleteShift`, `updateMerchandisingTags`, `calculateTrendingScore`, `publishItem`, and all other staff-only CFs. Any staff CF call from a session without `sign_in_second_factor` is rejected.
- **`consentVersion` mismatch:** On each authenticated session load, `AuthContext.tsx` reads `users/{uid}.consentVersion`. If it does not match the current `CONSENT_VERSION` constant, a mandatory re-consent modal (not dismissable) replaces the soft banner. Staff cannot proceed until they re-acknowledge.
- **`/admin/compliance` page:** Reads `auditLogs` for `age_gate_pass` and `age_gate_fail` counts (last 30 days) via `getCountFromServer` with a date filter. Reads consent coverage (count of `users/{uid}` where `consentAcceptedAt != null`) via a separate `getCountFromServer` query. Displays purge schedule summary from hardcoded constants. Manager/admin access only.
- Everything else from Strategy B.

**Firestore operations (additions over B):**
- `auditLogs` — `getCountFromServer` with `eventType + createdAt` composite index (new index required in `firestore.indexes.json`)
- `users/{uid}` — `getCountFromServer` for consent coverage (no new index — existing uid field)

**Cloud Functions modified (additions over B):**
- `assertMfaEnrolled` called in ~12 additional CFs across `inventory.ts`, `merchandising.ts`, `scheduling.ts`, `storeHours.ts`, `serialBlacklist.ts`, `ebay.ts`, `preorders.ts`

**New files (over B):**
- `src/pages/admin/CompliancePage.tsx`

**Files touched total:** ~22 files (4 new, 18 modified)

**Persona Lens:**
- Marie: Everything from B plus a hard re-consent path if policy changes. Maximum privacy compliance posture.
- Staff (all): Any staff CF call without a valid MFA session is rejected server-side. Eliminates the entire class of MFA bypass via callable functions.

**Compliance:**
- Maximum coverage: MFA enforced across all staff CFs, consent version tracked, admin visibility into compliance state.

**Trade-offs:**
- Gain: The strongest possible compliance posture short of an Identity Platform upgrade. Compliance dashboard gives a manager a live read on consent coverage and gate events.
- Sacrifice: Large scope. Touching ~12 additional CF files risks accidental regressions. Compliance dashboard requires a new composite index and a new admin route — adds 3+ files and a DECISIONS.md entry. Re-consent modal (Strategy C addition) is blocking UX — if a policy version constant changes during development, it inadvertently gates all staff.

**Estimated scope:** Large — ~22 files (4 new, 18 modified)

---

## Recommendation

**Strategy B.**

Marie's primary compliance requirement is a verifiable, auditable consent trail — not an admin dashboard showing it. Strategy A fails her because it leaves `consentAcceptedAt` unwritten; if legal review flags missing PIPEDA consent capture as a pre-prod blocker (a real risk given the ACTIVE_CYCLE.md open decision on legal counsel), Strategy A cannot be promoted to prod without reopening E11.

Strategy C delivers genuine value in the MFA hard gate expansion, but touching 12 additional Cloud Functions in a single epic significantly widens the blast radius for regressions across inventory, merchandising, scheduling, and preorders — all epics that are already closed and QA-tested. The four highest-risk CFs targeted by Strategy B (`assignRole`, `setPoliceHold`, `addSerialToBlacklist`, `removeSerialFromBlacklist`) cover the operations where a non-MFA staff account causes the most harm. The remaining staff CFs are protected by the Identity Platform upgrade gate, which is a pre-prod requirement independent of E11 code.

Strategy B delivers all five EPICS.md gates, closes Marie's compliance gate, and introduces the minimum necessary backend change (one helper function in `auth.ts`) with a known blast radius.

---

## Phase 4 — Anti-Regression Protocol

**1. The Hardcoded Hex Trap**
No proposed UI component introduces hardcoded colour values. `AgeGate.tsx` additions use existing inline style pattern with `var(--color-text-muted)` and `var(--text-xs)`. `ConsentBanner.tsx` must use `var(--color-*)` tokens only — no hex. `PrivacyPage.tsx` / `TermsPage.tsx` use `var(--color-text)` / `var(--color-bg)` throughout.

**2. The Firestore Field Invention Trap**
All fields verified against `docs/firestore-schema.md`:
- `consentAcceptedAt`, `consentVersion` — must be added to `users/{uid}` in schema before implementation (Phase 1 gate)
- `config/shopInfo.phoneNumber` — already added to schema pre-planning ✓
- `age_gate_pass`, `age_gate_fail` — already in `auditLogs.eventType` union ✓

**3. The Client-Side AI Key Trap**
No AI API calls in E11. N/A.

**4. The Scarcity Manufacture Trap**
No urgency mechanics. N/A.

**5. The PII Log Trap**
- `consentAcceptedAt` (timestamp) and `consentVersion` (string) written to `users/{uid}` only — no PII.
- No new `auditLogs` writes in E11.
- WhatsApp link has no Firestore write — phone-initiated contact is external.
- `assertMfaEnrolled` throws `HttpsError` before any data is written — no log entry on rejection.
✓ Clean.

**6. The Age Gate Bypass Trap**
Age gate enforcement remains at router level via the existing `AgeGate` wrapper in `main.tsx`. E11 adds disclosure text inside the existing component — it does not restructure how or where the gate is applied. ✓

**7. The Motion Trap**
`ConsentBanner.tsx` in `GlobalHeader`: propose a **slow fade** (opacity 0 → 1 over `var(--motion-speed-slow)`) when the banner first appears. This is on the approved list. No slide-in from sides, no bounce, no particle effects. Banner disappears on acknowledgment via immediate unmount (no exit animation needed for compliance UI). Flag for design confirmation before implementation.

**8. The Typography Scale Trap**
- AgeGate disclosure links: `--text-xs` (matches existing "Built with Canadian privacy standards" paragraph style)
- ConsentBanner copy: `--text-small` (body copy)
- Privacy/Terms page headings: `--text-heading` (display font); body: `--text-body` (body font)
- No hardcoded `px` or `rem` values.
- Cannabis view: no new instances of `--color-primary` at body size. Consent banner appears in the global header (`.view-cannabis` context) — any coloured text uses `--text-subheading` (24px) or larger, or uses `--color-text-muted` for body copy. ✓

**9. The Brand Voice Trap**
- Legal disclosure copy (privacy policy, terms of use) is marked `[LEGAL REVIEW REQUIRED]` — no placeholder copy goes to prod.
- Consent checkbox label: "I have read and agree to the Privacy Policy." — plain language, no retail buzzwords. ✓
- ConsentBanner CTA: "I acknowledge" — plain, not a sales CTA. ✓
- WhatsApp CTA: existing "Enquire on WhatsApp" copy is retained — no category disclosure, no cannabis/fireworks words. ✓
- Marie Discretion Test: AgeGate disclosure links say "Privacy Policy" and "Terms of Use" — no category-specific language. ✓

---

*The Pawn Shop · docs/plans/E11_Compliance_Programme_PLAN.md · 2026-05-18*
