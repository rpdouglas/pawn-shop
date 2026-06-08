import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, serverTimestamp, deleteField } from 'firebase/firestore'
import { updateDoc, doc, arrayUnion } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { Link } from 'react-router-dom'
import { db, functions } from '../../lib/firebase'
import { docToItem } from '../../hooks/useItems'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../lib/format'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Badge from '../../components/ui/Badge'
import AiAssistantPanel from '../../components/admin/AiAssistantPanel'
import MarkdownConfigPanel from '../../components/admin/MarkdownConfigPanel'
import QuantityAdjustControl from '../../components/admin/QuantityAdjustControl'
import InventoryTable from '../../components/admin/InventoryTable'
import type { Item, ItemStatus } from '../../lib/types'

const STATUS_FILTERS: Array<{ value: 'all' | ItemStatus; label: string }> = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'draft',    label: 'Draft' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold',     label: 'Sold' },
  { value: 'deleted',  label: 'Recycle Bin' },
]

export default function InventoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const handleApplyDescription = async (draft: string, itemId?: string) => {
    const id = itemId ?? selectedItem?.id
    if (!id) return
    try {
      await updateDoc(doc(db, 'items', id), { description: draft })
      alert('Description promoted!')
    } catch {
      alert('Failed to promote description.')
    }
  }

  const handleApplyTags = async (tags: string[], itemId?: string) => {
    const id = itemId ?? selectedItem?.id
    if (!id) return
    try {
      await updateDoc(doc(db, 'items', id), { merchandisingTags: arrayUnion(...tags) })
      alert('Tags applied!')
    } catch {
      alert('Failed to apply tags.')
    }
  }

  const handleApplyPrice = async (low: number, high: number, itemId?: string) => {
    const id = itemId ?? selectedItem?.id
    if (!id) return
    const midpoint = Math.floor((low + high) / 2)
    try {
      await updateDoc(doc(db, 'items', id), { price: midpoint })
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
    if (!window.confirm(`Move "${item.title}" to the Recycle Bin?`)) return
    try {
      await updateDoc(doc(db, 'items', item.id), { status: 'deleted', deletedAt: serverTimestamp() })
      if (selectedItem?.id === item.id) setSelectedItem(null)
    } catch (err) {
      alert(`Failed to move to recycle bin: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleRestore = async (item: Item, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateDoc(doc(db, 'items', item.id), { status: 'draft', deletedAt: deleteField() })
    } catch (err) {
      alert(`Failed to restore: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleEmptyRecycleBin = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all items in the Recycle Bin? This cannot be undone.")) return
    try {
      setLoading(true)
      const clearRecycleBin = httpsCallable(functions, 'clearRecycleBin')
      await clearRecycleBin()
      alert('Recycle Bin emptied.')
    } catch (err) {
      alert(`Failed to empty recycle bin: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }


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
    
    if (statusFilter !== 'deleted' && item.status === 'deleted') return false
    
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
        ) : (
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <div
                role="group"
                aria-label="Filter by status"
                style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  overflowX: 'auto',
                  paddingBottom: 'var(--space-2)',
                  flex: 1,
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
              
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                {/* View mode toggle */}
                <div
                  role="group"
                  aria-label="View mode"
                  style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
                >
                  {(['grid', 'table'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      aria-pressed={viewMode === mode}
                      style={{
                        minHeight: '36px',
                        padding: '0 var(--space-3)',
                        border: 'none',
                        backgroundColor: viewMode === mode ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: viewMode === mode ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-xs)',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {mode === 'grid' ? '⊞ Grid' : '☰ Table'}
                    </button>
                  ))}
                </div>

                {statusFilter === 'deleted' && user?.isAdmin && (
                  <button
                    onClick={handleEmptyRecycleBin}
                    style={{
                      backgroundColor: 'var(--color-error)',
                      color: 'white',
                      border: 'none',
                      padding: 'var(--space-2) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: 'var(--text-small)'
                    }}
                  >
                    Empty Recycle Bin
                  </button>
                )}
              </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <InventoryTable
                items={filteredItems}
                isAdmin={user?.isAdmin ?? false}
                onApplyDescription={(id, draft) => handleApplyDescription(draft, id)}
                onApplyTags={(id, tags) => handleApplyTags(tags, id)}
                onApplyPrice={(id, low, high) => handleApplyPrice(low, high, id)}
              />
            )}

            {/* Grouped Grid View */}
            {viewMode === 'grid' && filteredItems.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-12) 0' }}>
                No items match your search.
              </p>
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                {['pawn', 'cannabis', 'fireworks', 'other'].map(group => {
                  const groupItems = filteredItems.filter(item => {
                    if (group === 'other') return !['pawn', 'cannabis', 'fireworks'].includes(item.viewTag || '');
                    return item.viewTag === group;
                  })

                  if (groupItems.length === 0) return null;

                  return (
                    <section key={group}>
                      <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-lg)',
                        color: 'var(--color-primary)',
                        marginBottom: 'var(--space-4)',
                        textTransform: 'capitalize',
                        borderBottom: '1px solid var(--color-border)',
                        paddingBottom: 'var(--space-2)'
                      }}>
                        {group} Inventory
                      </h2>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 'var(--space-4)'
                      }}>
                        {groupItems.map(item => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              padding: 'var(--space-4)',
                              backgroundColor: 'var(--color-surface)',
                              borderRadius: 'var(--radius-md)',
                              border: selectedItem?.id === item.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              position: 'relative'
                            }}
                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                          >
                            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                              {item.images?.[0] ? (
                                <img
                                  src={item.images[0]}
                                  alt=""
                                  aria-hidden="true"
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: 'var(--radius-sm)',
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
                                <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
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
                                    {item.condition || 'Unknown Condition'}
                                  </span>
                                </div>
                                <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-md)', fontWeight: 'bold', color: 'var(--color-text)' }}>
                                  {formatPrice(item.price)}
                                </div>
                              </div>
                            </div>
                            
                            <div onClick={e => e.stopPropagation()} style={{ marginBottom: 'var(--space-4)' }}>
                              {item.quantity !== undefined ? (
                                <QuantityAdjustControl
                                  itemId={item.id}
                                  quantity={item.quantity}
                                  compact
                                />
                              ) : (
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No stock tracking</span>
                              )}
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                              <Link
                                to={`/admin/mobile-intake/edit/${item.id}`}
                                className="btn btn-secondary btn-sm"
                                onClick={(e) => e.stopPropagation()}
                                style={{ padding: '0 var(--space-2)', minHeight: '32px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                              >
                                Edit
                              </Link>
                              {item.status === 'deleted' ? (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={(e) => handleRestore(item, e)}
                                  style={{ padding: '0 var(--space-2)', minHeight: '32px', color: 'var(--color-primary)' }}
                                >
                                  Restore
                                </button>
                              ) : (
                                <>
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
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            ) : null}

            {/* AI Assistant Drawer */}
            {selectedItem && (
              <>
                <div 
                  style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
                  }}
                  onClick={() => setSelectedItem(null)}
                />
                <aside style={{ 
                  position: 'fixed', 
                  top: 0, right: 0, bottom: 0, 
                  width: '400px', 
                  maxWidth: '100vw',
                  backgroundColor: 'var(--color-bg)',
                  boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
                  zIndex: 1000,
                  overflowY: 'auto',
                  borderLeft: '1px solid var(--color-border)',
                  animation: 'slideInRight 0.3s ease-out'
                }}>
                  <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--color-bg)', zIndex: 10 }}>
                    <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'bold', color: 'var(--color-text)' }}>AI Assistant</h2>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      style={{ background: 'none', border: 'none', fontSize: 'var(--text-lg)', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                      &times;
                    </button>
                  </div>
                  <div style={{ padding: 'var(--space-4)' }}>
                    <AiAssistantPanel
                      item={selectedItem}
                      onApplyDescription={handleApplyDescription}
                      onApplyTags={handleApplyTags}
                      onApplyPrice={handleApplyPrice}
                    />
                    <MarkdownConfigPanel
                      item={selectedItem}
                      onConfigured={() => {}}
                    />
                  </div>
                </aside>
              </>
            )}

            {/* FAB */}
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
                zIndex: 900,
              }}
            >
              +
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
