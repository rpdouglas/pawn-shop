# E19 · Editorial CMS & Brand Narrative Implementation Plan

## Objective
Establish a high-integrity editorial foundation for The Pawn Shop's Akwesasne identity, featuring the Warriors of Akwesasne series and Finds of the Week.

## Phase 1 — Persona & Compliance Gate
- **Primary Persona:** Makoonsii + Marcus. Focus on cultural authenticity and dapper aesthetic.
- **Compliance:** Absolute "Kanien'kéha Rule" — unreviewed language blocks publication.
- **Performance:** Articles must load within app-grade PWA standards (Jordan persona).

## Phase 2 — Schema Audit
- **Collection:** `articles/{id}` (Pre-defined).
- **Audit Logs:** `article_published`, `article_updated`, `article_language_reviewed`.

---

## Phase 3 — Three-Strategy Proposal

### Strategy A: Minimal (Static Articles)
- **Architecture:** Articles are defined as JSON or Markdown files within the repository.
- **UI:** A simple list and detail view. No Admin UI for editing.
- **Persona Lens:** Serves the need for narrative but lacks the flexibility for "Finds of the Week" and requires developer intervention for every community review.
- **Scope:** Small (2 UI components, no Firestore writes).

### Strategy B: Recommended (Integrated CMS)
- **Architecture:** Full Firestore-backed CMS with a custom Admin Editor.
- **UI:** `/admin/articles` for management. `ArticleEditor.tsx` with Markdown support and the "Community Review" publishing gate.
- **Integration:** "Finds of the Week" as a specific article type that can reference `items/{id}`.
- **Persona Lens:** Provides Marcus with high-quality presentation and Makoonsii with a verifiable review process.
- **Scope:** Medium (1 Admin page, 1 Editor component, 2 Public routes).

### Strategy C: Robust (Editorial Suite)
- **Architecture:** Strategy B + multi-author collaboration (draft locking) + automated SEO scoring + Gemini-assisted description drafts (linked to E18).
- **UI:** Version history tracking and scheduled publishing.
- **Persona Lens:** Maximizes efficiency for staff but adds significant complexity before the core narrative is established.
- **Scope:** Large (Complex Editor, Cloud Functions for scheduling).

**Recommendation: Strategy B.** This strategy provides the second necessary control over the community review process (Makoonsii) and the high editorial quality required by Marcus/Jordan, without the overhead of enterprise-grade CMS features.

---

## Phase 4 — Anti-Regression Protocol
- [ ] No hardcoded hex/px in editorial layouts.
- [ ] Firestore rule enforces `indigenousLanguageReviewed` for publication.
- [ ] 48px hit areas for all editor controls.
- [ ] Verify PWA Lighthouse score remains ≥90 on article pages.

## Phase 5 — Output & Storage
- Plan saved to `docs/plans/E19_Editorial_CMS_PLAN.md`.

---

*The Pawn Shop · docs/plans/E19_Editorial_CMS_PLAN.md · v1.0*
