import type { MerchandisingTag } from '../../lib/types'

interface TagOption {
  value: MerchandisingTag
  label: string
}

const TAGS: TagOption[] = [
  { value: 'just-arrived',    label: 'Just Arrived' },
  { value: 'rare-find',       label: 'Rare Find' },
  { value: 'limited-edition', label: 'Limited Edition' },
  { value: 'staff-pick',      label: 'Staff Pick' },
]

interface MerchandisingTagSelectorProps {
  value: MerchandisingTag[]
  onChange: (tags: MerchandisingTag[]) => void
}

export default function MerchandisingTagSelector({ value, onChange }: MerchandisingTagSelectorProps) {
  const toggle = (tag: MerchandisingTag) => {
    onChange(
      value.includes(tag)
        ? value.filter((t) => t !== tag)
        : [...value, tag]
    )
  }

  return (
    <fieldset className="merch-tag-selector">
      <legend className="input-label">Merchandising Tags</legend>
      <p className="merch-tag-note">Staff-set only — no algorithmic tags</p>
      <div className="merch-tag-options">
        {TAGS.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-pressed={value.includes(t.value)}
            className={`merch-tag-btn${value.includes(t.value) ? ' merch-tag-btn--active' : ''}`}
            onClick={() => toggle(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
