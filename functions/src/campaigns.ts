import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

// ── activateCampaigns ────────────────────────────────────────────────────────
// Scheduled every 5 min. Sets active: true on campaigns whose startDate has
// passed and endDate has not yet passed. Writes campaign_activated auditLog.

export const activateCampaigns = onSchedule('every 5 minutes', async () => {
  const db = getFirestore()
  const now = Timestamp.now()

  // Query inactive campaigns that haven't expired; filter startDate in JS to
  // avoid a three-field composite index (active + startDate + endDate).
  const snap = await db.collection('campaigns')
    .where('active', '==', false)
    .where('endDate', '>=', now)
    .get()

  const toActivate = snap.docs.filter((d) => {
    const startDate = d.data()['startDate'] as Timestamp | undefined
    return startDate != null && startDate.toMillis() <= now.toMillis()
  })

  if (toActivate.length === 0) return

  const batch = db.batch()
  for (const d of toActivate) {
    batch.update(d.ref, { active: true, updatedAt: FieldValue.serverTimestamp() })
    const auditRef = db.collection('auditLogs').doc()
    batch.set(auditRef, {
      eventType: 'campaign_activated',
      uid: 'system',
      targetId: d.id,
      details: { campaignId: d.id, viewTag: String(d.data()['viewTag'] ?? '') },
      createdAt: FieldValue.serverTimestamp(),
    })
  }
  await batch.commit()
})

// ── deactivateCampaigns ──────────────────────────────────────────────────────
// Scheduled every 5 min. Sets active: false on campaigns whose endDate has
// passed. Writes campaign_deactivated auditLog.

export const deactivateCampaigns = onSchedule('every 5 minutes', async () => {
  const db = getFirestore()
  const now = Timestamp.now()

  const snap = await db.collection('campaigns')
    .where('active', '==', true)
    .where('endDate', '<', now)
    .get()

  if (snap.empty) return

  const batch = db.batch()
  for (const d of snap.docs) {
    batch.update(d.ref, { active: false, updatedAt: FieldValue.serverTimestamp() })
    const auditRef = db.collection('auditLogs').doc()
    batch.set(auditRef, {
      eventType: 'campaign_deactivated',
      uid: 'system',
      targetId: d.id,
      details: { campaignId: d.id, viewTag: String(d.data()['viewTag'] ?? '') },
      createdAt: FieldValue.serverTimestamp(),
    })
  }
  await batch.commit()
})
