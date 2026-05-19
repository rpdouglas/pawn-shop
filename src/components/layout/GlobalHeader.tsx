import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationDropdown from './NotificationDropdown'

export default function GlobalHeader() {
  const { user, loading, logout } = useAuth()
  const location = useLocation()

  return (
    <header aria-label="Site header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-4) var(--space-6)',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      borderBottom: '1px solid var(--color-border)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-small)',
    }}>
      <a href="#main-content" className="skip-to-content">Skip to main content</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <Link to="/pawn" style={{
          color: 'var(--color-text)',
          fontWeight: 600,
          textDecoration: 'none',
          padding: 'var(--space-2) 0',
        }}>
          The Pawn Shop
        </Link>

        {user && (
          <nav aria-label="User navigation" style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <Link to="/favourites" style={{ color: 'var(--color-text)', textDecoration: 'none', padding: 'var(--space-2)' }}>
              Favourites
            </Link>
          </nav>
        )}
      </div>

      <nav aria-label="Account" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
        {!loading && user && user.isStaff && (
          <Link to="/admin/dashboard" style={{ color: 'var(--color-text)', textDecoration: 'none', padding: 'var(--space-2)' }}>
            Admin Dashboard
          </Link>
        )}

        {!loading && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <NotificationDropdown />
            <span style={{ color: 'var(--color-text-muted)' }}>
              {user.email}
            </span>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                padding: 'var(--space-2)',
              }}
              aria-label="Sign Out"
            >
              Sign Out
            </button>
          </div>
        ) : !loading && location.pathname !== '/login' ? (
          <Link to="/login" style={{
            color: 'var(--color-text)',
            textDecoration: 'none',
            padding: 'var(--space-2)',
          }}>
            Sign In
          </Link>
        ) : null}
      </nav>
    </header>
  )
}
