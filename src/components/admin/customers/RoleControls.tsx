import React, { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../../lib/firebase'
import type { AuthUser, StaffRole } from '../../../lib/types'

interface RoleControlsProps {
  user: AuthUser
}

const ROLES: StaffRole[] = ['admin', 'manager', 'inventory_staff', 'marketing_staff', 'customer']

const RoleControls: React.FC<RoleControlsProps> = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assignRole = async (role: StaffRole) => {
    setLoading(true)
    setError(null)
    try {
      const assignRoleFn = httpsCallable(functions, 'assignRole')
      await assignRoleFn({ uid: user.uid, role })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 space-y-4">
      <h3 className="text-[var(--text-md)] font-display text-[var(--color-primary)] uppercase tracking-wider">
        Role & Permissions
      </h3>
      <p className="text-[var(--text-xs)] opacity-60">
        Update this user's core platform access level.
      </p>

      <select
        className="w-full bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-sm p-2 text-[var(--text-sm)]"
        value={user.role || 'customer'}
        disabled={loading}
        onChange={(e) => assignRole(e.target.value as StaffRole)}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      {error && <div className="text-red-500 text-[var(--text-xs)]">{error}</div>}
      {loading && <div className="text-[var(--text-xs)] opacity-50 animate-pulse">Updating role...</div>}
    </div>
  )
}

export default RoleControls
