import type { ConditionGrade } from '../../lib/types'

interface ConditionOption {
  value: ConditionGrade
  label: string
  description: string
}

const CONDITIONS: ConditionOption[] = [
  { value: 'new',      label: 'New',       description: 'Never used — original packaging' },
  { value: 'like-new', label: 'Like New',  description: 'Minimal use — no visible wear' },
  { value: 'good',     label: 'Good',      description: 'Normal wear — fully functional' },
  { value: 'fair',     label: 'Fair',      description: 'Visible wear — works as expected' },
  { value: 'poor',     label: 'Poor',      description: 'Heavy wear or minor issues' },
]

interface ConditionSelectorProps {
  value: ConditionGrade | ''
  onChange: (value: ConditionGrade) => void
  error?: string
}

export default function ConditionSelector({ value, onChange, error }: ConditionSelectorProps) {
  return (
    <fieldset className="condition-selector">
      <legend className="input-label">Condition</legend>
      <div className="condition-options">
        {CONDITIONS.map((c) => (
          <label
            key={c.value}
            className={`condition-option${value === c.value ? ' condition-option--selected' : ''}`}
          >
            <input
              type="radio"
              name="condition"
              value={c.value}
              checked={value === c.value}
              onChange={() => onChange(c.value)}
              className="sr-only"
            />
            <span className="condition-option-label">{c.label}</span>
            <span className="condition-option-desc">{c.description}</span>
          </label>
        ))}
      </div>
      {error && (
        <span className="input-error" role="alert">
          {error}
        </span>
      )}
    </fieldset>
  )
}
