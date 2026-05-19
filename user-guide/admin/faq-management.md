# FAQ Management

The **FAQ Engine** provides a centralized system for managing common questions and answers across all three storefronts. It is designed to build trust with the **Makoonsii** persona by providing clear, jargon-free information.

## Managing FAQs

Staff with `marketing_staff` or `admin` roles can manage FAQs at `/admin/faqs`.

1.  **Categories:** FAQs are organized by category: `General`, `Pawn`, `Cannabis`, and `Fireworks`.
2.  **Order:** Use the **Order** field to control the display sequence on the public page.
3.  **Audit Logs:** Every creation, update, or deletion of an FAQ is automatically logged in the [Audit Logs](/admin/audit-logs) via the `logFaqAction` Cloud Function.

## Public Display

The public FAQ page (`/faq`) adaptively filters content based on the user's current view:
- **General** questions are always shown.
- **Pawn/Cannabis/Fireworks** specific questions only appear when the user is in that respective storefront view.

## Accessibility Standards

To satisfy the **Makoonsii Trust Test**:
- **Touch Targets:** All accordion toggles have a minimum **48px hit area**.
- **Plain Language:** Content should be written in simple, direct language without retail buzzwords.

---

*Cornwall Island · Cornwall Island, Akwesasne*
*Dapper. Debonair. Distinctly Akwesasne.*
