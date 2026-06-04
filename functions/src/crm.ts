import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { dispatchSms } from './lib/sms'
import { twilioAccountSid, twilioAuthToken } from './lib/secrets'

// ── assignVipStatus ──────────────────────────────────────────────────────────

interface AssignVipStatusData {
  targetUid: string
  vipFlag: boolean
}

export const assignVipStatus = onCall<AssignVipStatusData>({ cors: true }, async (request) => {
  const token = (request.auth?.token ?? {}) as Record<string, unknown>
  if (!token['admin'] && !token['manager']) {
    throw new HttpsError('permission-denied', 'Manager access required')
  }

  const { targetUid, vipFlag } = request.data
  if (!targetUid?.trim()) throw new HttpsError('invalid-argument', 'targetUid is required')

  const db = getFirestore()
  const uid = request.auth!.uid

  await db.collection('users').doc(targetUid.trim()).update({
    vipFlag,
    updatedAt: FieldValue.serverTimestamp(),
  })

  await db.collection('auditLogs').add({
    eventType: 'vip_status_change',
    uid,
    targetId: targetUid.trim(),
    details: { vipFlag },
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})

// ── updateResellerTier ───────────────────────────────────────────────────────

interface UpdateResellerTierData {
  targetUid: string
  tier: 'bronze' | 'silver' | 'gold' | null
}

export const updateResellerTier = onCall<UpdateResellerTierData>({ cors: true }, async (request) => {
  const token = (request.auth?.token ?? {}) as Record<string, unknown>
  if (!token['admin'] && !token['manager']) {
    throw new HttpsError('permission-denied', 'Manager access required')
  }

  const { targetUid, tier } = request.data
  if (!targetUid?.trim()) throw new HttpsError('invalid-argument', 'targetUid is required')

  const db = getFirestore()
  const uid = request.auth!.uid

  await db.collection('users').doc(targetUid.trim()).update({
    resellerTier: tier,
    updatedAt: FieldValue.serverTimestamp(),
  })

  await db.collection('auditLogs').add({
    eventType: 'reseller_tier_change',
    uid,
    targetId: targetUid.trim(),
    details: { tier },
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})

// ── crmDailyReminders ────────────────────────────────────────────────────────
// Scheduled task to run daily at 09:00 Cornwall Island time (approx 14:00 UTC)
export const crmDailyReminders = onSchedule({ schedule: 'every day 09:00', secrets: [twilioAccountSid, twilioAuthToken] }, async () => {
  const db = getFirestore()
  const now = new Date()
  
  // 1. Staff Reminders: Pending pawn requests > 48h
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const pendingPawnRequests = await db.collection('pawnRequests')
    .where('status', '==', 'pending')
    .where('createdAt', '<=', fortyEightHoursAgo)
    .get()

  if (!pendingPawnRequests.empty) {
    console.info(`[CRM] Found ${pendingPawnRequests.size} pending pawn requests > 48h. Notifying staff...`)
    // In a real scenario, we'd send an email to the staff mailing list.
    // For now, we log the event.
    await db.collection('auditLogs').add({
      eventType: 'crm_followup_sent',
      uid: 'system',
      details: { type: 'staff_pawn_reminder', count: pendingPawnRequests.size },
      createdAt: FieldValue.serverTimestamp(),
    })
  }

  // 2. Customer Follow-ups: Quoted pawn requests > 72h
  const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)
  const quotedPawnRequests = await db.collection('pawnRequests')
    .where('status', '==', 'quoted')
    .where('createdAt', '<=', seventyTwoHoursAgo)
    .get()

  for (const doc of quotedPawnRequests.docs) {
    const data = doc.data() as Record<string, unknown>
    const userUid = data['uid'] as string | undefined
    if (userUid) {
      const userSnap = await db.collection('users').doc(userUid).get()
      const userData = userSnap.data() as Record<string, unknown> | undefined
      
      // Marie Discretion Test & CASL Compliance
      if (userData?.['alertOptIn'] === true && userData['phoneNumber']) {
        const body = `The Pawn Shop Update — checking in on your recent enquiry. If you have questions, we are here to help.`
        try {
          const sent = await dispatchSms(userData['phoneNumber'] as string, body)
          if (sent) {
            await db.collection('auditLogs').add({
              eventType: 'crm_followup_sent',
              uid: 'system',
              targetId: userUid,
              details: { type: 'customer_pawn_followup', requestId: doc.id },
              createdAt: FieldValue.serverTimestamp(),
            })
          }
        } catch (err) {
          console.error(`[CRM] Failed to send follow-up to ${userUid}:`, (err as Error).message)
        }
      }
    }
  }
})
