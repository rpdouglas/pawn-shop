import { useEffect, useState, useCallback, Fragment } from 'react'
import {
  collection, query, orderBy, where, onSnapshot, Timestamp,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import type { PawnRequest, PawnRequestStatus, PrintTicketData } from '../../lib/types'
import IssueLoanModal from './IssueLoanModal'
import PrintableTicket from './PrintableTicket'
import WalkInPawnModal from './WalkInPawnModal'

type FilterValue = PawnRequestStatus | 'all'

const FILTER_OPTIONS: FilterValue[] = ['all', 'pending', 'reviewed', 'quoted', 'declined', 'completed']

const FILTER_LABELS: Record<FilterValue, string> = {
  all: 'All',
  pending: 'Pending',
  reviewed: 'Reviewed',
  quoted: 'Quoted',
  declined: 'Declined',
  completed: 'Completed',
}

const STATUS_BADGE: Record<PawnRequestStatus, string> = {
  pending:   'badge badge-reserved',
  reviewed:  'badge badge-tag',
  quoted:    'badge badge-active',
  declined:  'badge badge-sold',
  completed: 'badge badge-condition-new',
}

const updateStatusFn = httpsCallable<
  { pawnRequestId: string; status: string; staffNotes?: string },
  { success: boolean }
>(functions, 'updatePawnRequestStatus')

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function toPawnRequest(id: string, data: Record<string, unknown>): PawnRequest {
  const createdAt = data['createdAt'] instanceof Timestamp
    ? data['createdAt'].toDate()
    : new Date()
  const rawSource = data['source']
  return {
    id,
    uid: typeof data['uid'] === 'string' ? data['uid'] : null,
    name: String(data['name'] ?? ''),
    email: typeof data['email'] === 'string' ? data['email'] : undefined,
    phone: typeof data['phone'] === 'string' ? data['phone'] : undefined,
    itemDescription: String(data['itemDescription'] ?? ''),
    serialNumber: typeof data['serialNumber'] === 'string' ? data['serialNumber'] : undefined,
    images: Array.isArray(data['images']) ? (data['images'] as string[]) : [],
    status: data['status'] as PawnRequestStatus,
    source: rawSource === 'walk_in' ? 'walk_in' : rawSource === 'online' ? 'online' : undefined,
    staffNotes: typeof data['staffNotes'] === 'string' ? data['staffNotes'] : undefined,
    serialBlacklistHit: data['serialBlacklistHit'] === true,
    pawnLoanId: typeof data['pawnLoanId'] === 'string' ? data['pawnLoanId'] : undefined,
    createdAt,
  }
}

export default function PawnInbox() {
  const [requests, setRequests] = useState<PawnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterValue>('all')

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<PawnRequestStatus>('pending')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [issueLoanFor, setIssueLoanFor] = useState<string | null>(null)
  const [issueLoanDescription, setIssueLoanDescription] = useState('')
  const [walkInModalOpen, setWalkInModalOpen] = useState(false)
  const [printTicket, setPrintTicket] = useState<PrintTicketData | null>(null)

  const handleReadyToPrint = useCallback((data: PrintTicketData) => {
    setPrintTicket(data)
    setTimeout(() => window.print(), 0)
  }, [])

  const handleWalkInSuccess = useCallback((pawnRequestId: string, itemDesc: string, serialBlacklistHit: boolean) => {
    setWalkInModalOpen(false)
    if (serialBlacklistHit) {
      // Serial flagged — stay in PawnInbox so staff can review the flag before issuing a loan
      return
    }
    setIssueLoanFor(pawnRequestId)
    setIssueLoanDescription(itemDesc)
  }, [])

  useEffect(() => {
    const col = collection(db, 'pawnRequests')
    const q = filter === 'all'
      ? query(col, orderBy('createdAt', 'desc'))
      : query(col, where('status', '==', filter), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const updated = snap.docs.map(d => toPawnRequest(d.id, d.data() as Record<string, unknown>))
        setRequests(updated)
        // Close expanded panel if its request is no longer in the current view
        setExpandedId(prev => updated.some(r => r.id === prev) ? prev : null)
        setLoading(false)
      },
      () => {
        setLoading(false)
      },
    )

    return unsubscribe
  }, [filter])

  const handleExpand = (req: PawnRequest) => {
    if (expandedId === req.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(req.id)
    setEditStatus(req.status)
    setEditNotes(req.staffNotes ?? '')
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!expandedId) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateStatusFn({ pawnRequestId: expandedId, status: editStatus, staffNotes: editNotes })
      setRequests(prev => prev.map(r =>
        r.id === expandedId ? { ...r, status: editStatus, staffNotes: editNotes } : r
      ))
    } catch {
      setSaveError('Failed to save — please try again.')
    } finally {
      setSaving(false)
    }
  }

  const flaggedCount = requests.filter(r => r.serialBlacklistHit).length

  return (
    <div className="pawn-inbox">
      <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-heading)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)',
          }}>
            Pawn Enquiries
          </h1>
          {flaggedCount > 0 && (
            <p style={{ margin: 0 }}>
              <span className="badge badge-sold">
                {flaggedCount} serial blacklist {flaggedCount === 1 ? 'hit' : 'hits'}
              </span>
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-md"
          style={{ minHeight: '48px', whiteSpace: 'nowrap' }}
          onClick={() => setWalkInModalOpen(true)}
        >
          + New Walk-in Pawn
        </button>
      </div>

      <div className="pawn-inbox-filters" role="group" aria-label="Filter by status">
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

      {!loading && requests.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
          No enquiries found.
        </p>
      )}

      {!loading && requests.length > 0 && (
        <div className="table-wrapper">
          <table className="table" aria-label="Pawn enquiries">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Serial #</th>
                <th>Flag</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <Fragment key={req.id}>
                  <tr className={req.serialBlacklistHit ? 'pawn-inbox-row--flagged' : ''}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(req.createdAt)}</td>
                    <td>{req.name}</td>
                    <td>{req.email}</td>
                    <td>
                      {req.serialNumber ?? (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {req.serialBlacklistHit
                        ? <span className="badge badge-sold">Flagged</span>
                        : <span className="badge badge-tag">Clear</span>
                      }
                    </td>
                    <td style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={STATUS_BADGE[req.status]}>
                        {FILTER_LABELS[req.status]}
                      </span>
                      {req.source === 'walk_in' && (
                        <span className="badge badge-tag">Walk-in</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleExpand(req)}
                        aria-expanded={expandedId === req.id}
                        aria-controls={`detail-${req.id}`}
                      >
                        {expandedId === req.id ? 'Close' : 'Review'}
                      </button>
                    </td>
                  </tr>

                  {expandedId === req.id && (
                    <tr>
                      <td colSpan={7} className="pawn-inbox-detail-cell">
                        <div id={`detail-${req.id}`} className="pawn-inbox-detail">

                          {req.phone && (
                            <p className="pawn-detail-field">
                              <strong>Phone:</strong> {req.phone}
                            </p>
                          )}

                          <p className="pawn-detail-field">
                            <strong>Item description:</strong>
                          </p>
                          <p className="pawn-detail-description">{req.itemDescription}</p>

                          {req.images.length > 0 && (
                            <div className="pawn-detail-photos">
                              <p className="pawn-detail-field"><strong>Photos:</strong></p>
                              <div className="pawn-detail-photo-grid">
                                {req.images.map((url, i) => (
                                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={url}
                                      alt={`Enquiry photo ${i + 1}`}
                                      className="pawn-detail-thumb"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pawn-detail-update">
                            <div className="input-wrapper" style={{ maxWidth: '240px' }}>
                              <label className="input-label" htmlFor={`status-${req.id}`}>
                                Status
                              </label>
                              <select
                                id={`status-${req.id}`}
                                className="input-field input-field-select"
                                value={editStatus}
                                onChange={e => setEditStatus(e.target.value as PawnRequestStatus)}
                                disabled={saving}
                              >
                                {(['pending', 'reviewed', 'quoted', 'declined', 'completed'] as PawnRequestStatus[]).map(s => (
                                  <option key={s} value={s}>{FILTER_LABELS[s]}</option>
                                ))}
                              </select>
                            </div>

                            <div className="input-wrapper">
                              <label className="input-label" htmlFor={`notes-${req.id}`}>
                                Staff notes — internal, not shown to customer
                              </label>
                              <textarea
                                id={`notes-${req.id}`}
                                className="input-field intake-textarea"
                                value={editNotes}
                                onChange={e => setEditNotes(e.target.value)}
                                placeholder="Add notes about this enquiry…"
                                rows={3}
                                disabled={saving}
                              />
                            </div>

                            {saveError && (
                              <p className="input-error" role="alert">{saveError}</p>
                            )}

                            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn btn-primary btn-md"
                                onClick={handleSave}
                                disabled={saving}
                                aria-busy={saving}
                              >
                                {saving ? 'Saving…' : 'Save changes'}
                              </button>

                              {req.status === 'quoted' && !req.pawnLoanId && (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-md"
                                  style={{ minHeight: '48px' }}
                                  onClick={() => {
                                    setIssueLoanFor(req.id)
                                    setIssueLoanDescription(req.itemDescription)
                                  }}
                                  disabled={saving}
                                >
                                  Issue Loan
                                </button>
                              )}

                              {req.pawnLoanId && (
                                <span
                                  className="badge badge-condition-new"
                                  style={{ alignSelf: 'center' }}
                                >
                                  Loan issued
                                </span>
                              )}
                            </div>
                          </div>
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

      <WalkInPawnModal
        isOpen={walkInModalOpen}
        onClose={() => setWalkInModalOpen(false)}
        onSuccess={handleWalkInSuccess}
      />

      <IssueLoanModal
        isOpen={!!issueLoanFor}
        onClose={() => { setIssueLoanFor(null); setIssueLoanDescription('') }}
        pawnRequestId={issueLoanFor}
        itemDescription={issueLoanDescription}
        onReadyToPrint={handleReadyToPrint}
      />

      <PrintableTicket data={printTicket} />
    </div>
  )
}
