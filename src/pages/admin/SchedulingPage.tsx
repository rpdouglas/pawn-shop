import ProtectedRoute from '../../components/auth/ProtectedRoute'
import ShiftCalendar from '../../components/admin/ShiftCalendar'

export default function SchedulingPage() {
  return (
    <ProtectedRoute staffOnly>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)',
          }}>
            Store Scheduling
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
          }}>
            Coordinate team coverage across all views
          </p>
        </header>

        <ShiftCalendar />
      </div>
    </ProtectedRoute>
  )
}
