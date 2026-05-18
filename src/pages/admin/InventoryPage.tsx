import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { docToItem } from '../../hooks/useItems'
import { formatPrice } from '../../lib/format'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Badge from '../../components/ui/Badge'
import type { Item } from '../../lib/types'

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Staff view: show all statuses, ordered by newest first
    const q = query(
      collection(db, 'items'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map(docToItem))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  return (
    <ProtectedRoute staffOnly>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)',
          }}>
            Inventory Management
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
          }}>
            Overview of all items across store views
          </p>
        </header>

        {error && (
          <p role="alert" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            Error: {error}
          </p>
        )}

        {loading ? (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Loading inventory…</p>
        ) : (
          <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  {['Item', 'Status', 'View', 'Price', 'Condition'].map((col) => (
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
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>{item.title}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{item.category}</div>
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <Badge variant={item.status === 'active' ? 'success' : 'secondary'}>
                        {item.status}
                      </Badge>
                      {item.policeHold && (
                        <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-error)', fontWeight: 'bold' }}>
                          HOLD
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-4)', textTransform: 'capitalize', fontSize: 'var(--text-small)' }}>
                      {item.viewTag}
                    </td>
                    <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-body)' }}>
                      {formatPrice(item.price)}
                    </td>
                    <td style={{ padding: 'var(--space-4)', textTransform: 'capitalize', fontSize: 'var(--text-small)' }}>
                      {item.condition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
