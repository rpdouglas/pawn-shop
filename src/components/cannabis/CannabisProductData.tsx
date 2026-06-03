
import type { CannabisProfile } from '../../lib/types'
import TerpeneProfile from './TerpeneProfile'

export default function CannabisProductData({ profile }: { profile: CannabisProfile }) {
  if (!profile) return null
  const unit = profile.cannabinoidUnit || '%'

  return (
    <div className="cannabis-product-data" style={{ padding: 'var(--space-16) 0', marginTop: 'var(--space-16)', borderTop: '1px solid var(--color-border)' }}>
      <h3 style={{ margin: '0 0 var(--space-16) 0', color: 'var(--color-text-lead)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        Wellness Profile
        {profile.strainType && (
          <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
            {profile.strainType.replace('-', ' ')}
          </span>
        )}
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', marginBottom: 'var(--space-24)' }}>
        {profile.brand && (
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Producer</div>
            <div>{profile.brand}</div>
          </div>
        )}
        {profile.geneticLineage && (
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Genetics</div>
            <div>{profile.geneticLineage}</div>
          </div>
        )}
        {profile.format && (
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Format</div>
            <div>
              {profile.format} {profile.subCategory ? `— ${profile.subCategory}` : ''}
              <br/>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {profile.servings && profile.weightPerServing 
                  ? `${profile.servings} x ${profile.weightPerServing} (${profile.weight} total)`
                  : profile.weight}
              </span>
            </div>
          </div>
        )}
        {(profile.thcMin !== undefined || profile.cbdMin !== undefined) && (
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Potency</div>
            <div>
              {profile.thcMin !== undefined && `THC: ${profile.thcMin}${profile.thcMax ? '-' + profile.thcMax : ''}${unit}`}
              {profile.thcMin !== undefined && profile.cbdMin !== undefined && ' | '}
              {profile.cbdMin !== undefined && `CBD: ${profile.cbdMin}${profile.cbdMax ? '-' + profile.cbdMax : ''}${unit}`}
            </div>
          </div>
        )}
      </div>

      {profile.effectProfile && profile.effectProfile.length > 0 && (
        <div style={{ marginBottom: 'var(--space-24)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>Reported Effects</div>
          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            {profile.effectProfile.map(effect => (
              <span key={effect} className="badge badge-outline" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                {effect}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.terpenes && profile.terpenes.length > 0 && (
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-16)', textAlign: 'center' }}>Dominant Terpenes</div>
          <TerpeneProfile terpenes={profile.terpenes} />
        </div>
      )}
    </div>
  )
}
