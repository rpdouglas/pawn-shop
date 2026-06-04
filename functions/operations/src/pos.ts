import { onRequest } from 'firebase-functions/v2/https'
import * as crypto from 'crypto'
import { brotherPosHmacSecret } from '@pawn-shop/shared/lib/secrets'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// ── receivePosWebhook ─────────────────────────────────────────────────────────
// Brother POS webhook receiver stub (E42).
// Validates the HMAC-SHA256 signature, parses the event payload, and transitions
// posSyncStatus → 'pending' on the matched item. No live processing until
// Brother POS API credentials are configured and the integration is activated.
//
// Required environment variable (Secret Manager or .env):
//   BROTHER_POS_HMAC_SECRET — shared secret agreed with Brother POS
//
// Brother POS must POST to this function's deployed URL and include:
//   X-Brother-POS-Signature: hex(HMAC-SHA256(body, secret))

export const receivePosWebhook = onRequest({ secrets: [brotherPosHmacSecret] }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // ── HMAC verification (skipped if secret not yet configured) ──────────────
  const secret = brotherPosHmacSecret.value()
  if (secret && secret !== 'dummy') {
    const signature = req.headers['x-brother-pos-signature']
    if (typeof signature !== 'string') {
      res.status(401).json({ error: 'Missing X-Brother-POS-Signature header' })
      return
    }
    const expected = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex')
    if (signature !== expected) {
      res.status(401).json({ error: 'Invalid signature' })
      return
    }
  }

  const payload = req.body as Record<string, unknown>
  const posId = typeof payload['itemId'] === 'string' ? payload['itemId'] : undefined
  const eventType = typeof payload['event'] === 'string' ? payload['event'] : 'unknown'

  // ── Stub processing: mark matched item as pending sync ────────────────────
  if (posId) {
    try {
      const db = getFirestore()
      const snap = await db.collection('items')
        .where('posId', '==', posId)
        .limit(1)
        .get()

      if (!snap.empty) {
        await snap.docs[0].ref.update({
          posSyncStatus: 'pending',
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    } catch (err) {
      console.error('[POS Webhook] Firestore update failed', err)
    }
  }

  console.info(`[POS Webhook] received event=${eventType} posId=${posId ?? 'none'}`)
  res.status(200).json({ received: true })
})
