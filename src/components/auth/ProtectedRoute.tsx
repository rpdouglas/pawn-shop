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

  return <>{children}</>
}
