import { NavLink } from 'react-router-dom';

const GROUPS = [
  {
    label: 'Operations',
    items: [
      { to: '/admin/dashboard', label: 'Overview', icon: '📊' },
      { to: '/admin/inventory', label: 'Inventory', icon: '🏷️' },
      { to: '/admin/intake', label: 'Intake', icon: '➕' },
    ]
  },
  {
    label: 'Customer',
    items: [
      { to: '/admin/pawn-inbox', label: 'Pawn Inbox', icon: '📥' },
      { to: '/admin/reservations', label: 'Reservations', icon: '📅' },
      { to: '/admin/preorders', label: 'Preorders', icon: '📦' },
      { to: '/admin/disputes', label: 'Disputes', icon: '⚠️' },
    ]
  },
  {
    label: 'People',
    items: [
      { to: '/admin/staff', label: 'Staff', icon: '👥' },
      { to: '/admin/scheduling', label: 'Scheduling', icon: '🗓️' },
      { to: '/admin/customers', label: 'Customers', icon: '👥' },
    ]
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/staff-picks', label: 'Staff Picks', icon: '⭐' },
      { to: '/admin/campaigns', label: 'Campaigns', icon: '📢' },
      { to: '/admin/articles', label: 'Articles', icon: '📄' },
      { to: '/admin/faqs', label: 'FAQs', icon: '❓' },
    ]
  },
  {
    label: 'Config',
    items: [
      { to: '/admin/store-hours', label: 'Store Hours', icon: '🕒' },
      { to: '/admin/serial-blacklist', label: 'Blacklist', icon: '🛡️' },
    ]
  },
  {
    label: 'Support',
    items: [
      { to: 'https://rpdouglas.github.io/pawn-shop/', label: 'User Guide', icon: '📘', isExternal: true },
    ]
  }
];

export default function AdminSidebar() {
  return (
    <nav
      aria-label="Admin navigation"
      style={{
        width: '54px',
        backgroundColor: '#161000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-4) 0',
        height: 'calc(100vh - 38px)',
        position: 'sticky',
        top: '38px',
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRight: '1px solid var(--color-border)',
        zIndex: 1000
      }}
    >
      {GROUPS.map((group, gIdx) => (
        <div key={group.label} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {gIdx > 0 && (
            <div style={{ 
              width: '28px', 
              height: '0.5px', 
              backgroundColor: '#2a1f00', 
              margin: 'var(--space-2) 0' 
            }} />
          )}
          {group.items.map(item => {
            const content = (
              <>
                <span style={{ 
                  fontSize: '18px', 
                  color: '#7a5e0a' 
                }}>
                  {item.icon}
                </span>
                <span style={{ 
                  fontSize: '8px', 
                  color: '#5a4508',
                  marginTop: '2px',
                  textAlign: 'center'
                }}>
                  {item.label.split(' ')[0]}
                </span>
              </>
            );

            if ('isExternal' in item && item.isExternal) {
              return (
                <a
                  key={item.to}
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.label}
                  aria-label={item.label}
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-1)',
                    backgroundColor: 'transparent',
                    transition: 'background-color var(--motion-speed-fast) var(--motion-easing)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2e2200'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {content}
                </a>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                aria-label={item.label}
                style={({ isActive }) => ({
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-1)',
                  backgroundColor: isActive ? '#2e2200' : 'transparent',
                  transition: 'background-color var(--motion-speed-fast) var(--motion-easing)'
                })}
              >
                {({ isActive }) => (
                  <>
                    <span style={{ 
                      fontSize: '18px', 
                      color: isActive ? 'var(--color-primary)' : '#7a5e0a' 
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ 
                      fontSize: '8px', 
                      color: isActive ? 'var(--color-primary)' : '#5a4508',
                      marginTop: '2px',
                      textAlign: 'center'
                    }}>
                      {item.label.split(' ')[0]}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
