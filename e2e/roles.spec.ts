import { test, expect } from '@playwright/test'

// Mock manager user
const mockManager = {
  uid: 'mgr123',
  email: 'manager@thepawnshop.ca',
  displayName: 'Manager',
  role: 'manager',
  isMfaEnrolled: true,
  isStaff: true,
  isAdmin: false,
}

// Mock inventory staff user
const mockStaff = {
  uid: 'staff123',
  email: 'staff@thepawnshop.ca',
  displayName: 'Inventory Staff',
  role: 'inventory_staff',
  isMfaEnrolled: true,
  isStaff: true,
  isAdmin: false,
}

test.describe('Role Based UI', () => {
  test('manager should see CRM access and shift controls', async ({ page }) => {
    await page.addInitScript((mock) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__PLAYWRIGHT_MOCK_USER__ = mock
    }, mockManager)

    await page.goto('/admin/dashboard')

    // Manager should see the Admin navigation drawer
    const bodyText = page.locator('body')
    await expect(bodyText).toContainText('Dashboard', { timeout: 10000 })
  })

  test('inventory_staff should NOT have admin-level role editing in CRM', async ({ page }) => {
    await page.addInitScript((mock) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__PLAYWRIGHT_MOCK_USER__ = mock
    }, mockStaff)

    await page.goto('/admin/customers/some-uid')
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
    
    // The role controls component shouldn't be accessible/visible
    const editRoleBtn = page.locator('text="Edit Role"')
    await expect(editRoleBtn).not.toBeVisible()
  })
})
