import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminShellProvider } from '../../context/AdminShellContext';
import AdminTopbar from './AdminTopbar';
import AdminSidebar from './AdminSidebar';
import AdminMobileNav from './AdminMobileNav';
import AcknowledgmentWall from '../auth/AcknowledgmentWall';

export default function AdminLayout() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!isDesktop) {
    return (
      <AcknowledgmentWall>
        <div style={{ paddingBottom: 'var(--space-16)' }}>
          <Outlet />
        </div>
        <AdminMobileNav />
      </AcknowledgmentWall>
    );
  }

  return (
    <AdminShellProvider value={{ isAdminDesktop: true }}>
      <AcknowledgmentWall>
        <div className="admin-shell" style={{ display: 'grid', gridTemplateColumns: '54px 1fr', minHeight: '100vh' }}>
          <AdminSidebar />
          <div className="admin-main" style={{ display: 'flex', flexDirection: 'column' }}>
            <AdminTopbar />
            <main id="admin-content" style={{ padding: 'var(--space-6)', flex: 1 }}>
              <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </AcknowledgmentWall>
    </AdminShellProvider>
  );
}
