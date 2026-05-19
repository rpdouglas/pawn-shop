import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { docToItem } from '../../hooks/useItems'
import { formatPrice } from '../../lib/format'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Badge from '../../components/ui/Badge'
import AiAssistantPanel from '../../components/admin/AiAssistantPanel'
import { updateDoc, doc, arrayUnion } from 'firebase/firestore'
import type { Item } from '../../lib/types'

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const handleApplyDescription = async (draft: string) => {
    if (!selectedItem) return
    try {
      await updateDoc(doc(db, 'items', selectedItem.id), { description: draft })
      alert('Description promoted!')
    } catch {
      alert('Failed to promote description.')
    }
  }

  const handleApplyTags = async (tags: string[]) => {
    if (!selectedItem) return
    try {
      await updateDoc(doc(db, 'items', selectedItem.id), { 
        merchandisingTags: arrayUnion(...tags) 
      })
      alert('Tags applied!')
    } catch {
      alert('Failed to apply tags.')
    }
  }

  const handleApplyPrice = async (low: number, high: number) => {
    if (!selectedItem) return
    const midpoint = Math.floor((low + high) / 2)
    try {
      await updateDoc(doc(db, 'items', selectedItem.id), { price: midpoint })
      alert('Midpoint price applied!')
    } catch {
      alert('Failed to apply price.')
    }
  }

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
          <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 340px' : '1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
            <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    {['Item', 'Status', 'View', 'Price', 'Condition', 'Actions'].map((col) => (
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
                    <tr 
                      key={item.id} 
                      style={{ 
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: selectedItem?.id === item.id ? 'var(--color-highlight)' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    >
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>{item.title}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{item.category}</div>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <Badge variant={item.status} label={item.status} />
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
                      <td style={{ padding: 'var(--space-4)' }}>
                        <button 
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--color-primary)', 
                            cursor: 'pointer',
                            fontSize: 'var(--text-small)',
                            padding: 'var(--space-2)',
                            minHeight: '48px'
                          }}
                        >
                          {selectedItem?.id === item.id ? 'Close AI' : 'AI Help'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedItem && (
              <aside style={{ position: 'sticky', top: 'var(--space-8)' }}>
                <AiAssistantPanel 
                  item={selectedItem}
                  onApplyDescription={handleApplyDescription}
                  onApplyTags={handleApplyTags}
                  onApplyPrice={handleApplyPrice}
                />
              </aside>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
