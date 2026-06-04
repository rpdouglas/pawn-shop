import { describe, it, expect, beforeEach } from 'vitest'
import { testEnv } from './setup'
import { assignRole } from '../core/src/auth'
import * as admin from 'firebase-admin'

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    setCustomUserClaims: vi.fn().mockResolvedValue(undefined),
    createUser: vi.fn().mockResolvedValue({ uid: 'target-123' }),
    getUser: vi.fn().mockResolvedValue({ customClaims: { manager: true, customer: false } })
  })
}))

const wrappedAssignRole = testEnv.wrap(assignRole)

describe('assignRole (Cloud Function)', () => {
  beforeEach(async () => {
    // Clear firestore emulator data before each test
    await fetch('http://127.0.0.1:8080/emulator/v1/projects/the-addicts-agenda/databases/(default)/documents', {
      method: 'DELETE'
    })
  })

  it('should throw permission-denied if not admin', async () => {
    const data = { uid: 'target-123', role: 'manager' }
    const auth = { uid: 'staff-123', token: { admin: false } }

    await expect(wrappedAssignRole({ data, auth })).rejects.toThrow('Admin role required')
  })

  it('should throw invalid-argument for bad role', async () => {
    const data = { uid: 'target-123', role: 'ceo' }
    const auth = {
      uid: 'admin-123',
      token: { admin: true, sign_in_second_factor: true }
    }

    await expect(wrappedAssignRole({ data, auth })).rejects.toThrow('Invalid role: ceo')
  })

  it('should update user role and write audit log when valid', async () => {
    // We mock auth to avoid needing an actual Auth Emulator user
    const db = admin.firestore()
    await db.collection('users').doc('target-123').set({ role: 'customer' })

    const data = { uid: 'target-123', role: 'manager' }
    const auth = {
      uid: 'admin-123',
      token: { admin: true, sign_in_second_factor: true } // MFA required
    }

    // Auth is mocked, so we just call wrappedAssignRole directly
    await wrappedAssignRole({ data, auth })

    // Verify Firestore updates
    const userDoc = await db.collection('users').doc('target-123').get()
    expect(userDoc.data()?.role).toBe('manager')

    // Verify Audit Logs
    const auditLogs = await db.collection('auditLogs').where('targetId', '==', 'target-123').get()
    expect(auditLogs.empty).toBe(false)
    expect(auditLogs.docs[0].data().eventType).toBe('role_change')
    expect(auditLogs.docs[0].data().details.newRole).toBe('manager')
    
    // We verify custom claims via the mock response directly or skip the test since it's mocked
  })
})
