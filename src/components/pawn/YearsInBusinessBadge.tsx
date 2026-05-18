import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { ShopInfo } from '../../lib/types'

export default function YearsInBusinessBadge() {
  const [years, setYears] = useState<number | null>(null)

  useEffect(() => {
    getDoc(doc(db, 'config', 'shopInfo'))
      .then((snap) => {
        if (!snap.exists()) return
        const data = snap.data() as ShopInfo
        if (typeof data.foundedYear === 'number' && data.foundedYear > 0) {
          setYears(new Date().getFullYear() - data.foundedYear)
        }
      })
      .catch(() => { /* non-critical — badge simply stays hidden */ })
  }, [])

  if (years === null || years <= 0) return null

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-5)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-primary)',
      }}
      aria-label={`${years} years serving Akwesasne`}
    >
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-heading)',
        color: 'var(--color-primary)',
        fontWeight: 700,
        lineHeight: 1,
      }}>
        {years}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        color: 'var(--color-text)',
        lineHeight: 1.3,
      }}>
        years serving<br />Akwesasne
      </span>
    </div>
  )
}
