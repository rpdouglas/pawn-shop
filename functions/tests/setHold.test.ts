import { describe, it, expect, beforeEach } from 'vitest'
import { testEnv } from './setup'
import { setHold } from '../operations/src/inventory'
import * as admin from 'firebase-admin'

const wrappedSetHold = testEnv.wrap(setHold)

describe('setHold (Cloud Function)', () => {
  beforeEach(async () => {
    // Clear firestore emulator data before each test
    await fetch('http://127.0.0.1:8080/emulator/v1/projects/the-addicts-agenda/databases/(default)/documents', {
      method: 'DELETE'
    })
  })

  it('should throw unauthenticated if no auth context', async () => {
    await expect(wrappedSetHold({ data: { itemId: 'item-123' }, auth: undefined })).rejects.toThrow('Sign in required')
  })

  it('should throw not-found if item does not exist', async () => {
    await expect(wrappedSetHold({ data: { itemId: 'missing-item' }, auth: { uid: 'user-1', token: {} as import('firebase-admin/auth').DecodedIdToken } })).rejects.toThrow('Item missing-item not found')
  })

  it('should throw failed-precondition if item is not active', async () => {
    const db = admin.firestore()
    await db.collection('items').doc('draft-item').set({ status: 'draft' })

    await expect(wrappedSetHold({ data: { itemId: 'draft-item' }, auth: { uid: 'user-1', token: {} as import('firebase-admin/auth').DecodedIdToken } })).rejects.toThrow('Item is not available for hold, current status: draft')
  })

  it('should transition active item to reserved and write audit log', async () => {
    const db = admin.firestore()
    await db.collection('items').doc('active-item').set({ status: 'active', title: 'Test Item' })

    await wrappedSetHold({ data: { itemId: 'active-item' }, auth: { uid: 'user-1', token: {} as import('firebase-admin/auth').DecodedIdToken } })

    const updatedItem = await db.collection('items').doc('active-item').get()
    const data = updatedItem.data()!
    expect(data.status).toBe('reserved')
    expect(data.holdExpiresAt).toBeDefined()

    const auditLogs = await db.collection('auditLogs').where('eventType', '==', 'hold_set').get()
    expect(auditLogs.empty).toBe(false)
    const log = auditLogs.docs[0].data()
    expect(log.uid).toBe('user-1')
    expect(log.targetId).toBe('active-item')
    expect(log.details.fromStatus).toBe('active')
    expect(log.details.toStatus).toBe('reserved')
  })
})
