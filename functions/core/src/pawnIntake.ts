import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

interface CreateWalkInPawnRequestData {
  name: string
  itemDescription: string
  phone?: string
  email?: string
  serialNumber?: string
  itemCategory?: string
  itemMake?: string
  itemModel?: string
  itemColour?: string
  condition?: string
  notableMarkings?: string
  requestedAmount?: number
  idType?: string
  idVerified?: boolean
}

export const createWalkInPawnRequest = onCall<CreateWalkInPawnRequestData>({ cors: true }, async (request) => {
  if (!request.auth?.token.admin && !request.auth?.token.manager && !request.auth?.token.inventory_staff) {
    throw new HttpsError('permission-denied', 'Only staff can create walk-in pawn requests')
  }

  const {
    name, itemDescription, phone, email, serialNumber,
    itemCategory, itemMake, itemModel, itemColour, condition, notableMarkings,
    requestedAmount, idType, idVerified,
  } = request.data

  if (!name?.trim()) throw new HttpsError('invalid-argument', 'Customer name is required')
  if (!itemDescription?.trim()) throw new HttpsError('invalid-argument', 'Item description is required')

  const db = getFirestore()

  let serialBlacklistHit = false
  const trimmedSerial = serialNumber?.trim() ?? ''
  if (trimmedSerial) {
    const snap = await db
      .collection('serialBlacklist')
      .where('serialNumber', '==', trimmedSerial)
      .limit(1)
      .get()
    serialBlacklistHit = !snap.empty
  }

  const now = FieldValue.serverTimestamp()

  const docData: Record<string, unknown> = {
    uid: null,
    name: name.trim(),
    itemDescription: itemDescription.trim(),
    images: [],
    status: 'quoted',
    source: 'walk_in',
    serialBlacklistHit,
    createdAt: now,
  }
  if (phone?.trim()) docData['phone'] = phone.trim()
  if (email?.trim()) docData['email'] = email.trim()
  if (trimmedSerial) docData['serialNumber'] = trimmedSerial
  if (itemCategory?.trim()) docData['itemCategory'] = itemCategory.trim()
  if (itemMake?.trim()) docData['itemMake'] = itemMake.trim()
  if (itemModel?.trim()) docData['itemModel'] = itemModel.trim()
  if (itemColour?.trim()) docData['itemColour'] = itemColour.trim()
  if (condition?.trim()) docData['condition'] = condition.trim()
  if (notableMarkings?.trim()) docData['notableMarkings'] = notableMarkings.trim()
  if (typeof requestedAmount === 'number' && requestedAmount > 0) docData['requestedAmount'] = requestedAmount
  if (idType?.trim()) docData['idType'] = idType.trim()
  if (idVerified) docData['idVerified'] = true

  const ref = await db.collection('pawnRequests').add(docData)

  await db.collection('auditLogs').add({
    eventType: 'walk_in_pawn_created',
    uid: request.auth.uid,
    targetId: ref.id,
    details: { requestId: ref.id, source: 'walk_in' },
    createdAt: now,
  })

  if (serialBlacklistHit) {
    await db.collection('auditLogs').add({
      eventType: 'serial_blacklist_hit',
      uid: request.auth.uid,
      targetId: ref.id,
      details: { requestId: ref.id, serialNumber: trimmedSerial },
      createdAt: now,
    })
    console.info(`[Admin alert] serial_blacklist_hit (walk-in) — requestId=${ref.id}`)
  }

  return { pawnRequestId: ref.id, serialBlacklistHit }
})
