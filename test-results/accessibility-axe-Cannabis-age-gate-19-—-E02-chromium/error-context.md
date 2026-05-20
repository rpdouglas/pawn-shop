# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> axe: Cannabis age gate (19+) — E02
- Location: e2e/accessibility.spec.ts:15:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/cannabis
Call log:
  - navigating to "http://localhost:5173/cannabis", waiting until "load"

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
> 16 |     await page.goto(route.path)
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/cannabis
  17 |     await page.waitForLoadState('load')
  18 |     // Route-level code splitting: the page component chunk loads asynchronously
  19 |     // after the main bundle. Wait for #main-content to have rendered children
  20 |     // before scanning — otherwise axe runs against an empty shell.
  21 |     await page.waitForFunction(
  22 |       () => {
  23 |         const main = document.querySelector('#main-content')
  24 |         return main !== null && main.children.length > 0
  25 |       },
  26 |       { timeout: 15_000 },
  27 |     )
  28 |     // Freeze all CSS animations so axe scans the settled state, not a mid-animation frame.
  29 |     // fade-up starts at opacity:0 (fill-mode:both) — without this the color contrast
  30 |     // checks measure blended/partial-opacity colours rather than the final token values.
  31 |     await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' })
  32 |     await page.evaluate(() => new Promise<void>(r => requestAnimationFrame(() => r())))
  33 |     const results = await new AxeBuilder({ page }).analyze()
  34 |     expect(results.violations).toEqual([])
  35 |   })
  36 | }
  37 | 
  38 | // ── Admin routes ───────────────────────────────────────────────────────────────
  39 | // Require staff credentials. Set PLAYWRIGHT_AUTH_EMAIL and PLAYWRIGHT_AUTH_PASSWORD
  40 | // environment variables to run these tests. Skipped in unauthenticated CI.
  41 | //
  42 | // Covers:  E06 (EbayPushButton in admin intake)
  43 | //          E10 (admin dashboard + PoliceHoldManager)
  44 | //          E14 (PreorderInboxPage, CampaignAdminPage)
  45 | 
  46 | const hasAuth = !!(process.env['PLAYWRIGHT_AUTH_EMAIL'] && process.env['PLAYWRIGHT_AUTH_PASSWORD'])
  47 | 
  48 | test.describe('admin routes', () => {
  49 |   test.skip(!hasAuth, 'Set PLAYWRIGHT_AUTH_EMAIL + PLAYWRIGHT_AUTH_PASSWORD to enable admin axe tests')
  50 | 
  51 |   test.beforeEach(async ({ page }) => {
  52 |     await page.goto('/pawn')
  53 |     await page.waitForLoadState('load')
  54 |     // Sign in via Firebase email/password
  55 |     await page.goto('/auth/signin')
  56 |     await page.fill('[name="email"]',    process.env['PLAYWRIGHT_AUTH_EMAIL']!)
  57 |     await page.fill('[name="password"]', process.env['PLAYWRIGHT_AUTH_PASSWORD']!)
  58 |     await page.click('[type="submit"]')
  59 |     await page.waitForURL('**/admin**', { timeout: 10_000 })
  60 |   })
  61 | 
  62 |   const adminRoutes = [
  63 |     { path: '/admin/dashboard',  label: 'Admin dashboard — E10' },
  64 |     { path: '/admin/inventory',  label: 'Admin inventory + PoliceHoldManager — E10' },
  65 |     { path: '/admin/preorders',  label: 'Admin preorders (PreorderInboxPage) — E14' },
  66 |     { path: '/admin/campaigns',  label: 'Admin campaigns (CampaignAdminPage) — E14' },
  67 |   ]
  68 | 
  69 |   for (const route of adminRoutes) {
  70 |     test(`axe: ${route.label}`, async ({ page }) => {
  71 |       await page.goto(route.path)
  72 |       await page.waitForLoadState('load')
  73 |       const results = await new AxeBuilder({ page }).analyze()
  74 |       expect(results.violations).toEqual([])
  75 |     })
  76 |   }
  77 | })
  78 | 
```