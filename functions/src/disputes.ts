import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { assertMfaEnrolled } from './auth'

interface ResolveDisputeData {
  disputeId: string
  status: 'resolved'
  refundAmount?: number
  refundMethod?: 'cash' | 'etransfer' | 'store-credit'
  staffNotes?: string
  restockItem?: boolean
}

/**
 * Resolves a dispute or return request.
 * Staff-only. Ensures atomic status changes and audit log integrity.
 */
export const resolveDispute = onCall<ResolveDisputeData>({ cors: true }, async (request) => {
  // Staff check
  if (!request.auth || !(request.auth.token['admin'] || request.auth.token['manager'] || request.auth.token['inventory_staff'])) {
    throw new HttpsError('permission-denied', 'Staff role required')
  }

  // MFA check for resolving disputes (compliance requirement)
  await assertMfaEnrolled(request)

  const { disputeId, status, refundAmount, refundMethod, staffNotes, restockItem } = request.data
  if (!disputeId) throw new HttpsError('invalid-argument', 'disputeId is required')

  const db = getFirestore()
  const disputeRef = db.collection('disputes').doc(disputeId)
  const disputeSnap = await disputeRef.get()

  if (!disputeSnap.exists) {
    throw new HttpsError('not-found', 'Dispute not found')
  }

  const dispute = disputeSnap.data() as Record<string, unknown>
  const itemId = dispute['itemId'] as string

  await db.runTransaction(async (transaction) => {
    // 1. Update Dispute
    transaction.update(disputeRef, {
      status,
      refundAmount: refundAmount ?? null,
      refundMethod: refundMethod ?? null,
      staffNotes: staffNotes ?? null,
      resolvedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

    // 2. Optional Restock
    if (restockItem && itemId) {
      const itemRef = db.collection('items').doc(itemId)
      const itemSnap = await transaction.get(itemRef)
      
      if (itemSnap.exists) {
        const item = itemSnap.data() as Record<string, unknown>
        // Safety: only restock if not on police hold
        if (item['policeHold'] !== true) {
          transaction.update(itemRef, {
            status: 'active',
            updatedAt: FieldValue.serverTimestamp()
          })

          // Audit restock
          transaction.set(db.collection('auditLogs').doc(), {
            eventType: 'item_restocked',
            uid: request.auth!.uid,
            targetId: itemId,
            details: { disputeId, previousStatus: item['status'] },
            createdAt: FieldValue.serverTimestamp()
          })
        }
      }
    }

    // 3. Audit Resolution
    transaction.set(db.collection('auditLogs').doc(), {
      eventType: 'dispute_resolved',
      uid: request.auth!.uid,
      targetId: disputeId,
      details: { itemId, refundAmount, restockItem },
      createdAt: FieldValue.serverTimestamp()
    })
  })

  return { success: true }
})

interface CreateDisputeData {
  itemId: string
  type: 'return' | 'dispute'
  description: string
}

/**
 * Creates a new dispute or return request.
 * Ensures consistent audit logging and server-side validation.
 */
export const createDispute = onCall<CreateDisputeData>({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required')
  }

  const { itemId, type, description } = request.data
  if (!itemId || !type || !description) {
    throw new HttpsError('invalid-argument', 'itemId, type, and description are required')
  }

  const db = getFirestore()
  
  // Verify item exists
  const itemSnap = await db.collection('items').doc(itemId).get()
  if (!itemSnap.exists) {
    throw new HttpsError('not-found', 'Item not found')
  }

  const disputeRef = db.collection('disputes').doc()
  const disputeId = disputeRef.id

  await db.runTransaction(async (transaction) => {
    // 1. Create Dispute
    transaction.set(disputeRef, {
      uid: request.auth!.uid,
      itemId,
      type,
      status: 'open',
      description,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

    // 2. Audit Creation
    transaction.set(db.collection('auditLogs').doc(), {
      eventType: 'dispute_created',
      uid: request.auth!.uid,
      targetId: disputeId,
      details: { itemId, type },
      createdAt: FieldValue.serverTimestamp()
    })
  })

  return { disputeId, success: true }
})
