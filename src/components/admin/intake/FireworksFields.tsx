import Input from '../../ui/Input'
import type { FormState } from './types'

interface FireworksFieldsProps {
  formState: FormState
  set: (field: keyof FormState) => (value: string | number) => void
}

export default function FireworksFields({ formState, set }: FireworksFieldsProps) {
  if (formState.viewTag !== 'fireworks') return null

  return (
    <section className="intake-section">
      <h2 className="intake-section-heading">Fireworks Profile</h2>
      
      <div className="intake-row intake-row-2">
        <Input
          id="explosiveWeight"
          label="Explosive Weight"
          value={formState.explosiveWeight}
          onChange={set('explosiveWeight')}
          placeholder="e.g. 500g"
        />
        <Input
          id="classificationClass"
          label="Classification Class"
          value={formState.classificationClass}
          onChange={set('classificationClass')}
          placeholder="e.g. 1.4G Consumer"
        />
      </div>

      <div className="intake-row intake-row-2">
        <Input
          id="effectType"
          label="Effect Type"
          value={formState.effectType}
          onChange={set('effectType')}
          placeholder="e.g. Aerial Repeater"
        />
        <div className="input-wrapper">
          <label className="input-label" htmlFor="noiseLevel">Noise Level</label>
          <select
            id="noiseLevel"
            className="input-field"
            value={formState.noiseLevel}
            onChange={(e) => set('noiseLevel')(e.target.value)}
          >
            <option value="">Select Noise Level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="intake-row intake-row-2">
        <Input
          id="shots"
          label="Shots (Count)"
          type="number"
          value={formState.shots}
          onChange={set('shots')}
          placeholder="e.g. 25"
        />
        <Input
          id="duration"
          label="Duration (Seconds)"
          type="number"
          value={formState.duration}
          onChange={set('duration')}
          placeholder="e.g. 45"
        />
      </div>
    </section>
  )
}
