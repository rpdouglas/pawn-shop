import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../ui/Modal'
import { formatPrice } from '../../lib/format'
import type { Item } from '../../lib/types'
import { Analytics, toGA4Item } from '../../lib/analytics'

interface Props {
  item: Item
  onClose: () => void
}

interface CreatePreorderData {
  itemId: string
  customerName: string
  customerPhone: string
  quantity: number
}

interface CreatePreorderResult {
  success: boolean
  preorderId: string
}

const createPreorderFn = httpsCallable<CreatePreorderData, CreatePreorderResult>(
  functions,
  'createPreorder',
)

export default function PreorderModal({ item, onClose }: Props) {
  const { user, loading: authLoading } = useAuth()

  const [name, setName]       = useState(user?.displayName ?? '')
  const [phone, setPhone]     = useState('')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!name.trim())  { setError('Your name is required'); return }
    if (!phone.trim()) { setError('Your phone number is required'); return }
    if (quantity < 1)  { setError('Quantity must be at least 1'); return }

    setError(null)
    setSubmitting(true)
    try {
      await createPreorderFn({
        itemId: item.id,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        quantity,
      })
      Analytics.generateLead({
        view: 'fireworks',
        items: [toGA4Item(item, 'fireworks_preorder')],
        value: item.price / 100,
        currency: 'CAD',
      })
      setSubmitted(true)
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Something went wrong — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen title="Pre-order — Fireworks Season" onClose={onClose}>
      {authLoading ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)' }}>
          Loading…
        </p>
      ) : !user ? (
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }}>
            Sign in to place a fireworks pre-order.
          </p>
          <a href="/login" className="btn btn-primary btn-md">Sign in</a>
        </div>
      ) : submitted ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-heading)',
            color: 'var(--color-primary)',
            margin: '0 0 var(--space-4)',
          }}>
            ✓
          </p>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-subheading)',
            color: 'var(--color-text)',
            fontWeight: 400,
            margin: '0 0 var(--space-3)',
          }}>
            Pre-order received
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-muted)',
            margin: '0 0 var(--space-6)',
            lineHeight: 1.6,
          }}>
            We'll confirm your pre-order by SMS within 24 hours and reach out once it's ready for pickup.
          </p>
          <button type="button" className="btn btn-secondary btn-md" onClick={onClose}>
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
            margin: 0,
            fontStyle: 'italic',
          }}>
            {item.title} — {formatPrice(item.price)}
          </p>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="po-name">Your name</label>
            <input
              id="po-name"
              className="input-field"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              required
              disabled={submitting}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="po-phone">Phone number for SMS confirmation</label>
            <input
              id="po-phone"
              className="input-field"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (613) 555-0100"
              autoComplete="tel"
              required
              disabled={submitting}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="po-qty">Quantity</label>
            <input
              id="po-qty"
              className="input-field"
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              disabled={submitting}
            />
          </div>

          {error && <p className="input-error" role="alert">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-md"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? 'Sending…' : 'Place pre-order'}
          </button>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            margin: 0,
            lineHeight: 1.5,
          }}>
            Payment on pickup. We'll confirm availability and send your pickup window by SMS.
          </p>
        </form>
      )}
    </Modal>
  )
}
