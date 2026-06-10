import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface CreateWalkInResult {
  pawnRequestId: string
  serialBlacklistHit: boolean
}

interface WalkInItemData {
  serialNumber?: string
  itemCategory?: string
  itemMake?: string
  itemModel?: string
  itemColour?: string
  condition?: string
  notableMarkings?: string
}

const createWalkInFn = httpsCallable<
  {
    name: string
    itemDescription: string
    phone?: string
    email?: string
    serialNumber?: string
    itemCategory?: string
    itemMake?: string
    itemModel?: string
    itemColour?: string
    condition?: string
    notableMarkings?: string
    requestedAmount?: number
    idType?: string
    idVerified?: boolean
  },
  CreateWalkInResult
>(functions, 'createWalkInPawnRequest')

interface WalkInPawnModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (pawnRequestId: string, itemDescription: string, serialBlacklistHit: boolean, itemData?: WalkInItemData) => void
}

export default function WalkInPawnModal({ isOpen, onClose, onSuccess }: WalkInPawnModalProps) {
  const [name, setName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [itemMake, setItemMake] = useState('')
  const [itemModel, setItemModel] = useState('')
  const [itemColour, setItemColour] = useState('')
  const [condition, setCondition] = useState('')
  const [notableMarkings, setNotableMarkings] = useState('')
  const [requestedAmountDollars, setRequestedAmountDollars] = useState('')
  const [idType, setIdType] = useState('')
  const [idVerified, setIdVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setName('')
    setItemDescription('')
    setPhone('')
    setEmail('')
    setSerialNumber('')
    setItemCategory('')
    setItemMake('')
    setItemModel('')
    setItemColour('')
    setCondition('')
    setNotableMarkings('')
    setRequestedAmountDollars('')
    setIdType('')
    setIdVerified(false)
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
      const requestedAmountCents = requestedAmountDollars.trim()
        ? Math.round(parseFloat(requestedAmountDollars) * 100)
        : undefined

      const payload: Parameters<typeof createWalkInFn>[0] = {
        name: name.trim(),
        itemDescription: itemDescription.trim(),
      }
      if (phone.trim()) payload.phone = phone.trim()
      if (email.trim()) payload.email = email.trim()
      if (serialNumber.trim()) payload.serialNumber = serialNumber.trim()
      if (itemCategory) payload.itemCategory = itemCategory
      if (itemMake.trim()) payload.itemMake = itemMake.trim()
      if (itemModel.trim()) payload.itemModel = itemModel.trim()
      if (itemColour.trim()) payload.itemColour = itemColour.trim()
      if (condition) payload.condition = condition
      if (notableMarkings.trim()) payload.notableMarkings = notableMarkings.trim()
      if (requestedAmountCents && requestedAmountCents > 0) payload.requestedAmount = requestedAmountCents
      if (idType) payload.idType = idType
      if (idVerified) payload.idVerified = true

      const result = await createWalkInFn(payload)
      const itemData: WalkInItemData = {
        serialNumber: serialNumber.trim() || undefined,
        itemCategory: itemCategory || undefined,
        itemMake: itemMake.trim() || undefined,
        itemModel: itemModel.trim() || undefined,
        itemColour: itemColour.trim() || undefined,
        condition: condition || undefined,
        notableMarkings: notableMarkings.trim() || undefined,
      }
      handleClose()
      onSuccess(result.data.pawnRequestId, itemDescription.trim(), result.data.serialBlacklistHit, itemData)
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

        {/* ── Customer info ──────────────────────────────────────────────── */}
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

        {/* ── Item details ───────────────────────────────────────────────── */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', margin: 0, paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)' }}>
          Item Details
        </p>

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
          <label className="input-label" htmlFor="wi-category">Category</label>
          <select
            id="wi-category"
            className="input-field input-field-select"
            style={{ minHeight: '48px' }}
            value={itemCategory}
            onChange={e => setItemCategory(e.target.value)}
            disabled={loading}
          >
            <option value="">Select category…</option>
            <option value="electronics">Electronics</option>
            <option value="jewellery">Jewellery</option>
            <option value="power_tools">Power Tools</option>
            <option value="musical_instruments">Musical Instruments</option>
            <option value="sporting_goods">Sporting Goods</option>
            <option value="collectibles">Collectibles</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="input-wrapper">
            <label className="input-label" htmlFor="wi-make">Make / Brand</label>
            <input
              id="wi-make"
              type="text"
              className="input-field"
              style={{ minHeight: '48px' }}
              value={itemMake}
              onChange={e => setItemMake(e.target.value)}
              placeholder="e.g. DeWalt"
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label" htmlFor="wi-model">Model</label>
            <input
              id="wi-model"
              type="text"
              className="input-field"
              style={{ minHeight: '48px' }}
              value={itemModel}
              onChange={e => setItemModel(e.target.value)}
              placeholder="e.g. DCD777C2"
              disabled={loading}
              autoComplete="off"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="input-wrapper">
            <label className="input-label" htmlFor="wi-colour">Colour</label>
            <input
              id="wi-colour"
              type="text"
              className="input-field"
              style={{ minHeight: '48px' }}
              value={itemColour}
              onChange={e => setItemColour(e.target.value)}
              placeholder="e.g. Black"
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label" htmlFor="wi-condition">Condition</label>
            <select
              id="wi-condition"
              className="input-field input-field-select"
              style={{ minHeight: '48px' }}
              value={condition}
              onChange={e => setCondition(e.target.value)}
              disabled={loading}
            >
              <option value="">Select…</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        <div className="input-wrapper">
          <label className="input-label" htmlFor="wi-serial">Serial Number (if present)</label>
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
          <label className="input-label" htmlFor="wi-markings">Notable Markings / Damage (optional)</label>
          <textarea
            id="wi-markings"
            className="input-field intake-textarea"
            style={{ minHeight: '64px' }}
            value={notableMarkings}
            onChange={e => setNotableMarkings(e.target.value)}
            placeholder="Engravings, scratches, dents, stickers…"
            disabled={loading}
            rows={2}
          />
        </div>

        <div className="input-wrapper">
          <label className="input-label" htmlFor="wi-requested">Amount Requested (CAD $) — optional</label>
          <input
            id="wi-requested"
            type="number"
            min="0"
            step="0.01"
            className="input-field"
            style={{ minHeight: '48px' }}
            value={requestedAmountDollars}
            onChange={e => setRequestedAmountDollars(e.target.value)}
            placeholder="How much is the customer asking for?"
            disabled={loading}
          />
        </div>

        {/* ── Identity verification ──────────────────────────────────────── */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', margin: 0, paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)' }}>
          Identity Verification
        </p>

        <div className="input-wrapper">
          <label className="input-label" htmlFor="wi-id-type">ID Type Checked</label>
          <select
            id="wi-id-type"
            className="input-field input-field-select"
            style={{ minHeight: '48px' }}
            value={idType}
            onChange={e => setIdType(e.target.value)}
            disabled={loading}
          >
            <option value="">Select ID type…</option>
            <option value="drivers_licence">Driver&apos;s Licence</option>
            <option value="status_card">Status Card</option>
            <option value="passport">Passport</option>
            <option value="other">Other Government ID</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minHeight: '48px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
          <input
            type="checkbox"
            checked={idVerified}
            onChange={e => setIdVerified(e.target.checked)}
            disabled={loading}
            style={{ width: '20px', height: '20px', flexShrink: 0 }}
          />
          Government-issued photo ID verified
        </label>

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
