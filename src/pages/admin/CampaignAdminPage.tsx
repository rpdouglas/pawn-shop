import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import { formatPrice } from '../../lib/format'
import type { Campaign, CampaignViewTag } from '../../lib/types'

const BANNER_COPY_MAX = 160

function docToCampaign(doc: { id: string; data: () => Record<string, unknown> }): Campaign {
  const d = doc.data()
  return {
    id: doc.id,
    title:            String(d['title'] ?? ''),
    viewTag:          (d['viewTag'] as CampaignViewTag) ?? 'pawn',
    startDate:        (d['startDate'] as { toDate(): Date }).toDate(),
    endDate:          (d['endDate'] as { toDate(): Date }).toDate(),
    active:           Boolean(d['active']),
    discountRule:     (d['discountRule'] as Campaign['discountRule']) ?? { type: 'fixed', value: 0 },
    bannerCopy:       String(d['bannerCopy'] ?? ''),
    countdownEnabled: Boolean(d['countdownEnabled']),
    createdBy:        d['createdBy'] != null ? String(d['createdBy']) : undefined,
    reminderSentAt:   d['reminderSentAt'] != null ? (d['reminderSentAt'] as { toDate(): Date }).toDate() : null,
    updatedAt:        d['updatedAt'] != null ? (d['updatedAt'] as { toDate(): Date }).toDate() : undefined,
    createdAt:        (d['createdAt'] as { toDate(): Date }).toDate(),
  }
}

type DiscountType = 'percent' | 'fixed'

const VIEW_OPTIONS: { value: CampaignViewTag; label: string }[] = [
  { value: 'pawn',      label: 'Pawn' },
  { value: 'cannabis',  label: 'Cannabis' },
  { value: 'fireworks', label: 'Fireworks' },
  { value: 'all',       label: 'All views' },
]

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function CampaignAdmin() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [showForm, setShowForm] = useState(false)

  // Form fields
  const [title, setTitle]                   = useState('')
  const [viewTag, setViewTag]               = useState<CampaignViewTag>('fireworks')
  const [startDate, setStartDate]           = useState(todayStr())
  const [endDate, setEndDate]               = useState('')
  const [bannerCopy, setBannerCopy]         = useState('')
  const [discountType, setDiscountType]     = useState<DiscountType>('percent')
  const [discountValue, setDiscountValue]   = useState<number>(0)
  const [countdownEnabled, setCountdownEnabled] = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [formError, setFormError]           = useState<string | null>(null)
  const [formSuccess, setFormSuccess]       = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setCampaigns(snap.docs.map(docToCampaign))
    })
    return unsub
  }, [])

  const resetForm = () => {
    setTitle('')
    setViewTag('fireworks')
    setStartDate(todayStr())
    setEndDate('')
    setBannerCopy('')
    setDiscountType('percent')
    setDiscountValue(0)
    setCountdownEnabled(false)
    setFormError(null)
    setFormSuccess(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!title.trim())            { setFormError('Title is required'); return }
    if (!startDate)               { setFormError('Start date is required'); return }
    if (!endDate)                 { setFormError('End date is required'); return }
    if (endDate <= startDate)     { setFormError('End date must be after start date'); return }
    if (!bannerCopy.trim())       { setFormError('Banner copy is required'); return }
    if (bannerCopy.length > BANNER_COPY_MAX) { setFormError(`Banner copy must be ${BANNER_COPY_MAX} characters or fewer`); return }

    setFormError(null)
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'campaigns'), {
        title: title.trim(),
        viewTag,
        startDate: new Date(`${startDate}T00:00:00`),
        endDate:   new Date(`${endDate}T23:59:59`),
        active: false,
        discountRule: { type: discountType, value: discountValue },
        bannerCopy: bannerCopy.trim(),
        countdownEnabled,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })
      setFormSuccess(true)
      resetForm()
      setShowForm(false)
    } catch (err) {
      setFormError((err as { message?: string }).message ?? 'Failed to create campaign')
    } finally {
      setSubmitting(false)
    }
  }

  const upcoming  = campaigns.filter((c) => !c.active && c.startDate > new Date())
  const active    = campaigns.filter((c) => c.active)
  const past      = campaigns.filter((c) => !c.active && c.endDate <= new Date())

  function renderList(list: Campaign[], emptyMsg: string) {
    if (list.length === 0) {
      return <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>{emptyMsg}</p>
    }
    return list.map((c) => (
      <div key={c.id} style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4) var(--space-5)',
        marginBottom: 'var(--space-3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-body)', color: 'var(--color-text)', margin: '0 0 var(--space-1)' }}>
              {c.title}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-1)', textTransform: 'capitalize' }}>
              {c.viewTag} · {c.startDate.toLocaleDateString('en-CA')} – {c.endDate.toLocaleDateString('en-CA')}
              {c.countdownEnabled && ' · Countdown'}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-1)', fontStyle: 'italic' }}>
              "{c.bannerCopy}"
              {c.discountRule.value > 0 && (
                <span style={{ marginLeft: 'var(--space-2)' }}>
                  — {c.discountRule.type === 'percent' ? `${c.discountRule.value}%` : formatPrice(c.discountRule.value)} off
                </span>
              )}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              {c.reminderSentAt != null
                ? `Reminder sent: ${c.reminderSentAt.toLocaleDateString('en-CA')}`
                : 'Reminder: not yet sent'}
            </p>
          </div>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            padding: 'var(--space-1) var(--space-2)',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
            color: c.active ? 'var(--color-primary)' : 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}>
            {c.active ? 'Active' : c.startDate > new Date() ? 'Scheduled' : 'Ended'}
          </span>
        </div>
      </div>
    ))
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-heading)',
          color: 'var(--color-text)',
          margin: 0,
        }}>
          Campaigns
        </h1>
        <button
          className="btn btn-primary btn-md"
          onClick={() => { resetForm(); setShowForm(!showForm) }}
        >
          {showForm ? 'Cancel' : 'New campaign'}
        </button>
      </div>

      {formSuccess && !showForm && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-4)',
        }}>
          Campaign created. It will activate automatically when the start date arrives.
        </p>
      )}

      {/* Create campaign form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          noValidate
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-subheading)', color: 'var(--color-text)', margin: 0, fontWeight: 400 }}>
            New Campaign
          </h2>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="camp-title">Title</label>
            <input
              id="camp-title"
              className="input-field"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Canada Day Fireworks 2026"
              required
              disabled={submitting}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="camp-view">View</label>
            <select
              id="camp-view"
              className="input-field"
              value={viewTag}
              onChange={(e) => setViewTag(e.target.value as CampaignViewTag)}
              disabled={submitting}
            >
              {VIEW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label" htmlFor="camp-start">Start date</label>
              <input
                id="camp-start"
                className="input-field"
                type="date"
                value={startDate}
                min={todayStr()}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label" htmlFor="camp-end">End date</label>
              <input
                id="camp-end"
                className="input-field"
                type="date"
                value={endDate}
                min={startDate || todayStr()}
                onChange={(e) => setEndDate(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="camp-banner">
              Banner copy <span style={{ color: bannerCopy.length > BANNER_COPY_MAX ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                ({bannerCopy.length}/{BANNER_COPY_MAX})
              </span>
            </label>
            <textarea
              id="camp-banner"
              className="input-field"
              value={bannerCopy}
              onChange={(e) => setBannerCopy(e.target.value)}
              placeholder="Fireworks season is here — pre-order your bundle today."
              rows={3}
              maxLength={BANNER_COPY_MAX + 10}
              required
              disabled={submitting}
              style={{ resize: 'vertical' }}
            />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
              Brand voice only — no "SALE", "BUY NOW", "Clearance", or manufactured urgency.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="input-wrapper" style={{ flex: '0 0 auto' }}>
              <label className="input-label" htmlFor="camp-disc-type">Discount type</label>
              <select
                id="camp-disc-type"
                className="input-field"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                disabled={submitting}
              >
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount off (cents)</option>
              </select>
            </div>
            <div className="input-wrapper" style={{ flex: '0 0 auto' }}>
              <label className="input-label" htmlFor="camp-disc-val">
                Value {discountType === 'percent' ? '(0–100)' : '(CAD cents)'}
              </label>
              <input
                id="camp-disc-val"
                className="input-field"
                type="number"
                min={0}
                max={discountType === 'percent' ? 100 : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                disabled={submitting}
                style={{ width: '120px' }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={countdownEnabled}
              onChange={(e) => setCountdownEnabled(e.target.checked)}
              disabled={submitting}
            />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text)' }}>
              Show countdown timer (fireworks page only, uses real end date)
            </span>
          </label>

          {formError && (
            <p role="alert" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-danger)', margin: 0 }}>
              {formError}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-md"
            disabled={submitting}
            aria-busy={submitting}
            style={{ alignSelf: 'flex-start' }}
          >
            {submitting ? 'Creating…' : 'Create campaign'}
          </button>
        </form>
      )}

      {/* Campaign lists */}
      <section aria-labelledby="active-heading" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 id="active-heading" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-subheading)', color: 'var(--color-text)', fontWeight: 400, marginBottom: 'var(--space-3)' }}>
          Active
        </h2>
        {renderList(active, 'No active campaigns.')}
      </section>

      <section aria-labelledby="upcoming-heading" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 id="upcoming-heading" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-subheading)', color: 'var(--color-text)', fontWeight: 400, marginBottom: 'var(--space-3)' }}>
          Scheduled
        </h2>
        {renderList(upcoming, 'No upcoming campaigns.')}
      </section>

      <section aria-labelledby="past-heading">
        <h2 id="past-heading" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-subheading)', color: 'var(--color-text)', fontWeight: 400, marginBottom: 'var(--space-3)' }}>
          Past
        </h2>
        {renderList(past, 'No past campaigns.')}
      </section>
    </div>
  )
}

export default function CampaignAdminPage() {
  return (
    <ProtectedRoute staffOnly>
      <CampaignAdmin />
    </ProtectedRoute>
  )
}
