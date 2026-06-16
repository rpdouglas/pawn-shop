import { useState, useEffect, useMemo } from 'react'
import { collection, query, orderBy, limit, onSnapshot, serverTimestamp, deleteField } from 'firebase/firestore'
import { updateDoc, doc, arrayUnion } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { Link } from 'react-router-dom'
import { db, functions } from '../../lib/firebase'
import { docToItem } from '../../hooks/useItems'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import AiAssistantPanel from '../../components/admin/AiAssistantPanel'
import MarkdownConfigPanel from '../../components/admin/MarkdownConfigPanel'
import InventoryTable, { type GroupBy } from '../../components/admin/InventoryTable'
import InventoryCard from '../../components/admin/InventoryCard'
import type { Item, ItemStatus } from '../../lib/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LS_VIEW_MODE   = 'inventory:viewMode'
const LS_GROUP_BY    = 'inventory:groupBy'
const LS_STATUS      = 'inventory:statusFilter'
const LS_COLLAPSED   = 'inventory:collapsedGroups'

const STATUS_FILTERS: Array<{ value: 'all' | ItemStatus; label: string }> = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'draft',    label: 'Draft' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold',     label: 'Sold' },
  { value: 'deleted',  label: 'Recycle Bin' },
]

const GROUP_BY_OPTIONS: Array<{ value: GroupBy; label: string }> = [
  { value: 'viewTag',  label: 'View Tag' },
  { value: 'category', label: 'Category' },
  { value: 'status',   label: 'Status' },
  { value: 'none',     label: 'None' },
]

const GROUP_DISPLAY_ORDER: Partial<Record<GroupBy, Record<string, number>>> = {
  viewTag: { pawn: 0, cannabis: 1, fireworks: 2, tobacco: 3, other: 4 },
  status:  { draft: 0, active: 1, reserved: 2, sold: 3, archived: 4, deleted: 5 },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getItemGroupKey(item: Item, by: GroupBy): string {
  if (by === 'viewTag')  return item.viewTag  || 'other'
  if (by === 'category') return item.category || 'uncategorized'
  if (by === 'status')   return item.status
  return '__all__'
}

function formatGroupLabel(key: string): string {
  if (key === 'uncategorized') return 'Uncategorized'
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InventoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Persisted UI state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    const s = localStorage.getItem(LS_VIEW_MODE)
    return s === 'table' ? 'table' : 'grid'
  })
  const [groupBy, setGroupBy] = useState<GroupBy>(() => {
    const s = localStorage.getItem(LS_GROUP_BY)
    const valid: GroupBy[] = ['none', 'viewTag', 'category', 'status']
    return valid.includes(s as GroupBy) ? (s as GroupBy) : 'viewTag'
  })
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>(() => {
    const s = localStorage.getItem(LS_STATUS)
    const valid = ['all', 'active', 'draft', 'reserved', 'sold', 'deleted']
    return valid.includes(s ?? '') ? (s as 'all' | ItemStatus) : 'all'
  })
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem(LS_COLLAPSED)
      return s ? new Set(JSON.parse(s) as string[]) : new Set<string>()
    } catch {
      return new Set<string>()
    }
  })

  // Persist on change
  useEffect(() => { localStorage.setItem(LS_VIEW_MODE, viewMode) }, [viewMode])
  useEffect(() => { localStorage.setItem(LS_GROUP_BY, groupBy) }, [groupBy])
  useEffect(() => { localStorage.setItem(LS_STATUS, statusFilter) }, [statusFilter])
  useEffect(() => {
    localStorage.setItem(LS_COLLAPSED, JSON.stringify([...collapsedGroups]))
  }, [collapsedGroups])

  // ---------------------------------------------------------------------------
  // Stat strip counts (full dataset, not filtered)
  // ---------------------------------------------------------------------------

  const totalActive   = useMemo(() => items.filter(i => i.status === 'active').length,   [items])
  const totalReserved = useMemo(() => items.filter(i => i.status === 'reserved').length, [items])
  const totalDraft    = useMemo(() => items.filter(i => i.status === 'draft').length,    [items])
  const totalItems    = useMemo(() => items.filter(i => i.status !== 'deleted').length,  [items])

  // ---------------------------------------------------------------------------
  // AI apply handlers (table mode)
  // ---------------------------------------------------------------------------

  const handleApplyTitle = async (title: string, itemId?: string) => {
    const id = itemId ?? selectedItem?.id
    if (!id) return
    try {
      await updateDoc(doc(db, 'items', id), { title })
    } catch { /* silent */ }
  }

  const handleApplyCategory = async (category: string, itemId?: string) => {
    const id = itemId ?? selectedItem?.id
    if (!id) return
    try {
      await updateDoc(doc(db, 'items', id), { category })
    } catch { /* silent */ }
  }

  const handleApplyDescription = async (draft: string, itemId?: string) => {
    const id = itemId ?? selectedItem?.id
    if (!id) return
    try {
      await updateDoc(doc(db, 'items', id), { description: draft })
    } catch { /* silent */ }
  }

  const handleApplyTags = async (tags: string[], itemId?: string) => {
    const id = itemId ?? selectedItem?.id
    if (!id) return
    try {
      await updateDoc(doc(db, 'items', id), { merchandisingTags: arrayUnion(...tags) })
    } catch { /* silent */ }
  }

  const handleApplyPrice = async (low: number, high: number, itemId?: string) => {
    const id = itemId ?? selectedItem?.id
    if (!id) return
    const midpoint = Math.floor((low + high) / 2)
    try {
      await updateDoc(doc(db, 'items', id), { price: midpoint })
    } catch { /* silent */ }
  }

  // ---------------------------------------------------------------------------
  // Bulk operations (table mode batch action bar)
  // ---------------------------------------------------------------------------

  const handleBulkDelete = async (itemIds: string[]) => {
    await Promise.all(
      itemIds.map(id =>
        updateDoc(doc(db, 'items', id), { status: 'deleted', deletedAt: serverTimestamp() }),
      ),
    )
  }

  const handleBulkRestore = async (itemIds: string[]) => {
    await Promise.all(
      itemIds.map(id =>
        updateDoc(doc(db, 'items', id), { status: 'draft', deletedAt: deleteField() }),
      ),
    )
  }

  const handleEmptyRecycleBin = async () => {
    if (!window.confirm('Permanently delete all items in the Recycle Bin? This cannot be undone.')) return
    try {
      setLoading(true)
      const clearRecycleBin = httpsCallable(functions, 'clearRecycleBin')
      await clearRecycleBin()
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Firestore listener
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'), limit(500))
    const unsubscribe = onSnapshot(
      q,
      snap => {
        setItems(snap.docs.map(docToItem))
        setLoading(false)
      },
      err => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [])

  // ---------------------------------------------------------------------------
  // Filtered + grouped items
  // ---------------------------------------------------------------------------

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
    if (statusFilter !== 'deleted' && item.status === 'deleted') return false
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Groups for grid mode (memoised)
  const gridGroups = useMemo(() => {
    if (groupBy === 'none') return null

    const map = new Map<string, Item[]>()
    for (const item of filteredItems) {
      const key = getItemGroupKey(item, groupBy)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }

    const order = GROUP_DISPLAY_ORDER[groupBy] ?? {}
    const keys = [...map.keys()].sort(
      (a, b) => (order[a] ?? 999) - (order[b] ?? 999) || a.localeCompare(b),
    )
    return keys.map(k => ({ key: k, items: map.get(k)! }))
  }, [filteredItems, groupBy])

  const toggleCollapsed = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const accentLabel = statusFilter === 'all'
    ? 'All'
    : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)

  return (
    <ProtectedRoute staffOnly>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <header style={{ marginBottom: 'var(--space-6)' }}>
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
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
            Loading inventory…
          </p>
        ) : (
          <div>
            {/* ── Stat strip ─────────────────────────────── */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--gmc-bg-surface)',
              border: '1px solid var(--gmc-border-default)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: 'var(--space-4)',
            }}>
              {([
                { label: 'ACTIVE',   value: totalActive,   color: 'var(--gmc-status-active)'   },
                { label: 'RESERVED', value: totalReserved, color: 'var(--gmc-status-reserved)' },
                { label: 'DRAFT',    value: totalDraft,    color: 'var(--gmc-text-muted)'       },
                { label: 'TOTAL',    value: totalItems,    color: 'var(--gmc-gold-primary)'     },
              ] as const).map((stat, i, arr) => (
                <div key={stat.label} style={{
                  flex: 1,
                  padding: 'var(--space-3) var(--space-2)',
                  textAlign: 'center',
                  borderRight: i < arr.length - 1 ? '1px solid var(--gmc-border-default)' : 'none',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-subheading)',
                    color: stat.value > 0 ? stat.color : 'var(--gmc-text-disabled)',
                    lineHeight: 1,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--gmc-text-muted)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginTop: 'var(--space-1)',
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Search with icon ───────────────────────── */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text-muted)',
                  pointerEvents: 'none',
                }}
              >
                🔍
              </span>
              <input
                type="search"
                placeholder="Search items…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search inventory"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  padding: '0 var(--space-4) 0 calc(var(--space-6) + var(--space-2))',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* ── Toolbar row ────────────────────────────── */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}>
              {/* Status filter chips */}
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
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${statusFilter === f.value ? 'var(--gmc-gold-dim)' : 'var(--color-border)'}`,
                      backgroundColor: statusFilter === f.value ? 'var(--gmc-gold-subtle)' : 'transparent',
                      color: statusFilter === f.value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: statusFilter === f.value ? 700 : 400,
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Right-side controls */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, alignItems: 'center' }}>
                {/* Group by */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                }}>
                  Group by
                  <select
                    value={groupBy}
                    onChange={e => setGroupBy(e.target.value as GroupBy)}
                    aria-label="Group inventory by"
                    style={{
                      minHeight: '36px',
                      padding: '0 var(--space-3)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      cursor: 'pointer',
                    }}
                  >
                    {GROUP_BY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>

                {/* View mode toggle */}
                <div
                  role="group"
                  aria-label="View mode"
                  style={{
                    display: 'flex',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                  }}
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
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      padding: 'var(--space-2) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: 'var(--text-small)',
                    }}
                  >
                    Empty Recycle Bin
                  </button>
                )}
              </div>
            </div>

            {/* ── Section accent bar ─────────────────────── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-3)',
            }}>
              <div
                aria-hidden="true"
                style={{
                  width: '3px',
                  height: 'var(--space-3)',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '2px',
                  flexShrink: 0,
                }}
              />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-primary)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}>
                {accentLabel} · {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* ---- Table View ---- */}
            {viewMode === 'table' && (
              <InventoryTable
                items={filteredItems}
                isAdmin={user?.isAdmin ?? false}
                groupBy={groupBy}
                onApplyTitle={(id, title) => handleApplyTitle(title, id)}
                onApplyCategory={(id, category) => handleApplyCategory(category, id)}
                onApplyDescription={(id, draft) => handleApplyDescription(draft, id)}
                onApplyTags={(id, tags) => handleApplyTags(tags, id)}
                onApplyPrice={(id, low, high) => handleApplyPrice(low, high, id)}
                onBulkDelete={handleBulkDelete}
                onBulkRestore={handleBulkRestore}
                showRestoreAction={statusFilter === 'deleted'}
              />
            )}

            {/* ---- Grid View ---- */}
            {viewMode === 'grid' && (
              filteredItems.length === 0 ? (
                <p style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: 'var(--space-12) 0',
                }}>
                  No items match your search.
                </p>
              ) : gridGroups !== null ? (
                /* Grouped grid */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                  {gridGroups.map(({ key, items: groupItems }) => {
                    const isCollapsed = collapsedGroups.has(key)
                    return (
                      <section key={key}>
                        <button
                          type="button"
                          onClick={() => toggleCollapsed(key)}
                          aria-expanded={!isCollapsed}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            width: '100%',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            borderBottom: '1px solid var(--color-border)',
                            paddingBottom: 'var(--space-2)',
                            marginBottom: 'var(--space-4)',
                            cursor: 'pointer',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--color-text-muted)',
                              display: 'inline-block',
                              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                              transition: `transform var(--motion-speed-fast) var(--motion-easing)`,
                            }}
                          >
                            ▼
                          </span>
                          <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'var(--text-lg)',
                            color: 'var(--color-primary)',
                            margin: 0,
                            textTransform: 'capitalize',
                            flex: 1,
                          }}>
                            {formatGroupLabel(key)}
                          </h2>
                          <span style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                            backgroundColor: 'var(--color-surface)',
                            padding: `2px var(--space-2)`,
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                          }}>
                            {groupItems.length}
                          </span>
                        </button>

                        {!isCollapsed && (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: 'var(--space-4)',
                          }}>
                            {groupItems.map(item => (
                              <InventoryCard
                                key={item.id}
                                item={item}
                                onOpenDrawer={setSelectedItem}
                              />
                            ))}
                          </div>
                        )}
                      </section>
                    )
                  })}
                </div>
              ) : (
                /* Flat grid (groupBy === 'none') */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 'var(--space-4)',
                }}>
                  {filteredItems.map(item => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      onOpenDrawer={setSelectedItem}
                    />
                  ))}
                </div>
              )
            )}

            {/* ---- AI Assistant Drawer (grid mode) ---- */}
            {selectedItem && viewMode === 'grid' && (
              <>
                <div
                  style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999,
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
                  animation: 'slideInRight 0.3s ease-out',
                }}>
                  <div style={{
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'var(--color-bg)',
                    zIndex: 10,
                  }}>
                    <div>
                      <h2 style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                        AI Assistant
                      </h2>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0, marginTop: 'var(--space-1)' }}>
                        {selectedItem.title}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      style={{ background: 'none', border: 'none', fontSize: 'var(--text-lg)', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                      aria-label="Close AI assistant"
                    >
                      &times;
                    </button>
                  </div>
                  <div style={{ padding: 'var(--space-4)' }}>
                    <AiAssistantPanel
                      item={selectedItem}
                      onApplyTitle={handleApplyTitle}
                      onApplyCategory={handleApplyCategory}
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
