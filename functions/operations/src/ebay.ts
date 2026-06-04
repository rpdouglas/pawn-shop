import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { ebayUserToken, ebayVerificationToken, ebaySandbox, ebayLocationKey, ebayWebhookUrl } from '@pawn-shop/shared/lib/secrets'

// ── Category & condition maps ─────────────────────────────────────────────────

const EBAY_CATEGORY_MAP: Record<string, string> = {
  electronics:  '293',
  jewellery:    '281',
  tools:        '631',
  collectibles: '1',
  clothing:     '11450',
}

// Maps our condition grades to eBay condition IDs
const EBAY_CONDITION_MAP: Record<string, number> = {
  new:        1000,
  'like-new': 1500,
  good:       3000,
  fair:       5000,
  poor:       7000,
}
const EBAY_DEFAULT_CONDITION = 3000 // Used - Good

// ── Helpers ───────────────────────────────────────────────────────────────────

function isStaffToken(token: Record<string, unknown>): boolean {
  return token['admin'] === true || token['manager'] === true
}

function getEbayBase(): string {
  return ebaySandbox.value() === 'true'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com'
}

// Node 20 native fetch — no additional dependencies required
async function ebayRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const token = ebayUserToken.value()
  if (!token || token === 'dummy') throw new HttpsError('internal', 'EBAY_USER_TOKEN not configured')

  const res = await fetch(`${getEbayBase()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_CA',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // PUT /inventory_item returns 204 No Content on success — no body to parse
  if (res.status === 204) return { ok: true, status: 204, data: null }

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // empty body on unexpected non-204 response
  }

  return { ok: res.ok, status: res.status, data }
}

// ── pushToEbay ────────────────────────────────────────────────────────────────
// Callable CF: staff admin pushes a pawn item to eBay.
// Three-step eBay Sell Inventory API flow:
//   1. Create/update inventory item (PUT)
//   2. Create offer (POST)
//   3. Publish offer → returns listingId (POST)
// On success, writes ebayListingId to items/{id} and logs ebay_push auditLog.

interface PushToEbayData {
  itemId: string
}

interface PushToEbayResult {
  success: boolean
  ebayListingId: string
}

export const pushToEbay = onCall<PushToEbayData, Promise<PushToEbayResult>>(
  { cors: true, secrets: [ebayUserToken] },
  async (request) => {
    if (!request.auth || !isStaffToken(request.auth.token as Record<string, unknown>)) {
      throw new HttpsError('permission-denied', 'Admin or manager role required')
    }

    const { itemId } = request.data
    if (!itemId) throw new HttpsError('invalid-argument', 'itemId is required')

    const db = getFirestore()
    const itemRef = db.collection('items').doc(itemId)
    const snap = await itemRef.get()

    if (!snap.exists) throw new HttpsError('not-found', `Item ${itemId} not found`)

    const item = snap.data() as Record<string, unknown>

    if (item['status'] !== 'active') {
      throw new HttpsError(
        'failed-precondition',
        `Item must be active to push to eBay (current: ${String(item['status'])})`,
      )
    }
    if (item['policeHold'] === true) {
      throw new HttpsError('failed-precondition', 'Item is on police hold and cannot be listed')
    }
    if (item['viewTag'] !== 'pawn') {
      throw new HttpsError(
        'failed-precondition',
        'Only pawn items can be listed on eBay — cannabis and fireworks are prohibited on eBay',
      )
    }
    if (typeof item['ebayListingId'] === 'string' && item['ebayListingId']) {
      throw new HttpsError(
        'already-exists',
        `Item is already listed on eBay (ID: ${item['ebayListingId']})`,
      )
    }

    const title       = String(item['title'] ?? '')
    const description = String(item['description'] ?? '')
    const category    = String(item['category'] ?? '').toLowerCase().trim()
    const condition   = String(item['condition'] ?? 'good')
    const priceCents  = Number(item['price'])
    const images      = (item['images'] as string[] | undefined) ?? []
    const locationKey = ebayLocationKey.value() || 'main_store'
    const sku         = itemId

    // Step 1: Create/update inventory item
    const inventoryResult = await ebayRequest(
      'PUT',
      `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
      {
        availability: { shipToLocationAvailability: { quantity: 1 } },
        condition: EBAY_CONDITION_MAP[condition] ?? EBAY_DEFAULT_CONDITION,
        product: {
          title,
          description,
          imageUrls: images.slice(0, 12), // eBay maximum 12 images per listing
        },
      },
    )
    if (!inventoryResult.ok) {
      throw new HttpsError('internal', 'Failed to create eBay inventory item')
    }

    // Step 2: Create offer
    const offerResult = await ebayRequest('POST', '/sell/inventory/v1/offer', {
      sku,
      marketplaceId: 'EBAY_CA',
      format: 'FIXED_PRICE',
      availableQuantity: 1,
      categoryId: EBAY_CATEGORY_MAP[category] ?? '99',
      pricingSummary: {
        price: { value: (priceCents / 100).toFixed(2), currency: 'CAD' },
      },
      listingDescription: description,
      merchantLocationKey: locationKey,
    })
    if (!offerResult.ok || typeof offerResult.data !== 'object' || !offerResult.data) {
      throw new HttpsError('internal', 'Failed to create eBay offer')
    }
    const offerId = (offerResult.data as Record<string, unknown>)['offerId']
    if (typeof offerId !== 'string') {
      throw new HttpsError('internal', 'eBay offer response missing offerId')
    }

    // Step 3: Publish offer → listingId
    const publishResult = await ebayRequest(
      'POST',
      `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}/publish`,
      {},
    )
    if (!publishResult.ok || typeof publishResult.data !== 'object' || !publishResult.data) {
      throw new HttpsError('internal', 'Failed to publish eBay offer')
    }
    const listingId = (publishResult.data as Record<string, unknown>)['listingId']
    if (typeof listingId !== 'string') {
      throw new HttpsError('internal', 'eBay publish response missing listingId')
    }

    await itemRef.update({
      ebayListingId: listingId,
      updatedAt: FieldValue.serverTimestamp(),
    })

    await db.collection('auditLogs').add({
      eventType: 'ebay_push',
      uid: request.auth.uid,
      targetId: itemId,
      details: { itemId, ebayListingId: listingId, viewTag: item['viewTag'] },
      createdAt: FieldValue.serverTimestamp(),
    })

    return { success: true, ebayListingId: listingId }
  },
)

// ── ebayWebhook ───────────────────────────────────────────────────────────────
// HTTP trigger: receives eBay Marketplace Event Notifications.
//
// GET  ?challenge_code=xxx  → endpoint challenge verification (required during
//                             eBay Notification API subscription setup)
// POST <signed payload>     → sold event; verifies signature, syncs status: 'sold'
//
// Environment variables required:
//   EBAY_VERIFICATION_TOKEN — set in eBay developer notification subscription
//   EBAY_WEBHOOK_URL        — this function's deployed HTTPS URL
//
// Signature verification (POST):
//   eBay computes SHA256(rawBody + verificationToken), Base64-encodes the result,
//   and sends it in the x-ebay-signature header.

interface EbayNotificationPayload {
  metadata?: { topic?: string }
  notification?: { data?: Record<string, unknown> }
}

export const ebayWebhook = onRequest({ secrets: [ebayVerificationToken] }, async (req, res) => {
  if (req.method === 'GET') {
    const challengeCode =
      typeof req.query['challenge_code'] === 'string' ? req.query['challenge_code'] : null
    if (!challengeCode) {
      res.status(400).json({ error: 'challenge_code required' })
      return
    }

    const verificationToken = ebayVerificationToken.value()
    const endpointUrl = ebayWebhookUrl.value()
    if (!verificationToken || !endpointUrl) {
      res.status(500).json({ error: 'Webhook environment not configured' })
      return
    }

    const challengeResponse = createHash('sha256')
      .update(challengeCode + verificationToken + endpointUrl)
      .digest('hex')

    res.status(200).json({ challengeResponse })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const verificationToken = ebayVerificationToken.value()
  if (!verificationToken) {
    res.status(500).json({ error: 'Webhook environment not configured' })
    return
  }

  const signature = req.headers['x-ebay-signature']
  if (typeof signature !== 'string') {
    res.status(403).json({ error: 'Missing x-ebay-signature header' })
    return
  }

  // Firebase Functions preserves the raw body as req.rawBody (Buffer)
  const rawBody =
    (req as unknown as { rawBody?: Buffer }).rawBody?.toString('utf8') ??
    JSON.stringify(req.body)

  const expectedSignature = createHash('sha256')
    .update(rawBody + verificationToken)
    .digest('base64')

  if (signature !== expectedSignature) {
    res.status(403).json({ error: 'Signature mismatch' })
    return
  }

  // Respond within eBay's 3-second acknowledgment window; process asynchronously
  res.status(200).json({ success: true })

  try {
    await processEbayNotification(req.body as unknown)
  } catch (err) {
    console.error('[ebayWebhook] notification processing error:', err)
  }
})

async function processEbayNotification(payload: unknown): Promise<void> {
  if (typeof payload !== 'object' || payload === null) return

  const n = payload as EbayNotificationPayload
  const topic = n.metadata?.topic ?? ''

  if (!topic.toLowerCase().includes('item_sold')) return

  const data = n.notification?.data
  if (!data) return

  // eBay may use listingId or itemId depending on notification topic version
  const listingId = String(data['listingId'] ?? data['itemId'] ?? '').trim()
  if (!listingId) return

  const db = getFirestore()
  const snap = await db.collection('items')
    .where('ebayListingId', '==', listingId)
    .limit(1)
    .get()

  if (snap.empty) return

  const itemDoc = snap.docs[0]
  if ((itemDoc.data() as Record<string, unknown>)['status'] === 'sold') return // Idempotent — already synced

  await itemDoc.ref.update({
    status: 'sold',
    soldAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  await db.collection('auditLogs').add({
    eventType: 'ebay_sync_sold',
    uid: 'ebay_webhook',
    targetId: itemDoc.id,
    details: { itemId: itemDoc.id, ebayListingId: listingId },
    createdAt: FieldValue.serverTimestamp(),
  })
}
