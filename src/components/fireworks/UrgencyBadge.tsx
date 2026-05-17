type UrgencyType = 'low-stock' | 'last-chance' | 'seasonal'

interface UrgencyBadgeProps {
  type: UrgencyType
  label: string
}

const URGENCY_STYLES: Record<UrgencyType, { bg: string; text: string; border: string }> = {
  'low-stock':   { bg: 'color-mix(in srgb, var(--color-warning) 15%, transparent)', text: 'var(--color-warning)', border: 'color-mix(in srgb, var(--color-warning) 40%, transparent)' },
  'last-chance': { bg: 'color-mix(in srgb, var(--color-danger)  15%, transparent)', text: 'var(--color-danger)',  border: 'color-mix(in srgb, var(--color-danger)  40%, transparent)' },
  'seasonal':    { bg: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', text: 'var(--color-primary)', border: 'color-mix(in srgb, var(--color-primary) 40%, transparent)' },
}

export default function UrgencyBadge({ type, label }: UrgencyBadgeProps) {
  const styles = URGENCY_STYLES[type]
  return (
    <span
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${styles.border}`,
        backgroundColor: styles.bg,
        color: styles.text,
        fontFamily: 'var(--font-display)',
        fontSize: '13px',
        fontWeight: 400,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  )
}
