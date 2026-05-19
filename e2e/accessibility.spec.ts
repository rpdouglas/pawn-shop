import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// ── Public routes ─────────────────────────────────────────────────────────────
// These require no authentication. Cannabis and Fireworks routes display the
// age gate UI — axe-core tests the gate page itself, not the gated content.

const publicRoutes = [
  { path: '/pawn',      label: 'Pawn view — E02, E09, E17 (RecentlySoldStrip, ActivityFeed, HoldCountdownBadge)' },
  { path: '/cannabis',  label: 'Cannabis age gate (19+) — E02' },
  { path: '/fireworks', label: 'Fireworks age gate (18+) — E02, E14 (CampaignBanner on public view)' },
]

for (const route of publicRoutes) {
  test(`axe: ${route.label}`, async ({ page }) => {
    await page.goto(route.path)
    await page.waitForLoadState('load')
    // Route-level code splitting: the page component chunk loads asynchronously
    // after the main bundle. Wait for #main-content to have rendered children
    // before scanning — otherwise axe runs against an empty shell.
    await page.waitForFunction(
      () => {
        const main = document.querySelector('#main-content')
        return main !== null && main.children.length > 0
      },
      { timeout: 15_000 },
    )
    // Freeze all CSS animations so axe scans the settled state, not a mid-animation frame.
    // fade-up starts at opacity:0 (fill-mode:both) — without this the color contrast
    // checks measure blended/partial-opacity colours rather than the final token values.
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' })
    await page.evaluate(() => new Promise<void>(r => requestAnimationFrame(() => r())))
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}

// ── Admin routes ───────────────────────────────────────────────────────────────
// Require staff credentials. Set PLAYWRIGHT_AUTH_EMAIL and PLAYWRIGHT_AUTH_PASSWORD
// environment variables to run these tests. Skipped in unauthenticated CI.
//
// Covers:  E06 (EbayPushButton in admin intake)
//          E10 (admin dashboard + PoliceHoldManager)
//          E14 (PreorderInboxPage, CampaignAdminPage)

const hasAuth = !!(process.env['PLAYWRIGHT_AUTH_EMAIL'] && process.env['PLAYWRIGHT_AUTH_PASSWORD'])

test.describe('admin routes', () => {
  test.skip(!hasAuth, 'Set PLAYWRIGHT_AUTH_EMAIL + PLAYWRIGHT_AUTH_PASSWORD to enable admin axe tests')

  test.beforeEach(async ({ page }) => {
    await page.goto('/pawn')
    await page.waitForLoadState('load')
    // Sign in via Firebase email/password
    await page.goto('/auth/signin')
    await page.fill('[name="email"]',    process.env['PLAYWRIGHT_AUTH_EMAIL']!)
    await page.fill('[name="password"]', process.env['PLAYWRIGHT_AUTH_PASSWORD']!)
    await page.click('[type="submit"]')
    await page.waitForURL('**/admin**', { timeout: 10_000 })
  })

  const adminRoutes = [
    { path: '/admin/dashboard',  label: 'Admin dashboard — E10' },
    { path: '/admin/inventory',  label: 'Admin inventory + PoliceHoldManager — E10' },
    { path: '/admin/preorders',  label: 'Admin preorders (PreorderInboxPage) — E14' },
    { path: '/admin/campaigns',  label: 'Admin campaigns (CampaignAdminPage) — E14' },
  ]

  for (const route of adminRoutes) {
    test(`axe: ${route.label}`, async ({ page }) => {
      await page.goto(route.path)
      await page.waitForLoadState('load')
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  }
})
