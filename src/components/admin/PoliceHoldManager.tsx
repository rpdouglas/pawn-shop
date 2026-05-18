import { useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import { formatPrice } from '../../lib/format'
import type { Item } from '../../lib/types'

interface SetPoliceHoldData { itemId: string; hold: boolean }
interface SetPoliceHoldResult { success: boolean }

const setPoliceHoldFn = httpsCallable<SetPoliceHoldData, SetPoliceHoldResult>(functions, 'setPoliceHold')

function docToPartialItem(id: string, data: Record<string, unknown>): Pick<Item, 'id' | 'title' | 'price' | 'status' | 'viewTag' | 'policeHold'> {
  return {
    id,
    title:      String(data['title'] ?? ''),
    price:      typeof data['price'] === 'number' ? data['price'] : 0,
    status:     (data['status'] as Item['status']) ?? 'draft',
    viewTag:    (data['viewTag'] as Item['viewTag']) ?? 'pawn',
    policeHold: Boolean(data['policeHold']),
  }
}

export default function PoliceHoldManager() {
  const [itemId, setItemId] = useState('')
  const [found, setFound] = useState<ReturnType<typeof docToPartialItem> | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookingUp, setLookingUp] = useState(false)

  const [confirming, setConfirming] = useState(false)
  const [pendingHold, setPendingHold] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)

  const handleLookup = async () => {
    const id = itemId.trim()
    if (!id) return
    setLookingUp(true)
    setLookupError(null)
    setFound(null)
    setActionResult(null)
    try {
      const snap = await getDoc(doc(db, 'items', id))
      if (!snap.exists()) {
        setLookupError(`No item found with ID "${id}".`)
      } else {
        setFound(docToPartialItem(snap.id, snap.data() as Record<string, unknown>))
      }
    } catch {
      setLookupError('Lookup failed — check the item ID and try again.')
    } finally {
      setLookingUp(false)
    }
  }

  const handleToggle = (newHold: boolean) => {
    setPendingHold(newHold)
    setConfirming(true)
    setActionResult(null)
  }

  const handleConfirm = async () => {
    if (!found || pendingHold === null) return
    setSubmitting(true)
    try {
      await setPoliceHoldFn({ itemId: found.id, hold: pendingHold })
      setFound({ ...found, policeHold: pendingHold })
      setActionResult(pendingHold
        ? 'Police hold set. Item is now hidden from all public views.'
        : 'Police hold cleared. Item is visible to the public.')
    } catch (err) {
      setActionResult(`Error: ${(err as { message?: string }).message ?? 'Something went wrong.'}`)
    } finally {
      setSubmitting(false)
      setConfirming(false)
      setPendingHold(null)
    }
  }

  const handleCancel = () => {
    setConfirming(false)
    setPendingHold(null)
  }

  return (
    <section aria-labelledby="police-hold-heading">
      <h2
        id="police-hold-heading"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-heading)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-2)',
        }}
      >
        Police Hold
      </h2>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        color: 'var(--color-text-muted)',
        marginBottom: 'var(--space-6)',
      }}>
        Setting a hold immediately hides the item from all public views. Admin only.
      </p>

      {/* Item ID lookup */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-field"
          value={itemId}
          onChange={e => setItemId(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleLookup() }}
          placeholder="Firestore item ID"
          aria-label="Item ID"
          style={{ flex: '1 1 260px', minWidth: '200px' }}
          disabled={lookingUp || submitting}
        />
        <button
          type="button"
          className="btn btn-secondary btn-md"
          onClick={handleLookup}
          disabled={lookingUp || !itemId.trim() || submitting}
          aria-busy={lookingUp}
        >
          {lookingUp ? 'Looking up…' : 'Look up'}
        </button>
      </div>

      {lookupError && (
        <p role="alert" style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-4)',
        }}>
          {lookupError}
        </p>
      )}

      {found && (
        <div style={{
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: 'var(--space-4)',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-subheading)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)',
          }}>
            {found.title}
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--space-6)',
            flexWrap: 'wrap',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-6)',
          }}>
            <span>{formatPrice(found.price)}</span>
            <span style={{ textTransform: 'capitalize' }}>{found.viewTag}</span>
            <span style={{ textTransform: 'capitalize' }}>{found.status}</span>
            <span style={{ color: found.policeHold ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: found.policeHold ? 600 : 400 }}>
              {found.policeHold ? 'Police hold: ACTIVE' : 'Police hold: none'}
            </span>
          </div>

          {!confirming ? (
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              {!found.policeHold && (
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  onClick={() => handleToggle(true)}
                >
                  Set hold
                </button>
              )}
              {found.policeHold && (
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => handleToggle(false)}
                >
                  Clear hold
                </button>
              )}
            </div>
          ) : (
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-primary)',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-4)',
              }}>
                {pendingHold
                  ? `Confirm: set police hold on "${found.title}"? The item will be hidden from all public views immediately.`
                  : `Confirm: clear police hold on "${found.title}"? The item will become publicly visible.`}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  onClick={handleConfirm}
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? 'Saving…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-md"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {actionResult && (
            <p role="status" aria-live="polite" style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-4)',
              fontStyle: 'italic',
            }}>
              {actionResult}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
