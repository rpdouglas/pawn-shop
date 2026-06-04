import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { dispatchSms } from './lib/sms'
import { twilioAccountSid, twilioAuthToken } from './lib/secrets'

// ── createPreorder ───────────────────────────────────────────────────────────
// Callable CF. Customer creates a fireworks pre-order.
// No item status change on creation — status transitions only when staff confirm.
// SMS is sent only when staff call confirmPreorder (not here).

interface CreatePreorderData {
  itemId: string
  customerName: string
  customerPhone: string
  quantity: number
  campaignId?: string
}

function isStaffToken(token: Record<string, unknown>): boolean {
  return token['admin'] === true || token['manager'] === true || token['inventory_staff'] === true
}

export const createPreorder = onCall<CreatePreorderData>({ cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to pre-order')

  const { itemId, customerName, customerPhone, quantity, campaignId } = request.data

  if (!itemId?.trim())        throw new HttpsError('invalid-argument', 'itemId is required')
  if (!customerName?.trim())  throw new HttpsError('invalid-argument', 'Your name is required')
  if (!customerPhone?.trim()) throw new HttpsError('invalid-argument', 'Your phone number is required')
  if (!quantity || quantity < 1) throw new HttpsError('invalid-argument', 'Quantity must be at least 1')

  const db = getFirestore()
  const uid = request.auth.uid

  const itemSnap = await db.collection('items').doc(itemId.trim()).get()
  if (!itemSnap.exists) throw new HttpsError('not-found', 'Item not found')
  const itemData = itemSnap.data() as Record<string, unknown>
  if (itemData['policeHold'] === true) {
    throw new HttpsError('failed-precondition', 'This item is not available')
  }
  if (itemData['status'] !== 'active') {
    throw new HttpsError('failed-precondition', 'This item is not currently available for pre-order')
  }
  if (itemData['viewTag'] !== 'fireworks') {
    throw new HttpsError('invalid-argument', 'Pre-orders are available for fireworks items only')
  }

  const now = FieldValue.serverTimestamp()
  const preorderPayload: Record<string, unknown> = {
    uid,
    itemId: itemId.trim(),
    status: 'pending',
    quantity,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    viewTag: 'fireworks',
    smsDeliveredAt: null,
    createdAt: now,
  }
  if (campaignId?.trim()) preorderPayload['campaignId'] = campaignId.trim()

  const preorderRef = await db.collection('preorders').add(preorderPayload)

  await db.collection('auditLogs').add({
    eventType: 'preorder_created',
    uid,
    targetId: preorderRef.id,
    details: { preorderId: preorderRef.id, viewTag: 'fireworks' },
    createdAt: now,
  })

  return { success: true, preorderId: preorderRef.id }
})

// ── confirmPreorder ──────────────────────────────────────────────────────────
// Staff-only callable CF. Transitions status pending → confirmed.
// Dispatches Twilio SMS inline — guarantees 60-second SLA.

interface ConfirmPreorderData {
  preorderId: string
  staffNotes?: string
}

export const confirmPreorder = onCall<ConfirmPreorderData>({ cors: true, secrets: [twilioAccountSid, twilioAuthToken] }, async (request) => {
  const token = (request.auth?.token ?? {}) as Record<string, unknown>
  if (!request.auth || !isStaffToken(token)) {
    throw new HttpsError('permission-denied', 'Staff access required')
  }

  const { preorderId, staffNotes } = request.data
  if (!preorderId?.trim()) throw new HttpsError('invalid-argument', 'preorderId is required')

  const db = getFirestore()
  const preorderRef = db.collection('preorders').doc(preorderId.trim())
  const snap = await preorderRef.get()
  if (!snap.exists) throw new HttpsError('not-found', 'Pre-order not found')

  const data = snap.data() as Record<string, unknown>
  if (data['status'] !== 'pending') {
    throw new HttpsError('failed-precondition', 'Only pending pre-orders can be confirmed')
  }

  const now = FieldValue.serverTimestamp()
  const updatePayload: Record<string, unknown> = { status: 'confirmed', updatedAt: now }
  if (staffNotes?.trim()) updatePayload['staffNotes'] = staffNotes.trim()
  await preorderRef.update(updatePayload)

  await db.collection('auditLogs').add({
    eventType: 'preorder_confirmed',
    uid: request.auth.uid,
    targetId: preorderId.trim(),
    details: { preorderId: preorderId.trim(), viewTag: 'fireworks' },
    createdAt: now,
  })

  // Inline SMS dispatch — guarantees 60-second SLA (E14 Tanya requirement)
  const customerName  = String(data['customerName'] ?? '')
  const customerPhone = String(data['customerPhone'] ?? '')
  const body = `The Pawn Shop · Hi ${customerName}, your fireworks pre-order has been confirmed. We'll reach out once it's ready for pickup.`
  try {
    const sent = await dispatchSms(customerPhone, body)
    if (sent) await preorderRef.update({ smsDeliveredAt: Timestamp.now() })
  } catch (err) {
    console.error('[confirmPreorder] SMS failed:', (err as Error).message)
    await preorderRef.update({ staffNotes: (staffNotes?.trim() ? staffNotes.trim() + ' — ' : '') + 'SMS failed on confirm — resend manually' })
  }

  return { success: true }
})

// ── markPreorderReady ────────────────────────────────────────────────────────
// Staff-only callable CF. Transitions status confirmed → ready.
// Sets pickupWindow and dispatches SMS with the specific pickup time.

interface MarkPreorderReadyData {
  preorderId: string
  pickupWindow: string
  staffNotes?: string
}

export const markPreorderReady = onCall<MarkPreorderReadyData>({ cors: true, secrets: [twilioAccountSid, twilioAuthToken] }, async (request) => {
  const token = (request.auth?.token ?? {}) as Record<string, unknown>
  if (!request.auth || !isStaffToken(token)) {
    throw new HttpsError('permission-denied', 'Staff access required')
  }

  const { preorderId, pickupWindow, staffNotes } = request.data
  if (!preorderId?.trim())   throw new HttpsError('invalid-argument', 'preorderId is required')
  if (!pickupWindow?.trim()) throw new HttpsError('invalid-argument', 'pickupWindow is required')

  const db = getFirestore()
  const preorderRef = db.collection('preorders').doc(preorderId.trim())
  const snap = await preorderRef.get()
  if (!snap.exists) throw new HttpsError('not-found', 'Pre-order not found')

  const data = snap.data() as Record<string, unknown>
  if (data['status'] !== 'confirmed') {
    throw new HttpsError('failed-precondition', 'Only confirmed pre-orders can be marked ready')
  }

  const now = FieldValue.serverTimestamp()
  const updatePayload: Record<string, unknown> = {
    status: 'ready',
    pickupWindow: pickupWindow.trim(),
    updatedAt: now,
  }
  if (staffNotes?.trim()) updatePayload['staffNotes'] = staffNotes.trim()
  await preorderRef.update(updatePayload)

  await db.collection('auditLogs').add({
    eventType: 'preorder_ready',
    uid: request.auth.uid,
    targetId: preorderId.trim(),
    details: { preorderId: preorderId.trim(), viewTag: 'fireworks' },
    createdAt: now,
  })

  const customerName  = String(data['customerName'] ?? '')
  const customerPhone = String(data['customerPhone'] ?? '')
  const body = `The Pawn Shop · Hi ${customerName}, your fireworks order is ready for pickup. Your window: ${pickupWindow.trim()}. See you soon!`
  try {
    const sent = await dispatchSms(customerPhone, body)
    if (sent) await preorderRef.update({ smsDeliveredAt: Timestamp.now() })
  } catch (err) {
    console.error('[markPreorderReady] SMS failed:', (err as Error).message)
    await preorderRef.update({ staffNotes: (staffNotes?.trim() ? staffNotes.trim() + ' — ' : '') + 'SMS failed on ready — resend manually' })
  }

  return { success: true }
})

// ── collectPreorder ──────────────────────────────────────────────────────────
// Staff-only callable CF. Transitions status ready → collected.

interface CollectPreorderData {
  preorderId: string
}

export const collectPreorder = onCall<CollectPreorderData>({ cors: true }, async (request) => {
  const token = (request.auth?.token ?? {}) as Record<string, unknown>
  if (!request.auth || !isStaffToken(token)) {
    throw new HttpsError('permission-denied', 'Staff access required')
  }

  const { preorderId } = request.data
  if (!preorderId?.trim()) throw new HttpsError('invalid-argument', 'preorderId is required')

  const db = getFirestore()
  const preorderRef = db.collection('preorders').doc(preorderId.trim())
  const snap = await preorderRef.get()
  if (!snap.exists) throw new HttpsError('not-found', 'Pre-order not found')

  const data = snap.data() as Record<string, unknown>
  if (data['status'] !== 'ready') {
    throw new HttpsError('failed-precondition', 'Only ready pre-orders can be marked collected')
  }

  const now = FieldValue.serverTimestamp()
  await preorderRef.update({ status: 'collected', updatedAt: now })

  await db.collection('auditLogs').add({
    eventType: 'preorder_collected',
    uid: request.auth.uid,
    targetId: preorderId.trim(),
    details: { preorderId: preorderId.trim(), viewTag: 'fireworks' },
    createdAt: now,
  })

  return { success: true }
})

// ── cancelPreorder ───────────────────────────────────────────────────────────
// Staff or owner callable CF. Cancels a non-terminal pre-order.

interface CancelPreorderData {
  preorderId: string
}

export const cancelPreorder = onCall<CancelPreorderData>({ cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to cancel')

  const { preorderId } = request.data
  if (!preorderId?.trim()) throw new HttpsError('invalid-argument', 'preorderId is required')

  const db = getFirestore()
  const uid = request.auth.uid
  const token = (request.auth.token ?? {}) as Record<string, unknown>

  const preorderRef = db.collection('preorders').doc(preorderId.trim())
  const snap = await preorderRef.get()
  if (!snap.exists) throw new HttpsError('not-found', 'Pre-order not found')

  const data = snap.data() as Record<string, unknown>

  // Owner or staff can cancel; staff can cancel any, owner only their own
  const isOwner = data['uid'] === uid
  if (!isOwner && !isStaffToken(token)) {
    throw new HttpsError('permission-denied', 'You can only cancel your own pre-orders')
  }

  const terminalStatuses = ['collected', 'cancelled']
  if (terminalStatuses.includes(String(data['status']))) {
    throw new HttpsError('failed-precondition', 'This pre-order cannot be cancelled')
  }

  const now = FieldValue.serverTimestamp()
  await preorderRef.update({ status: 'cancelled', updatedAt: now })

  await db.collection('auditLogs').add({
    eventType: 'preorder_cancelled',
    uid,
    targetId: preorderId.trim(),
    details: { preorderId: preorderId.trim(), viewTag: 'fireworks' },
    createdAt: now,
  })

  return { success: true }
})
