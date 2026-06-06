import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { writeAuditLog } from './lib/audit'

const db = getFirestore()

export const issueLoanTicket = onCall(async (request) => {
  if (!request.auth || !request.auth.token.isStaff) {
    throw new HttpsError('permission-denied', 'Only staff can issue loan tickets.')
  }

  const { pawnRequestId, loanAmount, periodDays, interestRate = 0.05, itemId } = request.data
  if (!pawnRequestId || !loanAmount || !periodDays) {
    throw new HttpsError('invalid-argument', 'Missing required fields.')
  }

  const reqDoc = await db.collection('pawnRequests').doc(pawnRequestId).get()
  if (!reqDoc.exists) {
    throw new HttpsError('not-found', 'Pawn request not found.')
  }

  const reqData = reqDoc.data()!
  const uid = reqData.uid

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + periodDays)

  const ticketData = {
    uid,
    pawnRequestId,
    itemId: itemId || null,
    itemDescription: reqData.itemDescription,
    loanAmount,
    interestRate,
    periodDays,
    dueDate: Timestamp.fromDate(dueDate),
    status: 'active',
    extensionCount: 0,
    staffNotes: '',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }

  const docRef = await db.collection('loanTickets').add(ticketData)

  await db.collection('pawnRequests').doc(pawnRequestId).update({
    status: 'completed',
    pawnLoanId: docRef.id
  })

  if (itemId) {
    await db.collection('items').doc(itemId).update({
      status: 'reserved',
      policeHold: true
    })
  }

  await writeAuditLog(request.auth.uid, 'loan_ticket_created', {
    loanTicketId: docRef.id,
    pawnRequestId,
    loanAmount
  })

  return { success: true, loanTicketId: docRef.id }
})

export const requestExtension = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.')
  }

  const { loanTicketId } = request.data
  if (!loanTicketId) {
    throw new HttpsError('invalid-argument', 'Missing loanTicketId.')
  }

  const ticketRef = db.collection('loanTickets').doc(loanTicketId)
  const ticketDoc = await ticketRef.get()

  if (!ticketDoc.exists) throw new HttpsError('not-found', 'Loan ticket not found.')
  if (ticketDoc.data()?.uid !== request.auth.uid) {
    throw new HttpsError('permission-denied', 'You do not own this loan ticket.')
  }

  await ticketRef.update({
    status: 'extension_requested',
    updatedAt: FieldValue.serverTimestamp()
  })

  await writeAuditLog(request.auth.uid, 'extension_requested', { loanTicketId })

  return { success: true }
})

export const processExtension = onCall(async (request) => {
  if (!request.auth || !request.auth.token.isStaff) {
    throw new HttpsError('permission-denied', 'Only staff can process extensions.')
  }

  const { loanTicketId, approved, newDueDate, staffNotes } = request.data
  if (!loanTicketId) {
    throw new HttpsError('invalid-argument', 'Missing loanTicketId.')
  }

  const ticketRef = db.collection('loanTickets').doc(loanTicketId)
  const ticketDoc = await ticketRef.get()

  if (!ticketDoc.exists) throw new HttpsError('not-found', 'Loan ticket not found.')

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp()
  }

  if (approved && newDueDate) {
    updates.status = 'active'
    updates.dueDate = Timestamp.fromDate(new Date(newDueDate))
    updates.extensionCount = FieldValue.increment(1)
  } else {
    updates.status = 'active' // revert to active if declined
  }

  if (staffNotes) {
    updates.staffNotes = staffNotes
  }

  await ticketRef.update(updates)

  await writeAuditLog(request.auth.uid, approved ? 'extension_approved' : 'extension_declined', { 
    loanTicketId, 
    newDueDate 
  })

  return { success: true }
})

export const redeemLoan = onCall(async (request) => {
  if (!request.auth || !request.auth.token.isStaff) {
    throw new HttpsError('permission-denied', 'Only staff can redeem loans.')
  }

  const { loanTicketId, paymentIntentId } = request.data
  if (!loanTicketId) {
    throw new HttpsError('invalid-argument', 'Missing loanTicketId.')
  }

  // NOTE: E79 Stripe Integration is pending.
  // We log the paymentIntentId but do not strictly validate against Stripe API yet.

  const ticketRef = db.collection('loanTickets').doc(loanTicketId)
  const ticketDoc = await ticketRef.get()
  if (!ticketDoc.exists) throw new HttpsError('not-found', 'Loan ticket not found.')
  
  const data = ticketDoc.data()!

  await ticketRef.update({
    status: 'redeemed',
    redemptionAmount: data.loanAmount * (1 + data.interestRate),
    paymentIntentId: paymentIntentId || null,
    updatedAt: FieldValue.serverTimestamp()
  })

  if (data.itemId) {
    await db.collection('items').doc(data.itemId).update({
      status: 'archived', // Customer reclaimed their item
      policeHold: false
    })
  }

  await writeAuditLog(request.auth.uid, 'loan_redeemed', { loanTicketId, paymentIntentId })

  return { success: true }
})

export const forfeitLoan = onCall(async (request) => {
  if (!request.auth || !request.auth.token.isAdmin) {
    // Strategy B: admin only can forfeit
    throw new HttpsError('permission-denied', 'Only admins can forfeit loans.')
  }

  const { loanTicketId } = request.data
  if (!loanTicketId) {
    throw new HttpsError('invalid-argument', 'Missing loanTicketId.')
  }

  const ticketRef = db.collection('loanTickets').doc(loanTicketId)
  const ticketDoc = await ticketRef.get()
  if (!ticketDoc.exists) throw new HttpsError('not-found', 'Loan ticket not found.')
  
  const data = ticketDoc.data()!

  await ticketRef.update({
    status: 'forfeited',
    updatedAt: FieldValue.serverTimestamp()
  })

  if (data.itemId) {
    await db.collection('items').doc(data.itemId).update({
      status: 'active', // Item becomes shop property, ready for sale
      policeHold: false
    })
  }

  await writeAuditLog(request.auth.uid, 'loan_forfeited', { loanTicketId })

  return { success: true }
})
