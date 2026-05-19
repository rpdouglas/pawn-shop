import React from 'react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '../../../lib/types'

interface CustomerListProps {
  customers: AuthUser[]
}

const CustomerList: React.FC<CustomerListProps> = ({ customers }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-primary)]/20">
      <table className="w-full text-left text-[var(--text-body)]">
        <thead className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] uppercase text-[var(--text-xs)] tracking-wider">
          <tr>
            <th className="px-6 py-3">Customer</th>
            <th className="px-6 py-3">Tier / VIP</th>
            <th className="px-6 py-3 text-right">Lifetime Value</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-primary)]/10">
          {customers.map((c) => (
            <tr key={c.uid} className="hover:bg-[var(--color-primary)]/5 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium">{c.displayName || 'Anonymous'}</div>
                <div className="text-[var(--text-xs)] opacity-60">{c.email}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {c.vipFlag && (
                    <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[var(--text-xs)] font-bold border border-gold/30">
                      VIP
                    </span>
                  )}
                  {c.resellerTier && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-[var(--text-xs)] font-bold border border-[var(--color-primary)]/30">
                      {c.resellerTier.toUpperCase()}
                    </span>
                  )}
                  {!c.vipFlag && !c.resellerTier && <span className="opacity-40 text-[var(--text-xs)]">—</span>}
                </div>
              </td>
              <td className="px-6 py-4 text-right tabular-nums">
                ${((c.lifetimeValue || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/admin/crm/${c.uid}`}
                  className="inline-flex items-center px-3 py-1 rounded border border-[var(--color-primary)] text-[var(--color-primary)] text-[var(--text-xs)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg)] transition-colors"
                >
                  View Profile
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CustomerList
