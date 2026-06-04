import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { dispatchSms } from './lib/sms'
import { twilioAccountSid, twilioAuthToken, twilioFromNumber } from './lib/secrets'

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

interface DayConfig {
  open: string
  close: string
  closed: boolean
}

function generateSlots(day: DayConfig): string[] {
  const slots: string[] = []
  const [openH, openM] = day.open.split(':').map(Number)
  const [closeH, closeM] = day.close.split(':').map(Number)
  const openMin = openH * 60 + openM
  const closeMin = closeH * 60 + closeM
  for (let m = openMin; m <= closeMin - 30; m += 30) {
    const h = Math.floor(m / 60)
    const min = m % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
  }
  return slots
}

// Validates "YYYY-MM-DD HH:MM–HH:MM" against configured store hours
function isValidPickupWindow(pickupWindow: string, hoursDoc: Record<string, unknown>): boolean {
  const match = pickupWindow.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})–\d{2}:\d{2}$/)
  if (!match) return false
  const dateStr = match[1]
  const startTime = match[2]
  // Use noon to avoid DST edge cases when parsing date-only strings
  const date = new Date(`${dateStr}T12:00:00`)
  const dayKey = DAY_KEYS[date.getDay()]
  const dayConfig = hoursDoc[dayKey] as DayConfig | undefined
  if (!dayConfig || dayConfig.closed) return false
  return generateSlots(dayConfig).includes(startTime)
}

// ── createReservation ────────────────────────────────────────────────────────

interface CreateReservationData {
  itemId: string
  customerName: string
  customerPhone: string
  pickupWindow: string  // "YYYY-MM-DD HH:MM–HH:MM"
  viewTag: string
}

export const createReservation = onCall<CreateReservationData>({ cors: true, secrets: [twilioAccountSid, twilioAuthToken, twilioFromNumber] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to reserve an item')

  const { itemId, customerName, customerPhone, pickupWindow, viewTag } = request.data

  if (!itemId?.trim())        throw new HttpsError('invalid-argument', 'itemId is required')
  if (!customerName?.trim())  throw new HttpsError('invalid-argument', 'Your name is required')
  if (!customerPhone?.trim()) throw new HttpsError('invalid-argument', 'Your phone number is required')
  if (!pickupWindow?.trim())  throw new HttpsError('invalid-argument', 'Please select a pickup window')
  if (!['pawn', 'fireworks'].includes(viewTag)) {
    throw new HttpsError('invalid-argument', 'Invalid viewTag')
  }

  const db = getFirestore()
  const uid = request.auth.uid

  const itemSnap = await db.collection('items').doc(itemId.trim()).get()
  if (!itemSnap.exists) throw new HttpsError('not-found', 'Item not found')
  const itemData = itemSnap.data() as Record<string, unknown>
  if (itemData['status'] !== 'active') {
    throw new HttpsError('failed-precondition', 'This item is no longer available')
  }
  if (itemData['policeHold'] === true) {
    throw new HttpsError('failed-precondition', 'This item is not available for reservation')
  }

  const hoursSnap = await db.collection('config').doc('storeHours').get()
  if (!hoursSnap.exists) {
    throw new HttpsError('failed-precondition', 'Reservation booking is not currently configured')
  }
  if (!isValidPickupWindow(pickupWindow.trim(), hoursSnap.data() as Record<string, unknown>)) {
    throw new HttpsError('invalid-argument', 'Selected pickup window is not within store hours')
  }

  const now = FieldValue.serverTimestamp()
  const resRef = await db.collection('reservations').add({
    uid,
    itemId: itemId.trim(),
    status: 'pending',
    pickupWindow: pickupWindow.trim(),
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    viewTag,
    smsDeliveredAt: null,
    createdAt: now,
  })

  await db.collection('auditLogs').add({
    eventType: 'reservation_created',
    uid,
    targetId: resRef.id,
    details: { itemId: itemId.trim(), reservationId: resRef.id, viewTag },
    createdAt: now,
  })

  // Increment enquiryCount on the item — feeds calculateTrendingScore CF
  await db.collection('items').doc(itemId.trim()).update({
    enquiryCount: FieldValue.increment(1),
  })

  // Inline SMS dispatch — no Firestore trigger — guarantees 60-second SLA
  try {
    const sent = await dispatchSms(
      customerPhone.trim(),
      `The Pawn Shop — your collection request has been received. Requested window: ${pickupWindow.trim()}. We will confirm shortly.`,
    )
    if (sent) await resRef.update({ smsDeliveredAt: Timestamp.now() })
  } catch (err) {
    console.error('[createReservation] SMS failed:', (err as Error).message)
    await resRef.update({ staffNotes: 'SMS failed on create — resend manually' })
  }

  return { success: true, reservationId: resRef.id }
})

// ── confirmReservation ───────────────────────────────────────────────────────

interface ConfirmReservationData {
  reservationId: string
  decision: 'confirmed' | 'declined'
  staffNotes?: string
}

export const confirmReservation = onCall<ConfirmReservationData>({ cors: true, secrets: [twilioAccountSid, twilioAuthToken, twilioFromNumber] }, async (request) => {
  const token = (request.auth?.token ?? {}) as Record<string, unknown>
  if (!token['admin'] && !token['manager'] && !token['inventory_staff']) {
    throw new HttpsError('permission-denied', 'Staff access required')
  }

  const { reservationId, decision, staffNotes } = request.data
  if (!reservationId?.trim()) throw new HttpsError('invalid-argument', 'reservationId is required')
  if (decision !== 'confirmed' && decision !== 'declined') {
    throw new HttpsError('invalid-argument', 'decision must be confirmed or declined')
  }

  const db = getFirestore()
  const uid = request.auth!.uid

  const resRef = db.collection('reservations').doc(reservationId.trim())
  const resSnap = await resRef.get()
  if (!resSnap.exists) throw new HttpsError('not-found', 'Reservation not found')
  const resData = resSnap.data() as Record<string, unknown>
  if (resData['status'] !== 'pending') {
    throw new HttpsError('failed-precondition', 'Only pending reservations can be confirmed or declined')
  }

  const now = FieldValue.serverTimestamp()
  const updatePayload: Record<string, unknown> = { status: decision, updatedAt: now }
  if (staffNotes?.trim()) updatePayload['staffNotes'] = staffNotes.trim()
  await resRef.update(updatePayload)

  if (decision === 'confirmed') {
    await db.collection('items').doc(resData['itemId'] as string).update({
      status: 'reserved',
      updatedAt: now,
    })
  }

  const eventType = decision === 'confirmed' ? 'reservation_confirmed' : 'reservation_declined'
  await db.collection('auditLogs').add({
    eventType,
    uid,
    targetId: reservationId.trim(),
    details: { itemId: resData['itemId'], reservationId: reservationId.trim(), viewTag: resData['viewTag'] },
    createdAt: now,
  })

  const customerPhone = resData['customerPhone'] as string | undefined
  const pickupWindow = resData['pickupWindow'] as string | undefined
  if (customerPhone) {
    const body = decision === 'confirmed'
      ? `The Pawn Shop — your collection is confirmed. Pickup: ${pickupWindow}. See you then.`
      : `The Pawn Shop — we are unable to fulfill your collection request. Please contact us to rebook.`
    try {
      await dispatchSms(customerPhone, body)
    } catch (err) {
      console.error('[confirmReservation] SMS failed:', (err as Error).message)
    }
  }

  return { success: true }
})

// ── completeReservation ──────────────────────────────────────────────────────

interface CompleteReservationData {
  reservationId: string
}

export const completeReservation = onCall<CompleteReservationData>({ cors: true }, async (request) => {
  const token = (request.auth?.token ?? {}) as Record<string, unknown>
  if (!token['admin'] && !token['manager'] && !token['inventory_staff']) {
    throw new HttpsError('permission-denied', 'Staff access required')
  }

  const { reservationId } = request.data
  if (!reservationId?.trim()) throw new HttpsError('invalid-argument', 'reservationId is required')

  const db = getFirestore()
  const uid = request.auth!.uid

  const resRef = db.collection('reservations').doc(reservationId.trim())
  const resSnap = await resRef.get()
  if (!resSnap.exists) throw new HttpsError('not-found', 'Reservation not found')
  const resData = resSnap.data() as Record<string, unknown>
  if (resData['status'] !== 'confirmed') {
    throw new HttpsError('failed-precondition', 'Only confirmed reservations can be completed')
  }

  const now = FieldValue.serverTimestamp()
  await resRef.update({ status: 'completed', updatedAt: now })
  
  const itemRef = db.collection('items').doc(resData['itemId'] as string)
  const itemSnap = await itemRef.get()
  const itemPrice = (itemSnap.data() as Record<string, unknown>)?.['price'] as number ?? 0

  await itemRef.update({ status: 'sold', soldAt: now, updatedAt: now })

  // E15: Update customer purchase history and lifetime value
  const customerUid = resData['uid'] as string
  if (customerUid) {
    await db.collection('users').doc(customerUid).update({
      purchaseHistory: FieldValue.arrayUnion(resData['itemId']),
      lifetimeValue: FieldValue.increment(itemPrice),
      updatedAt: now,
    })
  }

  await db.collection('auditLogs').add({
    eventType: 'reservation_completed',
    uid,
    targetId: reservationId.trim(),
    details: { itemId: resData['itemId'], reservationId: reservationId.trim(), viewTag: resData['viewTag'] },
    createdAt: now,
  })

  return { success: true }
})
