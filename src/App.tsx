import { Link, Outlet } from 'react-router-dom'
import { ViewProvider } from './context/ViewContext'
import ViewLayout from './components/layout/ViewLayout'
import ConsentBanner from './components/ConsentBanner'

export default function App() {
  return (
    <ViewProvider>
      <ViewLayout>
        {/* Dev nav — replaced by per-view navigation in E05 */}
        <nav aria-label="Site navigation" style={{
          display: 'flex',
          gap: 'var(--space-6)',
          padding: 'var(--space-1) var(--space-8)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}>
          <Link to="/pawn"      className="site-nav-link">Pawn</Link>
          <Link to="/cannabis"  className="site-nav-link">Cannabis</Link>
          <Link to="/fireworks" className="site-nav-link">Fireworks</Link>
        </nav>

        <ConsentBanner />

        <main id="main-content">
          <Outlet />
        </main>

        <footer className="site-footer">
          <nav aria-label="Footer navigation">
            <Link to="/contact"       className="site-footer-link">Contact</Link>
            <Link to="/accessibility" className="site-footer-link">Accessibility</Link>
            <Link to="/privacy"       className="site-footer-link">Privacy Policy</Link>
            <Link to="/terms"         className="site-footer-link">Terms of Use</Link>
          </nav>
          <p className="site-footer-copy">
            © {new Date().getFullYear()} The Pawn Shop · Cornwall Island, Akwesasne
          </p>
        </footer>
      </ViewLayout>
    </ViewProvider>
  )
}
