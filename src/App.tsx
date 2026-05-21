import { Link, Outlet } from 'react-router-dom'
import { ViewProvider } from './context/ViewContext'
import { AdminShellProvider } from './context/AdminShellContext'
import ViewLayout from './components/layout/ViewLayout'
import ConsentBanner from './components/ConsentBanner'

export default function App() {
  return (
    <ViewProvider>
      <AdminShellProvider value={{ isAdminDesktop: false }}>
        <ViewLayout>
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
            {' · '}{import.meta.env.VITE_APP_VERSION || 'v0.0.0-local'}
          </p>
        </footer>
      </ViewLayout>
      </AdminShellProvider>
    </ViewProvider>
  )
}
