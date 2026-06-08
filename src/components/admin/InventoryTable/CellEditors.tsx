import { useEffect, useRef, useState } from 'react'
import type { MerchandisingTag } from '../../../lib/types'

const EDITOR_INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  minHeight: '36px',
  padding: '0 var(--space-2)',
  backgroundColor: 'var(--color-bg)',
  border: '2px solid var(--color-primary)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  outline: 'none',
  boxSizing: 'border-box',
}

// ---------------------------------------------------------------------------
// TextCellEditor
// ---------------------------------------------------------------------------

interface TextCellEditorProps {
  initialValue: string
  onSave: (value: string) => void
  onCancel: () => void
  onTabForward?: () => void
  onTabBack?: () => void
}

export function TextCellEditor({ initialValue, onSave, onCancel, onTabForward, onTabBack }: TextCellEditorProps) {
  const [value, setValue] = useState(initialValue)
  const ref = useRef<HTMLInputElement>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelledRef.current = true
      onCancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      cancelledRef.current = true
      onSave(value)
      if (e.shiftKey) { onTabBack?.() } else { onTabForward?.() }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      cancelledRef.current = true
      onSave(value)
    }
  }

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => { if (!cancelledRef.current) onSave(value) }}
      style={EDITOR_INPUT_STYLE}
    />
  )
}

// ---------------------------------------------------------------------------
// SelectCellEditor
// ---------------------------------------------------------------------------

interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectCellEditorProps<T extends string> {
  initialValue: T
  options: readonly SelectOption<T>[]
  onSave: (value: T) => void
  onCancel: () => void
  onTabForward?: () => void
  onTabBack?: () => void
}

export function SelectCellEditor<T extends string>({ initialValue, options, onSave, onCancel, onTabForward, onTabBack }: SelectCellEditorProps<T>) {
  const [value, setValue] = useState<T>(initialValue)
  const savedRef = useRef(false)
  const ref = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  const save = (val: T) => {
    if (savedRef.current) return
    savedRef.current = true
    onSave(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      savedRef.current = true
      onCancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      save(value)
      if (e.shiftKey) { onTabBack?.() } else { onTabForward?.() }
    }
  }

  return (
    <select
      ref={ref}
      value={value}
      onChange={e => {
        const v = e.target.value as T
        setValue(v)
        save(v)
      }}
      onKeyDown={handleKeyDown}
      onBlur={() => { if (!savedRef.current) onCancel() }}
      style={{ ...EDITOR_INPUT_STYLE, cursor: 'pointer' }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ---------------------------------------------------------------------------
// PriceCellEditor  (displays dollars, saves CAD cents)
// ---------------------------------------------------------------------------

interface PriceCellEditorProps {
  initialCents: number
  onSave: (cents: number) => void
  onCancel: () => void
  onTabForward?: () => void
  onTabBack?: () => void
}

export function PriceCellEditor({ initialCents, onSave, onCancel, onTabForward, onTabBack }: PriceCellEditorProps) {
  const [dollarStr, setDollarStr] = useState((initialCents / 100).toFixed(2))
  const ref = useRef<HTMLInputElement>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  const commitSave = () => {
    const dollars = parseFloat(dollarStr)
    if (!isNaN(dollars) && dollars >= 0) {
      onSave(Math.round(dollars * 100))
    } else {
      onCancel()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelledRef.current = true
      onCancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      cancelledRef.current = true
      commitSave()
      if (e.shiftKey) { onTabBack?.() } else { onTabForward?.() }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      cancelledRef.current = true
      commitSave()
    }
  }

  return (
    <input
      ref={ref}
      type="number"
      step="0.01"
      min="0"
      value={dollarStr}
      onChange={e => setDollarStr(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => { if (!cancelledRef.current) commitSave() }}
      style={EDITOR_INPUT_STYLE}
    />
  )
}

// ---------------------------------------------------------------------------
// TagCellEditor  (multi-select popover for MerchandisingTag[])
// ---------------------------------------------------------------------------

const ALL_TAGS: MerchandisingTag[] = ['just-arrived', 'staff-pick', 'price-dropped', 'rare-find', 'limited-edition']
const RESTRICTED_TAGS: MerchandisingTag[] = ['rare-find', 'limited-edition']

interface TagCellEditorProps {
  initialTags: MerchandisingTag[]
  isAdmin: boolean
  onSave: (tags: MerchandisingTag[]) => void
  onCancel: () => void
}

export function TagCellEditor({ initialTags, isAdmin, onSave }: TagCellEditorProps) {
  const [tags, setTags] = useState<MerchandisingTag[]>(initialTags)
  const ref = useRef<HTMLDivElement>(null)
  const availableTags = isAdmin ? ALL_TAGS : ALL_TAGS.filter(t => !RESTRICTED_TAGS.includes(t))

  useEffect(() => {
    ref.current?.focus()
  }, [])

  const toggle = (tag: MerchandisingTag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="listbox"
      aria-multiselectable="true"
      aria-label="Select merchandising tags"
      onKeyDown={e => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault()
          onSave(tags)
        }
      }}
      onBlur={e => {
        if (!ref.current?.contains(e.relatedTarget as Node)) onSave(tags)
      }}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 200,
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2)',
        minWidth: '180px',
        boxShadow: '0 var(--space-2) var(--space-8) rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
      }}
    >
      {availableTags.map(tag => (
        <label
          key={tag}
          role="option"
          aria-selected={tags.includes(tag)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-1) var(--space-2)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text)',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={tags.includes(tag)}
            onChange={() => toggle(tag)}
            style={{ accentColor: 'var(--color-primary)' }}
          />
          {tag}
        </label>
      ))}
      <button
        type="button"
        onClick={() => onSave(tags)}
        style={{
          marginTop: 'var(--space-1)',
          minHeight: '32px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          fontSize: 'var(--text-xs)',
          cursor: 'pointer',
        }}
      >
        Apply
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PoliceHoldCell  (inline toggle button — not a modal editor)
// ---------------------------------------------------------------------------

interface PoliceHoldCellProps {
  value: boolean
  isAdmin: boolean
  onSave: (value: boolean) => void
}

export function PoliceHoldCell({ value, isAdmin, onSave }: PoliceHoldCellProps) {
  if (!isAdmin) {
    return (
      <span style={{
        fontSize: 'var(--text-xs)',
        color: value ? 'var(--color-error)' : 'var(--color-text-muted)',
        fontWeight: value ? 700 : undefined,
      }}>
        {value ? 'HOLD' : '—'}
      </span>
    )
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onSave(!value)}
      style={{
        minHeight: '32px',
        padding: '0 var(--space-2)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid',
        borderColor: value ? 'var(--color-error)' : 'var(--color-border)',
        backgroundColor: value
          ? 'color-mix(in srgb, var(--color-error) 20%, transparent)'
          : 'transparent',
        color: value ? 'var(--color-error)' : 'var(--color-text-muted)',
        fontSize: 'var(--text-xs)',
        fontWeight: value ? 700 : undefined,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {value ? 'HOLD' : 'Clear'}
    </button>
  )
}

