# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> axe: Cannabis age gate (19+) — E02
- Location: e2e/accessibility.spec.ts:15:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 243

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1a0d2e",
+               "contrastRatio": 3.03,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#7b4fa0",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.03 (foreground color: #7b4fa0, background color: #1a0d2e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<header style=\"display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-6); background-color: var(--color-bg); color: var(--color-text); border-bottom: 1px solid var(--color-border); font-family: var(--font-body); font-size: var(--text-small);\">",
+                 "target": Array [
+                   "header",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.03 (foreground color: #7b4fa0, background color: #1a0d2e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<a href=\"/pawn\" data-discover=\"true\" style=\"color: var(--color-primary); font-weight: 600; text-decoration: none; padding: var(--space-2) 0;\">The Pawn Shop</a>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "div > a[href$=\"pawn\"][data-discover=\"true\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1a0d2e",
+               "contrastRatio": 3.03,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#7b4fa0",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.03 (foreground color: #7b4fa0, background color: #1a0d2e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<header style=\"display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-6); background-color: var(--color-bg); color: var(--color-text); border-bottom: 1px solid var(--color-border); font-family: var(--font-body); font-size: var(--text-small);\">",
+                 "target": Array [
+                   "header",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.03 (foreground color: #7b4fa0, background color: #1a0d2e, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<a href=\"/login\" data-discover=\"true\" style=\"color: var(--color-primary); text-decoration: none; padding: var(--space-2);\">Sign In</a>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "a[href$=\"login\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#7b4fa0",
+               "contrastRatio": 3.03,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#1a0d2e",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.03 (foreground color: #1a0d2e, background color: #7b4fa0, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<a href=\"#main-content\" class=\"skip-to-content\">Skip to main content</a>",
+                 "target": Array [
+                   ".skip-to-content",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.03 (foreground color: #1a0d2e, background color: #7b4fa0, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<a href=\"#main-content\" class=\"skip-to-content\">Skip to main content</a>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".skip-to-content",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#784d9c",
+               "contrastRatio": 2.92,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#1a0d2e",
+               "fontSize": "13.5pt (18px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.92 (foreground color: #1a0d2e, background color: #784d9c, font size: 13.5pt (18px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button class=\"btn btn-primary btn-lg\" aria-label=\"I confirm I am 19 or older\">I am 19 or older</button>",
+                 "target": Array [
+                   ".btn-primary",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.92 (foreground color: #1a0d2e, background color: #784d9c, font size: 13.5pt (18px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"btn btn-primary btn-lg\" aria-label=\"I confirm I am 19 or older\">I am 19 or older</button>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".btn-primary",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
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
+                   ".view-cannabis > nav",
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
  - main:
    - dialog "Age Verification" [ref=e14]:
      - paragraph [ref=e15]: The Pawn Shop
      - heading "Age Verification" [level=1] [ref=e16]
      - paragraph [ref=e17]: You must be 19 or older to enter this section. Please confirm your age to continue.
      - generic [ref=e18]:
        - button "I confirm I am 19 or older" [active] [ref=e19] [cursor=pointer]: I am 19 or older
        - button "I am under 19" [ref=e20] [cursor=pointer]
      - paragraph [ref=e21]:
        - text: By entering, you confirm you are 19 or older and agree to our
        - link "Terms of Use" [ref=e22] [cursor=pointer]:
          - /url: /terms
        - text: and
        - link "Privacy Policy" [ref=e23] [cursor=pointer]:
          - /url: /privacy
        - text: . Your response is session-scoped and not stored beyond this visit.
  - contentinfo [ref=e24]:
    - navigation "Footer navigation" [ref=e25]:
      - link "Contact" [ref=e26] [cursor=pointer]:
        - /url: /contact
      - link "Accessibility" [ref=e27] [cursor=pointer]:
        - /url: /accessibility
      - link "Privacy Policy" [ref=e28] [cursor=pointer]:
        - /url: /privacy
      - link "Terms of Use" [ref=e29] [cursor=pointer]:
        - /url: /terms
    - paragraph [ref=e30]: © 2026 The Pawn Shop · Cornwall Island, Akwesasne
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