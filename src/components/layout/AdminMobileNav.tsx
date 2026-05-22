import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/admin/inventory',     label: 'Inventory', icon: '🏷️' },
  { to: '/admin/mobile-intake', label: 'Add Item',  icon: '📷' },
  { to: '/admin/dashboard',     label: 'Dashboard', icon: '📊' },
] as const

export default function AdminMobileNav() {
  return (
    <nav
      aria-label="Admin mobile navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 1100,
      }}
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          aria-label={tab.label}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '56px',
            textDecoration: 'none',
            padding: 'var(--space-2)',
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            transition: `color var(--motion-speed-fast) var(--motion-easing)`,
          })}
        >
          {({ isActive }) => (
            <>
              <span style={{ fontSize: '20px', lineHeight: 1 }} aria-hidden="true">
                {tab.icon}
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                marginTop: 'var(--space-1)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
