import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { assertStaff } from '@pawn-shop/shared/lib/authHelpers'



interface LogFaqActionData {
  action: 'faq_created' | 'faq_updated' | 'faq_deleted'
  faqId: string
  details?: Record<string, unknown>
}

export const logFaqAction = onCall<LogFaqActionData>({ cors: true }, async (request) => {
  const db = getFirestore()
  const { uid } = assertStaff(request)
  const { action, faqId, details } = request.data

  if (!action || !faqId) {
    throw new HttpsError('invalid-argument', 'Missing required fields')
  }

  await db.collection('auditLogs').add({
    eventType: action,
    uid,
    targetId: faqId,
    details: details || {},
    createdAt: FieldValue.serverTimestamp()
  })

  return { success: true }
})
