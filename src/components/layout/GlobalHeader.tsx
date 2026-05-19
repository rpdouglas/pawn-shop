import NavigationDrawer from './NavigationDrawer'
import UserNav from './UserNav'
import { useAdminShell } from '../../context/AdminShellContext'

export default function GlobalHeader() {
  const { isAdminDesktop } = useAdminShell()

  if (isAdminDesktop) return null

  return (
    <header 
      aria-label="Site header" 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-2) var(--space-6)',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        borderBottom: '1px solid var(--color-border)',
        minHeight: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <a href="#main-content" className="skip-to-content">Skip to main content</a>

      <NavigationDrawer />
      <UserNav />
    </header>
  )
}
