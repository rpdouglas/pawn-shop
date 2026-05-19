import React, { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../../lib/firebase'
import type { AuthUser, ResellerTier } from '../../../lib/types'

interface TierControlsProps {
  user: AuthUser
}

const TierControls: React.FC<TierControlsProps> = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleVip = async () => {
    setLoading(true)
    setError(null)
    try {
      const assignVipStatus = httpsCallable(functions, 'assignVipStatus')
      await assignVipStatus({ targetUid: user.uid, vipFlag: !user.vipFlag })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const setTier = async (tier: ResellerTier | null) => {
    setLoading(true)
    setError(null)
    try {
      const updateResellerTier = httpsCallable(functions, 'updateResellerTier')
      await updateResellerTier({ targetUid: user.uid, tier })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 space-y-6">
      <h3 className="text-[var(--text-md)] font-display text-[var(--color-primary)] uppercase tracking-wider">
        Tier Management
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold">VIP Status</div>
            <div className="text-[var(--text-xs)] opacity-60">Grant priority access and exclusive alerts</div>
          </div>
          <button
            onClick={toggleVip}
            disabled={loading}
            className={`px-4 py-2 rounded font-bold text-[var(--text-sm)] transition-colors ${
              user.vipFlag
                ? 'bg-gold text-black hover:bg-gold/80'
                : 'border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg)]'
            }`}
          >
            {user.vipFlag ? 'Active VIP' : 'Make VIP'}
          </button>
        </div>

        <div className="space-y-2">
          <div className="font-bold">Reseller Tier</div>
          <div className="flex gap-2">
            {(['bronze', 'silver', 'gold'] as ResellerTier[]).map((t) => (
              <button
                key={t}
                onClick={() => setTier(user.resellerTier === t ? null : t)}
                disabled={loading}
                className={`flex-1 px-3 py-2 rounded text-[var(--text-xs)] font-bold border transition-colors ${
                  user.resellerTier === t
                    ? 'bg-[var(--color-primary)] text-[var(--color-bg)] border-[var(--color-primary)]'
                    : 'border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:border-[var(--color-primary)]'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-[var(--text-xs)]">{error}</div>}
      {loading && <div className="text-[var(--text-xs)] opacity-50 animate-pulse">Updating status...</div>}
    </div>
  )
}

export default TierControls
