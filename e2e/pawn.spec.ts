import { test, expect } from '@playwright/test'
import { clearFirestore, seedFirestore } from './test-helpers'

const PAWN_ITEM_ID = 'test-pawn-item-123'
const PAWN_ITEM_DATA = {
  title: 'Vintage Rolex Submariner',
  description: 'A classic 1980s Rolex.',
  category: 'Watches',
  viewTag: 'pawn',
  status: 'active',
  policeHold: false,
  price: 850000,
  condition: 'Good',
  images: ['https://example.com/rolex.jpg'],
  createdAt: new Date(),
}

test.describe('Pawn Persona (Makoonsii)', () => {
  test.beforeAll(async () => {
    await clearFirestore()
    await seedFirestore('items', PAWN_ITEM_ID, PAWN_ITEM_DATA)
  })

  test('browse item and submit click-and-collect reservation', async ({ page }) => {
    // 1. Navigate to the Pawn homepage
    await page.goto('/pawn')
    
    // 2. See the item in the inventory feed
    const itemCard = page.locator('text="Vintage Rolex Submariner"').first()
    await expect(itemCard).toBeVisible()

    // 3. Click to open Quick View modal
    await itemCard.click()
    
    // Expect the Quick View modal to open instead of navigating
    await expect(page.locator('h2', { hasText: 'Vintage Rolex Submariner' })).toBeVisible()
    await expect(page.locator('text="$8,500"')).toBeVisible()

    // 4. Click the Reserve for Collection button
    const clickCollectBtn = page.locator('button', { hasText: 'Reserve for Collection' })
    await clickCollectBtn.click()

    // 5. Fill out the reservation form
    const modal = page.locator('dialog')
    await expect(modal).toBeVisible()
    
    await page.fill('input[name="firstName"]', 'Makoonsii')
    await page.fill('input[name="lastName"]', 'Bear')
    await page.fill('input[name="phone"]', '5551234567')

    // Note: Due to Playwright's lack of mock for the callable function unless we stub it or have the emulator running,
    // and since the emulator IS running, this will actually call the confirmReservation/createReservation callable!
    // But wait! `createReservation` requires Twilio which we mocked out in Cloud Functions testing, but the running emulator
    // will execute the actual CF. 
    // In our local dev setup, Twilio fails gracefully if keys are missing (or we can just submit).
    // Let's just submit the form.
    const submitBtn = page.locator('button', { hasText: 'Reserve' })
    await submitBtn.click()

    // The form should show a success state or close
    await expect(page.locator('text="Reservation Confirmed"')).toBeVisible({ timeout: 10000 })
  })
})
