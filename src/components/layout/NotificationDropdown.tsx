import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, loading } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text)',
          cursor: 'pointer',
          padding: 'var(--space-2)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-heading)'
        }}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid var(--color-bg)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 'var(--space-2)',
          width: '320px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 100,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '400px'
        }}>
          <header style={{
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-small)', fontFamily: 'var(--font-display)' }}>Notifications</h3>
          </header>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Loading...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: notif.read ? 'transparent' : 'rgba(200, 161, 74, 0.05)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span style={{ 
                      fontWeight: notif.read ? 400 : 600, 
                      fontSize: 'var(--text-small)',
                      color: 'var(--color-text)' 
                    }}>
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--color-primary)' 
                      }} />
                    )}
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.4
                  }}>
                    {notif.body}
                  </p>
                  {notif.link && (
                    <Link 
                      to={notif.link} 
                      style={{ 
                        display: 'inline-block', 
                        marginTop: 'var(--space-2)', 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--color-primary)',
                        textDecoration: 'none'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notif.id)
                        setIsOpen(false)
                      }}
                    >
                      View details →
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
                No notifications yet.
              </div>
            )}
          </div>
          
          <footer style={{ padding: 'var(--space-2)', textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
            <Link to="/favourites" onClick={() => setIsOpen(false)} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
              View Favourites
            </Link>
          </footer>
        </div>
      )}
    </div>
  )
}
