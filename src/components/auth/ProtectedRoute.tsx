import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  staffOnly?: boolean
  adminOnly?: boolean
}

export default function ProtectedRoute({
  children,
  staffOnly = false,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Render nothing while auth state resolves — avoids flash-of-wrong-route
  if (loading) return null

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/pawn" replace />
  }

  if (staffOnly && !user.isStaff) {
    return <Navigate to="/pawn" replace />
  }

  // Staff accessing any protected route must have MFA enrolled (bypassed in dev for local testing)
  if ((staffOnly || adminOnly) && user.isStaff && !user.isMfaEnrolled && !import.meta.env.DEV) {
    return (
      <Navigate
        to="/auth/mfa-enroll"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return <>{children}</>
}
