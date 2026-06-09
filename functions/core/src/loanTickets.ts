import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { dispatchSms } from '@pawn-shop/shared/lib/sms'
import { twilioAccountSid, twilioAuthToken } from '@pawn-shop/shared/lib/secrets'

interface CreateLoanTicketData {
  uid: string
  pawnRequestId: string
  itemDescription: string
  loanAmount: number
  interestRate: number
  periodDays: number
  dueDate: string // ISO string
}

export const createLoanTicket = onCall<CreateLoanTicketData>({ cors: true }, async (request) => {
  if (!request.auth?.token.admin && !request.auth?.token.manager && !request.auth?.token.inventory_staff) {
    throw new HttpsError('permission-denied', 'Only staff can create loan tickets')
  }

  const { uid, pawnRequestId, itemDescription, loanAmount, interestRate, periodDays, dueDate } = request.data

  if (!uid || !pawnRequestId || !itemDescription || loanAmount == null || interestRate == null || periodDays == null || !dueDate) {
    throw new HttpsError('invalid-argument', 'Missing required fields')
  }

  const db = getFirestore()
  const now = FieldValue.serverTimestamp()

  const docData: Record<string, unknown> = {
    uid,
    pawnRequestId,
    itemDescription,
    loanAmount,
    interestRate,
    periodDays,
    dueDate: new Date(dueDate),
    status: 'active',
    extensionCount: 0,
    staffNotes: '',
    createdAt: now,
    updatedAt: now,
  }

  const ref = await db.collection('loanTickets').add(docData)

  await db.collection('pawnRequests').doc(pawnRequestId).update({
    pawnLoanId: ref.id,
    updatedAt: now
  })

  await db.collection('auditLogs').add({
    eventType: 'loan_ticket_created',
    uid: request.auth.uid,
    targetId: ref.id,
    details: { loanTicketId: ref.id, pawnRequestId, loanAmount },
    createdAt: now,
  })

  return { success: true, loanTicketId: ref.id }
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
}

export const redeemLoanTicket = onCall<RedeemLoanTicketData>({ cors: true }, async (request) => {
  if (!request.auth?.token.admin && !request.auth?.token.manager && !request.auth?.token.inventory_staff) {
    throw new HttpsError('permission-denied', 'Only staff can redeem loan tickets')
  }

  const { loanTicketId } = request.data
  if (!loanTicketId) throw new HttpsError('invalid-argument', 'loanTicketId required')

  const db = getFirestore()
  const ref = db.collection('loanTickets').doc(loanTicketId)
  const snap = await ref.get()

  if (!snap.exists) throw new HttpsError('not-found', 'Loan ticket not found')

  const now = FieldValue.serverTimestamp()

  await ref.update({
    status: 'redeemed',
    updatedAt: now
  })

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
      // Forfeited
      await doc.ref.update({
        status: 'forfeited',
        updatedAt: FieldValue.serverTimestamp()
      })

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
