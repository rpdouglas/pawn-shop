import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import type { AdjustInventoryPayload } from '../../lib/types'

const adjustInventoryFn = httpsCallable<
  AdjustInventoryPayload,
  { success: boolean; newQuantity: number }
>(functions, 'adjustInventory')

interface Props {
  itemId: string
  quantity: number
  compact?: boolean  // Compact mode for table rows (smaller label)
}

const BTN: React.CSSProperties = {
  minWidth: '48px',
  minHeight: '48px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

export default function QuantityAdjustControl({ itemId, quantity, compact = false }: Props) {
  // Track an in-flight delta for optimistic UI — cleared when the CF resolves.
  // The parent's onSnapshot updates `quantity` prop after the CF writes to Firestore.
  const [inFlightDelta, setInFlightDelta] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const displayQty = quantity + inFlightDelta
  const outOfStock = displayQty === 0

  const adjust = async (delta: number) => {
    if (pending) return
    const next = displayQty + delta
    if (next < 0) return
    setPending(true)
    setInFlightDelta(inFlightDelta + delta)
    setError('')
    try {
      await adjustInventoryFn({ itemId, delta })
      setInFlightDelta(0) // prop will settle from onSnapshot
    } catch (err) {
      setInFlightDelta(0) // revert optimistic update
      setError(err instanceof Error ? err.message : 'Adjustment failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={() => adjust(-1)}
          disabled={pending || outOfStock}
          aria-label="Reduce stock by 1"
          style={{ ...BTN, opacity: (pending || outOfStock) ? 0.4 : 1 }}
        >
          −
        </button>

        <span
          aria-live="polite"
          aria-label={`Stock: ${displayQty}`}
          style={{
            minWidth: compact ? '2ch' : '3ch',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: compact ? 'var(--text-small)' : 'var(--text-body)',
            color: outOfStock ? 'var(--color-error)' : 'var(--color-text)',
            fontWeight: outOfStock ? 600 : undefined,
          }}
        >
          {pending ? '…' : displayQty}
        </span>

        <button
          type="button"
          onClick={() => adjust(+1)}
          disabled={pending}
          aria-label="Add 1 to stock"
          style={{ ...BTN, opacity: pending ? 0.4 : 1 }}
        >
          +
        </button>

        {outOfStock && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-error)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Out of Stock
          </span>
        )}
      </div>

      {error && (
        <span
          role="alert"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-error)',
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
