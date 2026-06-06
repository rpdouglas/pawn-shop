import { test } from '@playwright/test'

// Mock manager user to bypass login for staff screens
const mockManager = {
  uid: 'mgr123',
  email: 'manager@thepawnshop.ca',
  displayName: 'Manager',
  role: 'manager',
  isMfaEnrolled: true,
  isStaff: true,
  isAdmin: false,
}

test.describe('Automated Documentation Screenshots', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  // Inject mock user to act as a logged-in manager
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((mock) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__PLAYWRIGHT_MOCK_USER__ = mock
    }, mockManager)
  })

  test('Capture Home Page', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/home-page.png' })
  })

  test('Capture Admin Dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/admin-dashboard.png' })
  })

  test('Capture Admin Intake Form', async ({ page }) => {
    await page.goto('/admin/inventory/intake')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/admin-intake-form.png', fullPage: true })
  })

  test('Capture Admin Inventory List', async ({ page }) => {
    await page.goto('/admin/inventory')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/admin-inventory-list.png', fullPage: true })
  })

  test('Capture Admin Customer Profiles CRM', async ({ page }) => {
    await page.goto('/admin/customers')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/admin-customers-crm.png' })
  })
})
