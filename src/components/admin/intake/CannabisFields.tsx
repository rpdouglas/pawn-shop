import Input from '../../ui/Input'
import type { FormState } from './types'

interface CannabisFieldsProps {
  formState: FormState
  set: (field: keyof FormState) => (value: any) => void
}

export default function CannabisFields({ formState, set }: CannabisFieldsProps) {
  if (formState.viewTag !== 'cannabis') return null

  return (
    <section className="intake-section">
      <h2 className="intake-section-heading">Cannabis Profile</h2>
      
      <div className="intake-row intake-row-2">
        <Input
          id="brand"
          label="Brand/Producer"
          value={formState.brand}
          onChange={set('brand')}
          placeholder="e.g. Broken Coast"
        />
        <div className="input-wrapper">
          <label className="input-label" htmlFor="strainType">Strain Type</label>
          <select
            id="strainType"
            className="input-field"
            value={formState.strainType}
            onChange={(e) => set('strainType')(e.target.value)}
          >
            <option value="">Select Strain</option>
            <option value="sativa">Sativa</option>
            <option value="indica">Indica</option>
            <option value="hybrid">Hybrid</option>
            <option value="blend">Blend</option>
            <option value="high-cbd">High CBD</option>
          </select>
        </div>
      </div>

      <div className="intake-row intake-row-2">
        <Input
          id="geneticLineage"
          label="Genetic Lineage"
          value={formState.geneticLineage}
          onChange={set('geneticLineage')}
          placeholder="e.g. Sativa - Sour Diesel"
        />
      </div>

      <div className="intake-row">
        <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>Potency Unit:</label>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text)' }}>
              <input type="radio" name="cannabinoidUnit" value="%" checked={formState.cannabinoidUnit === '%'} onChange={(e) => set('cannabinoidUnit')(e.target.value)} />
              % (Flower / Vapes)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text)' }}>
              <input type="radio" name="cannabinoidUnit" value="mg" checked={formState.cannabinoidUnit === 'mg'} onChange={(e) => set('cannabinoidUnit')(e.target.value)} />
              mg (Edibles / Oils)
            </label>
          </div>
        </div>
      </div>

      <div className="intake-row intake-row-4">
        <Input
          id="thcMin"
          label="THC Min %"
          value={formState.thcMin}
          onChange={set('thcMin')}
          placeholder="e.g. 20"
        />
        <Input
          id="thcMax"
          label="THC Max %"
          value={formState.thcMax}
          onChange={set('thcMax')}
          placeholder="e.g. 25"
        />
        <Input
          id="cbdMin"
          label="CBD Min %"
          value={formState.cbdMin}
          onChange={set('cbdMin')}
          placeholder="e.g. 0"
        />
        <Input
          id="cbdMax"
          label="CBD Max %"
          value={formState.cbdMax}
          onChange={set('cbdMax')}
          placeholder="e.g. 1"
        />
      </div>

      <div className="intake-row intake-row-2">
        <Input
          id="terpenes"
          label="Terpenes (comma separated)"
          value={formState.terpenes}
          onChange={set('terpenes')}
          placeholder="e.g. Myrcene, Limonene, Caryophyllene"
        />
        <Input
          id="effectProfile"
          label="Effects (comma separated)"
          value={formState.effectProfile}
          onChange={set('effectProfile')}
          placeholder="e.g. Relax, Sleep"
        />
      </div>

      <div className="intake-row intake-row-2">
        <Input
          id="format"
          label="Format"
          value={formState.format}
          onChange={set('format')}
          placeholder="e.g. Pre-Roll, Dried Flower, Vape"
        />
        <Input
          id="subCategory"
          label="Sub Category"
          value={formState.subCategory}
          onChange={set('subCategory')}
          placeholder="e.g. Infused, 510 Thread"
        />
      </div>

      <div className="intake-row intake-row-3">
        <Input
          id="weight"
          label="Total Weight / Size"
          value={formState.weight}
          onChange={set('weight')}
          placeholder="e.g. 3.5g, 10-pack"
        />
        <Input
          id="servings"
          label="Servings (Count)"
          type="number"
          value={formState.servings}
          onChange={set('servings')}
          placeholder="e.g. 10"
        />
        <Input
          id="weightPerServing"
          label="Weight Per Serving"
          value={formState.weightPerServing}
          onChange={set('weightPerServing')}
          placeholder="e.g. 0.5g"
        />
      </div>

      <div className="intake-row intake-row-2">
        <Input
          id="lotNumber"
          label="Lot Number"
          value={formState.lotNumber}
          onChange={set('lotNumber')}
          placeholder="e.g. LOT12345"
        />
        <Input
          id="packagedDate"
          label="Packaged Date (YYYY-MM-DD)"
          value={formState.packagedDate}
          onChange={set('packagedDate')}
          placeholder="2026-05-01"
        />
      </div>
    </section>
  )
}
