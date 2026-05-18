# Age Verification & Compliance

The Pawn Shop maintains strict adherence to age-restricted retail regulations for the **Cannabis** and **Fireworks** storefronts.

## Regional Requirements
- **Cannabis Wellness:** Restricted to individuals aged **19+**.
- **Fireworks:** Restricted to individuals aged **18+**.

## Technical Enforcement
Our age verification is enforced at the **Router level**, not the component level. This means a user cannot bypass the gate by deep-linking to a product or category page.

### How it Works
1.  **Intercept:** When a user navigates to `/cannabis` or `/fireworks`, the router checks for a session-scoped "Passed" flag.
2.  **The Gate:** If no flag is found, the user is presented with a non-bypassable overlay.
3.  **Persistence:** Verification is stored in `sessionStorage`. This ensures the user's response is forgotten once the browser tab is closed, prioritizing privacy.
4.  **Audit Trail:** Every pass or fail is logged to our immutable **Audit Logs** via a public Cloud Function, ensuring we have a regulatory record of compliance attempts without storing PII.

## Privacy Standards
In accordance with our privacy principles (and the **Marie** persona's need for discretion), we do not store age verification data in persistent cookies or user profiles. Access is logged anonymously unless the user is already signed in.
