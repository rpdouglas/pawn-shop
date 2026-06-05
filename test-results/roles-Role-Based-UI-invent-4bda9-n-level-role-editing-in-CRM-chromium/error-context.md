# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: roles.spec.ts >> Role Based UI >> inventory_staff should NOT have admin-level role editing in CRM
- Location: e2e/roles.spec.ts:39:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('text="Edit Role"')
Expected: not visible
Received: visible

Call log:
  - Expect "not toBeVisible" with timeout 5000ms
  - waiting for locator('text="Edit Role"')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // Mock manager user
  4  | const mockManager = {
  5  |   uid: 'mgr123',
  6  |   email: 'manager@thepawnshop.ca',
  7  |   displayName: 'Manager',
  8  |   role: 'manager',
  9  |   isMfaEnrolled: true,
  10 |   isStaff: true,
  11 |   isAdmin: false,
  12 | }
  13 | 
  14 | // Mock inventory staff user
  15 | const mockStaff = {
  16 |   uid: 'staff123',
  17 |   email: 'staff@thepawnshop.ca',
  18 |   displayName: 'Inventory Staff',
  19 |   role: 'inventory_staff',
  20 |   isMfaEnrolled: true,
  21 |   isStaff: true,
  22 |   isAdmin: false,
  23 | }
  24 | 
  25 | test.describe('Role Based UI', () => {
  26 |   test('manager should see CRM access and shift controls', async ({ page }) => {
  27 |     await page.addInitScript((mock) => {
  28 |       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  29 |       ;(window as any).__PLAYWRIGHT_MOCK_USER__ = mock
  30 |     }, mockManager)
  31 | 
  32 |     await page.goto('/admin/dashboard')
  33 | 
  34 |     // Manager should see the Admin navigation drawer
  35 |     const bodyText = page.locator('body')
  36 |     await expect(bodyText).toContainText('Dashboard', { timeout: 10000 })
  37 |   })
  38 | 
  39 |   test('inventory_staff should NOT have admin-level role editing in CRM', async ({ page }) => {
  40 |     await page.addInitScript((mock) => {
  41 |       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  42 |       ;(window as any).__PLAYWRIGHT_MOCK_USER__ = mock
  43 |     }, mockStaff)
  44 | 
  45 |     await page.goto('/admin/customers/some-uid')
  46 |     await expect(page.locator('body')).toBeVisible({ timeout: 10000 })
  47 |     
  48 |     // The role controls component shouldn't be accessible/visible
  49 |     const editRoleBtn = page.locator('text="Edit Role"')
> 50 |     await expect(editRoleBtn).not.toBeVisible()
     |                                   ^ Error: expect(locator).not.toBeVisible() failed
  51 |   })
  52 | })
  53 | 
```