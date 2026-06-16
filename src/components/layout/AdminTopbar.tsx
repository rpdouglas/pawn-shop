import { useAuth } from '../../context/AuthContext';

export default function AdminTopbar() {
  const { user } = useAuth();
  const raw = user?.email?.split('@')[0] ?? 'ad';
  const initials = raw.slice(0, 2).toUpperCase();

  return (
    <header
      style={{
        height: '48px',
        backgroundColor: 'var(--gmc-bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        borderBottom: '1px solid var(--gmc-border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 1001,
        flexShrink: 0,
      }}
    >
      {/* Left: gold rule + wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div
          aria-hidden="true"
          style={{
            width: '3px',
            height: 'var(--space-4)',
            backgroundColor: 'var(--gmc-gold-primary)',
            borderRadius: '2px',
            flexShrink: 0,
          }}
        />
        <span style={{
          fontFamily: 'var(--gmc-font-display)',
          fontSize: 'var(--text-small)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--gmc-text-primary)',
        }}>
          The Pawn Shop
        </span>
        <span style={{
          fontFamily: 'var(--gmc-font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--gmc-text-muted)',
          letterSpacing: '0.10em',
        }}>
          · Akwesasne
        </span>
      </div>

      {/* Right: live dot + role + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <div
            aria-hidden="true"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--gmc-status-active)',
            }}
          />
          <span style={{
            fontFamily: 'var(--gmc-font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--gmc-text-muted)',
            letterSpacing: '0.08em',
          }}>
            LIVE
          </span>
        </div>

        {/* Role badge */}
        {user?.role && (
          <span style={{
            fontFamily: 'var(--gmc-font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--gmc-text-muted)',
            padding: '2px var(--space-2)',
            border: '1px solid var(--gmc-border-default)',
            borderRadius: 'var(--radius-sm)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {user.role.replace('_', ' ')}
          </span>
        )}

        {/* Avatar initials */}
        <div
          aria-hidden="true"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'var(--gmc-gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--gmc-font-body)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            color: 'var(--gmc-bg-base)',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
