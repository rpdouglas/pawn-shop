# Project E18: AI Assistant (Staff-Facing)

**Status:** Completed
**Epic:** E18 — AI Assistant (Staff-Facing)
**Phase:** Phase 6 from EPICS.md
**Primary Persona:** Marcus
**Secondary Personas:** Dale, Jordan, Staff
**AI Involvement:** Claude (dev), Gemini E18 (runtime)

**Objective:** Deliver a Gemini-powered staff toolkit that enhances inventory metadata quality while ensuring absolute staff control via a draft-and-promote review gate.

---

## 1. User Story

> As **Marcus**, I want **every item description to carry provenance and cultural context** so that I can **fully appreciate the character and value of the find**.

> As **Dale**, I want **item pricing to be consistently accurate against market comps** so that I can **verify the deal quality before crossing the bridge**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

Quote the relevant UX constraint rule(s) from `docs/PERSONAS.md` for Marcus:

> *"AI descriptions must go beyond condition grade into provenance, cultural context, and collecting significance where applicable. Marcus reads the full description. If it reads like a product datasheet, it fails."*

Test for it: Generate a description for a high-value vintage item. Verify it includes historical or cultural context and matches the "Dapper & Debonair" brand voice.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px)
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Feature is navigable by a low-tech mobile user in under 3 taps

### Marie Discretion Test (Secondary)

- [ ] All CRM comms use "The Pawn Shop Update" — no category disclosure
- [ ] No cannabis/fireworks words in subject lines, SMS previews, or push notification copy

### Jordan Editorial Test (Secondary)

- [ ] AI-generated copy matches the editorial depth Jordan expects.
- [ ] `aiDescription` is NEVER visible to Jordan until promoted by staff.

---

## 3. Compliance Gate

- [ ] **Age gate required?** No.
- [ ] **`auditLogs` events required?** Yes. `ai_description_generated`, `ai_price_suggested`, `ai_tags_suggested`.
- [ ] **PII exclusion** — Confirm no names, emails, phone numbers enter `auditLogs.details`.
- [ ] **`aiDescription` draft-only** — Gemini output is saved to the `items/{id}/internal/ai` subcollection only.
- [ ] **Staff review gate** — Staff must explicitly promote AI drafts to the main `description` field.
- [ ] **AI API security** — All Gemini calls are routed through Cloud Functions with staff role verification.
- [ ] **Kanien'kéha Rule** — Gemini system prompts explicitly forbid the generation of Kanien'kéha language.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read: title, description, category, condition, provenanceNotes, searchTokens
Fields written: description, price, merchandisingTags, searchTokens (post-review)

Collection: items/{id}/internal/ai (Staff-only subcollection)
Fields read: aiDescription, aiPriceSuggestion
Fields written: aiDescription, aiPriceSuggestion, aiTagSuggestions

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: ai_description_generated, ai_price_suggested, ai_tags_suggested
```

### New Fields Required

```
NEW FIELDS (update schema doc first):
- items/{id}/internal/ai / aiTagSuggestions — array<string> — AI suggested merchandising tags
```

### TypeScript Interfaces

- `Item`
- `AuditLog`
- `AiMetadata` (New interface for the internal subcollection)

### Security Rules Required

```javascript
// Restrict read/write on items/{id}/internal/ai to staff custom claims only.
// Ensure customer-facing queries on items/{id} never include internal AI data.
```

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.
- Guardrail: Claude must implement strict "Staff Review" UI patterns.

### If Gemini E18 (runtime):
- Cloud Functions: `generateAiDescription`, `suggestAiPrice`, `suggestAiTags`.
- Prompt: Defined in `docs/prompts/GEMINI_INITIALIZATION.md`.
- Model: Gemini 1.5 Pro.
- Staff review gate: **HARD MANDATE**. Gemini output → `internal/ai` collection.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules
- [ ] Update `docs/firestore-schema.md` with `aiTagSuggestions`.
- [ ] Update `firestore.rules` for the `internal/ai` subcollection.

### Phase 2 — Cloud Functions
- [ ] `generateAiDescription`: Callable Gemini function with provenance-aware prompt.
- [ ] `suggestAiPrice`: Callable function fetching eBay sold comps range.
- [ ] `suggestAiTags`: Suggests `just-arrived`, `rare-find`, etc.

### Phase 3 — Admin UI Components
- [ ] `AiAssistantPanel.tsx`: Sidebar/Modal for staff to trigger and review AI output.
- [ ] `PriceCompView.tsx`: Displays suggested range and eBay source link.
- [ ] `TagReviewList.tsx`: Checkbox list for staff to approve/reject suggested tags.

### Phase 4 — QA
- [ ] Marcus "Provenance & Brand Voice" check.
- [ ] Dale "Pricing Accuracy" check.
- [ ] Compliance: `aiDescription` visibility firewall check.
- [ ] Makoonsii "One-Thumb" accessibility check (48px targets).

---

## 7. Definition of Done

- [ ] AI output is 100% hidden from customers until staff approval.
- [ ] Gemini never generates Kanien'kéha.
- [ ] `npm run build` and `npm run lint` — zero errors.
- [ ] EPICS.md E18 tasks ticked.
- [ ] PR opened.

---

*The Pawn Shop · docs/projects/E18_AI_Assistant.md · v1.0*
