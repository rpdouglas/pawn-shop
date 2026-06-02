import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { updateDoc, doc, arrayUnion } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { Link } from 'react-router-dom'
import { db, functions } from '../../lib/firebase'
import { docToItem } from '../../hooks/useItems'
import { formatPrice } from '../../lib/format'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Badge from '../../components/ui/Badge'
import AiAssistantPanel from '../../components/admin/AiAssistantPanel'
import QuantityAdjustControl from '../../components/admin/QuantityAdjustControl'
import type { Item, ItemStatus } from '../../lib/types'

const STATUS_FILTERS: Array<{ value: 'all' | ItemStatus; label: string }> = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'draft',    label: 'Draft' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold',     label: 'Sold' },
]

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 767px)').matches)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>('all')

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

  const handleArchive = async (item: Item, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Archive "${item.title}"?`)) return
    try {
      await updateDoc(doc(db, 'items', item.id), { status: 'archived' })
    } catch (err) {
      alert(`Failed to archive: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (item: Item, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`PERMANENTLY delete "${item.title}"? This cannot be undone.`)) return
    try {
      setLoading(true)
      const deleteInventoryItem = httpsCallable<{ itemId: string }, { success: boolean }>(functions, 'deleteInventoryItem')
      await deleteInventoryItem({ itemId: item.id })
      if (selectedItem?.id === item.id) setSelectedItem(null)
    } catch (err) {
      alert(`Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
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

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
            Inventory
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
          }}>
            {items.length} item{items.length !== 1 ? 's' : ''} — most recent first
          </p>
        </header>

        {error && (
          <p role="alert" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            Error: {error}
          </p>
        )}

        {loading ? (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Loading inventory…</p>
        ) : isMobile ? (
          // ── Mobile card view ──────────────────────────────────────────────
          <div>
            {/* Search */}
            <input
              type="search"
              placeholder="Search items…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search inventory"
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '0 var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                marginBottom: 'var(--space-4)',
                boxSizing: 'border-box',
              }}
            />

            {/* Status filter chips */}
            <div
              role="group"
              aria-label="Filter by status"
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                overflowX: 'auto',
                paddingBottom: 'var(--space-2)',
                marginBottom: 'var(--space-6)',
              }}
            >
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  aria-pressed={statusFilter === f.value}
                  style={{
                    flexShrink: 0,
                    minHeight: '44px',
                    padding: '0 var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: statusFilter === f.value ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: statusFilter === f.value ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-small)',
                    cursor: 'pointer',
                    transition: `background-color var(--motion-speed-fast) var(--motion-easing), color var(--motion-speed-fast) var(--motion-easing)`,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Cards */}
            {filteredItems.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-12) 0' }}>
                No items match your search.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filteredItems.map(item => (
                  <li key={item.id} style={{ marginBottom: 'var(--space-4)' }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 'var(--space-4)',
                        padding: 'var(--space-4)',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        minHeight: '72px',
                        alignItems: 'center',
                      }}
                    >
                      {item.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt=""
                          aria-hidden="true"
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-sm)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-small)',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                          margin: '0 0 var(--space-2)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.title}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          <Badge variant={item.status} label={item.status} />
                          {item.policeHold && (
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', fontWeight: 'bold' }}>HOLD</span>
                          )}
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                            {item.viewTag}
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        {item.quantity !== undefined && (
                          <div style={{ marginTop: 'var(--space-3)' }}>
                            <QuantityAdjustControl
                              itemId={item.id}
                              quantity={item.quantity}
                              compact
                            />
                          </div>
                        )}
                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => handleArchive(item, e)}
                            style={{ padding: '0 var(--space-2)', minHeight: '32px' }}
                          >
                            Archive
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => handleDelete(item, e)}
                            style={{ padding: '0 var(--space-2)', minHeight: '32px', color: 'var(--color-error)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* FAB — sits above mobile nav bar */}
            <Link
              to="/admin/mobile-intake"
              aria-label="Add new item"
              style={{
                position: 'fixed',
                bottom: 'calc(var(--space-16) + var(--space-4))',
                right: 'var(--space-4)',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontSize: 'var(--text-subheading)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
                zIndex: 1000,
              }}
            >
              +
            </Link>
          </div>
        ) : (
          // ── Desktop table view (unchanged) ────────────────────────────────
          <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 340px' : '1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
            <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    {['Item', 'Status', 'View', 'Price', 'Condition', 'Stock', 'Actions'].map((col) => (
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
                      <td style={{ padding: 'var(--space-4)' }} onClick={e => e.stopPropagation()}>
                        {item.quantity !== undefined ? (
                          <QuantityAdjustControl
                            itemId={item.id}
                            quantity={item.quantity}
                            compact
                          />
                        ) : (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
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
                          <button
                            type="button"
                            onClick={(e) => handleArchive(item, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-text-muted)',
                              cursor: 'pointer',
                              fontSize: 'var(--text-small)',
                              padding: 'var(--space-2)',
                              minHeight: '48px'
                            }}
                          >
                            Archive
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-error)',
                              cursor: 'pointer',
                              fontSize: 'var(--text-small)',
                              padding: 'var(--space-2)',
                              minHeight: '48px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
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
