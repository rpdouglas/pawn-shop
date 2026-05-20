import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function UserProfileCircle() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getInitials = () => {
    if (!user?.email) return '?'
    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 'var(--space-12)',
          height: 'var(--space-12)',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-body)',
          fontWeight: 600,
          padding: 0
        }}
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        {user ? getInitials() : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + var(--space-2))',
          right: 0,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          minWidth: '200px',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          {user ? (
            <>
              <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Signed in as</p>
                <p style={{ margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
              </div>
              <Link to="/profile" onClick={() => setIsOpen(false)} style={itemStyle}>Profile</Link>
              <button onClick={() => { logout(); setIsOpen(false); }} style={{ ...itemStyle, border: 'none', background: 'none', width: '100%', textAlign: 'left', color: 'var(--color-danger)' }}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} style={itemStyle}>Sign In</Link>
          )}
        </div>
      )}
    </div>
  )
}

const itemStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  color: 'var(--color-text)',
  textDecoration: 'none',
  fontSize: 'var(--text-small)',
  cursor: 'pointer',
  minHeight: 'var(--space-12)',
  display: 'flex',
  alignItems: 'center'
}
