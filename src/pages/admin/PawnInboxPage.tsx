import ProtectedRoute from '../../components/auth/ProtectedRoute'
import PawnInbox from '../../components/admin/PawnInbox'

export default function PawnInboxPage() {
  return (
    <ProtectedRoute staffOnly>
      <PawnInbox />
    </ProtectedRoute>
  )
}
