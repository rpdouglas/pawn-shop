import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import TierControls from '../../../components/admin/crm/TierControls'
import RoleControls from '../../../components/admin/crm/RoleControls'
import { useAuth } from '../../../context/AuthContext'
import type { AuthUser } from '../../../lib/types'

const CustomerDetailPage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const unsubscribe = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        setUser({ uid: snap.id, ...snap.data() } as AuthUser)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [uid])

  if (loading) return <div className="p-12 text-center opacity-50">Loading profile...</div>
  if (!user) return <div className="p-12 text-center">Customer not found. <Link to="/admin/crm" className="text-[var(--color-primary)] underline">Back to list</Link></div>

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <Link to="/admin/crm" className="text-[var(--text-xs)] text-[var(--color-primary)] hover:underline">← Back to CRM</Link>
          <h1 className="text-[var(--text-3xl)] font-display text-[var(--color-primary)]">{user.displayName || 'Anonymous Customer'}</h1>
          <div className="flex items-center gap-4 text-[var(--text-sm)] opacity-60">
            <span>{user.email}</span>
            <span>•</span>
            <span>Joined {user.createdAt ? (user.createdAt as unknown as Timestamp).toDate().toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="p-6 rounded-lg border border-[var(--color-primary)]/20 space-y-4">
            <h2 className="text-[var(--text-lg)] font-display text-[var(--color-primary)]">Purchase History</h2>
            {user.purchaseHistory && user.purchaseHistory.length > 0 ? (
              <ul className="space-y-2">
                {user.purchaseHistory.map((itemId, i) => (
                  <li key={i} className="text-[var(--text-sm)] p-2 rounded bg-[var(--color-primary)]/5 flex justify-between">
                    <span>Item ID: {itemId}</span>
                    <span className="opacity-50"># {i + 1}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--text-sm)] opacity-50 italic">No purchases yet.</p>
            )}
          </section>

          <section className="p-6 rounded-lg border border-[var(--color-primary)]/20 space-y-4">
            <h2 className="text-[var(--text-lg)] font-display text-[var(--color-primary)]">Pawn Inquiries</h2>
            {user.inquiryHistory && user.inquiryHistory.length > 0 ? (
              <ul className="space-y-2">
                {user.inquiryHistory.map((requestId, i) => (
                  <li key={i} className="text-[var(--text-sm)] p-2 rounded bg-[var(--color-primary)]/5 flex justify-between">
                    <span>Request ID: {requestId}</span>
                    <span className="opacity-50"># {i + 1}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--text-sm)] opacity-50 italic">No pawn inquiries yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <TierControls user={user} />
          {currentUser?.isAdmin && <RoleControls user={user} />}
          
          <div className="p-6 rounded-lg border border-[var(--color-primary)]/20 space-y-4">
            <h3 className="text-[var(--text-xs)] uppercase tracking-wider opacity-60">Engagement Score</h3>
            <div className="flex items-end gap-2">
              <span className="text-[var(--text-3xl)] font-display leading-none">
                {(user.purchaseHistory?.length || 0) * 10 + (user.inquiryHistory?.length || 0) * 5}
              </span>
              <span className="text-[var(--text-xs)] opacity-60 mb-1">points</span>
            </div>
            <p className="text-[var(--text-xs)] opacity-50">
              10 pts per purchase, 5 pts per enquiry.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CustomerDetailPage
