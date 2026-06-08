import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()

export async function writeAuditLog(
  uid: string,
  eventType: string,
  details: Record<string, unknown>
): Promise<void> {
  await db.collection('auditLogs').add({
    eventType,
    uid,
    details,
    createdAt: FieldValue.serverTimestamp(),
  })
}
