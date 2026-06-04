# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> axe: Tobacco age gate (19+) — E23
- Location: e2e/accessibility.spec.ts:16:3

# Error details

```
Error: page.evaluate: Target crashed 
 Please check out https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/error-handling.md
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
  12 |   { path: '/tobacco',   label: 'Tobacco age gate (19+) — E23' },
  13 | ]
  14 | 
  15 | for (const route of publicRoutes) {
  16 |   test(`axe: ${route.label}`, async ({ page }) => {
  17 |     await page.goto(route.path)
  18 |     await page.waitForLoadState('load')
  19 |     // Route-level code splitting: the page component chunk loads asynchronously
  20 |     // after the main bundle. Wait for #main-content to have rendered children
  21 |     // before scanning — otherwise axe runs against an empty shell.
  22 |     await page.waitForFunction(
  23 |       () => {
  24 |         const main = document.querySelector('#main-content')
  25 |         return main !== null && main.children.length > 0
  26 |       },
  27 |       { timeout: 15_000 },
  28 |     )
  29 |     // Freeze all CSS animations so axe scans the settled state, not a mid-animation frame.
  30 |     // fade-up starts at opacity:0 (fill-mode:both) — without this the color contrast
  31 |     // checks measure blended/partial-opacity colours rather than the final token values.
  32 |     await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' })
  33 |     await page.evaluate(() => new Promise<void>(r => requestAnimationFrame(() => r())))
> 34 |     const results = await new AxeBuilder({ page }).analyze()
     |                     ^ Error: page.evaluate: Target crashed 
  35 |     expect(results.violations).toEqual([])
  36 |   })
  37 | }
  38 | 
  39 | // ── Admin routes ───────────────────────────────────────────────────────────────
  40 | // Require staff credentials. Set PLAYWRIGHT_AUTH_EMAIL and PLAYWRIGHT_AUTH_PASSWORD
  41 | // environment variables to run these tests. Skipped in unauthenticated CI.
  42 | //
  43 | // Covers:  E06 (EbayPushButton in admin intake)
  44 | //          E10 (admin dashboard + PoliceHoldManager)
  45 | //          E14 (PreorderInboxPage, CampaignAdminPage)
  46 | //          E41 (mobile inventory view + mobile-intake wizard)
  47 | 
  48 | const hasAuth = !!(process.env['PLAYWRIGHT_AUTH_EMAIL'] && process.env['PLAYWRIGHT_AUTH_PASSWORD'])
  49 | 
  50 | test.describe('admin routes', () => {
  51 |   test.skip(!hasAuth, 'Set PLAYWRIGHT_AUTH_EMAIL + PLAYWRIGHT_AUTH_PASSWORD to enable admin axe tests')
  52 | 
  53 |   test.beforeEach(async ({ page }) => {
  54 |     await page.goto('/pawn')
  55 |     await page.waitForLoadState('load')
  56 |     // Sign in via Firebase email/password
  57 |     await page.goto('/auth/signin')
  58 |     await page.fill('[name="email"]',    process.env['PLAYWRIGHT_AUTH_EMAIL']!)
  59 |     await page.fill('[name="password"]', process.env['PLAYWRIGHT_AUTH_PASSWORD']!)
  60 |     await page.click('[type="submit"]')
  61 |     await page.waitForURL('**/admin**', { timeout: 10_000 })
  62 |   })
  63 | 
  64 |   const adminRoutes = [
  65 |     { path: '/admin/dashboard',      label: 'Admin dashboard — E10' },
  66 |     { path: '/admin/inventory',      label: 'Admin inventory + PoliceHoldManager — E10, E41' },
  67 |     { path: '/admin/mobile-intake',  label: 'Mobile camera intake wizard — E41' },
  68 |     { path: '/admin/preorders',      label: 'Admin preorders (PreorderInboxPage) — E14' },
  69 |     { path: '/admin/campaigns',      label: 'Admin campaigns (CampaignAdminPage) — E14' },
  70 |   ]
  71 | 
  72 |   for (const route of adminRoutes) {
  73 |     test(`axe: ${route.label}`, async ({ page }) => {
  74 |       await page.goto(route.path)
  75 |       await page.waitForLoadState('load')
  76 |       const results = await new AxeBuilder({ page }).analyze()
  77 |       expect(results.violations).toEqual([])
  78 |     })
  79 |   }
  80 | })
  81 | 
```