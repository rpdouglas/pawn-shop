import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'

interface BlacklistEntry {
  id: string
  serialNumber: string
  reason: string
  addedBy: string
  createdAt: Date
}

function toEntry(id: string, data: Record<string, unknown>): BlacklistEntry {
  return {
    id,
    serialNumber: String(data['serialNumber'] ?? ''),
    reason: String(data['reason'] ?? ''),
    addedBy: String(data['addedBy'] ?? ''),
    createdAt: data['createdAt'] instanceof Timestamp ? data['createdAt'].toDate() : new Date(),
  }
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const addSerialFn    = httpsCallable(functions, 'addSerialToBlacklist')
const removeSerialFn = httpsCallable(functions, 'removeSerialFromBlacklist')

export default function SerialBlacklistManager() {
  const [entries, setEntries]       = useState<BlacklistEntry[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')

  const [newSerial, setNewSerial]   = useState('')
  const [newReason, setNewReason]   = useState('')
  const [adding, setAdding]         = useState(false)
  const [addError, setAddError]     = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)

  const [removingId, setRemovingId]     = useState<string | null>(null)
  const [removeError, setRemoveError]   = useState<string | null>(null)
  const [confirmId, setConfirmId]       = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'serialBlacklist'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map(d => toEntry(d.id, d.data() as Record<string, unknown>)))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  const filtered = search.trim()
    ? entries.filter(e => e.serialNumber.includes(search.trim().toUpperCase()))
    : entries

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSerial.trim() || !newReason.trim()) {
      setAddError('Both serial number and reason are required.')
      return
    }
    setAdding(true)
    setAddError(null)
    setAddSuccess(false)
    try {
      await addSerialFn({ serialNumber: newSerial.trim(), reason: newReason.trim() })
      setNewSerial('')
      setNewReason('')
      setAddSuccess(true)
    } catch (err) {
      setAddError((err as { message?: string }).message ?? 'Failed to add — please try again')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id: string) => {
    setRemovingId(id)
    setRemoveError(null)
    try {
      await removeSerialFn({ blacklistId: id })
      setConfirmId(null)
    } catch (err) {
      setRemoveError((err as { message?: string }).message ?? 'Failed to remove — please try again')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="serial-manager">
      <h1 className="serial-manager-heading">Serial Blacklist</h1>

      {/* Add form */}
      <section className="serial-manager-add" aria-label="Add serial number to blacklist">
        <h2 className="serial-manager-add-heading">Add to Blacklist</h2>
        <form onSubmit={handleAdd} noValidate className="serial-add-form">
          <div className="input-wrapper" style={{ maxWidth: '320px' }}>
            <label className="input-label" htmlFor="new-serial">Serial number</label>
            <input
              id="new-serial"
              className="input-field"
              type="text"
              value={newSerial}
              onChange={e => { setNewSerial(e.target.value); setAddSuccess(false) }}
              placeholder="e.g. SN-123456"
              maxLength={100}
              disabled={adding}
              autoComplete="off"
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label" htmlFor="new-reason">Reason for blacklist</label>
            <input
              id="new-reason"
              className="input-field"
              type="text"
              value={newReason}
              onChange={e => { setNewReason(e.target.value); setAddSuccess(false) }}
              placeholder="e.g. Reported stolen — case #12345"
              maxLength={500}
              disabled={adding}
            />
          </div>
          {addError && <p className="input-error" role="alert">{addError}</p>}
          {addSuccess && (
            <p style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)' }} role="status">
              Serial number added to blacklist.
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-md"
            disabled={adding}
            aria-busy={adding}
          >
            {adding ? 'Adding…' : 'Add to blacklist'}
          </button>
        </form>
      </section>

      {/* Search */}
      <div className="serial-manager-search">
        <div className="input-wrapper" style={{ maxWidth: '320px', marginBottom: 'var(--space-4)' }}>
          <label className="input-label" htmlFor="serial-search">Search blacklist</label>
          <input
            id="serial-search"
            className="input-field"
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Serial number…"
            autoComplete="off"
          />
        </div>
      </div>

      {/* List */}
      {loading && (
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
          Loading…
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
          {search.trim() ? 'No match found.' : 'Blacklist is empty.'}
        </p>
      )}

      {removeError && (
        <p className="input-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          {removeError}
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="table-wrapper">
          <table className="table" aria-label="Blacklisted serial numbers">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Reason</th>
                <th>Added by</th>
                <th>Date</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <code style={{ fontFamily: 'monospace', fontSize: 'var(--text-small)' }}>
                      {entry.serialNumber}
                    </code>
                  </td>
                  <td>{entry.reason}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {entry.addedBy.slice(0, 8)}…
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(entry.createdAt)}</td>
                  <td>
                    {confirmId === entry.id ? (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                          onClick={() => handleRemove(entry.id)}
                          disabled={removingId === entry.id}
                          aria-busy={removingId === entry.id}
                        >
                          {removingId === entry.id ? 'Removing…' : 'Confirm remove'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setConfirmId(null)}
                          disabled={removingId === entry.id}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setConfirmId(entry.id); setRemoveError(null) }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
