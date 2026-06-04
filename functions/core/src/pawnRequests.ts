import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

interface SubmitPawnRequestData {
  name: string
  email: string
  phone: string
  itemDescription: string
  serialNumber: string
  imageUrls: string[]
}

// Callable — any user (authenticated or guest). uid is null for guest submissions.
// Blacklist check always runs before the document is written to Firestore, ensuring
// serialBlacklistHit is set before staff can read the request (compliance requirement).
export const submitPawnRequest = onCall<SubmitPawnRequestData>({ cors: true }, async (request) => {
  const { name, email, phone, itemDescription, serialNumber, imageUrls } = request.data

  if (!name?.trim())
    throw new HttpsError('invalid-argument', 'Your name is required')
  if (!email?.trim())
    throw new HttpsError('invalid-argument', 'Your email address is required')
  if (!itemDescription?.trim())
    throw new HttpsError('invalid-argument', 'Please describe the item')
  if (!Array.isArray(imageUrls))
    throw new HttpsError('invalid-argument', 'imageUrls must be an array')

  const db = getFirestore()
  const uid = request.auth?.uid ?? null

  // Serial blacklist check — runs regardless of whether a serial was provided.
  // Empty serial → no match possible → serialBlacklistHit: false.
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
    uid,
    name: name.trim(),
    email: email.trim(),
    itemDescription: itemDescription.trim(),
    images: imageUrls,
    status: 'pending',
    serialBlacklistHit,
    createdAt: now,
  }
  if (phone?.trim()) docData['phone'] = phone.trim()
  if (trimmedSerial) docData['serialNumber'] = trimmedSerial

  // Admin SDK write bypasses Firestore rules — serialBlacklistHit is always set
  // before any staff read, satisfying the E07 compliance requirement.
  const ref = await db.collection('pawnRequests').add(docData)

  // E15: Update customer inquiry history if signed in
  if (uid) {
    await db.collection('users').doc(uid).update({
      inquiryHistory: FieldValue.arrayUnion(ref.id),
      updatedAt: now,
    })
  }

  // Audit: submission — no PII in details
  await db.collection('auditLogs').add({
    eventType: 'pawn_request_submit',
    uid,
    targetId: ref.id,
    details: { requestId: ref.id, viewTag: 'pawn' },
    createdAt: now,
  })

  if (serialBlacklistHit) {
    await db.collection('auditLogs').add({
      eventType: 'serial_blacklist_hit',
      uid,
      targetId: ref.id,
      details: { requestId: ref.id, serialNumber: trimmedSerial },
      createdAt: now,
    })
    // E12 will replace this stub with real email dispatch via SendGrid
    console.info(`[Admin alert] serial_blacklist_hit — requestId=${ref.id}`)
  }

  return { success: true, requestId: ref.id }
})
