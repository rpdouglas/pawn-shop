import { useState } from 'react';
import { NavLink } from 'react-router-dom';

type NavItem = { to: string; label: string; icon: string; isExternal?: boolean }
type NavGroup = { label: string; defaultOpen: boolean; items: NavItem[] }

const GROUPS: NavGroup[] = [
  {
    label: 'Operations',
    defaultOpen: true,
    items: [
      { to: '/admin/dashboard', label: 'Overview', icon: '📊' },
      { to: '/admin/inventory', label: 'Inventory', icon: '🏷️' },
    ]
  },
  {
    label: 'Customer',
    defaultOpen: true,
    items: [
      { to: '/admin/pawn-inbox', label: 'Pawn Inbox', icon: '📥' },
      { to: '/admin/loans', label: 'Loans', icon: '💸' },
      { to: '/admin/reservations', label: 'Reservations', icon: '📅' },
      { to: '/admin/preorders', label: 'Preorders', icon: '📦' },
      { to: '/admin/disputes', label: 'Disputes', icon: '⚠️' },
    ]
  },
  {
    label: 'People',
    defaultOpen: true,
    items: [
      { to: '/admin/staff', label: 'Staff', icon: '👥' },
      { to: '/admin/scheduling', label: 'Scheduling', icon: '🗓️' },
      { to: '/admin/customers', label: 'Customers', icon: '👥' },
      { to: '/admin/documents', label: 'Documents', icon: '📑' },
    ]
  },
  {
    label: 'Content',
    defaultOpen: false,
    items: [
      { to: '/admin/staff-picks', label: 'Staff Picks', icon: '⭐' },
      { to: '/admin/campaigns', label: 'Campaigns', icon: '📢' },
      { to: '/admin/articles', label: 'Articles', icon: '📄' },
      { to: '/admin/faqs', label: 'FAQs', icon: '❓' },
      { to: '/admin/social', label: 'Social Media', icon: '📱' },
    ]
  },
  {
    label: 'Config',
    defaultOpen: false,
    items: [
      { to: '/admin/store-hours', label: 'Store Hours', icon: '🕒' },
      { to: '/admin/serial-blacklist', label: 'Blacklist', icon: '🛡️' },
    ]
  },
  {
    label: 'Support',
    defaultOpen: false,
    items: [
      { to: 'https://rpdouglas.github.io/pawn-shop/', label: 'User Guide', icon: '📘', isExternal: true },
    ]
  }
];

const BASE_ITEM_STYLE = {
  width: '100%',
  minHeight: 'var(--space-12)',
  display: 'flex' as const,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 'var(--space-2)',
  paddingLeft: 'var(--space-4)',
  paddingRight: 'var(--space-4)',
  textDecoration: 'none',
  transition: `background-color var(--motion-speed-fast) var(--motion-easing)`,
} as const;

export default function AdminSidebar() {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(GROUPS.filter(g => !g.defaultOpen).map(g => g.label))
  );
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  function toggleGroup(label: string) {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  return (
    <nav
      aria-label="Admin navigation"
      style={{
        width: '210px',
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
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
      {GROUPS.map((group, gIdx) => {
        const isCollapsed = collapsedGroups.has(group.label);

        return (
          <div key={group.label} style={{ width: '100%' }}>
            {gIdx > 0 && (
              <div style={{
                height: '1px',
                backgroundColor: 'var(--color-border)',
                margin: `var(--space-1) var(--space-4)`,
              }} />
            )}

            <button
              onClick={() => toggleGroup(group.label)}
              aria-expanded={!isCollapsed}
              aria-label={`${group.label} section, ${isCollapsed ? 'collapsed' : 'expanded'}`}
              style={{
                width: '100%',
                minHeight: 'var(--space-12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: 'var(--space-4)',
                paddingRight: 'var(--space-4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
              }}
            >
              <span style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {group.label}
              </span>
              <span
                aria-hidden="true"
                style={{
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text-muted)',
                  display: 'inline-block',
                  transition: `transform var(--motion-speed-fast) var(--motion-easing)`,
                  transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                  lineHeight: 1,
                }}
              >
                ›
              </span>
            </button>

            {!isCollapsed && group.items.map(item => {
              const isHovered = hoveredItem === item.to;

              if (item.isExternal) {
                return (
                  <a
                    key={item.to}
                    href={item.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    style={{
                      ...BASE_ITEM_STYLE,
                      color: 'color-mix(in srgb, var(--color-primary) 50%, transparent)',
                      backgroundColor: isHovered
                        ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                        : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredItem(item.to)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span aria-hidden="true" style={{ fontSize: 'var(--text-body)', lineHeight: 1 }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: 'var(--text-small)', fontFamily: 'var(--font-body)' }}>
                      {item.label}
                    </span>
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  onMouseEnter={() => setHoveredItem(item.to)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={({ isActive }) => ({
                    ...BASE_ITEM_STYLE,
                    backgroundColor: isActive
                      ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                      : isHovered
                        ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                        : 'transparent',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: 'var(--text-body)',
                          lineHeight: 1,
                          color: isActive
                            ? 'var(--color-primary)'
                            : 'color-mix(in srgb, var(--color-primary) 50%, transparent)',
                        }}
                      >
                        {item.icon}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--text-small)',
                          fontFamily: 'var(--font-body)',
                          color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        }}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
