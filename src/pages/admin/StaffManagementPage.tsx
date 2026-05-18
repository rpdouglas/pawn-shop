import ProtectedRoute from '../../components/auth/ProtectedRoute'
import StaffList from '../../components/admin/StaffList'

export default function StaffManagementPage() {
  return (
    <ProtectedRoute adminOnly>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)',
          }}>
            Staff Management
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
          }}>
            Manage employee roles and permissions
          </p>
        </header>

        <StaffList />
      </div>
    </ProtectedRoute>
  )
}
