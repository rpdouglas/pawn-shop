import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { assertMfaEnrolled } from './auth'
import { onObjectFinalized } from 'firebase-functions/v2/storage'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import sharp from 'sharp'
import * as path from 'node:path'
import { dispatchSms } from './lib/sms'

// ── Helpers ───────────────────────────────────────────────────────────────────

function isStaffToken(token: Record<string, unknown>): boolean {
  return token['admin'] === true || token['manager'] === true || token['inventory_staff'] === true
}

// Generates prefix-search tokens from title and category (Dale + Kevin requirement).
// "Gold Watch" → ['g','go','gol','gold','w','wa','wat','watc','watch'], plus category tokens.
function buildSearchTokens(title: string, category: string): string[] {
  const text = `${title} ${category}`.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const tokens = new Set<string>()
  for (const word of words) {
    for (let i = 1; i <= word.length; i++) {
      tokens.add(word.slice(0, i))
    }
  }
  return Array.from(tokens)
}

// ── Alerts & Notifications (E12) ──────────────────────────────────────────────

/**
 * Triggered whenever an item is updated. 
 * If status transitions to 'active' and policeHold is false, dispatches alerts.
 */
export const onItemPublished = onDocumentUpdated('items/{itemId}', async (event) => {
  const before = event.data?.before.data()
  const after = event.data?.after.data()

  if (!after) return
  if (before?.['status'] === 'active') return // Only trigger on transition to active
  if (after['status'] !== 'active') return
  if (after['policeHold'] === true) return // Never alert on police hold items

  const db = getFirestore()
  const itemId = event.params.itemId
  const viewTag = after['viewTag']
  const title = after['title']
  const searchTokens = new Set<string>(after['searchTokens'] || [])

  const searchesSnap = await db.collection('savedSearches')
    .where('active', '==', true)
    .where('viewTag', '==', viewTag)
    .get()

  if (searchesSnap.empty) return

  const notifications = searchesSnap.docs.map(async (doc) => {
    const savedSearch = doc.data()
    const queryStr = String(savedSearch['query'] ?? '').toLowerCase().trim()
    
    // Exact match on one of the search tokens
    if (!searchTokens.has(queryStr)) return

    const userSnap = await db.collection('users').doc(String(savedSearch['uid'])).get()
    if (!userSnap.exists) return

    const user = userSnap.data()!
    if (user['alertOptIn'] !== true) return

    const alerts: Promise<unknown>[] = []

    // 1. In-app notification
    alerts.push(db.collection('users').doc(userSnap.id).collection('notifications').add({
      title: 'New Item Match!',
      body: `A new item matching "${queryStr}" is now available.`,
      link: `/pawn/item/${itemId}`, // Assuming path structure
      read: false,
      createdAt: FieldValue.serverTimestamp()
    }))

    // 2. External Alert (SMS/Email)
    const alertMethod = user['alertMethod']
    if (alertMethod === 'sms' && user['phoneNumber']) {
      // Discretion: generic branding for cannabis/fireworks
      const body = viewTag === 'pawn' 
        ? `[The Pawn Shop] Match found: ${title}. View: https://pawn.shop/item/${itemId}`
        : `[The Pawn Shop Update] A new item matching your search is available. View: https://pawn.shop/item/${itemId}`
      
      alerts.push(dispatchSms(user['phoneNumber'], body))
    } else if (alertMethod === 'email' && user['email']) {
      // Email dispatch would go here (SendGrid)
      // For now, logging email intent as SendGrid helper is internal to storeHours.ts
      console.info(`[Email Alert] to=${user['email']} subject="New Match Found"`)
    }

    return Promise.all(alerts)
  })

  await Promise.all(notifications.filter(Boolean))
})

// ── createDraftItem ───────────────────────────────────────────────────────────
// Creates a new draft item. Direct client writes are rejected by Firestore rules
// (resource.data is null for creates; diff() fails), so intake form calls this CF.

interface CreateDraftItemData {
  title: string
  category: string
  viewTag: string
}

export const createDraftItem = onCall<CreateDraftItemData>({ cors: true }, async (request) => {
  if (!request.auth || !isStaffToken(request.auth.token as Record<string, unknown>)) {
    throw new HttpsError('permission-denied', 'Staff role required')
  }

  const { title, category, viewTag } = request.data
  if (!title) throw new HttpsError('invalid-argument', 'title is required')
  if (!category) throw new HttpsError('invalid-argument', 'category is required')
  if (!viewTag) throw new HttpsError('invalid-argument', 'viewTag is required')

  const now = FieldValue.serverTimestamp()
  const ref = await getFirestore().collection('items').add({
    title,
    category,
    viewTag,
    status: 'draft',
    policeHold: false,
    images: [],
    searchTokens: [],
    createdAt: now,
    updatedAt: now,
  })

  return { success: true, itemId: ref.id }
})

// ── processImageUpload ────────────────────────────────────────────────────────
// Storage trigger. Staff uploads to items/{itemId}/uploads/{filename}.
// This function watermarks → converts to WebP → writes final URL to items/{id}.images[]
// → deletes the temp original.

const WATERMARK_SVG = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="36">
    <text x="6" y="26" font-family="sans-serif" font-size="16"
          fill="white" fill-opacity="0.60" font-weight="bold">© The Pawn Shop</text>
  </svg>`
);

export const processImageUpload = onObjectFinalized(
  {
    region: "us-east1"
  },
  async (event) => {
    const filePath = event.data.name;
    if (!filePath) return;

    const match = filePath.match(/^items\/([^/]+)\/uploads\/([^/]+)$/);
    if (!match) return;

    const [, itemId, filename] = match;
    const bucket = getStorage().bucket(event.data.bucket);
    const tempFile = bucket.file(filePath);

    // Ingest the raw temporary artifact
    const [buffer] = await tempFile.download();

    // Process processing operations via Sharp
    const watermarked = await sharp(buffer)
      .composite([{ input: WATERMARK_SVG, gravity: "southeast" }])
      .webp({ quality: 85 })
      .toBuffer();

    const finalPath = `items/${itemId}/images/${path.parse(filename).name}.webp`;
    const finalFile = bucket.file(finalPath);
    
    // Save the finalized client-ready production WebP back to the Cloud Storage bucket
    await finalFile.save(watermarked, {
      contentType: "image/webp",
      public: true,
    });

    const finalUrl = finalFile.publicUrl();

    // Append the direct URL destination string array element securely inside Firestore
    await getFirestore().collection("items").doc(itemId).update({
      images: FieldValue.arrayUnion(finalUrl),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Clean up the temporary original upload object path safely
    await tempFile.delete();
  }
)

// ── publishItem ───────────────────────────────────────────────────────────────
// Validates required fields, generates searchTokens, transitions draft → active,
// writes publishedBy (CF-only field), writes item_published auditLog, fires Kevin alerts.

interface PublishItemData {
  itemId: string
}

export const publishItem = onCall<PublishItemData>({ cors: true }, async (request) => {
  if (!request.auth || !isStaffToken(request.auth.token as Record<string, unknown>)) {
    throw new HttpsError('permission-denied', 'Staff role required')
  }

  const { itemId } = request.data
  if (!itemId) throw new HttpsError('invalid-argument', 'itemId is required')

  const db = getFirestore()
  const itemRef = db.collection('items').doc(itemId)
  const snap = await itemRef.get()

  if (!snap.exists) throw new HttpsError('not-found', `Item ${itemId} not found`)

  const item = snap.data()!

  if (item['status'] !== 'draft') {
    throw new HttpsError('failed-precondition', `Item must be in draft status, current: ${item['status']}`)
  }
  if (!item['title']) throw new HttpsError('invalid-argument', 'title is required')
  if (!item['description']) throw new HttpsError('invalid-argument', 'description is required')
  if (!item['category']) throw new HttpsError('invalid-argument', 'category is required')
  if (!item['viewTag']) throw new HttpsError('invalid-argument', 'viewTag is required')
  if (typeof item['price'] !== 'number' || item['price'] <= 0) {
    throw new HttpsError('invalid-argument', 'price must be a positive integer (CAD cents)')
  }
  if (!item['condition']) throw new HttpsError('invalid-argument', 'condition is required')
  if (!Array.isArray(item['images']) || item['images'].length === 0) {
    throw new HttpsError('invalid-argument', 'At least one image is required before publishing')
  }

  const searchTokens = buildSearchTokens(String(item['title']), String(item['category']))

  await itemRef.update({
    status: 'active',
    policeHold: item['policeHold'] ?? false,
    searchTokens,
    publishedBy: request.auth.uid,
    merchandisingTags: FieldValue.arrayUnion('just-arrived'),
    updatedAt: FieldValue.serverTimestamp(),
  })

  await db.collection('auditLogs').add({
    eventType: 'item_published',
    uid: request.auth.uid,
    targetId: itemId,
    details: { itemId, fromStatus: 'draft', toStatus: 'active' },
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})

// ── setHold ───────────────────────────────────────────────────────────────────
// Transitions active → reserved with a 48-hour expiry. Callable by any signed-in user.

interface SetHoldData {
  itemId: string
}

const HOLD_DURATION_MS = 48 * 60 * 60 * 1000

export const setHold = onCall<SetHoldData>({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required')
  }

  const { itemId } = request.data
  if (!itemId) throw new HttpsError('invalid-argument', 'itemId is required')

  const db = getFirestore()
  const itemRef = db.collection('items').doc(itemId)
  const snap = await itemRef.get()

  if (!snap.exists) throw new HttpsError('not-found', `Item ${itemId} not found`)

  const item = snap.data()!
  if (item['status'] !== 'active') {
    throw new HttpsError(
      'failed-precondition',
      `Item is not available for hold, current status: ${item['status']}`
    )
  }

  const holdExpiresAt = Timestamp.fromMillis(Date.now() + HOLD_DURATION_MS)

  await itemRef.update({
    status: 'reserved',
    holdExpiresAt,
    updatedAt: FieldValue.serverTimestamp(),
  })

  await db.collection('auditLogs').add({
    eventType: 'hold_set',
    uid: request.auth.uid,
    targetId: itemId,
    details: { itemId, fromStatus: 'active', toStatus: 'reserved' },
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true, holdExpiresAt: holdExpiresAt.toDate().toISOString() }
})

// ── setPoliceHold ─────────────────────────────────────────────────────────────
// Admin-only. Sets or clears the policeHold flag on an item. policeHold: true
// removes the item from all public Firestore reads immediately (Firestore rule
// enforced). Writes a police_hold_set auditLog entry on every call.

interface SetPoliceHoldData {
  itemId: string
  hold: boolean
}

export const setPoliceHold = onCall<SetPoliceHoldData>({ cors: true }, async (request) => {
  const token = request.auth?.token as Record<string, unknown> | undefined
  if (!request.auth || token?.['admin'] !== true) {
    throw new HttpsError('permission-denied', 'Admin role required')
  }
  assertMfaEnrolled(request)

  const { itemId, hold } = request.data
  if (!itemId) throw new HttpsError('invalid-argument', 'itemId is required')
  if (typeof hold !== 'boolean') throw new HttpsError('invalid-argument', 'hold must be boolean')

  const db = getFirestore()
  const itemRef = db.collection('items').doc(itemId)
  const snap = await itemRef.get()

  if (!snap.exists) throw new HttpsError('not-found', `Item ${itemId} not found`)

  const previousValue: boolean = snap.data()!['policeHold'] ?? false

  await itemRef.update({
    policeHold: hold,
    updatedAt: FieldValue.serverTimestamp(),
  })

  await db.collection('auditLogs').add({
    eventType: 'police_hold_set',
    uid: request.auth.uid,
    targetId: itemId,
    details: { itemId, previousValue, newValue: hold },
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})

// ── resetExpiredHolds ─────────────────────────────────────────────────────────
// Scheduled every 30 minutes. Resets any reserved items whose holdExpiresAt has passed.

export const resetExpiredHolds = onSchedule('every 30 minutes', async () => {
  const db = getFirestore()
  const now = Timestamp.now()

  const expired = await db.collection('items')
    .where('status', '==', 'reserved')
    .where('holdExpiresAt', '<', now)
    .get()

  if (expired.empty) return

  await Promise.all(
    expired.docs.map(async (doc) => {
      await doc.ref.update({
        status: 'active',
        holdExpiresAt: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      await db.collection('auditLogs').add({
        eventType: 'hold_expired',
        uid: 'system',
        targetId: doc.id,
        details: { itemId: doc.id, fromStatus: 'reserved', toStatus: 'active' },
        createdAt: FieldValue.serverTimestamp(),
      })
    })
  )
})
