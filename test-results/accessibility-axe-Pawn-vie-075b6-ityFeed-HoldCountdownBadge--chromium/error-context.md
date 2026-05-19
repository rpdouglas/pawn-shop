# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> axe: Pawn view — E02, E09, E17 (RecentlySoldStrip, ActivityFeed, HoldCountdownBadge)
- Location: e2e/accessibility.spec.ts:15:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 127

- Array []
+ Array [
+   Object {
+     "description": "Ensure ARIA attributes are not prohibited for an element's role",
+     "help": "Elements must only use permitted ARIA attributes",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/aria-prohibited-attr?application=playwright",
+     "id": "aria-prohibited-attr",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   aria-label attribute cannot be used on a div with no valid role attribute.",
+         "html": "<div class=\"masonry-grid\" aria-label=\"Inventory discovery grid\"></div>",
+         "impact": "serious",
+         "none": Array [
+           Object {
+             "data": Object {
+               "messageKey": "noRoleSingular",
+               "nodeName": "div",
+               "prohibited": Array [
+                 "aria-label",
+               ],
+               "role": null,
+             },
+             "id": "aria-prohibited-attr",
+             "impact": "serious",
+             "message": "aria-label attribute cannot be used on a div with no valid role attribute.",
+             "relatedNodes": Array [],
+           },
+         ],
+         "target": Array [
+           ".masonry-grid",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.aria",
+       "wcag2a",
+       "wcag412",
+       "EN-301-549",
+       "EN-9.4.1.2",
+       "RGAAv4",
+       "RGAA-7.1.1",
+     ],
+   },
+   Object {
+     "description": "Ensure landmarks are unique",
+     "help": "Landmarks should have a unique role or role/label/title (i.e. accessible name) combination",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/landmark-unique?application=playwright",
+     "id": "landmark-unique",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "accessibleText": null,
+               "role": "navigation",
+             },
+             "id": "landmark-is-unique",
+             "impact": "moderate",
+             "message": "The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<nav style=\"display: flex; gap: var(--space-6); padding: var(--space-1) var(--space-8); border-bottom: 1px solid var(--color-border); background-color: var(--color-surface);\">",
+                 "target": Array [
+                   ".view-pawn > nav",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable",
+         "html": "<nav style=\"display: flex; align-items: center; gap: var(--space-6);\"><a href=\"/login\" data-discover=\"true\" style=\"color: var(--color-primary); text-decoration: none; padding: var(--space-2);\">Sign In</a></nav>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "header > nav",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+   Object {
+     "description": "Ensure all page content is contained by landmarks",
+     "help": "All page content should be contained by landmarks",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/region?application=playwright",
+     "id": "region",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<a href=\"#main-content\" class=\"skip-to-content\">Skip to main content</a>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".skip-to-content",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.keyboard",
+       "best-practice",
+       "RGAAv4",
+       "RGAA-9.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "The Pawn Shop" [ref=e6] [cursor=pointer]:
      - /url: /pawn
    - navigation [ref=e7]:
      - link "Sign In" [ref=e8] [cursor=pointer]:
        - /url: /login
  - link "Skip to main content" [ref=e9] [cursor=pointer]:
    - /url: "#main-content"
  - navigation [ref=e10]:
    - link "Pawn" [ref=e11] [cursor=pointer]:
      - /url: /pawn
    - link "Cannabis" [ref=e12] [cursor=pointer]:
      - /url: /cannabis
    - link "Fireworks" [ref=e13] [cursor=pointer]:
      - /url: /fireworks
  - main [ref=e14]:
    - generic [ref=e15]:
      - region "Pawn Shop — find your next discovery" [ref=e16]:
        - generic [ref=e18]:
          - paragraph [ref=e19]: Cornwall Island · Akwesasne
          - heading "Objects with stories deserve presentation with meaning." [level=1] [ref=e20]
          - paragraph [ref=e21]: Curated inventory — timepieces, instruments, cameras, and rare finds — presented to the standard they deserve.
          - generic [ref=e22]:
            - button "Browse Inventory" [ref=e23] [cursor=pointer]
            - button "Pawn or Sell" [ref=e24] [cursor=pointer]
      - generic [ref=e26]:
        - region "Store trust signals" [ref=e27]:
          - generic "16 years serving Akwesasne" [ref=e28]:
            - generic [ref=e29]: "16"
            - generic [ref=e30]:
              - text: years serving
              - text: Akwesasne
        - region "Search inventory" [ref=e31]:
          - generic [ref=e32]:
            - generic [ref=e33]: Search inventory
            - searchbox "Search inventory" [ref=e34]
        - region "Staff Picks" [ref=e35]:
          - heading "Staff Picks" [level=2] [ref=e36]
          - paragraph [ref=e37]: Handpicked by our team — objects worth your attention.
          - article [ref=e39]:
            - button "View Dewalt Brushless Drill Set" [ref=e40] [cursor=pointer]:
              - generic [ref=e41]:
                - img "Dewalt Brushless Drill Set" [ref=e42]
                - generic: ★ Staff Pick
            - generic [ref=e43]:
              - heading "Dewalt Brushless Drill Set" [level=3] [ref=e44]
              - paragraph [ref=e45]: $38.00 CAD
              - button "Quick view" [ref=e46] [cursor=pointer]
        - region "Featured" [ref=e47]:
          - heading "Featured" [level=2] [ref=e48]
          - generic [ref=e49]:
            - button "Tiffany & Co. Diamond Ring — $184.00 CAD" [ref=e50] [cursor=pointer]:
              - img "Tiffany & Co. Diamond Ring" [ref=e52]
              - generic [ref=e53]:
                - heading "Tiffany & Co. Diamond Ring" [level=3] [ref=e54]
                - generic [ref=e55]: $184.00 CAD
                - generic [ref=e57]: New
            - button "Fender Stratocaster 1964 — $35.00 CAD" [ref=e58] [cursor=pointer]:
              - img "Fender Stratocaster 1964" [ref=e60]
              - generic [ref=e61]:
                - heading "Fender Stratocaster 1964" [level=3] [ref=e62]
                - generic [ref=e63]: $35.00 CAD
                - generic [ref=e65]: Fair
            - button "Tiffany & Co. Diamond Ring — $304.00 CAD" [ref=e66] [cursor=pointer]:
              - img "Tiffany & Co. Diamond Ring" [ref=e68]
              - generic [ref=e69]:
                - heading "Tiffany & Co. Diamond Ring" [level=3] [ref=e70]
                - generic [ref=e71]: $304.00 CAD
                - generic [ref=e73]: Good
            - button "Dewalt Brushless Drill Set — $495.00 CAD" [ref=e74] [cursor=pointer]:
              - img "Dewalt Brushless Drill Set" [ref=e76]
              - generic [ref=e77]:
                - heading "Dewalt Brushless Drill Set" [level=3] [ref=e78]
                - generic [ref=e79]: $495.00 CAD
                - generic [ref=e81]: Like New
        - region "Discover" [ref=e82]:
          - heading "Discover" [level=2] [ref=e84]
          - generic [ref=e85]:
            - generic "Inventory discovery grid" [ref=e86]:
              - button "Tiffany & Co. Diamond Ring — $184.00 CAD" [ref=e87] [cursor=pointer]:
                - img "Tiffany & Co. Diamond Ring" [ref=e89]
                - generic [ref=e90]:
                  - heading "Tiffany & Co. Diamond Ring" [level=3] [ref=e91]
                  - generic [ref=e92]: $184.00 CAD
                  - generic [ref=e93]: New
              - button "Fender Stratocaster 1964 — $35.00 CAD" [ref=e94] [cursor=pointer]:
                - img "Fender Stratocaster 1964" [ref=e96]
                - generic [ref=e97]:
                  - heading "Fender Stratocaster 1964" [level=3] [ref=e98]
                  - generic [ref=e99]: $35.00 CAD
                  - generic [ref=e100]: Fair
              - button "Tiffany & Co. Diamond Ring — $304.00 CAD" [ref=e101] [cursor=pointer]:
                - img "Tiffany & Co. Diamond Ring" [ref=e103]
                - generic [ref=e104]:
                  - heading "Tiffany & Co. Diamond Ring" [level=3] [ref=e105]
                  - generic [ref=e106]: $304.00 CAD
                  - generic [ref=e107]: Good
              - button "Dewalt Brushless Drill Set — $495.00 CAD" [ref=e108] [cursor=pointer]:
                - img "Dewalt Brushless Drill Set" [ref=e110]
                - generic [ref=e111]:
                  - heading "Dewalt Brushless Drill Set" [level=3] [ref=e112]
                  - generic [ref=e113]: $495.00 CAD
                  - generic [ref=e114]: Like New
              - button "Tiffany & Co. Diamond Ring — $395.00 CAD" [ref=e115] [cursor=pointer]:
                - generic [ref=e116]:
                  - img "Tiffany & Co. Diamond Ring" [ref=e117]
                  - generic [ref=e119]: Limited Edition
                - generic [ref=e120]:
                  - heading "Tiffany & Co. Diamond Ring" [level=3] [ref=e121]
                  - generic [ref=e122]: $395.00 CAD
                  - generic [ref=e123]: Fair
              - button "Leica M10-R Camera — $270.00 CAD" [ref=e124] [cursor=pointer]:
                - generic [ref=e125]:
                  - img "Leica M10-R Camera" [ref=e126]
                  - generic [ref=e128]: Rare Find
                - generic [ref=e129]:
                  - heading "Leica M10-R Camera" [level=3] [ref=e130]
                  - generic [ref=e131]: $270.00 CAD
                  - generic [ref=e132]: Good
              - button "Canon EOS R5 Body — $144.00 CAD" [ref=e133] [cursor=pointer]:
                - generic [ref=e134]:
                  - img "Canon EOS R5 Body" [ref=e135]
                  - generic [ref=e137]: Rare Find
                - generic [ref=e138]:
                  - heading "Canon EOS R5 Body" [level=3] [ref=e139]
                  - generic [ref=e140]: $144.00 CAD
                  - generic [ref=e141]: Good
              - button "Dewalt Brushless Drill Set — $38.00 CAD" [ref=e142] [cursor=pointer]:
                - generic [ref=e143]:
                  - img "Dewalt Brushless Drill Set" [ref=e144]
                  - generic [ref=e146]: ★ Staff Pick
                - generic [ref=e147]:
                  - heading "Dewalt Brushless Drill Set" [level=3] [ref=e148]
                  - generic [ref=e149]: $38.00 CAD
                  - generic [ref=e150]: Poor
              - button "Leica M10-R Camera — $445.00 CAD" [ref=e151] [cursor=pointer]:
                - img "Leica M10-R Camera" [ref=e153]
                - generic [ref=e154]:
                  - heading "Leica M10-R Camera" [level=3] [ref=e155]
                  - generic [ref=e156]: $445.00 CAD
                  - generic [ref=e157]: Good
            - paragraph [ref=e159]: All 9 items shown
        - region "From the Community" [ref=e160]:
          - heading "From the Community" [level=2] [ref=e161]
          - generic [ref=e162]:
            - blockquote [ref=e163]:
              - paragraph [ref=e164]: "\"I've been coming here for years. They're honest, fair, and they know what things are worth. That matters on the island.\""
              - generic [ref=e165]: — Raymond
            - blockquote [ref=e166]:
              - paragraph [ref=e167]: "\"Picked up a beautiful guitar here that I never would have found anywhere else. Good people, good prices.\""
              - generic [ref=e168]: — Shirley
            - blockquote [ref=e169]:
              - paragraph [ref=e170]: "\"When I needed quick cash, they treated me with respect. No judgment. Just a fair deal.\""
              - generic [ref=e171]: — Marcus
  - contentinfo [ref=e172]:
    - navigation "Footer navigation" [ref=e173]:
      - link "Contact" [ref=e174] [cursor=pointer]:
        - /url: /contact
      - link "Accessibility" [ref=e175] [cursor=pointer]:
        - /url: /accessibility
      - link "Privacy Policy" [ref=e176] [cursor=pointer]:
        - /url: /privacy
      - link "Terms of Use" [ref=e177] [cursor=pointer]:
        - /url: /terms
    - paragraph [ref=e178]: © 2026 The Pawn Shop · Cornwall Island, Akwesasne
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import AxeBuilder from '@axe-core/playwright'
  3  | 
  4  | // ── Public routes ─────────────────────────────────────────────────────────────
  5  | // These require no authentication. Cannabis and Fireworks routes display the
  6  | // age gate UI — axe-core tests the gate page itself, not the gated content.
  7  | 
  8  | const publicRoutes = [
  9  |   { path: '/pawn',      label: 'Pawn view — E02, E09, E17 (RecentlySoldStrip, ActivityFeed, HoldCountdownBadge)' },
  10 |   { path: '/cannabis',  label: 'Cannabis age gate (19+) — E02' },
  11 |   { path: '/fireworks', label: 'Fireworks age gate (18+) — E02, E14 (CampaignBanner on public view)' },
  12 | ]
  13 | 
  14 | for (const route of publicRoutes) {
  15 |   test(`axe: ${route.label}`, async ({ page }) => {
  16 |     await page.goto(route.path)
  17 |     await page.waitForLoadState('load')
  18 |     const results = await new AxeBuilder({ page }).analyze()
> 19 |     expect(results.violations).toEqual([])
     |                                ^ Error: expect(received).toEqual(expected) // deep equality
  20 |   })
  21 | }
  22 | 
  23 | // ── Admin routes ───────────────────────────────────────────────────────────────
  24 | // Require staff credentials. Set PLAYWRIGHT_AUTH_EMAIL and PLAYWRIGHT_AUTH_PASSWORD
  25 | // environment variables to run these tests. Skipped in unauthenticated CI.
  26 | //
  27 | // Covers:  E06 (EbayPushButton in admin intake)
  28 | //          E10 (admin dashboard + PoliceHoldManager)
  29 | //          E14 (PreorderInboxPage, CampaignAdminPage)
  30 | 
  31 | const hasAuth = !!(process.env['PLAYWRIGHT_AUTH_EMAIL'] && process.env['PLAYWRIGHT_AUTH_PASSWORD'])
  32 | 
  33 | test.describe('admin routes', () => {
  34 |   test.skip(!hasAuth, 'Set PLAYWRIGHT_AUTH_EMAIL + PLAYWRIGHT_AUTH_PASSWORD to enable admin axe tests')
  35 | 
  36 |   test.beforeEach(async ({ page }) => {
  37 |     await page.goto('/pawn')
  38 |     await page.waitForLoadState('load')
  39 |     // Sign in via Firebase email/password
  40 |     await page.goto('/auth/signin')
  41 |     await page.fill('[name="email"]',    process.env['PLAYWRIGHT_AUTH_EMAIL']!)
  42 |     await page.fill('[name="password"]', process.env['PLAYWRIGHT_AUTH_PASSWORD']!)
  43 |     await page.click('[type="submit"]')
  44 |     await page.waitForURL('**/admin**', { timeout: 10_000 })
  45 |   })
  46 | 
  47 |   const adminRoutes = [
  48 |     { path: '/admin/dashboard',  label: 'Admin dashboard — E10' },
  49 |     { path: '/admin/inventory',  label: 'Admin inventory + PoliceHoldManager — E10' },
  50 |     { path: '/admin/preorders',  label: 'Admin preorders (PreorderInboxPage) — E14' },
  51 |     { path: '/admin/campaigns',  label: 'Admin campaigns (CampaignAdminPage) — E14' },
  52 |   ]
  53 | 
  54 |   for (const route of adminRoutes) {
  55 |     test(`axe: ${route.label}`, async ({ page }) => {
  56 |       await page.goto(route.path)
  57 |       await page.waitForLoadState('load')
  58 |       const results = await new AxeBuilder({ page }).analyze()
  59 |       expect(results.violations).toEqual([])
  60 |     })
  61 |   }
  62 | })
  63 | 
```