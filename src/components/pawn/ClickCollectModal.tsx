import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../ui/Modal'
import type { Item, StoreHours, StoreHoursDay } from '../../lib/types'

interface Props {
  item: Item
  onClose: () => void
}

const DAY_KEYS: (keyof Omit<StoreHours, 'updatedBy' | 'updatedAt'>)[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
]

function todayStr(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function addDays(base: string, n: number): string {
  const d = new Date(`${base}T12:00:00`)
  d.setDate(d.getDate() + n)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function generateSlots(day: StoreHoursDay): string[] {
  const slots: string[] = []
  const [oh, om] = day.open.split(':').map(Number)
  const [ch, cm] = day.close.split(':').map(Number)
  const openMin = oh * 60 + om
  const closeMin = ch * 60 + cm
  for (let m = openMin; m <= closeMin - 30; m += 30) {
    const h = Math.floor(m / 60)
    const min = m % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
  }
  return slots
}

function filterPastSlots(slots: string[], selectedDate: string): string[] {
  if (selectedDate !== todayStr()) return slots
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return slots.filter(slot => {
    const [h, m] = slot.split(':').map(Number)
    return h * 60 + m > nowMin
  })
}

function formatSlotDisplay(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const endMin = h * 60 + m + 30
  const endH = Math.floor(endMin / 60)
  const endM = endMin % 60
  const fmt = (hour: number, min: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${String(min).padStart(2, '0')} ${period}`
  }
  return `${fmt(h, m)} – ${fmt(endH, endM)}`
}

function buildPickupWindow(date: string, slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const endMin = h * 60 + m + 30
  const endH = Math.floor(endMin / 60)
  const endM = endMin % 60
  return `${date} ${slot}–${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

const createReservationFn = httpsCallable(functions, 'createReservation')

export default function ClickCollectModal({ item, onClose }: Props) {
  const { user, loading: authLoading } = useAuth()

  const [storeHours, setStoreHours] = useState<StoreHours | null>(null)
  const [hoursLoading, setHoursLoading] = useState(true)

  const today = todayStr()
  const maxDate = addDays(today, 13)

  const [name, setName] = useState(user?.displayName ?? '')
  const [phone, setPhone] = useState('')
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDoc(doc(db, 'config', 'storeHours'))
      .then(snap => {
        if (snap.exists()) setStoreHours(snap.data() as StoreHours)
      })
      .catch(() => {})
      .finally(() => setHoursLoading(false))
  }, [])


  const dayConfig = storeHours
    ? storeHours[DAY_KEYS[new Date(`${selectedDate}T12:00:00`).getDay()]]
    : null
  const rawSlots = dayConfig && !dayConfig.closed ? generateSlots(dayConfig) : []
  const slots = filterPastSlots(rawSlots, selectedDate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!selectedSlot) { setError('Please select a pickup window'); return }
    if (!name.trim())  { setError('Your name is required'); return }
    if (!phone.trim()) { setError('Your phone number is required'); return }

    setError(null)
    setSubmitting(true)
    try {
      await createReservationFn({
        itemId: item.id,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        pickupWindow: buildPickupWindow(selectedDate, selectedSlot),
        viewTag: item.viewTag,
      })
      setSubmitted(true)
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Something went wrong — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen title="Reserve for Collection" onClose={onClose}>
      {authLoading ? (
        <p className="cc-loading">Loading…</p>
      ) : !user ? (
        <div className="cc-signin-prompt">
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }}>
            Sign in to reserve this item for collection.
          </p>
          <a href="/login" className="btn btn-primary btn-md">Sign in</a>
        </div>
      ) : submitted ? (
        <div className="cc-success">
          <p className="cc-success-check" aria-hidden="true">✓</p>
          <h3 className="cc-success-heading">Request received</h3>
          <p className="cc-success-body">
            We sent a confirmation to your phone. We'll confirm your pickup window shortly.
          </p>
          <button type="button" className="btn btn-secondary btn-md" onClick={onClose}>
            Close
          </button>
        </div>
      ) : (
        <form className="cc-modal-form" onSubmit={handleSubmit} noValidate>
          <p className="cc-item-name">{item.title}</p>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="cc-name">Your name</label>
            <input
              id="cc-name"
              className="input-field"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              required
              disabled={submitting}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="cc-phone">Phone number for SMS confirmation</label>
            <input
              id="cc-phone"
              className="input-field"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (613) 555-0100"
              autoComplete="tel"
              required
              disabled={submitting}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="cc-date">Preferred pickup date</label>
            <input
              id="cc-date"
              className="input-field"
              type="date"
              value={selectedDate}
              min={today}
              max={maxDate}
              onChange={e => { setSelectedDate(e.target.value); setSelectedSlot('') }}
              disabled={submitting}
            />
          </div>

          {hoursLoading ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
              Loading available times…
            </p>
          ) : !storeHours ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
              Online booking is not currently available. Please call us to arrange a pickup.
            </p>
          ) : dayConfig?.closed ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
              We are closed on this day. Please choose another date.
            </p>
          ) : slots.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
              No pickup windows available for this date.
            </p>
          ) : (
            <fieldset className="cc-slots-fieldset">
              <legend className="input-label">Preferred pickup window</legend>
              <div className="cc-slot-grid" role="group" aria-label="Available pickup windows">
                {slots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    className={`cc-slot-btn${selectedSlot === slot ? ' cc-slot-btn--selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                    aria-pressed={selectedSlot === slot}
                    disabled={submitting}
                  >
                    {formatSlotDisplay(slot)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {error && <p className="input-error" role="alert">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-md"
            disabled={submitting || !selectedSlot || !storeHours}
            aria-busy={submitting}
          >
            {submitting ? 'Sending request…' : 'Request this window'}
          </button>

          <p className="cc-disclaimer">
            We will confirm your pickup window by SMS. Standard message rates apply.
          </p>
        </form>
      )}
    </Modal>
  )
}
