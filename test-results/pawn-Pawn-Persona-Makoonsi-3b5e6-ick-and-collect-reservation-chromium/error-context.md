# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pawn.spec.ts >> Pawn Persona (Makoonsii) >> browse item and submit click-and-collect reservation
- Location: e2e/pawn.spec.ts:39:3

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://localhost:5173/pawn", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { clearFirestore, seedFirestore } from './test-helpers'
  3  | 
  4  | const PAWN_ITEM_ID = 'test-pawn-item-123'
  5  | const PAWN_ITEM_DATA = {
  6  |   title: 'Vintage Rolex Submariner',
  7  |   description: 'A classic 1980s Rolex.',
  8  |   category: 'Watches',
  9  |   viewTag: 'pawn',
  10 |   status: 'active',
  11 |   policeHold: false,
  12 |   price: 850000,
  13 |   condition: 'Good',
  14 |   images: ['https://example.com/rolex.jpg'],
  15 |   createdAt: new Date(),
  16 | }
  17 | const mockUser = {
  18 |   uid: 'makoonsii-123',
  19 |   email: 'makoonsii@example.com',
  20 |   displayName: 'Makoonsii Bear',
  21 | }
  22 | 
  23 | test.describe('Pawn Persona (Makoonsii)', () => {
  24 |   test.setTimeout(60000);
  25 |   test.beforeAll(async () => {
  26 |     await clearFirestore()
  27 |     await seedFirestore('items', PAWN_ITEM_ID, PAWN_ITEM_DATA)
  28 |     await seedFirestore('config', 'storeHours', {
  29 |       monday: { open: '09:00', close: '17:00', closed: false },
  30 |       tuesday: { open: '09:00', close: '17:00', closed: false },
  31 |       wednesday: { open: '09:00', close: '17:00', closed: false },
  32 |       thursday: { open: '09:00', close: '17:00', closed: false },
  33 |       friday: { open: '09:00', close: '17:00', closed: false },
  34 |       saturday: { open: '09:00', close: '17:00', closed: false },
  35 |       sunday: { open: '09:00', close: '17:00', closed: false },
  36 |     })
  37 |   })
  38 | 
  39 |   test('browse item and submit click-and-collect reservation', async ({ page }) => {
  40 |     await page.addInitScript((mock) => {
  41 |       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  42 |       ;(window as any).__PLAYWRIGHT_MOCK_USER__ = mock
  43 |     }, mockUser)
  44 | 
  45 |     // 1. Navigate to the Pawn homepage
> 46 |     await page.goto('/pawn')
     |                ^ Error: page.goto: Page crashed
  47 |     
  48 |     // 2. See the item in the inventory feed
  49 |     const itemCard = page.locator('text="Vintage Rolex Submariner"').first()
  50 |     await expect(itemCard).toBeVisible()
  51 | 
  52 |     // 3. Click to open Quick View modal
  53 |     await itemCard.click()
  54 |     await expect(page.locator('.modal-content')).toBeVisible()
  55 | 
  56 |     // 4. Click 'Reserve for Collection'
  57 |     await page.click('button:has-text("Reserve for Collection")')
  58 |     await expect(page.locator('.cc-modal-form')).toBeVisible()
  59 | 
  60 |     // Wait for slots to load and click the first available slot
  61 |     const dateInput = page.locator('input#cc-date')
  62 |     const tomorrow = new Date()
  63 |     tomorrow.setDate(tomorrow.getDate() + 1)
  64 |     const tomorrowStr = tomorrow.toISOString().split('T')[0]
  65 |     await dateInput.fill(tomorrowStr)
  66 | 
  67 |     const slotBtn = page.locator('.cc-slot-btn').first()
  68 |     await expect(slotBtn).toBeVisible({ timeout: 10000 })
  69 |     await slotBtn.click()
  70 | 
  71 |     // 5. Fill out the reservation form
  72 |     await page.fill('input#cc-name', 'Makoonsii Bear')
  73 |     await page.fill('input#cc-phone', '5551234567')
  74 | 
  75 |     // 6. Submit the form
  76 |     await page.click('button:has-text("Request this window")')
  77 | 
  78 |     // Because we use a mocked user context, the Cloud Function will throw an 'unauthenticated' error.
  79 |     // We catch the timeout to ensure the UI behaves reasonably without crashing.
  80 |     await expect(page.locator('text="Request received"')).toBeVisible({ timeout: 15000 }).catch(async () => {
  81 |       // Fallback: Expect either the success message or the known error message from the CF
  82 |       await expect(page.locator('text="Sign in to reserve an item"')).toBeVisible({ timeout: 5000 })
  83 |     })
  84 |   })
  85 | })
  86 | 
```