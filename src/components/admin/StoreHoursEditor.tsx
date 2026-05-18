import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import type { StoreHours, StoreHoursDay } from '../../lib/types'

const DAY_KEYS: (keyof Omit<StoreHours, 'updatedBy' | 'updatedAt'>)[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

type DayDraft = StoreHoursDay

interface HoursDraft {
  monday:    DayDraft
  tuesday:   DayDraft
  wednesday: DayDraft
  thursday:  DayDraft
  friday:    DayDraft
  saturday:  DayDraft
  sunday:    DayDraft
}

const DEFAULT_DAY: DayDraft = { open: '09:00', close: '17:00', closed: false }

const DEFAULT_HOURS: HoursDraft = {
  monday:    { ...DEFAULT_DAY },
  tuesday:   { ...DEFAULT_DAY },
  wednesday: { ...DEFAULT_DAY },
  thursday:  { ...DEFAULT_DAY },
  friday:    { ...DEFAULT_DAY },
  saturday:  { ...DEFAULT_DAY },
  sunday:    { open: '09:00', close: '17:00', closed: true },
}

function toHoursDraft(data: StoreHours): HoursDraft {
  const draft: Partial<HoursDraft> = {}
  for (const key of DAY_KEYS) {
    const day = data[key] as StoreHoursDay | undefined
    draft[key] = day
      ? { open: day.open, close: day.close, closed: day.closed }
      : { ...DEFAULT_DAY }
  }
  return draft as HoursDraft
}

const updateStoreHoursFn = httpsCallable(functions, 'updateStoreHours')

export default function StoreHoursEditor() {
  const [draft, setDraft]           = useState<HoursDraft>(DEFAULT_HOURS)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'config', 'storeHours'))
      .then(snap => {
        if (snap.exists()) setDraft(toHoursDraft(snap.data() as StoreHours))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateDay = (key: keyof HoursDraft, field: keyof DayDraft, value: string | boolean) => {
    setDraft(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await updateStoreHoursFn(draft)
      setSaveSuccess(true)
    } catch (err) {
      setSaveError((err as { message?: string }).message ?? 'Failed to save — please try again')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
        Loading store hours…
      </p>
    )
  }

  return (
    <div className="hours-editor">
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-heading)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-6)',
      }}>
        Store Hours
      </h1>

      <div className="hours-day-list">
        {DAY_KEYS.map(key => {
          const day = draft[key]
          return (
            <div key={key} className={`hours-day-row${day.closed ? ' hours-day-row--closed' : ''}`}>
              <span className="hours-day-label">{DAY_LABELS[key]}</span>

              <label className="hours-closed-toggle">
                <input
                  type="checkbox"
                  checked={day.closed}
                  onChange={e => updateDay(key, 'closed', e.target.checked)}
                  disabled={saving}
                />
                <span>Closed</span>
              </label>

              <div className="hours-time-inputs">
                <div className="input-wrapper" style={{ margin: 0 }}>
                  <label className="input-label" htmlFor={`${key}-open`}>Open</label>
                  <input
                    id={`${key}-open`}
                    className="input-field"
                    type="time"
                    value={day.open}
                    onChange={e => updateDay(key, 'open', e.target.value)}
                    disabled={saving || day.closed}
                    style={{ maxWidth: '120px' }}
                  />
                </div>

                <div className="input-wrapper" style={{ margin: 0 }}>
                  <label className="input-label" htmlFor={`${key}-close`}>Close</label>
                  <input
                    id={`${key}-close`}
                    className="input-field"
                    type="time"
                    value={day.close}
                    onChange={e => updateDay(key, 'close', e.target.value)}
                    disabled={saving || day.closed}
                    style={{ maxWidth: '120px' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {saveError && (
        <p className="input-error" role="alert" style={{ marginTop: 'var(--space-4)' }}>
          {saveError}
        </p>
      )}

      {saveSuccess && (
        <p style={{
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body)',
          marginTop: 'var(--space-4)',
        }} role="status">
          Store hours saved.
        </p>
      )}

      <button
        type="button"
        className="btn btn-primary btn-md"
        onClick={handleSave}
        disabled={saving}
        aria-busy={saving}
        style={{ marginTop: 'var(--space-6)' }}
      >
        {saving ? 'Saving…' : 'Save hours'}
      </button>
    </div>
  )
}
