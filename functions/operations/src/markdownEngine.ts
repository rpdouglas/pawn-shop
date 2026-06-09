import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { assertMfaEnrolled } from '@pawn-shop/shared/lib/authHelpers'
import { dispatchSms } from '@pawn-shop/shared/lib/sms'
import { twilioAccountSid, twilioAuthToken } from '@pawn-shop/shared/lib/secrets'

// ── Helpers ───────────────────────────────────────────────────────────────────

function isManagerToken(token: Record<string, unknown>): boolean {
  return token['admin'] === true || token['manager'] === true
}

// ── Markdown Engine (E28) ─────────────────────────────────────────────────────

/**
 * Scheduled Cron Job: daily at 03:00 UTC.
 * Scans all active inventory for items with markdownEnabled = true.
 * If the period has elapsed since lastMarkdownAt (or since created), drops the price.
 */
export const applyMarkdownDrops = onSchedule({ schedule: '0 3 * * *', secrets: [twilioAccountSid, twilioAuthToken] }, async () => {
  const db = getFirestore()
  const now = new Date()

  // Find eligible items: markdownEnabled, active status, not on policeHold
  const itemsSnap = await db.collection('items')
    .where('markdownEnabled', '==', true)
    .where('status', '==', 'active')
    .where('policeHold', '!=', true)
    .get()

  for (const doc of itemsSnap.docs) {
    const data = doc.data() as Record<string, unknown>
    const merchandisingTags = (data['merchandisingTags'] as string[] | undefined) || []
    
    // Skip immune tags (Dale Authenticity Test)
    if (merchandisingTags.includes('rare-find') || merchandisingTags.includes('limited-edition')) {
      continue
    }

    const price = Number(data['price']) || 0
    const floorPrice = Number(data['floorPrice']) || 0
    const markdownRate = Number(data['markdownRate']) || 0
    const markdownPeriodDays = Number(data['markdownPeriodDays']) || 0
    
    if (price <= floorPrice || markdownRate <= 0 || markdownPeriodDays <= 0) continue

    const lastMarkdownAt = data['lastMarkdownAt'] instanceof Timestamp 
      ? data['lastMarkdownAt'].toDate() 
      : (data['createdAt'] instanceof Timestamp ? data['createdAt'].toDate() : new Date(0))

    const msPerDay = 1000 * 60 * 60 * 24
    const daysSinceMarkdown = (now.getTime() - lastMarkdownAt.getTime()) / msPerDay

    if (daysSinceMarkdown >= markdownPeriodDays) {
      let dropAmount: number
      
      if (markdownRate <= 100) {
        dropAmount = Math.floor(price * (markdownRate / 100))
      } else {
        dropAmount = markdownRate
      }

      let newPrice = price - dropAmount
      if (newPrice < floorPrice) {
        newPrice = floorPrice
      }

      if (newPrice < price) {
        // Execute drop
        const batch = db.batch()
        batch.update(doc.ref, {
          price: newPrice,
          lastMarkdownAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        })

        // Audit log
        const auditRef = db.collection('auditLogs').doc()
        batch.set(auditRef, {
          eventType: 'price_override',
          uid: 'system',
          details: { 
            itemId: doc.id, 
            oldPrice: price, 
            newPrice, 
            reason: 'automated_markdown' 
          },
          createdAt: FieldValue.serverTimestamp()
        })

        await batch.commit()

        // Send Alerts (CASL and Discretion compliant)
        await sendMarkdownAlert(doc.id, data, db)
      }
    }
  }
})

/**
 * Callable: enableMarkdown
 * Staff configuration toggle for marking down an item.
 */
export const enableMarkdown = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in')
  assertMfaEnrolled(request)
  if (!isManagerToken(request.auth.token)) throw new HttpsError('permission-denied', 'Manager+ required')

  const { itemId, floorPrice, markdownRate, markdownPeriodDays } = request.data as {
    itemId: string, floorPrice: number, markdownRate: number, markdownPeriodDays: number
  }

  if (!itemId || typeof floorPrice !== 'number' || typeof markdownRate !== 'number' || typeof markdownPeriodDays !== 'number') {
    throw new HttpsError('invalid-argument', 'Missing configuration parameters')
  }

  const db = getFirestore()
  const itemRef = db.collection('items').doc(itemId)
  const itemSnap = await itemRef.get()

  if (!itemSnap.exists) throw new HttpsError('not-found', 'Item not found')
  const itemData = itemSnap.data() as Record<string, unknown>

  const price = Number(itemData['price']) || 0
  const originalPrice = itemData['originalPrice'] === undefined ? price : Number(itemData['originalPrice'])

  await itemRef.update({
    markdownEnabled: true,
    floorPrice,
    markdownRate,
    markdownPeriodDays,
    originalPrice,
    lastMarkdownAt: itemData['lastMarkdownAt'] ?? FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  return { success: true }
})

/**
 * Callable: disableMarkdown
 * Manager endpoint to pause markdowns.
 */
export const disableMarkdown = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in')
  assertMfaEnrolled(request)
  if (!isManagerToken(request.auth.token)) throw new HttpsError('permission-denied', 'Manager+ required')

  const { itemId } = request.data as { itemId: string }
  if (!itemId) throw new HttpsError('invalid-argument', 'Missing itemId')

  const db = getFirestore()
  await db.collection('items').doc(itemId).update({
    markdownEnabled: false,
    updatedAt: FieldValue.serverTimestamp()
  })

  return { success: true }
})

// ── Alert Helper ──────────────────────────────────────────────────────────────

async function sendMarkdownAlert(itemId: string, itemData: Record<string, unknown>, db: FirebaseFirestore.Firestore) {
  const viewTag = String(itemData['viewTag'])
  const searchTokens = new Set<string>((itemData['searchTokens'] as string[] | undefined) ?? [])

  const searchesSnap = await db.collection('savedSearches')
    .where('active', '==', true)
    .where('viewTag', '==', viewTag)
    .get()

  if (searchesSnap.empty) return

  for (const doc of searchesSnap.docs) {
    const savedSearch = doc.data() as Record<string, unknown>
    const queryStr = String(savedSearch['query'] ?? '').toLowerCase().trim()
    
    if (!searchTokens.has(queryStr)) continue

    const userSnap = await db.collection('users').doc(String(savedSearch['uid'])).get()
    if (!userSnap.exists) continue

    const user = userSnap.data() as Record<string, unknown>
    if (user['alertOptIn'] !== true) continue

    const alertMethod = user['alertMethod']
    if (alertMethod === 'sms' && user['phoneNumber']) {
      // Kevin & Marie constraints: generic alert without exact price
      const body = `[The Pawn Shop Update] An item you're watching has dropped in price. View: https://pawn.shop/item/${itemId}`
      try {
        await dispatchSms(user['phoneNumber'] as string, body)
      } catch (err) {
        console.error(`[Markdown Alert] SMS failed for uid=${userSnap.id}:`, (err as Error).message)
      }
    }
  }
}
