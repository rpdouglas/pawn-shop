# Feature Planning Prompt — The Pawn Shop
**Version:** 1.0 · **Run before writing any code for a new feature.**

---

## Role

Senior Staff Engineer & Systems Architect for The Pawn Shop.

**Objective:** Produce a formal implementation plan — three strategies with a clear recommendation — aligned to the persona and epic defined in the project spec. Then stop. Do not write code until the plan is approved via `APPROVAL.md`.

---

## Pre-Flight Checklist (complete before planning begins)

### 1. Project Spec Verification — CRITICAL

Does a project spec exist at `docs/projects/[ID]_[FEATURE].md`?

- **If YES:** Load it. Proceed to Phase 1.
- **If NO:** STOP. Do not plan without a spec. Reply: *"No project spec found for this feature. Create one using `docs/projects/00_TEMPLATE.md` first, then re-run this prompt."*

### 2. Context Verification

Do you have the complete, current contents of every file you intend to modify?

- **If YES:** Proceed.
- **If NO:** Reply: *"I need the exact current contents of `[filename]` before I can safely plan modifications. Please paste it below."*

Do not rely on prior session memory for file contents. File state changes between sessions.

---

## Phase 1 — Persona & Compliance Gate

### 1.1 Identify the Persona

State explicitly:
- **Primary persona:** Who is this feature built for first?
- **Secondary personas:** Who must it not harm?

Apply the relevant tests from `docs/PERSONAS.md §0`:

| Test | Applies when |
|---|---|
| **Makoonsii Trust Test** | Any Pawn view feature, editorial content, navigation, or community-facing copy |
| **Marie Discretion Test** | Any CRM, email, SMS, push notification, or cannabis/fireworks feature |
| **Marcus Photography Test** | Any feature that surfaces item imagery to customers |
| **Kevin Speed Test** | Any inventory alert, notification, or new-listing flow |
| **Kanien'kéha Rule** | Any feature touching collection names, editorial headings, or article content |

### 1.2 Compliance Gate

For features touching cannabis, fireworks, pawn intake, or customer data — answer each:

- [ ] Age gate required? (cannabis 19+, fireworks 18+) — enforced at **router level**, not component level
- [ ] `auditLogs` event defined? State the `eventType` string.
- [ ] PII excluded from all logs and analytics?
- [ ] `policeHold` logic respected? (hides item immediately, admin-only write)
- [ ] `aiDescription` kept separate from `description`? (draft never customer-visible)
- [ ] All AI API calls going through Cloud Functions? (never client-side)

If any box would be unchecked by the proposed design, the design must change before the strategy is proposed.

---

## Phase 2 — Schema Audit

Before proposing any strategy:

1. List every Firestore collection this feature reads or writes.
2. For each collection, quote the relevant fields from `docs/firestore-schema.md`.
3. If you need a field that does not exist in the schema: **STOP. Update `docs/firestore-schema.md` first, then add a line to `docs/DECISIONS.md`. Then return to planning.**

Never reference a field that is not in `docs/firestore-schema.md`. This is the only source of truth.

### Schema audit output format

```
Collections impacted:
- items/{id} — fields: title, description, aiDescription, status, price, condition, merchandisingTags, searchTokens
- auditLogs/{id} — fields: eventType, uid, targetId, details, createdAt

New fields required: NONE | [field name, type, collection — update schema first]
```

---

## Phase 3 — Three-Strategy Proposal

Present three implementation approaches. Stop at the proposal — do not write code.

### Strategy Format

For each strategy (A = Minimal, B = Recommended, C = Robust):

```
## Strategy [A|B|C] — [Name]

**Summary:** One sentence.

**Architecture:**
- Where does the logic live? (Cloud Function / client hook / ViewContext / etc.)
- What Firestore operations are required?
- What Cloud Functions are created or modified?
- What Firestore security rules are affected?

**Persona Lens:**
- How does this serve [primary persona]?
- Does it harm any secondary persona? If so, how is that mitigated?

**Compliance:**
- How does this satisfy the compliance gate from Phase 1?

**Trade-offs:**
- What does this approach gain?
- What does it sacrifice?

**Estimated scope:** [Small | Medium | Large] — [approximate component/file count]
```

### Recommendation

State which strategy you recommend (typically B) and in one paragraph explain why it best serves the primary persona's hard UX constraints and the compliance requirements.

---

## Phase 4 — Anti-Regression Protocol

Before the plan is finalised, explicitly address these common failure modes:

**1. The Hardcoded Hex Trap**
Does any proposed UI component use hardcoded colour values? All colours must use `var(--color-primary)` and the `.view-*` CSS class system. No exceptions.

**2. The Firestore Field Invention Trap**
Has every field reference been verified against `docs/firestore-schema.md`? If a field was invented during planning, it must be added to the schema before the plan proceeds.

**3. The Client-Side AI Key Trap**
Does any proposed architecture pass AI API keys to the client? If yes, redesign to route through a Cloud Function.

**4. The Scarcity Manufacture Trap**
Does any proposed feature automatically apply `rare-find`, `limited-edition`, or countdown-based urgency? If yes, redesign. These must be staff-set or campaign-date-bound only.

**5. The PII Log Trap**
Does any proposed `auditLogs` entry, analytics event, or console output include names, emails, phone numbers, or other PII? If yes, redesign. PII is never in logs.

**6. The Age Gate Bypass Trap**
Is any age-gated route (cannabis, fireworks) protected at the router level, or only at the component level? Component-level gates are insufficient — enforcement must be at the router.

**7. The Motion Trap**
Does any proposed UI component include animation or transition? If yes, verify against `docs/design-system.md §4`:
- Only approved patterns (slow fade, cinematic reveal, ambient glow, smooth hover, staggered grid, quick-view open) — nothing else.
- Timing must use `--motion-speed-*` tokens, not hardcoded `ms` values.
- Prohibited: bounce, particle effects, constant micro-animations, slide-in-from-sides.
If a proposed animation is not on the approved list, remove it or flag it for design review before proceeding.

**8. The Typography Scale Trap**
Does any proposed UI component set a font size? Verify:
- All sizes use `--text-*` tokens — never hardcoded `px` or `rem`.
- Display font (`--font-display`) is used for headings/product names; body font (`--font-body`) for copy, labels, inputs.
- Cannabis view: `--color-primary` on `--color-bg` must only appear at `--text-subheading` (24px) or larger.

**9. The Brand Voice Trap**
Does any proposed feature introduce copy, labels, or CTA text? Check against `docs/design-system.md §8`:
- Prohibited vocabulary: Cheap, Junk, BUY NOW!!!, SALE, Clearance, Liquidation, Budget.
- Cannabis copy: zero medical claims, zero clinical terminology, zero youth-oriented language.
- CRM / notifications: generic "The Pawn Shop Update" — cannabis category never disclosed.

---

## Phase 5 — Output & Storage

Do not output the full plan into the chat. Instead:

1. Create a new file at `docs/plans/[ID]_[FEATURE]_PLAN.md`.
2. Write the results of Phases 1 through 4 into this file using clear markdown headings.
3. In the chat, output ONLY the following summary block:

> "I have drafted the implementation plan and saved it to `docs/plans/[ID]_[FEATURE]_PLAN.md`.
> 
> **Proposed Strategies:**
> - **Strategy A:** [One sentence summary]
> - **Strategy B:** [One sentence summary] (Recommended)
> - **Strategy C:** [One sentence summary]
> 
> Please review the markdown file and reply with your approved strategy."

4. **STOP.** Wait for approval via `APPROVAL.md`. Do not write code.

---

*The Pawn Shop · docs/prompts/PLANNING.md · v1.1*
