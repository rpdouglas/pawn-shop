import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import { docToItem } from '../../hooks/useItems'
import { formatPrice } from '../../lib/format'
import type { Item, ViewType } from '../../lib/types'

const updateMerchandisingTagsFn = httpsCallable<
  { itemId: string; tag: string; action: 'add' | 'remove'; curatorNote?: string },
  { success: boolean }
>(functions, 'updateMerchandisingTags')

const VIEW_OPTIONS: { value: ViewType; label: string }[] = [
  { value: 'pawn',      label: 'Pawn' },
  { value: 'cannabis',  label: 'Cannabis' },
  { value: 'fireworks', label: 'Fireworks' },
]

function useAdminItems(viewTag: ViewType): { items: Item[]; loading: boolean } {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'items'),
      where('viewTag', '==', viewTag),
      where('status', '==', 'active'),
      where('policeHold', '==', false),
      orderBy('createdAt', 'desc'),
      limit(100),
    )

    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map(docToItem))
        setLoading(false)
      },
      () => setLoading(false),
    )
  }, [viewTag])

  return { items, loading }
}

interface PickRowProps {
  item: Item
  onToggle: (item: Item, note: string) => Promise<void>
  toggling: boolean
}

function PickRow({ item, onToggle, toggling }: PickRowProps) {
  const isPick = item.merchandisingTags?.includes('staff-pick') ?? false
  const [note, setNote] = useState(item.staffPickNote ?? '')
  const [expanded, setExpanded] = useState(false)

  return (
    <tr className={isPick ? 'staff-picks-row--active' : undefined}>
      <td>
        {item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
          />
        ) : (
          <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }} />
        )}
      </td>
      <td>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-body)', color: 'var(--color-text)', margin: 0 }}>
          {item.title}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
          {formatPrice(item.price)}
        </p>
      </td>
      <td>
        <span
          className={`badge ${isPick ? 'badge-active' : 'badge-draft'}`}
          aria-label={isPick ? 'Currently a staff pick' : 'Not a staff pick'}
        >
          {isPick ? '★ Staff Pick' : 'Not picked'}
        </span>
      </td>
      <td>
        {isPick ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
            >
              {expanded ? 'Hide note' : (item.staffPickNote ? 'Edit note' : 'Add note')}
            </button>
            {expanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label className="input-label" htmlFor={`note-${item.id}`}>
                  Curator note — brand voice, first person, max 280 chars
                </label>
                <textarea
                  id={`note-${item.id}`}
                  className="input-field"
                  rows={3}
                  maxLength={280}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What makes this piece worth your attention…"
                  style={{ resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)' }}
                />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {note.length}/280
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => { void onToggle(item, note); setExpanded(false) }}
                  disabled={toggling}
                >
                  Save note
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label className="input-label" htmlFor={`note-add-${item.id}`}>
              Curator note (optional)
            </label>
            <textarea
              id={`note-add-${item.id}`}
              className="input-field"
              rows={2}
              maxLength={280}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What makes this piece exceptional…"
              style={{ resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)' }}
            />
          </div>
        )}
      </td>
      <td>
        <button
          type="button"
          className={`btn btn-sm ${isPick ? 'btn-ghost' : 'btn-primary'}`}
          onClick={() => void onToggle(item, note)}
          disabled={toggling}
          aria-busy={toggling}
          style={isPick ? { color: 'var(--color-danger)', borderColor: 'var(--color-danger)' } : undefined}
        >
          {toggling ? '…' : isPick ? 'Remove pick' : 'Add as pick'}
        </button>
      </td>
    </tr>
  )
}

export default function StaffPicksManager() {
  const [activeView, setActiveView] = useState<ViewType>('pawn')
  const { items, loading } = useAdminItems(activeView)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async (item: Item, note: string): Promise<void> => {
    const isPick = item.merchandisingTags?.includes('staff-pick') ?? false
    setTogglingId(item.id)
    setError(null)
    try {
      await updateMerchandisingTagsFn({
        itemId: item.id,
        tag: 'staff-pick',
        action: isPick ? 'remove' : 'add',
        curatorNote: note.trim() || undefined,
      })
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Failed — please try again')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="staff-picks-manager">
      <h1 className="serial-manager-heading">Staff Picks</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
        Handpick items for the Staff Picks section. Add a curator note in your own voice.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
        {VIEW_OPTIONS.map((v) => (
          <button
            key={v.value}
            type="button"
            className={`btn btn-sm ${activeView === v.value ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveView(v.value)}
            aria-pressed={activeView === v.value}
          >
            {v.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="input-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </p>
      )}

      {loading && (
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          Loading…
        </p>
      )}

      {!loading && items.length === 0 && (
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          No active items in the {activeView} view.
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="table-wrapper">
          <table className="table" aria-label={`${activeView} items — staff picks management`}>
            <thead>
              <tr>
                <th><span className="sr-only">Image</span></th>
                <th>Item</th>
                <th>Status</th>
                <th>Curator note</th>
                <th><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <PickRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  toggling={togglingId === item.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

