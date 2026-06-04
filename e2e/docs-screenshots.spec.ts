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

  test('Capture all User Guide screenshots', async ({ page }) => {
    
    // Inject mock user to act as a logged-in manager
    await page.addInitScript((mock) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__PLAYWRIGHT_MOCK_USER__ = mock
    }, mockManager)

    // --- 1. Getting Started: Home Page ---
    await page.goto('/')
    // Wait for the app to settle
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/home-page.png' })

    // --- 2. Admin Dashboard ---
    await page.goto('/admin/dashboard')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/admin-dashboard.png' })

    // --- 3. Intake Form ---
    await page.goto('/admin/inventory/intake')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/admin-intake-form.png', fullPage: true })

    // --- 4. Inventory List (to show AI Assistant access point) ---
    await page.goto('/admin/inventory')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/admin-inventory-list.png', fullPage: true })

    // --- 5. Customer Profiles (CRM) ---
    await page.goto('/admin/customers')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'user-guide/public/screenshots/admin-customers-crm.png', fullPage: true })

  })
})
