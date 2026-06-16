import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/admin/inventory',     label: 'Inventory', icon: '🏷️' },
  { to: '/admin/mobile-intake', label: 'Add Item',  icon: '📷' },
  { to: '/admin/customers',     label: 'Customers', icon: '👥' },
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
        backgroundColor: 'var(--gmc-bg-surface)',
        borderTop: '1px solid var(--gmc-border-default)',
        paddingTop: 'var(--space-2)',
        paddingBottom: 'calc(var(--space-2) + env(safe-area-inset-bottom))',
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
            minHeight: '48px',
            textDecoration: 'none',
            padding: '0 var(--space-1)',
            color: isActive ? 'var(--gmc-gold-primary)' : 'var(--gmc-text-muted)',
            transition: 'color 0.12s ease',
          })}
        >
          {({ isActive }) => (
            <>
              <span style={{ fontSize: '22px', lineHeight: 1 }} aria-hidden="true">
                {tab.icon}
              </span>
              <span style={{
                fontFamily: 'var(--gmc-font-body)',
                fontSize: 'var(--text-xs)',
                marginTop: 'var(--space-1)',
                letterSpacing: '0.08em',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--gmc-gold-primary)' : 'var(--gmc-text-muted)',
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
