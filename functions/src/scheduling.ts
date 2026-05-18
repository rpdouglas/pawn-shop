import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

function isManagerOrAdmin(token: Record<string, unknown>): boolean {
  return token['admin'] === true || token['manager'] === true
}

interface CreateShiftData {
  staffUid: string
  startTime: string // ISO
  endTime: string // ISO
  viewTag: string
  notes?: string
}

export const createShift = onCall<CreateShiftData>({ cors: true }, async (request) => {
  const token = request.auth?.token as Record<string, unknown> | undefined
  if (!request.auth || !token || !isManagerOrAdmin(token)) {
    throw new HttpsError('permission-denied', 'Manager or Admin role required')
  }

  const { staffUid, startTime, endTime, viewTag, notes } = request.data
  if (!staffUid || !startTime || !endTime || !viewTag) {
    throw new HttpsError('invalid-argument', 'Missing required fields')
  }

  const db = getFirestore()
  const now = FieldValue.serverTimestamp()
  const ref = await db.collection('shifts').add({
    staffUid,
    startTime: Timestamp.fromDate(new Date(startTime)),
    endTime: Timestamp.fromDate(new Date(endTime)),
    viewTag,
    notes: notes || '',
    createdBy: request.auth.uid,
    createdAt: now,
    updatedAt: now,
  })

  await db.collection('auditLogs').add({
    eventType: 'shift_created',
    uid: request.auth.uid,
    targetId: ref.id,
    details: { staffUid, viewTag },
    createdAt: now,
  })

  return { success: true, shiftId: ref.id }
})

interface UpdateShiftData extends Partial<CreateShiftData> {
  shiftId: string
}

export const updateShift = onCall<UpdateShiftData>({ cors: true }, async (request) => {
  const token = request.auth?.token as Record<string, unknown> | undefined
  if (!request.auth || !token || !isManagerOrAdmin(token)) {
    throw new HttpsError('permission-denied', 'Manager or Admin role required')
  }

  const { shiftId, ...updates } = request.data
  if (!shiftId) throw new HttpsError('invalid-argument', 'shiftId is required')

  const db = getFirestore()
  const shiftRef = db.collection('shifts').doc(shiftId)
  
  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  }

  if (updates.startTime) payload.startTime = Timestamp.fromDate(new Date(updates.startTime))
  if (updates.endTime) payload.endTime = Timestamp.fromDate(new Date(updates.endTime))
  if (updates.viewTag) payload.viewTag = updates.viewTag
  if (updates.notes !== undefined) payload.notes = updates.notes
  if (updates.staffUid) payload.staffUid = updates.staffUid

  await shiftRef.update(payload)

  await db.collection('auditLogs').add({
    eventType: 'shift_updated',
    uid: request.auth.uid,
    targetId: shiftId,
    details: { updatedFields: Object.keys(updates) },
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})

export const deleteShift = onCall<{ shiftId: string }>({ cors: true }, async (request) => {
  const token = request.auth?.token as Record<string, unknown> | undefined
  if (!request.auth || !token || !isManagerOrAdmin(token)) {
    throw new HttpsError('permission-denied', 'Manager or Admin role required')
  }

  const { shiftId } = request.data
  if (!shiftId) throw new HttpsError('invalid-argument', 'shiftId is required')

  const db = getFirestore()
  await db.collection('shifts').doc(shiftId).delete()

  await db.collection('auditLogs').add({
    eventType: 'shift_deleted',
    uid: request.auth.uid,
    targetId: shiftId,
    details: {},
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})
