import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface CreateWalkInResult {
  pawnRequestId: string
  serialBlacklistHit: boolean
}

const createWalkInFn = httpsCallable<
  { name: string; itemDescription: string; phone?: string; email?: string; serialNumber?: string },
  CreateWalkInResult
>(functions, 'createWalkInPawnRequest')

interface WalkInPawnModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (pawnRequestId: string, itemDescription: string, serialBlacklistHit: boolean) => void
}

export default function WalkInPawnModal({ isOpen, onClose, onSuccess }: WalkInPawnModalProps) {
  const [name, setName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setName('')
    setItemDescription('')
    setPhone('')
    setEmail('')
    setSerialNumber('')
    setLoading(false)
    setError('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Customer name is required'); return }
    if (!itemDescription.trim()) { setError('Item description is required'); return }

    setLoading(true)
    setError('')
    try {
      const payload: { name: string; itemDescription: string; phone?: string; email?: string; serialNumber?: string } = {
        name: name.trim(),
        itemDescription: itemDescription.trim(),
      }
      if (phone.trim()) payload.phone = phone.trim()
      if (email.trim()) payload.email = email.trim()
      if (serialNumber.trim()) payload.serialNumber = serialNumber.trim()

      const result = await createWalkInFn(payload)
      handleClose()
      onSuccess(result.data.pawnRequestId, itemDescription.trim(), result.data.serialBlacklistHit)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Walk-in Pawn">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
          Create a pawn intake for a walk-in customer. The loan will be issued immediately after.
        </p>

        <div className="input-wrapper">
          <label className="input-label" htmlFor="wi-name">Customer Name *</label>
          <input
            id="wi-name"
            type="text"
            className="input-field"
            style={{ minHeight: '48px' }}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name as shown on ID"
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className="input-wrapper">
          <label className="input-label" htmlFor="wi-item">Item Description *</label>
          <textarea
            id="wi-item"
            className="input-field intake-textarea"
            style={{ minHeight: '80px' }}
            value={itemDescription}
            onChange={e => setItemDescription(e.target.value)}
            placeholder="e.g. DeWalt 20V drill kit, model DCD777C2, black case"
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="input-wrapper">
          <label className="input-label" htmlFor="wi-serial">Serial Number (optional)</label>
          <input
            id="wi-serial"
            type="text"
            className="input-field"
            style={{ minHeight: '48px' }}
            value={serialNumber}
            onChange={e => setSerialNumber(e.target.value)}
            placeholder="Check item for manufacturer serial"
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className="input-wrapper">
          <label className="input-label" htmlFor="wi-phone">Phone (optional)</label>
          <input
            id="wi-phone"
            type="tel"
            className="input-field"
            style={{ minHeight: '48px' }}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="e.g. 613-555-0100"
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className="input-wrapper">
          <label className="input-label" htmlFor="wi-email">Email (optional)</label>
          <input
            id="wi-email"
            type="email"
            className="input-field"
            style={{ minHeight: '48px' }}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="e.g. customer@example.com"
            disabled={loading}
            autoComplete="off"
          />
        </div>

        {error && <p className="input-error" role="alert">{error}</p>}

        <div style={{ display: 'flex', gap: 'var(--space-4)', paddingTop: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={handleClose} style={{ flex: 1, minHeight: '48px' }} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} style={{ flex: 1, minHeight: '48px' }} disabled={loading}>
            {loading ? 'Creating…' : 'Continue to Loan'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
