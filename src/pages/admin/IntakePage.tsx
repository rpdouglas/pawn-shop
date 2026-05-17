import ProtectedRoute from '../../components/auth/ProtectedRoute'
import IntakeForm from '../../components/admin/IntakeForm'

export default function IntakePage() {
  return (
    <ProtectedRoute staffOnly>
      <IntakeForm />
    </ProtectedRoute>
  )
}
