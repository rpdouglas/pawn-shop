import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

interface LogAgeGateData {
  eventType: 'age_gate_pass' | 'age_gate_fail'
  viewTag: 'cannabis' | 'fireworks'
  policyVersion: string
}

const VALID_EVENTS: ReadonlyArray<LogAgeGateData['eventType']> = ['age_gate_pass', 'age_gate_fail']
const VALID_VIEWS: ReadonlyArray<LogAgeGateData['viewTag']> = ['cannabis', 'fireworks']

// Public invoker — anonymous users must be able to log age gate events without signing in.
// Admin SDK write bypasses Firestore rules (auditLogs allow create: isSignedIn() is for clients only).
export const logAgeGate = onCall<LogAgeGateData>(
  { invoker: 'public', cors: true },
  async (request) => {
    const { eventType, viewTag, policyVersion } = request.data

    if (!VALID_EVENTS.includes(eventType)) {
      throw new HttpsError('invalid-argument', 'Invalid eventType')
    }
    if (!VALID_VIEWS.includes(viewTag)) {
      throw new HttpsError('invalid-argument', 'Invalid viewTag')
    }
    if (typeof policyVersion !== 'string' || policyVersion.length === 0) {
      throw new HttpsError('invalid-argument', 'policyVersion required')
    }

    await getFirestore().collection('auditLogs').add({
      eventType,
      uid: request.auth?.uid ?? 'anonymous',
      targetId: null,
      details: { viewTag, policyVersion },
      createdAt: FieldValue.serverTimestamp(),
    })

    return { success: true }
  },
)
