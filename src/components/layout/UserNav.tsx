import { lazy, Suspense } from 'react'
import { useAuth } from '../../context/AuthContext'
import UserProfileCircle from './UserProfileCircle'

const NotificationDropdown = lazy(() => import('./NotificationDropdown'))

export default function UserNav() {
  const { user, loading } = useAuth()

  return (
    <nav aria-label="Account" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
      {!loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {user && <Suspense fallback={null}><NotificationDropdown /></Suspense>}
          <UserProfileCircle />
        </div>
      )}
    </nav>
  )
}
