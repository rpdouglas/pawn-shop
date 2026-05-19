import React, { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import CustomerList from '../../../components/admin/crm/CustomerList'
import type { AuthUser } from '../../../lib/types'

const CrmDashboardPage: React.FC = () => {
  const [customers, setCustomers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For MVP, we query users ordered by lifetimeValue descending
    const q = query(
      collection(db, 'users'),
      orderBy('lifetimeValue', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AuthUser))
      setCustomers(docs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="space-y-8 animate-fade-up">
      <header>
        <h1 className="text-[var(--text-2xl)] font-display text-[var(--color-primary)]">CRM & Retention</h1>
        <p className="text-[var(--text-sm)] opacity-70">Manage VIP tiers, reseller status, and customer engagement.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
          <div className="text-[var(--text-xs)] uppercase tracking-wider opacity-60">Total Customers</div>
          <div className="text-[var(--text-3xl)] font-display mt-2">{customers.length}+</div>
        </div>
        <div className="p-6 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
          <div className="text-[var(--text-xs)] uppercase tracking-wider opacity-60">VIP Members</div>
          <div className="text-[var(--text-3xl)] font-display mt-2">
            {customers.filter(c => c.vipFlag).length}
          </div>
        </div>
        <div className="p-6 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
          <div className="text-[var(--text-xs)] uppercase tracking-wider opacity-60">Avg. Lifetime Value</div>
          <div className="text-[var(--text-3xl)] font-display mt-2">
            ${((customers.reduce((acc, c) => acc + (c.lifetimeValue || 0), 0) / (customers.length || 1)) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[var(--text-lg)] font-display text-[var(--color-primary)]">Top Customers</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center opacity-50">Loading customer data...</div>
        ) : (
          <CustomerList customers={customers} />
        )}
      </section>
    </div>
  )
}

export default CrmDashboardPage
