import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserProfileCircle from './UserProfileCircle'

// Lazy: only shown to authenticated users; avoids pulling Firestore into main bundle
const NotificationDropdown = lazy(() => import('./NotificationDropdown'))

export default function UserNav() {
  const { user, loading } = useAuth()

  return (
    <nav aria-label="Account" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
      {!loading && user && user.isStaff && (
        <Link 
          to="/admin/dashboard" 
          style={{ 
            color: 'var(--color-text)', 
            textDecoration: 'none', 
            padding: 'var(--space-2)',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center'
          }}
          aria-label="Admin Dashboard"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="desktop-only" style={{ fontSize: 'var(--text-small)', fontWeight: 600 }}>Admin</span>
        </Link>
      )}

      {!loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {user && <Suspense fallback={null}><NotificationDropdown /></Suspense>}
          <UserProfileCircle />
        </div>
      )}
    </nav>
  )
}
