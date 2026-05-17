import type { MoodCategory } from '../../lib/types'

const MOOD_CONFIG: Record<MoodCategory, { label: string; description: string }> = {
  relax:    { label: 'Relax',    description: 'Unwind and find your calm' },
  focus:    { label: 'Focus',    description: 'Clarity and creative flow' },
  social:   { label: 'Social',   description: 'Connection and celebration' },
  ceremony: { label: 'Ceremony', description: 'Ritual and reflection' },
}

interface MoodCardProps {
  mood: MoodCategory
  itemCount?: number
  onClick?: () => void
}

export default function MoodCard({ mood, itemCount, onClick }: MoodCardProps) {
  const config = MOOD_CONFIG[mood]
  const isInteractive = onClick !== undefined

  return (
    <article
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive
        ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }
        : undefined
      }
      aria-label={`${config.label} collection${itemCount !== undefined ? ` — ${itemCount} items` : ''}`}
      className={isInteractive ? 'interactive-surface' : undefined}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '32px 24px',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
      }}
      onMouseEnter={isInteractive ? (e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'
      } : undefined}
      onMouseLeave={isInteractive ? (e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
      } : undefined}
    >
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px',
        fontWeight: 300,
        color: 'var(--color-text)',
        marginBottom: '8px',
        letterSpacing: '0.01em',
      }}>
        {config.label}
      </h3>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '15px',
        color: 'var(--color-text-muted)',
        margin: 0,
        lineHeight: 1.5,
      }}>
        {config.description}
      </p>
      {itemCount !== undefined && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-primary)',
          marginTop: '16px',
          marginBottom: 0,
          fontWeight: 500,
        }}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      )}
    </article>
  )
}
