import { describe, it, expect, beforeEach } from 'vitest'
import { testEnv } from './setup'
import { logAgeGate } from '../core/src/ageGate'
import * as admin from 'firebase-admin'

const wrappedLogAgeGate = testEnv.wrap(logAgeGate)

describe('logAgeGate (Cloud Function)', () => {
  beforeEach(async () => {
    // Clear firestore emulator data before each test
    await fetch('http://127.0.0.1:8080/emulator/v1/projects/the-addicts-agenda/databases/(default)/documents', {
      method: 'DELETE'
    })
  })

  it('should throw invalid-argument for bad eventType', async () => {
    const data = { eventType: 'age_gate_maybe', viewTag: 'cannabis', policyVersion: '1.0' }
    await expect(wrappedLogAgeGate({ data })).rejects.toThrow('Invalid eventType')
  })

  it('should throw invalid-argument for bad viewTag', async () => {
    const data = { eventType: 'age_gate_pass', viewTag: 'alcohol', policyVersion: '1.0' }
    await expect(wrappedLogAgeGate({ data })).rejects.toThrow('Invalid viewTag')
  })

  it('should allow anonymous execution and write audit log', async () => {
    const db = admin.firestore()
    const data = { eventType: 'age_gate_pass', viewTag: 'cannabis', policyVersion: 'v1.0' }
    
    // Pass empty context to simulate unauthenticated user
    await wrappedLogAgeGate({ data, auth: undefined })

    const auditLogs = await db.collection('auditLogs').where('eventType', '==', 'age_gate_pass').get()
    expect(auditLogs.empty).toBe(false)
    
    const log = auditLogs.docs[0].data()
    expect(log.uid).toBe('anonymous')
    expect(log.details.viewTag).toBe('cannabis')
    expect(log.details.policyVersion).toBe('v1.0')
  })
})
