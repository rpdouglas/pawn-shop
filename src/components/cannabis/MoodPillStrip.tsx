import type { MoodCategory } from '../../lib/types'

const MOODS: { label: string; icon: string; mood: MoodCategory | null }[] = [
  { label: 'All',      icon: 'circle', mood: null },
  { label: 'Relax',    icon: 'moon',   mood: 'relax' },
  { label: 'Focus',    icon: 'bolt',   mood: 'focus' },
  { label: 'Social',   icon: 'users',  mood: 'social' },
  { label: 'Ceremony', icon: 'flame',  mood: 'ceremony' },
]

interface MoodPillStripProps {
  activeMood: MoodCategory | null
  onChange: (mood: MoodCategory | null) => void
}

export default function MoodPillStrip({ activeMood, onChange }: MoodPillStripProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        overflowX: 'auto',
        paddingBottom: 'var(--space-1)',
        marginBottom: 'var(--space-6)',
      }}
    >
      {MOODS.map(({ label, icon, mood }) => {
        const isActive = activeMood === mood
        return (
          <button
            key={label}
            onClick={() => onChange(mood)}
            aria-pressed={isActive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: '9999px',
              fontSize: 'var(--text-small)',
              border: isActive
                ? '1px solid var(--color-accent)'
                : '1px solid var(--color-border)',
              background: isActive
                ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
                : 'transparent',
              color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontWeight: isActive ? 500 : 400,
              transition: 'all var(--motion-speed-fast) var(--motion-easing)',
              minHeight: 'var(--space-12)',
              whiteSpace: 'nowrap',
            }}
          >
            <i className={`ti ti-${icon}`} aria-hidden="true" style={{ fontSize: 'var(--text-small)' }} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
