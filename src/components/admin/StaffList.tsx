import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import type { StaffMember, StaffRole } from '../../lib/types'
import Badge from '../ui/Badge'

const getStaffMembersFn = httpsCallable<unknown, { staff: StaffMember[] }>(functions, 'getStaffMembers')
const assignRoleFn = httpsCallable<{ uid: string; role: StaffRole }, { success: boolean }>(functions, 'assignRole')

const ROLES: StaffRole[] = ['admin', 'manager', 'inventory_staff', 'marketing_staff', 'customer']

export default function StaffList() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUid, setUpdatingUid] = useState<string | null>(null)

  useEffect(() => {
    getStaffMembersFn()
      .then(res => {
        setStaff(res.data.staff)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleRoleChange = async (uid: string, newRole: StaffRole) => {
    setUpdatingUid(uid)
    try {
      await assignRoleFn({ uid, role: newRole })
      setStaff(prev => prev.map(s => s.uid === uid ? { ...s, role: newRole } : s))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setUpdatingUid(null)
    }
  }

  if (loading) return <p style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Loading staff...</p>
  if (error) return <p style={{ padding: 'var(--space-4)', color: 'var(--color-error)' }}>Error: {error}</p>

  return (
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
          {staff.map((member) => (
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
                  disabled={updatingUid === member.uid}
                  onChange={(e) => handleRoleChange(member.uid, e.target.value as StaffRole)}
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
