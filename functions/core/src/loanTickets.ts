import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { dispatchSms } from '@pawn-shop/shared/lib/sms'
import { twilioAccountSid, twilioAuthToken } from '@pawn-shop/shared/lib/secrets'

const APR_CAP_UNDER_1000 = 0.48
const APR_CAP_OVER_1000  = 0.35
const LOAN_THRESHOLD_CENTS = 100_000

function calcMaxRate(amountCents: number, days: number): number {
  if (amountCents <= 0 || days <= 0) return 0
  const cap = amountCents < LOAN_THRESHOLD_CENTS ? APR_CAP_UNDER_1000 : APR_CAP_OVER_1000
  return cap * (days / 365)
}

interface CreateLoanTicketData {
  pawnRequestId: string
  loanAmount: number
  interestRate: number
  periodDays: number
  itemId?: string
  agreedItemValue?: number
  idType?: string
  idVerified?: boolean
  aprOverrideConfirmed?: boolean
}

// Derives uid and itemDescription from the pawnRequest document so the client
// does not need to send them (reduces trust surface; CF is the source of truth).
export const createLoanTicket = onCall<CreateLoanTicketData>({ cors: true }, async (request) => {
  if (!request.auth?.token.admin && !request.auth?.token.manager && !request.auth?.token.inventory_staff) {
    throw new HttpsError('permission-denied', 'Only staff can create loan tickets')
  }

  const { pawnRequestId, loanAmount, periodDays, itemId, agreedItemValue, idType, idVerified, aprOverrideConfirmed } = request.data
  const interestRate = request.data.interestRate

  if (!pawnRequestId || loanAmount == null || periodDays == null) {
    throw new HttpsError('invalid-argument', 'pawnRequestId, loanAmount, and periodDays are required')
  }
  if (interestRate == null) {
    throw new HttpsError('invalid-argument', 'interestRate is required')
  }
  if (loanAmount <= 0) throw new HttpsError('invalid-argument', 'loanAmount must be positive')
  if (periodDays <= 0) throw new HttpsError('invalid-argument', 'periodDays must be positive')

  const maxRate = calcMaxRate(loanAmount, periodDays)
  const isOverCap = maxRate > 0 && interestRate > maxRate
  if (isOverCap && aprOverrideConfirmed !== true) {
    const capPct = loanAmount < LOAN_THRESHOLD_CENTS ? 48 : 35
    throw new HttpsError('invalid-argument', `Interest rate exceeds the legal cap (${capPct}% APR). Pass aprOverrideConfirmed: true to override.`)
  }

  const db = getFirestore()

  const pawnReqSnap = await db.collection('pawnRequests').doc(pawnRequestId).get()
  if (!pawnReqSnap.exists) throw new HttpsError('not-found', 'Pawn request not found')

  const pawnReqData = pawnReqSnap.data() as Record<string, unknown>
  const uid = typeof pawnReqData['uid'] === 'string' ? pawnReqData['uid'] : ''
  const itemDescription = String(pawnReqData['itemDescription'] ?? '')
  const serialNumber = typeof pawnReqData['serialNumber'] === 'string' ? pawnReqData['serialNumber'] : undefined
  const itemCategory = typeof pawnReqData['itemCategory'] === 'string' ? pawnReqData['itemCategory'] : undefined
  const itemMake = typeof pawnReqData['itemMake'] === 'string' ? pawnReqData['itemMake'] : undefined
  const itemModel = typeof pawnReqData['itemModel'] === 'string' ? pawnReqData['itemModel'] : undefined
  const itemColour = typeof pawnReqData['itemColour'] === 'string' ? pawnReqData['itemColour'] : undefined
  const condition = typeof pawnReqData['condition'] === 'string' ? pawnReqData['condition'] : undefined
  const notableMarkings = typeof pawnReqData['notableMarkings'] === 'string' ? pawnReqData['notableMarkings'] : undefined

  // Check that a loan hasn't already been issued for this request
  if (typeof pawnReqData['pawnLoanId'] === 'string' && pawnReqData['pawnLoanId']) {
    throw new HttpsError('already-exists', 'A loan ticket has already been issued for this pawn request')
  }

  const issuedByDisplayName = typeof request.auth.token['name'] === 'string'
    ? request.auth.token['name']
    : (request.auth.token.email ?? '')

  const dueDate = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000)
  const now = FieldValue.serverTimestamp()

  const docData: Record<string, unknown> = {
    uid,
    pawnRequestId,
    itemDescription,
    loanAmount,
    interestRate,
    periodDays,
    dueDate,
    status: 'active',
    extensionCount: 0,
    staffNotes: '',
    createdAt: now,
    updatedAt: now,
  }
  if (itemId) docData['itemId'] = itemId
  if (serialNumber) docData['serialNumber'] = serialNumber
  if (issuedByDisplayName) docData['issuedByDisplayName'] = issuedByDisplayName
  if (typeof agreedItemValue === 'number' && agreedItemValue > 0) docData['agreedItemValue'] = agreedItemValue
  if (itemCategory) docData['itemCategory'] = itemCategory
  if (itemMake) docData['itemMake'] = itemMake
  if (itemModel) docData['itemModel'] = itemModel
  if (itemColour) docData['itemColour'] = itemColour
  if (condition) docData['condition'] = condition
  if (notableMarkings) docData['notableMarkings'] = notableMarkings
  if (isOverCap) docData['aprOverrideConfirmed'] = true

  const ref = await db.collection('loanTickets').add(docData)

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const ticketNumber = `PLT-${dateStr}-${ref.id.slice(0, 4).toUpperCase()}`
  await ref.update({ ticketNumber })

  const pawnRequestUpdates: Record<string, unknown> = {
    pawnLoanId: ref.id,
    status: 'completed',
    updatedAt: now,
  }
  if (idType) pawnRequestUpdates['idType'] = idType
  if (idVerified) pawnRequestUpdates['idVerified'] = true
  await db.collection('pawnRequests').doc(pawnRequestId).update(pawnRequestUpdates)

  await db.collection('auditLogs').add({
    eventType: 'loan_ticket_created',
    uid: request.auth.uid,
    targetId: ref.id,
    details: { loanTicketId: ref.id, pawnRequestId, loanAmount, idVerified: idVerified ?? false },
    createdAt: now,
  })

  if (isOverCap) {
    const impliedApr = parseFloat((interestRate * (365 / periodDays) * 100).toFixed(2))
    const capApr = loanAmount < LOAN_THRESHOLD_CENTS ? 48 : 35
    await db.collection('auditLogs').add({
      eventType: 'loan_rate_override',
      uid: request.auth.uid,
      targetId: ref.id,
      details: { loanTicketId: ref.id, interestRate, impliedApr, capApr },
      createdAt: now,
    })
  }

  return { success: true, loanTicketId: ref.id, ticketNumber, dueDate: dueDate.toISOString() }
})

interface RequestExtensionData {
  loanTicketId: string
}

export const requestExtension = onCall<RequestExtensionData>({ cors: true }, async (request) => {
  const { loanTicketId } = request.data
  const uid = request.auth?.uid

  if (!uid) {
    throw new HttpsError('unauthenticated', 'Must be signed in')
  }

  if (!loanTicketId) {
    throw new HttpsError('invalid-argument', 'loanTicketId required')
  }

  const db = getFirestore()
  const ref = db.collection('loanTickets').doc(loanTicketId)
  const snap = await ref.get()

  if (!snap.exists) {
    throw new HttpsError('not-found', 'Loan ticket not found')
  }

  const data = snap.data() as Record<string, unknown>
  if (data['uid'] !== uid) {
    throw new HttpsError('permission-denied', 'You do not own this loan ticket')
  }

  if (data['status'] !== 'active') {
    throw new HttpsError('failed-precondition', 'Loan must be active to request extension')
  }

  const now = FieldValue.serverTimestamp()

  await ref.update({
    status: 'extension_requested',
    updatedAt: now
  })

  await db.collection('auditLogs').add({
    eventType: 'extension_requested',
    uid,
    targetId: loanTicketId,
    details: { loanTicketId },
    createdAt: now,
  })

  return { success: true }
})

interface ProcessExtensionData {
  loanTicketId: string
  approved: boolean
  newDueDate?: string
  staffNotes?: string
}

export const processExtension = onCall<ProcessExtensionData>({ cors: true }, async (request) => {
  if (!request.auth?.token.admin && !request.auth?.token.manager && !request.auth?.token.inventory_staff) {
    throw new HttpsError('permission-denied', 'Only staff can process extensions')
  }

  const { loanTicketId, approved, newDueDate, staffNotes } = request.data

  if (!loanTicketId) {
    throw new HttpsError('invalid-argument', 'loanTicketId required')
  }

  if (approved && !newDueDate) {
    throw new HttpsError('invalid-argument', 'newDueDate required if approved')
  }

  const db = getFirestore()
  const ref = db.collection('loanTickets').doc(loanTicketId)
  const snap = await ref.get()

  if (!snap.exists) {
    throw new HttpsError('not-found', 'Loan ticket not found')
  }

  const data = snap.data() as Record<string, unknown>
  const now = FieldValue.serverTimestamp()

  const updates: Record<string, unknown> = {
    status: 'active',
    updatedAt: now
  }

  if (approved) {
    updates['dueDate'] = new Date(newDueDate!)
    updates['extensionCount'] = (typeof data['extensionCount'] === 'number' ? data['extensionCount'] : 0) + 1
  }

  if (staffNotes) {
    updates['staffNotes'] = staffNotes
  }

  await ref.update(updates)

  await db.collection('auditLogs').add({
    eventType: approved ? 'extension_approved' : 'extension_declined',
    uid: request.auth.uid,
    targetId: loanTicketId,
    details: { loanTicketId, approved, newDueDate },
    createdAt: now,
  })

  return { success: true }
})

interface RedeemLoanTicketData {
  loanTicketId: string
  redemptionAmount?: number  // CAD cents — recorded for cash transactions; overwritten by Stripe when E79 ships
}

export const redeemLoanTicket = onCall<RedeemLoanTicketData>({ cors: true }, async (request) => {
  if (!request.auth?.token.admin && !request.auth?.token.manager && !request.auth?.token.inventory_staff) {
    throw new HttpsError('permission-denied', 'Only staff can redeem loan tickets')
  }

  const { loanTicketId, redemptionAmount } = request.data
  if (!loanTicketId) throw new HttpsError('invalid-argument', 'loanTicketId required')

  const db = getFirestore()
  const ref = db.collection('loanTickets').doc(loanTicketId)
  const snap = await ref.get()

  if (!snap.exists) throw new HttpsError('not-found', 'Loan ticket not found')

  const now = FieldValue.serverTimestamp()
  const updates: Record<string, unknown> = { status: 'redeemed', updatedAt: now }
  if (redemptionAmount != null) updates['redemptionAmount'] = redemptionAmount

  await ref.update(updates)

  await db.collection('auditLogs').add({
    eventType: 'loan_redeemed',
    uid: request.auth.uid,
    targetId: loanTicketId,
    details: { loanTicketId },
    createdAt: now,
  })

  return { success: true }
})

interface ForfeitLoanData {
  loanTicketId: string
}

export const forfeitLoan = onCall<ForfeitLoanData>({ cors: true }, async (request) => {
  if (!request.auth?.token.admin && !request.auth?.token.manager) {
    throw new HttpsError('permission-denied', 'Only admins and managers can forfeit loans')
  }

  const { loanTicketId } = request.data
  if (!loanTicketId) throw new HttpsError('invalid-argument', 'loanTicketId required')

  const db = getFirestore()
  const ref = db.collection('loanTickets').doc(loanTicketId)
  const snap = await ref.get()

  if (!snap.exists) throw new HttpsError('not-found', 'Loan ticket not found')

  const data = snap.data() as Record<string, unknown>
  const now = FieldValue.serverTimestamp()

  await ref.update({ status: 'forfeited', updatedAt: now })

  const itemId = typeof data['itemId'] === 'string' ? data['itemId'] : null
  if (itemId) {
    await db.collection('items').doc(itemId).update({ status: 'active', policeHold: false, updatedAt: now })
  }

  await db.collection('auditLogs').add({
    eventType: 'loan_forfeited',
    uid: request.auth.uid,
    targetId: loanTicketId,
    details: { loanTicketId },
    createdAt: now,
  })

  return { success: true }
})

export const checkLoanDueDates = onSchedule({ schedule: '0 0 * * *', secrets: [twilioAccountSid, twilioAuthToken] }, async () => {
  const db = getFirestore()
  const now = new Date()
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  const activeLoans = await db.collection('loanTickets')
    .where('status', '==', 'active')
    .get()

  for (const doc of activeLoans.docs) {
    const data = doc.data() as Record<string, unknown>
    const dueDateVal = data['dueDate'] as { toDate?: () => Date } | undefined
    const dueDate = dueDateVal?.toDate?.()

    if (!dueDate) continue

    const uid = String(data['uid'])
    const loanTicketId = doc.id

    if (dueDate < now) {
      // Forfeited — mirror the item-transition logic from the manual forfeitLoan CF
      await doc.ref.update({
        status: 'forfeited',
        updatedAt: FieldValue.serverTimestamp()
      })

      const itemId = typeof data['itemId'] === 'string' ? data['itemId'] : null
      if (itemId) {
        await db.collection('items').doc(itemId).update({
          status: 'active',
          policeHold: false,
          updatedAt: FieldValue.serverTimestamp(),
        })
      }

      await db.collection('auditLogs').add({
        eventType: 'loan_forfeited',
        uid: 'system',
        targetId: loanTicketId,
        details: { loanTicketId, dueDate: dueDate.toISOString() },
        createdAt: FieldValue.serverTimestamp(),
      })
    } else if (dueDate < fortyEightHoursFromNow) {
      // Within 48 hours alert
      const alertSentAt = data['forfeitAlertSentAt']
      if (!alertSentAt) {
        const userSnap = await db.collection('users').doc(uid).get()
        if (userSnap.exists) {
          const userData = userSnap.data() as Record<string, unknown>
          if (userData['alertOptIn'] === true) {
            const phone = String(userData['phoneNumber'] ?? '')
            if (phone.length > 0) {
              const smsBody = 'The Pawn Shop Update — Your pawn loan is due in less than 48 hours. Please visit us to redeem or request an extension.'
              try {
                await dispatchSms(phone, smsBody)
                await doc.ref.update({
                  forfeitAlertSentAt: FieldValue.serverTimestamp()
                })
              } catch (err) {
                console.error(`[checkLoanDueDates] SMS failed for user ${uid}:`, (err as Error).message)
              }
            }
          }
        }
      }
    }
  }
})
