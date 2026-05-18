import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

const VALID_TAGS = ['staff-pick', 'rare-find', 'limited-edition', 'just-arrived'] as const
type MerchandisingTagValue = typeof VALID_TAGS[number]

function isStaffToken(token: Record<string, unknown>): boolean {
  return token['admin'] === true || token['manager'] === true || token['inventory_staff'] === true
}

function isManagerOrAbove(token: Record<string, unknown>): boolean {
  return token['admin'] === true || token['manager'] === true
}

// ── updateMerchandisingTags ───────────────────────────────────────────────────
// Callable CF. Adds or removes a merchandising tag from items/{id}.merchandisingTags.
// Writes staff-pick auditLog entries. Enforces rare-find/limited-edition to manager+.

interface UpdateMerchandisingTagsData {
  itemId: string
  tag: MerchandisingTagValue
  action: 'add' | 'remove'
  curatorNote?: string
}

export const updateMerchandisingTags = onCall<UpdateMerchandisingTagsData>({ cors: true }, async (request) => {
  const token = (request.auth?.token ?? {}) as Record<string, unknown>
  if (!isStaffToken(token)) {
    throw new HttpsError('permission-denied', 'Staff role required')
  }

  const { itemId, tag, action, curatorNote } = request.data

  if (!itemId?.trim()) throw new HttpsError('invalid-argument', 'itemId is required')
  if (!(VALID_TAGS as readonly string[]).includes(tag)) {
    throw new HttpsError('invalid-argument', `tag must be one of: ${VALID_TAGS.join(', ')}`)
  }
  if (action !== 'add' && action !== 'remove') {
    throw new HttpsError('invalid-argument', 'action must be add or remove')
  }
  if ((tag === 'rare-find' || tag === 'limited-edition') && !isManagerOrAbove(token)) {
    throw new HttpsError('permission-denied', 'rare-find and limited-edition require manager or admin role')
  }

  const db = getFirestore()
  const itemRef = db.collection('items').doc(itemId.trim())
  const snap = await itemRef.get()
  if (!snap.exists) throw new HttpsError('not-found', `Item ${itemId} not found`)

  const updatePayload: Record<string, unknown> = {
    merchandisingTags: action === 'add'
      ? FieldValue.arrayUnion(tag)
      : FieldValue.arrayRemove(tag),
    updatedAt: FieldValue.serverTimestamp(),
  }

  if (tag === 'staff-pick') {
    if (action === 'add' && curatorNote?.trim()) {
      updatePayload['staffPickNote'] = curatorNote.trim().slice(0, 280)
    } else if (action === 'remove') {
      updatePayload['staffPickNote'] = FieldValue.delete()
    }
  }

  await itemRef.update(updatePayload)

  if (tag === 'staff-pick') {
    const item = snap.data()!
    await db.collection('auditLogs').add({
      eventType: action === 'add' ? 'staff_pick_set' : 'staff_pick_removed',
      uid: request.auth!.uid,
      targetId: itemId.trim(),
      details: { itemId: itemId.trim(), viewTag: item['viewTag'] },
      createdAt: FieldValue.serverTimestamp(),
    })
  }

  return { success: true }
})

// ── calculateTrendingScore ────────────────────────────────────────────────────
// Scheduled every 30 minutes. Recomputes trendingScore for all active items.
// Formula: viewCount + (enquiryCount * 5). No time decay at current inventory scale.

const BATCH_LIMIT = 500

export const calculateTrendingScore = onSchedule('every 30 minutes', async () => {
  const db = getFirestore()

  const snap = await db.collection('items')
    .where('status', '==', 'active')
    .where('policeHold', '==', false)
    .get()

  if (snap.empty) return

  const batches: ReturnType<typeof db.batch>[] = []
  let currentBatch = db.batch()
  let count = 0

  for (const doc of snap.docs) {
    const d = doc.data()
    const viewCount = Number(d['viewCount'] ?? 0)
    const enquiryCount = Number(d['enquiryCount'] ?? 0)
    const score = viewCount + enquiryCount * 5

    currentBatch.update(doc.ref, {
      trendingScore: score,
      updatedAt: FieldValue.serverTimestamp(),
    })
    count++

    if (count % BATCH_LIMIT === 0) {
      batches.push(currentBatch)
      currentBatch = db.batch()
    }
  }

  if (count % BATCH_LIMIT !== 0) batches.push(currentBatch)

  await Promise.all(batches.map((b) => b.commit()))
})

// ── removeJustArrivedTags ─────────────────────────────────────────────────────
// Scheduled every 30 minutes. Removes just-arrived from items older than 48 hours.
// Queries by array-contains only; filters by createdAt in memory to avoid extra index.

const JUST_ARRIVED_HOURS = 48

export const removeJustArrivedTags = onSchedule('every 30 minutes', async () => {
  const db = getFirestore()

  const snap = await db.collection('items')
    .where('merchandisingTags', 'array-contains', 'just-arrived')
    .get()

  if (snap.empty) return

  const cutoffMs = Date.now() - JUST_ARRIVED_HOURS * 60 * 60 * 1000
  const toUpdate = snap.docs.filter((doc) => {
    const createdAt = doc.data()['createdAt'] as Timestamp | undefined
    return createdAt != null && createdAt.toMillis() < cutoffMs
  })

  if (toUpdate.length === 0) return

  const batches: ReturnType<typeof db.batch>[] = []
  let currentBatch = db.batch()
  let count = 0

  for (const doc of toUpdate) {
    currentBatch.update(doc.ref, {
      merchandisingTags: FieldValue.arrayRemove('just-arrived'),
      updatedAt: FieldValue.serverTimestamp(),
    })
    count++
    if (count % BATCH_LIMIT === 0) {
      batches.push(currentBatch)
      currentBatch = db.batch()
    }
  }

  if (count % BATCH_LIMIT !== 0) batches.push(currentBatch)

  await Promise.all(batches.map((b) => b.commit()))
})
