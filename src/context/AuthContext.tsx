import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, getIdTokenResult, multiFactor, signOut } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import type { User } from 'firebase/auth'
import { auth, functions } from '../lib/firebase-core'
import { setAnalyticsUserProperties } from '../lib/analytics'
import type { AuthUser, StaffRole } from '../lib/types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
})

const STAFF_ROLES: readonly StaffRole[] = ['admin', 'manager', 'inventory_staff', 'marketing_staff']
const ALL_ROLES: readonly StaffRole[] = [...STAFF_ROLES, 'customer']

const recordLogoutFn = httpsCallable(functions, 'recordLogout')

async function buildAuthUser(firebaseUser: User): Promise<AuthUser> {
  const tokenResult = await getIdTokenResult(firebaseUser)
  const claims = tokenResult.claims as Record<string, unknown>

  const role = ALL_ROLES.find((r) => claims[r] === true) ?? null
  const isStaff = STAFF_ROLES.some((r) => claims[r] === true)
  const isAdmin = claims['admin'] === true
  const isMfaEnrolled = multiFactor(firebaseUser).enrolledFactors.length > 0

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    role,
    isMfaEnrolled,
    isStaff,
    isAdmin,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // @ts-expect-error - E2E testing hook
      if (typeof window !== 'undefined' && window.__PLAYWRIGHT_MOCK_USER__) {
        // @ts-expect-error - E2E testing hook
        setUser(window.__PLAYWRIGHT_MOCK_USER__)
        setLoading(false)
        return
      }

      if (!firebaseUser) {
        setUser(null)
        setAnalyticsUserProperties({ is_staff: 'false' })
        setLoading(false)
        return
      }
      const builtUser = await buildAuthUser(firebaseUser)
      setUser(builtUser)
      setAnalyticsUserProperties({ is_staff: builtUser.isStaff ? 'true' : 'false' })
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Forces a re-read of the Firebase user — call after MFA enrollment or role assignment.
  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return
    await currentUser.reload()
    // auth.currentUser is updated after reload(); re-read it
    const reloaded = auth.currentUser
    if (reloaded) setUser(await buildAuthUser(reloaded))
  }, [])

  const logout = useCallback(async () => {
    try {
      await recordLogoutFn()
    } catch (e) {
      console.error('Failed to record logout event', e)
    }
    await signOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
