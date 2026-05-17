import { Link, Outlet } from 'react-router-dom'
import { ViewProvider } from './context/ViewContext'
import ViewLayout from './components/layout/ViewLayout'

export default function App() {
  return (
    <ViewProvider>
      <ViewLayout>
        {/* Dev nav — replaced by per-view navigation in E05 */}
        <nav style={{
          display: 'flex',
          gap: '24px',
          padding: '4px 32px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}>
          <Link
            to="/pawn"
            style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '17.5px' }}
          >
            Pawn
          </Link>
          <Link
            to="/cannabis"
            style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '17.5px' }}
          >
            Cannabis
          </Link>
          <Link
            to="/fireworks"
            style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '17.5px' }}
          >
            Fireworks
          </Link>
        </nav>
        <Outlet />
      </ViewLayout>
    </ViewProvider>
  )
}
