import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { prefetchRoute } from '../../lib/prefetch'

interface NavLink {
  to: string
  label: string
  comingSoon?: boolean
}

const LINKS: NavLink[] = [
  { to: '/', label: 'Home' },
  { to: '/pawn', label: 'Pawn' },
  { to: '/cannabis', label: 'Cannabis' },
  { to: '/fireworks', label: 'Fireworks' },
  { to: '/tobacco', label: 'Tobacco' },
]

export default function NavigationDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const drawerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'The Pawn Shop'
    if (path.startsWith('/pawn')) return 'The Pawn Shop - Pawn & Resale'
    if (path.startsWith('/cannabis')) return 'The Pawn Shop - Cannabis'
    if (path.startsWith('/fireworks')) return 'The Pawn Shop - Fireworks'
    if (path.startsWith('/tobacco')) return 'The Pawn Shop - Tobacco'
    if (path.startsWith('/admin')) return 'The Pawn Shop - Admin'
    return 'The Pawn Shop'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 'var(--space-12)',
          height: 'var(--space-12)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'var(--space-2)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: 'var(--color-text)'
        }}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <span style={{ width: 'var(--space-6)', height: '2px', backgroundColor: 'currentColor', transition: 'var(--motion-speed-base)', transform: isOpen ? 'rotate(45deg) translate(var(--space-1), var(--space-1))' : 'none' }} />
        <span style={{ width: 'var(--space-6)', height: '2px', backgroundColor: 'currentColor', transition: 'var(--motion-speed-base)', opacity: isOpen ? 0 : 1 }} />
        <span style={{ width: 'var(--space-6)', height: '2px', backgroundColor: 'currentColor', transition: 'var(--motion-speed-base)', transform: isOpen ? 'rotate(-45deg) translate(var(--space-1), calc(var(--space-1) * -1))' : 'none' }} />
      </button>

      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-lead)',
        color: 'var(--color-text)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {getPageTitle()}
      </span>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }}>
          <div ref={drawerRef} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 'min(18rem, 80%)',
            height: '100%',
            backgroundColor: 'var(--color-bg)',
            boxShadow: 'var(--shadow-xl)',
            padding: 'var(--space-8) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              padding: '0 var(--space-4)',
              marginBottom: 'var(--space-4)',
              textTransform: 'uppercase'
            }}>
              Navigation
            </h2>
            {LINKS.map(link => (
              <div key={link.label} style={{ position: 'relative' }}>
                <Link
                  to={link.to}
                  onMouseEnter={() => prefetchRoute(link.to)}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--space-4)',
                    color: link.comingSoon ? 'var(--color-text-muted)' : 'var(--color-text)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: location.pathname === link.to ? 'var(--color-surface)' : 'transparent',
                    pointerEvents: link.comingSoon ? 'none' : 'auto',
                    minHeight: 'var(--space-12)'
                  }}
                >
                  {link.label}
                  {link.comingSoon && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-bg)',
                      backgroundColor: 'var(--color-text)',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase'
                    }}>
                      Soon
                    </span>
                  )}
                </Link>
              </div>
            ))}

            {user && (
              <div style={{ position: 'relative' }}>
                <Link
                  to="/pawn/my-loans"
                  onMouseEnter={() => prefetchRoute('/pawn/my-loans')}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--space-4)',
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: location.pathname === '/pawn/my-loans' ? 'var(--color-surface)' : 'transparent',
                    minHeight: 'var(--space-12)'
                  }}
                >
                  My Pawn Loans
                </Link>
              </div>
            )}

            {user?.isStaff && (
              <>
                <div style={{
                  height: '1px',
                  backgroundColor: 'var(--color-border)',
                  margin: 'var(--space-2) var(--space-4)'
                }} />
                <Link
                  to="/admin/dashboard"
                  onMouseEnter={() => prefetchRoute('/admin/dashboard')}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--space-4)',
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: location.pathname.startsWith('/admin') ? 'var(--color-surface)' : 'transparent',
                    minHeight: 'var(--space-12)'
                  }}
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="https://rpdouglas.github.io/pawn-shop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--space-4)',
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'transparent',
                    minHeight: 'var(--space-12)'
                  }}
                >
                  User Guide ↗
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
