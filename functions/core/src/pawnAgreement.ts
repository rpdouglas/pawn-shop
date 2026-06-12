import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { dispatchEmail } from '@pawn-shop/shared/lib/email'
import { sendgridApiKey } from '@pawn-shop/shared/lib/secrets'

interface SignPawnAgreementData {
  loanTicketId: string
  signatureDataUrl: string
  customerName: string
  agreementVersion: string
}

function formatCad(cents: number): string {
  return `$${(cents / 100).toFixed(2)} CAD`
}

// Dark-luxury receipt email. Inline CSS required — email clients cannot use CSS variables.
function buildReceiptHtml(ticket: Record<string, unknown>, ticketNumber: string): string {
  const itemDescription = typeof ticket['itemDescription'] === 'string' ? ticket['itemDescription'] : 'Item'
  const loanAmount = typeof ticket['loanAmount'] === 'number' ? ticket['loanAmount'] : 0
  const agreedItemValue = typeof ticket['agreedItemValue'] === 'number' ? ticket['agreedItemValue'] : null
  const interestRate = typeof ticket['interestRate'] === 'number' ? ticket['interestRate'] : 0
  const periodDays = typeof ticket['periodDays'] === 'number' ? ticket['periodDays'] : 0
  const dueDate = ticket['dueDate'] instanceof Timestamp ? ticket['dueDate'].toDate() : null
  const issuedBy =
    typeof ticket['issuedByDisplayName'] === 'string' && ticket['issuedByDisplayName']
      ? ticket['issuedByDisplayName']
      : null

  const dueDateStr = dueDate
    ? dueDate.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'See your ticket'
  const ratePct = (interestRate * 100).toFixed(2)
  const aprPct = periodDays > 0 ? ((interestRate * (365 / periodDays)) * 100).toFixed(1) : '—'

  const dataRows: [string, string][] = [
    ['Ticket Number', `#${ticketNumber}`],
    ['Item', itemDescription],
    ['Loan Amount', formatCad(loanAmount)],
    ...(agreedItemValue !== null ? [['Agreed Item Value', formatCad(agreedItemValue)] as [string, string]] : []),
    ['Interest Rate', `${ratePct}% per ${periodDays} day${periodDays === 1 ? '' : 's'}`],
    ['APR', `~${aprPct}%`],
    ['Due Date', dueDateStr],
    ...(issuedBy ? [['Issued By', issuedBy] as [string, string]] : []),
  ]

  const rows = dataRows
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-family:Arial,sans-serif;font-size:13px;color:#aaa;width:42%;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-family:Georgia,serif;font-size:14px;color:#e8e0d0;">${value}</td>
    </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Pawn Loan Receipt</title>
</head>
<body style="background:#080706;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080706;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding-bottom:24px;border-bottom:1px solid #2a2a2a;">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#C8A14A;letter-spacing:0.04em;">The Pawn Shop</p>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#aaa;letter-spacing:0.08em;text-transform:uppercase;">Cornwall Island &middot; Akwesasne</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 0 8px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:20px;color:#C8A14A;">Pawn Loan Receipt</p>
          </td>
        </tr>
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0">${rows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 0 0;">
            <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:14px;color:#e8e0d0;">Your signed agreement is on file at The Pawn Shop. To redeem your item, visit us before ${dueDateStr} with this receipt and valid photo ID.</p>
            <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#666;">This is a transactional receipt — not marketing. You received this because a pawn loan was issued in your name at The Pawn Shop, Cornwall Island, Akwesasne.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export const signPawnAgreement = onCall<SignPawnAgreementData>(
  { cors: true, secrets: [sendgridApiKey] },
  async (request) => {
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

    // Receipt email — best-effort, never blocks loan signing
    if (!ticketData['receiptEmailSentAt']) {
      try {
        let customerEmail: string | undefined
        const uid = typeof ticketData['uid'] === 'string' ? ticketData['uid'] : undefined
        if (uid) {
          const userSnap = await db.collection('users').doc(uid).get()
          const userData = userSnap.data() as Record<string, unknown> | undefined
          if (userData && typeof userData['email'] === 'string' && userData['email']) {
            customerEmail = userData['email']
          }
        }
        if (!customerEmail) {
          const pawnRequestId =
            typeof ticketData['pawnRequestId'] === 'string' ? ticketData['pawnRequestId'] : undefined
          if (pawnRequestId) {
            const reqSnap = await db.collection('pawnRequests').doc(pawnRequestId).get()
            const reqData = reqSnap.data() as Record<string, unknown> | undefined
            if (reqData && typeof reqData['email'] === 'string' && reqData['email']) {
              customerEmail = reqData['email']
            }
          }
        }
        if (customerEmail) {
          const ticketNumber =
            typeof ticketData['ticketNumber'] === 'string' ? ticketData['ticketNumber'] : loanTicketId
          const html = buildReceiptHtml(ticketData, ticketNumber)
          const sent = await dispatchEmail(customerEmail, `Your Pawn Loan — Ticket #${ticketNumber}`, html)
          if (sent) {
            await db.collection('loanTickets').doc(loanTicketId).update({
              receiptEmailSentAt: FieldValue.serverTimestamp(),
              receiptEmailAddress: customerEmail,
            })
            await db.collection('auditLogs').add({
              eventType: 'pawn_receipt_emailed',
              uid: request.auth.uid,
              targetId: loanTicketId,
              details: { loanTicketId, ticketNumber, sent: true },
              createdAt: FieldValue.serverTimestamp(),
            })
          }
        }
      } catch (emailErr) {
        console.error('[E114] Receipt email failed — loan signing succeeded', emailErr)
      }
    }

    return { signatureUrl }
  },
)
