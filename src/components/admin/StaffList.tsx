import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import type { StaffRole } from '../../lib/types'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import HRTab from '../profile/HRTab'
import Button from '../ui/Button'
import { useStaffMembers } from '../../lib/useStaffMembers'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const assignRoleFn = httpsCallable<{ uid: string; role: StaffRole }, { success: boolean }>(functions, 'assignRole')
const inviteEmployeeFn = httpsCallable<{ email: string; displayName: string; role: StaffRole }, { success: boolean; resetLink: string }>(functions, 'inviteEmployee')

const ROLES: StaffRole[] = ['admin', 'manager', 'inventory_staff', 'marketing_staff', 'customer']

export default function StaffList() {
  const queryClient = useQueryClient()
  const { data: staff, isLoading: loading, error: queryError } = useStaffMembers()
  const error = queryError ? (queryError as Error).message : null
  
  const [selectedHrUid, setSelectedHrUid] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<StaffRole>('inventory_staff')
  const [inviting, setInviting] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)

  const assignRoleMutation = useMutation({
    mutationFn: async ({ uid, newRole }: { uid: string, newRole: StaffRole }) => {
      await assignRoleFn({ uid, role: newRole })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] })
    },
    onError: (err: Error) => {
      alert(err.message || 'Failed to update role')
    }
  })

  const handleRoleChange = (uid: string, newRole: StaffRole) => {
    assignRoleMutation.mutate({ uid, newRole })
  }

  const [inviteError, setInviteError] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteError(null)
    try {
      const res = await inviteEmployeeFn({ email: inviteEmail, displayName: inviteName, role: inviteRole })
      setResetLink(res.data.resetLink)
      // Refresh staff list
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] })
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite')
    } finally {
      setInviting(false)
    }
  }

  if (loading) return <p style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Loading staff...</p>
  if (error) return <p style={{ padding: 'var(--space-4)', color: 'var(--color-error)' }}>Error: {error}</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" onClick={() => { setShowInviteModal(true); setResetLink(null) }}>
          Invite Employee
        </Button>
      </div>
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
            {['Name', 'Email', 'Role', 'MFA', 'Actions'].map((col) => (
              <th
                key={col}
                style={{
                  padding: 'var(--space-4)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(staff ?? []).map((member) => (
            <tr key={member.uid} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text)' }}>
                {member.displayName || 'Unnamed'}
              </td>
              <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text)' }}>
                {member.email}
              </td>
              <td style={{ padding: 'var(--space-4)' }}>
                <Badge variant="tag" label={member.role} />
              </td>
              <td style={{ padding: 'var(--space-4)' }}>
                <Badge variant={member.mfaEnrolled ? 'active' : 'archived'} label={member.mfaEnrolled ? 'Enrolled' : 'Missing'} />
              </td>
              <td style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <select
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-small)',
                    }}
                    value={member.role}
                    disabled={assignRoleMutation.isPending && assignRoleMutation.variables?.uid === member.uid}
                    onChange={(e) => handleRoleChange(member.uid, e.target.value as StaffRole)}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <Button variant="secondary" onClick={() => setSelectedHrUid(member.uid)}>HR</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {selectedHrUid && (
        <Modal
          isOpen={!!selectedHrUid}
          onClose={() => setSelectedHrUid(null)}
          title="Staff HR Profile"
        >
          <div style={{ padding: 'var(--space-4)' }}>
            <HRTab uid={selectedHrUid} isAdminView />
          </div>
        </Modal>
      )}

      {showInviteModal && (
        <Modal
          isOpen={showInviteModal}
          onClose={() => { setShowInviteModal(false); setResetLink(null) }}
          title="Invite Employee"
        >
          <div style={{ padding: 'var(--space-4)' }}>
            {resetLink ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p style={{ color: 'var(--color-text)' }}>
                  Employee invited successfully! Since we are in development/MVP mode, please send them this secure password setup link directly:
                </p>
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg)', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-sm)' }}>
                  {resetLink}
                </div>
                <Button variant="primary" onClick={() => setShowInviteModal(false)}>Done</Button>
              </div>
            ) : (
              <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {inviteError && <p style={{ color: 'var(--color-error)' }}>{inviteError}</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Display Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Initial Role</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as StaffRole)}
                    style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  <Button variant="secondary" onClick={() => setShowInviteModal(false)} type="button">Cancel</Button>
                  <Button variant="primary" disabled={inviting} type="submit">{inviting ? 'Inviting...' : 'Invite'}</Button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
