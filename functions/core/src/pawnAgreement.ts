import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

interface SignPawnAgreementData {
  loanTicketId: string
  signatureDataUrl: string
  customerName: string
  agreementVersion: string
}

export const signPawnAgreement = onCall<SignPawnAgreementData>({ cors: true }, async (request) => {
  if (!request.auth?.token.admin && !request.auth?.token.manager && !request.auth?.token.inventory_staff) {
    throw new HttpsError('permission-denied', 'Only staff can sign pawn agreements')
  }

  const { loanTicketId, signatureDataUrl, customerName, agreementVersion } = request.data

  if (!loanTicketId) throw new HttpsError('invalid-argument', 'loanTicketId required')
  if (!signatureDataUrl?.startsWith('data:image/png;base64,')) {
    throw new HttpsError('invalid-argument', 'signatureDataUrl must be a PNG data URL')
  }
  if (!customerName?.trim()) throw new HttpsError('invalid-argument', 'customerName required')
  if (!agreementVersion?.trim()) throw new HttpsError('invalid-argument', 'agreementVersion required')

  const db = getFirestore()
  const ticketSnap = await db.collection('loanTickets').doc(loanTicketId).get()
  if (!ticketSnap.exists) throw new HttpsError('not-found', 'Loan ticket not found')

  const ticketData = ticketSnap.data() as Record<string, unknown>
  if (ticketData['signedAt']) throw new HttpsError('already-exists', 'This ticket has already been signed')

  const base64Data = signatureDataUrl.replace(/^data:image\/png;base64,/, '')
  const imageBuffer = Buffer.from(base64Data, 'base64')

  const bucket = getStorage().bucket()
  const file = bucket.file(`tickets/${loanTicketId}/signature.png`)
  await file.save(imageBuffer, { contentType: 'image/png', public: true })
  const signatureUrl = file.publicUrl()

  const now = FieldValue.serverTimestamp()
  await db.collection('loanTickets').doc(loanTicketId).update({
    signatureUrl,
    signedAt: now,
    customerName: customerName.trim(),
    agreementVersion,
    updatedAt: now,
  })

  await db.collection('auditLogs').add({
    eventType: 'pawn_agreement_signed',
    uid: request.auth.uid,
    targetId: loanTicketId,
    details: { loanTicketId, agreementVersion },
    createdAt: now,
  })

  return { signatureUrl }
})
