import { useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import IntakeForm from '../../components/admin/IntakeForm'

export default function IntakePage() {
  const { id } = useParams()
  return (
    <ProtectedRoute staffOnly>
      <IntakeForm initialItemId={id} />
    </ProtectedRoute>
  )
}
