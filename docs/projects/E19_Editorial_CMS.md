# Project E19: Editorial CMS & Brand Narrative

**Status:** Completed
**Epic:** E19 — Editorial CMS & Brand Narrative
**Phase:** Phase 6 from EPICS.md
**Primary Persona:** Makoonsii + Marcus
**Secondary Personas:** Jordan, Sandra, Staff
**AI Involvement:** Claude (dev)

**Objective:** Establish a high-integrity editorial foundation for The Pawn Shop's Akwesasne identity, featuring the Warriors of Akwesasne series and Finds of the Week.

---

## 1. User Story

> As **Makoonsii**, I want to **read authentic stories about my community and our business roots** so that I can **trust that The Pawn Shop genuinely belongs on Cornwall Island**.

> As **Marcus**, I want **editorial content that matches the dapper brand aesthetic** so that I can **be inspired by the finds and share the shop's unique point of view**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate (Makoonsii + Marcus)

Quote the relevant UX constraint rule(s) from `docs/PERSONAS.md`:

> *"No Kanien'kéha phrase enters any article, heading, or collection name without community review and `indigenousLanguageReviewed: true` set on the article. Every single instance. No shortcuts."*

Test for it: Attempt to publish an article containing Mohawk language. Verify that the system blocks publication unless `indigenousLanguageReviewed` is `true`.

### Makoonsii Trust Test (always run)

- [x] All touch targets ≥48px on mobile viewport (375px)
- [x] All copy uses plain language — no jargon, no retail buzzwords
- [x] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [x] Feature is navigable by a low-tech mobile user in under 3 taps

### Marcus Photography Test

- [ ] "Finds of the Week" images meet dark luxury standard (macro, dark background, well-lit)
- [ ] No placeholder or poorly lit images in the editorial view

### Jordan Editorial Test

- [x] Editorial layout feels app-grade (PWA) with fast transitions and high visual density.
- [ ] "Finds of the Week" provides the curated lifestyle inspiration Jordan expects.

---

## 3. Compliance Gate

- [x] **Age gate required?** No (Articles are public; however, view-specific articles like Cannabis wellness must still pass the Marie Discretion Test in their metadata/previews).
- [x] **`auditLogs` events required?** Yes. `article_published`, `article_updated`, `article_language_reviewed`.
- [x] **PII exclusion** — Confirm no PII enters `auditLogs.details`.
- [x] **Kanien'kéha Rule** — Absolute block on unreviewed indigenous language.
- [x] **Scarcity integrity** — "Finds of the Week" must only feature real items with staff-verified scarcity/provenance.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: articles/{id}
Fields read: title, slug, body, viewTag, status, seoMeta, publishedAt, authorUid, indigenousLanguageReviewed
Fields written: [All above]

Collection: items/{id}
Fields read: title, price, merchandisingTags, images, provenanceNotes (for Finds of the Week integration)

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: article_published, article_updated, article_language_reviewed
```

### New Fields Required

None. Schema was pre-defined in `docs/firestore-schema.md`.

### TypeScript Interfaces

- `Article` (New, based on schema)
- `Item`
- `AuditLog`

### Security Rules Required

```javascript
// Allow public read on articles where status == 'published'
// Block customer write on articles
// Staff-only write on all article fields
// indigenousLanguageReviewed: true required to set status: 'published' if content has Mohawk tags (implement via check logic or staff process)
```

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.
- Guardrail: Claude must implement the strict `indigenousLanguageReviewed` publication gate in the Admin UI.

---

## 6. Implementation Phases

### Phase 1 — Foundation & Articles List
- [x] `Article` interface implementation.
- [x] Admin Article List page (`/admin/articles`).
- [x] Firestore rules for `articles` collection.

### Phase 2 — Admin Editor
- [x] `ArticleEditor.tsx`: Rich text (or Markdown) support, viewTag selector, SEO meta fields.
- [x] **Review Gate:** The "Community Language Review" checkbox.
- [x] **Publishing Logic:** Atomic update with `publishedAt` and `article_published` auditLog.

### Phase 3 — Public Pages
- [x] `/articles/:slug` dynamic route with ViewContext adaptation.
- [x] Article listing component for storefront homepages.
- [x] Integration: "Finds of the Week" dynamic template.

### Phase 4 — QA
- [x] Makoonsii Accessibility (48px) and Language Review check.
- [ ] Marcus Photography standard verification.
- [x] PWA performance check for article pages.

### Phase 5 — Local SEO Landing Pages (Dale Persona)
- [x] Create at least 6 Local SEO landing pages targeting regional locations (Cornwall, Massena, Malone, Akwesasne, Rooseveltown, Hogansburg).
- [x] Implement `JSON-LD LocalBusiness` schema on each landing page.
- [x] Focus content on deal verification and cross-border deal quality for Dale.

### Phase 6 — FAQ Engine (Makoonsii Persona)
- [x] `faqs/{id}` collection: question, answer, category (Pawn/Cannabis/Fireworks/General).
- [x] Admin FAQ CRUD interface.
- [x] Public FAQ page with large touch targets and plain-language answers.
- [x] Integration with storefront homepages.

---

## 7. Definition of Done

- [x] Publication gate for unreviewed Kanien'kéha is absolute.
- [x] FAQ engine provides clear, jargon-free answers to community questions.
- [x] Local SEO pages are indexed with proper LocalBusiness schema.
- [x] `npm run build` and `npm run lint` — zero errors.
- [x] EPICS.md E19 tasks ticked.
- [x] PR opened.

---

*The Pawn Shop · docs/projects/E19_Editorial_CMS.md · v1.0*
