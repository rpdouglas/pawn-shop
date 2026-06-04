import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { purgeRetentionDays } from '@pawn-shop/shared/lib/secrets'

const TERMINAL_STATUSES = ['declined', 'completed']
const BATCH_SIZE = 500

// Default 730 days (2 years) — configurable via environment variable
function retentionDays(): number {
  const val = purgeRetentionDays.value()
  return isNaN(val) || val < 1 ? 730 : val
}

function cutoffTimestamp(days: number): Timestamp {
  const ms = Date.now() - days * 24 * 60 * 60 * 1000
  return Timestamp.fromMillis(ms)
}

async function purgeCollection(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  cutoff: Timestamp,
): Promise<number> {
  let totalDeleted = 0

  while (true) {
    const snap = await db.collection(collectionName)
      .where('status', 'in', TERMINAL_STATUSES)
      .where('createdAt', '<', cutoff)
      .limit(BATCH_SIZE)
      .get()

    if (snap.empty) break

    const batch = db.batch()
    snap.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    totalDeleted += snap.size

    // If fewer than BATCH_SIZE docs returned, we're done
    if (snap.size < BATCH_SIZE) break
  }

  return totalDeleted
}

// Runs every Sunday at 02:00 UTC
export const purgeExpiredData = onSchedule('every sunday 02:00', async () => {
  const db = getFirestore()
  const days = retentionDays()
  const cutoff = cutoffTimestamp(days)
  const now = FieldValue.serverTimestamp()

  const collections: Array<'pawnRequests' | 'reservations'> = ['pawnRequests', 'reservations']

  for (const col of collections) {
    let deleted = 0
    try {
      deleted = await purgeCollection(db, col, cutoff)
    } catch (err) {
      console.error(`[purgeExpiredData] Error purging ${col}:`, (err as Error).message)
    }

    if (deleted > 0) {
      await db.collection('auditLogs').add({
        eventType: 'data_purged',
        uid: 'system',
        targetId: col,
        details: { collection: col, recordsDeleted: deleted, retentionDays: days },
        createdAt: now,
      })
    }
  }
})
