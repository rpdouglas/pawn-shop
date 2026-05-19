import { useAuth } from '../../context/AuthContext';

export default function AdminTopbar() {
  const { user } = useAuth();

  return (
    <header
      style={{
        height: '38px',
        backgroundColor: '#1c1400',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 1001
      }}
    >
      <div style={{ 
        fontFamily: 'var(--font-display)', 
        fontSize: 'var(--text-small)', 
        color: 'var(--color-primary)',
        fontWeight: 600
      }}>
        The Pawn Shop
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {user?.email}
        </span>
        {user?.role && (
          <span className="badge" style={{ 
            fontSize: '10px', 
            padding: '2px 6px',
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)'
          }}>
            {user.role.replace('_', ' ')}
          </span>
        )}
      </div>
    </header>
  );
}
