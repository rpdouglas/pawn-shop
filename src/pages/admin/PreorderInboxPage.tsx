import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import type { Preorder, PreorderStatus } from '../../lib/types'

function docToPreorder(doc: { id: string; data: () => Record<string, unknown> }): Preorder {
  const d = doc.data()
  return {
    id: doc.id,
    uid:           String(d['uid'] ?? ''),
    itemId:        String(d['itemId'] ?? ''),
    status:        (d['status'] as PreorderStatus) ?? 'pending',
    quantity:      Number(d['quantity'] ?? 1),
    customerName:  String(d['customerName'] ?? ''),
    customerPhone: String(d['customerPhone'] ?? ''),
    viewTag:       'fireworks',
    pickupWindow:  d['pickupWindow'] != null ? String(d['pickupWindow']) : undefined,
    smsDeliveredAt: d['smsDeliveredAt'] != null
      ? (d['smsDeliveredAt'] as { toDate(): Date }).toDate()
      : null,
    campaignId: d['campaignId'] != null ? String(d['campaignId']) : undefined,
    staffNotes: d['staffNotes'] != null ? String(d['staffNotes']) : undefined,
    createdAt:  (d['createdAt'] as { toDate(): Date }).toDate(),
  }
}

const STATUS_LABELS: Record<PreorderStatus, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  ready:     'Ready',
  collected: 'Collected',
  cancelled: 'Cancelled',
}

const confirmPreorderFn    = httpsCallable<{ preorderId: string }, { success: boolean }>(functions, 'confirmPreorder')
const markPreorderReadyFn  = httpsCallable<{ preorderId: string; pickupWindow: string }, { success: boolean }>(functions, 'markPreorderReady')
const collectPreorderFn    = httpsCallable<{ preorderId: string }, { success: boolean }>(functions, 'collectPreorder')
const cancelPreorderFn     = httpsCallable<{ preorderId: string }, { success: boolean }>(functions, 'cancelPreorder')

type ActiveFilter = PreorderStatus | 'all'

function PreorderInbox() {
  const [preorders, setPreorders] = useState<Preorder[]>([])
  const [filter, setFilter] = useState<ActiveFilter>('pending')
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pickupWindowInputs, setPickupWindowInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    const q = query(collection(db, 'preorders'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPreorders(snap.docs.map(docToPreorder))
    })
    return unsub
  }, [])

  const filtered = filter === 'all'
    ? preorders
    : preorders.filter((p) => p.status === filter)

  async function handleAction(action: 'confirm' | 'ready' | 'collect' | 'cancel', preorderId: string) {
    setActionError(null)
    setActionLoading(preorderId + action)
    try {
      if (action === 'confirm') {
        await confirmPreorderFn({ preorderId })
      } else if (action === 'ready') {
        const pickupWindow = pickupWindowInputs[preorderId]?.trim()
        if (!pickupWindow) { setActionError('Enter a pickup window before marking ready'); setActionLoading(null); return }
        await markPreorderReadyFn({ preorderId, pickupWindow })
        setPickupWindowInputs((prev) => { const next = { ...prev }; delete next[preorderId]; return next })
      } else if (action === 'collect') {
        await collectPreorderFn({ preorderId })
      } else if (action === 'cancel') {
        await cancelPreorderFn({ preorderId })
      }
    } catch (err) {
      setActionError((err as { message?: string }).message ?? 'Action failed — please try again')
    } finally {
      setActionLoading(null)
    }
  }

  const filterBtns: ActiveFilter[] = ['pending', 'confirmed', 'ready', 'collected', 'cancelled', 'all']

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-heading)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-6)',
      }}>
        Fireworks Pre-orders
      </h1>

      {/* Status filter */}
      <div
        role="group"
        aria-label="Filter by status"
        style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}
      >
        {filterBtns.map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f ? 'var(--color-badge-on-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {actionError && (
        <p role="alert" style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-danger)',
          marginBottom: 'var(--space-4)',
        }}>
          {actionError}
        </p>
      )}

      {filtered.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          No pre-orders in this status.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.map((p) => {
            const isLoading = (act: string) => actionLoading === p.id + act
            return (
              <article
                key={p.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4) var(--space-5)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-body)', color: 'var(--color-text)', margin: '0 0 var(--space-1)' }}>
                      {p.customerName}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 0 }}>
                      {p.customerPhone} · Qty {p.quantity} · {p.createdAt.toLocaleDateString('en-CA')}
                    </p>
                    {p.pickupWindow && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
                        Pickup: {p.pickupWindow}
                      </p>
                    )}
                    {p.staffNotes && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 'var(--space-1) 0 0' }}>
                        Note: {p.staffNotes}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    padding: 'var(--space-1) var(--space-2)',
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </div>

                {/* Staff actions */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                  {p.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAction('confirm', p.id)}
                        disabled={isLoading('confirm')}
                        aria-busy={isLoading('confirm')}
                      >
                        {isLoading('confirm') ? 'Confirming…' : 'Confirm + SMS'}
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleAction('cancel', p.id)}
                        disabled={isLoading('cancel')}
                        style={{ color: 'var(--color-text-muted)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: 'var(--space-1) var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)' }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {p.status === 'confirmed' && (
                    <>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="YYYY-MM-DD HH:MM–HH:MM"
                        value={pickupWindowInputs[p.id] ?? ''}
                        onChange={(e) => setPickupWindowInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        aria-label="Pickup window"
                        style={{ flex: '1 1 200px', maxWidth: '260px' }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAction('ready', p.id)}
                        disabled={isLoading('ready')}
                        aria-busy={isLoading('ready')}
                      >
                        {isLoading('ready') ? 'Sending…' : 'Mark Ready + SMS'}
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleAction('cancel', p.id)}
                        disabled={isLoading('cancel')}
                        style={{ color: 'var(--color-text-muted)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: 'var(--space-1) var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)' }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {p.status === 'ready' && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAction('collect', p.id)}
                        disabled={isLoading('collect')}
                        aria-busy={isLoading('collect')}
                      >
                        {isLoading('collect') ? 'Marking…' : 'Mark Collected'}
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleAction('cancel', p.id)}
                        disabled={isLoading('cancel')}
                        style={{ color: 'var(--color-text-muted)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: 'var(--space-1) var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)' }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function PreorderInboxPage() {
  return (
    <ProtectedRoute staffOnly>
      <PreorderInbox />
    </ProtectedRoute>
  )
}
