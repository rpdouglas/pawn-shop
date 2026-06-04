import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { assertMfaEnrolled } from '@pawn-shop/shared/lib/authHelpers'

// ── addSerialToBlacklist ─────────────────────────────────────────────────────

interface AddSerialData {
  serialNumber: string
  reason: string
}

export const addSerialToBlacklist = onCall<AddSerialData>({ cors: true }, async (request) => {
  if (!request.auth?.token?.['admin']) {
    throw new HttpsError('permission-denied', 'Admin access required')
  }
  assertMfaEnrolled(request)

  const { serialNumber, reason } = request.data

  if (!serialNumber?.trim() || serialNumber.length > 100) {
    throw new HttpsError('invalid-argument', 'Serial number is required (max 100 characters)')
  }
  if (!reason?.trim() || reason.length > 500) {
    throw new HttpsError('invalid-argument', 'Reason is required (max 500 characters)')
  }

  const db = getFirestore()
  const uid = request.auth.uid
  const now = FieldValue.serverTimestamp()

  // Idempotency: check if serial already exists
  const existing = await db.collection('serialBlacklist')
    .where('serialNumber', '==', serialNumber.trim().toUpperCase())
    .limit(1)
    .get()

  if (!existing.empty) {
    throw new HttpsError('already-exists', 'This serial number is already on the blacklist')
  }

  const docRef = await db.collection('serialBlacklist').add({
    serialNumber: serialNumber.trim().toUpperCase(),
    reason: reason.trim(),
    addedBy: uid,
    createdAt: now,
  })

  await db.collection('auditLogs').add({
    eventType: 'serial_blacklist_add',
    uid,
    targetId: docRef.id,
    details: { serialNumber: serialNumber.trim().toUpperCase() },
    createdAt: now,
  })

  return { success: true, id: docRef.id }
})

// ── removeSerialFromBlacklist ────────────────────────────────────────────────

interface RemoveSerialData {
  blacklistId: string
}

export const removeSerialFromBlacklist = onCall<RemoveSerialData>({ cors: true }, async (request) => {
  if (!request.auth?.token?.['admin']) {
    throw new HttpsError('permission-denied', 'Admin access required')
  }
  assertMfaEnrolled(request)

  const { blacklistId } = request.data

  if (!blacklistId?.trim()) {
    throw new HttpsError('invalid-argument', 'blacklistId is required')
  }

  const db = getFirestore()
  const uid = request.auth.uid
  const now = FieldValue.serverTimestamp()

  const ref = db.collection('serialBlacklist').doc(blacklistId.trim())
  const snap = await ref.get()
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Blacklist entry not found')
  }

  const serialNumber = (snap.data() as Record<string, unknown>)['serialNumber'] as string

  await ref.delete()

  await db.collection('auditLogs').add({
    eventType: 'serial_blacklist_remove',
    uid,
    targetId: blacklistId.trim(),
    details: { serialNumber },
    createdAt: now,
  })

  return { success: true }
})
