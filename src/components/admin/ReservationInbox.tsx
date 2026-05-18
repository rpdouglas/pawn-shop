import { useEffect, useState, Fragment } from 'react'
import {
  collection, query, orderBy, where, onSnapshot, Timestamp,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import type { Reservation, ReservationStatus } from '../../lib/types'

type FilterValue = ReservationStatus | 'all'

const FILTER_OPTIONS: FilterValue[] = ['all', 'pending', 'confirmed', 'declined', 'completed']

const FILTER_LABELS: Record<FilterValue, string> = {
  all:       'All',
  pending:   'Pending',
  confirmed: 'Confirmed',
  declined:  'Declined',
  completed: 'Completed',
}

const STATUS_BADGE: Record<ReservationStatus, string> = {
  pending:   'badge badge-reserved',
  confirmed: 'badge badge-active',
  declined:  'badge badge-sold',
  completed: 'badge badge-condition-new',
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function toReservation(id: string, data: Record<string, unknown>): Reservation {
  const createdAt = data['createdAt'] instanceof Timestamp ? data['createdAt'].toDate() : new Date()
  const smsDeliveredAt = data['smsDeliveredAt'] instanceof Timestamp
    ? data['smsDeliveredAt'].toDate()
    : null
  return {
    id,
    uid: String(data['uid'] ?? ''),
    itemId: String(data['itemId'] ?? ''),
    status: data['status'] as ReservationStatus,
    pickupWindow: String(data['pickupWindow'] ?? ''),
    customerName: String(data['customerName'] ?? ''),
    customerPhone: String(data['customerPhone'] ?? ''),
    viewTag: data['viewTag'] as Reservation['viewTag'],
    smsDeliveredAt,
    staffNotes: typeof data['staffNotes'] === 'string' ? data['staffNotes'] : undefined,
    createdAt,
  }
}

const confirmReservationFn  = httpsCallable(functions, 'confirmReservation')
const completeReservationFn = httpsCallable(functions, 'completeReservation')

export default function ReservationInbox() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState<FilterValue>('pending')

  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [editNotes, setEditNotes]     = useState('')
  const [acting, setActing]           = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    const col = collection(db, 'reservations')
    const q = filter === 'all'
      ? query(col, orderBy('createdAt', 'desc'))
      : query(col, where('status', '==', filter), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const updated = snap.docs.map(d => toReservation(d.id, d.data() as Record<string, unknown>))
        setReservations(updated)
        setExpandedId(prev => updated.some(r => r.id === prev) ? prev : null)
        setLoading(false)
      },
      () => { setLoading(false) },
    )

    return unsubscribe
  }, [filter])

  const handleExpand = (res: Reservation) => {
    if (expandedId === res.id) { setExpandedId(null); return }
    setExpandedId(res.id)
    setEditNotes(res.staffNotes ?? '')
    setActionError(null)
  }

  const handleDecision = async (reservationId: string, decision: 'confirmed' | 'declined') => {
    setActing(true)
    setActionError(null)
    try {
      await confirmReservationFn({ reservationId, decision, staffNotes: editNotes.trim() || undefined })
      setExpandedId(null)
    } catch (err) {
      setActionError((err as { message?: string }).message ?? 'Action failed — please try again')
    } finally {
      setActing(false)
    }
  }

  const handleComplete = async (reservationId: string) => {
    setActing(true)
    setActionError(null)
    try {
      await completeReservationFn({ reservationId })
      setExpandedId(null)
    } catch (err) {
      setActionError((err as { message?: string }).message ?? 'Action failed — please try again')
    } finally {
      setActing(false)
    }
  }

  const pendingCount = reservations.filter(r => r.status === 'pending').length

  return (
    <div className="res-inbox">
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-heading)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-2)',
        }}>
          Collection Reservations
        </h1>
        {filter === 'all' && pendingCount > 0 && (
          <p style={{ margin: 0 }}>
            <span className="badge badge-reserved">
              {pendingCount} pending {pendingCount === 1 ? 'reservation' : 'reservations'}
            </span>
          </p>
        )}
      </div>

      <div className="res-inbox-filters" role="group" aria-label="Filter by status">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            type="button"
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setFilter(f); setLoading(true); setExpandedId(null) }}
            aria-pressed={filter === f}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
          Loading…
        </p>
      )}

      {!loading && reservations.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
          No reservations found.
        </p>
      )}

      {!loading && reservations.length > 0 && (
        <div className="table-wrapper">
          <table className="table" aria-label="Collection reservations">
            <thead>
              <tr>
                <th>Requested</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Pickup Window</th>
                <th>SMS</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <Fragment key={res.id}>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(res.createdAt)}</td>
                    <td>{res.customerName}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{res.customerPhone}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{res.pickupWindow}</td>
                    <td>
                      {res.smsDeliveredAt
                        ? <span className="badge badge-active">Sent</span>
                        : <span className="badge badge-sold">Not sent</span>
                      }
                    </td>
                    <td>
                      <span className={STATUS_BADGE[res.status]}>
                        {FILTER_LABELS[res.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleExpand(res)}
                        aria-expanded={expandedId === res.id}
                        aria-controls={`res-detail-${res.id}`}
                      >
                        {expandedId === res.id ? 'Close' : 'Review'}
                      </button>
                    </td>
                  </tr>

                  {expandedId === res.id && (
                    <tr>
                      <td colSpan={7} className="pawn-inbox-detail-cell">
                        <div id={`res-detail-${res.id}`} className="pawn-inbox-detail">
                          <p className="pawn-detail-field">
                            <strong>Item ID:</strong>{' '}
                            <code style={{ fontSize: 'var(--text-small)' }}>{res.itemId}</code>
                          </p>

                          {res.staffNotes && res.status !== 'pending' && res.status !== 'confirmed' && (
                            <p className="pawn-detail-field">
                              <strong>Staff notes:</strong> {res.staffNotes}
                            </p>
                          )}

                          {(res.status === 'pending' || res.status === 'confirmed') && (
                            <div className="pawn-detail-update">
                              {res.status === 'pending' && (
                                <div className="input-wrapper">
                                  <label className="input-label" htmlFor={`notes-${res.id}`}>
                                    Staff notes (optional — sent to customer SMS if declined)
                                  </label>
                                  <textarea
                                    id={`notes-${res.id}`}
                                    className="input-field intake-textarea"
                                    value={editNotes}
                                    onChange={e => setEditNotes(e.target.value)}
                                    placeholder="Internal notes…"
                                    rows={2}
                                    disabled={acting}
                                  />
                                </div>
                              )}

                              {actionError && (
                                <p className="input-error" role="alert">{actionError}</p>
                              )}

                              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                                {res.status === 'pending' && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-md"
                                      onClick={() => handleDecision(res.id, 'confirmed')}
                                      disabled={acting}
                                      aria-busy={acting}
                                    >
                                      {acting ? 'Processing…' : 'Confirm'}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-md"
                                      onClick={() => handleDecision(res.id, 'declined')}
                                      disabled={acting}
                                      aria-busy={acting}
                                    >
                                      {acting ? 'Processing…' : 'Decline'}
                                    </button>
                                  </>
                                )}

                                {res.status === 'confirmed' && (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-md"
                                    onClick={() => handleComplete(res.id)}
                                    disabled={acting}
                                    aria-busy={acting}
                                  >
                                    {acting ? 'Processing…' : 'Mark as collected'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
