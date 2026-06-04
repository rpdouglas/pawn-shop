export type LayoutMode = 'grid2' | 'grid3' | 'list' | 'magazine' | 'masonry'

interface LayoutToggleProps {
  mode: LayoutMode
  onChange: (mode: LayoutMode) => void
  allowedModes?: LayoutMode[]
}

const MODES: { mode: LayoutMode; label: string; icon: React.ReactNode }[] = [
  {
    mode: 'masonry',
    label: 'Masonry',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="10" rx="1" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="1" y="12" width="6" height="3" rx="1" fill="currentColor" />
        <rect x="9" y="8" width="6" height="7" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    mode: 'grid2',
    label: 'Two columns',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="14" rx="1" fill="currentColor" />
        <rect x="9" y="1" width="6" height="14" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    mode: 'grid3',
    label: 'Three columns',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="4" height="14" rx="1" fill="currentColor" />
        <rect x="6" y="1" width="4" height="14" rx="1" fill="currentColor" />
        <rect x="11" y="1" width="4" height="14" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    mode: 'list',
    label: 'List',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="2" width="14" height="3" rx="1" fill="currentColor" />
        <rect x="1" y="7" width="14" height="3" rx="1" fill="currentColor" />
        <rect x="1" y="12" width="14" height="3" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    mode: 'magazine',
    label: 'Magazine',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="14" height="8" rx="1" fill="currentColor" />
        <rect x="1" y="11" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="9" y="11" width="6" height="4" rx="1" fill="currentColor" />
      </svg>
    ),
  },
]

export default function LayoutToggle({ mode, onChange, allowedModes = ['grid2', 'grid3', 'list', 'magazine'] }: LayoutToggleProps) {
  const visibleModes = MODES.filter(m => allowedModes.includes(m.mode))

  if (visibleModes.length <= 1) return null

  return (
    <div
      role="group"
      aria-label="Layout"
      style={{
        display: 'flex',
        gap: 'var(--space-1)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-1)',
      }}
    >
      {visibleModes.map(({ mode: m, label, icon }) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-label={label}
          aria-pressed={m === mode}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 'var(--space-12)',
            minHeight: 'var(--space-12)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'background-color var(--motion-speed-fast) var(--motion-easing), color var(--motion-speed-fast) var(--motion-easing)',
            background: m === mode ? 'var(--color-primary)' : 'transparent',
            color: m === mode ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
