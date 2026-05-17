import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'

type StaffRole = 'admin' | 'manager' | 'inventory_staff' | 'marketing_staff' | 'customer'

const VALID_ROLES: readonly StaffRole[] = [
  'admin', 'manager', 'inventory_staff', 'marketing_staff', 'customer',
]

interface AssignRoleData {
  uid: string
  role: StaffRole
}

interface RecordLoginData {
  method: 'email' | 'google'
}

function hashIp(rawIp: string): string {
  return createHash('sha256').update(rawIp).digest('hex')
}

// Assigns or changes a user's role. Admin-only. Writes role_change auditLog.
export const assignRole = onCall<AssignRoleData>(async (request) => {
  if (!request.auth || request.auth.token['admin'] !== true) {
    throw new HttpsError('permission-denied', 'Admin role required')
  }

  const { uid, role } = request.data

  if (!VALID_ROLES.includes(role)) {
    throw new HttpsError('invalid-argument', `Invalid role: ${role}`)
  }

  // Set exactly one role claim true; clear all others
  const claims = Object.fromEntries(VALID_ROLES.map((r) => [r, r === role]))
  await getAuth().setCustomUserClaims(uid, claims)
  await getFirestore().collection('users').doc(uid).update({ role })
  await getFirestore().collection('auditLogs').add({
    eventType: 'role_change',
    uid: request.auth.uid,
    targetId: uid,
    details: { newRole: role },
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})

// Called by the client after every successful sign-in.
// Creates users/{uid} on first login. Hashes IP before writing. Writes login auditLog.
export const recordLogin = onCall<RecordLoginData>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required')
  }

  const { method } = request.data
  const uid = request.auth.uid

  // IP extraction — x-forwarded-for is preferred when behind a proxy
  const headers = request.rawRequest.headers as Record<string, string | string[] | undefined>
  const rawIp = String(headers['x-forwarded-for'] || request.rawRequest.ip || 'unknown')
    .split(',')[0]
    .trim()
  const hashedIp = hashIp(rawIp)

  const db = getFirestore()
  const userRef = db.collection('users').doc(uid)
  const snap = await userRef.get()
  const now = FieldValue.serverTimestamp()

  if (!snap.exists) {
    const firebaseUser = await getAuth().getUser(uid)
    const mfaEnrolled = (firebaseUser.multiFactor?.enrolledFactors?.length ?? 0) > 0
    // Derive role from custom claims so staff accounts get the correct role on first login
    const existingClaims = (firebaseUser.customClaims ?? {}) as Record<string, unknown>
    const role = VALID_ROLES.find((r) => existingClaims[r] === true) ?? 'customer'
    await userRef.set({
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? '',
      role,
      mfaEnrolled,
      lastLoginAt: now,
      lastLoginIp: hashedIp,
      createdAt: now,
    })
  } else {
    await userRef.update({ lastLoginAt: now, lastLoginIp: hashedIp })
  }

  await db.collection('auditLogs').add({
    eventType: 'login',
    uid,
    details: { method },
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})

// Called by the client before signOut(). Writes logout auditLog.
export const recordLogout = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required')
  }

  await getFirestore().collection('auditLogs').add({
    eventType: 'logout',
    uid: request.auth.uid,
    details: {},
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})

// Called by the client after successful TOTP enrollment.
// Sets users/{uid}.mfaEnrolled = true and writes mfa_enrolled auditLog.
export const recordMfaEnrolled = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required')
  }

  const uid = request.auth.uid
  const db = getFirestore()

  await db.collection('users').doc(uid).update({ mfaEnrolled: true })
  await db.collection('auditLogs').add({
    eventType: 'mfa_enrolled',
    uid,
    details: {},
    createdAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})
