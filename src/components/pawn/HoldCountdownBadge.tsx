import { useState, useEffect } from 'react'

interface HoldCountdownBadgeProps {
  holdExpiresAt: Date
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return ''
  const totalMinutes = Math.floor(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}

export default function HoldCountdownBadge({ holdExpiresAt }: HoldCountdownBadgeProps) {
  const [remaining, setRemaining] = useState(() => holdExpiresAt.getTime() - Date.now())

  useEffect(() => {
    const tick = () => setRemaining(holdExpiresAt.getTime() - Date.now())
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [holdExpiresAt])

  if (remaining <= 0) return null

  return (
    <span
      style={{
        display: 'inline-block',
        padding: 'var(--space-1) var(--space-2)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-primary)',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-primary)',
        letterSpacing: '0.03em',
      }}
      aria-label={`Item reserved — ${formatRemaining(remaining)}`}
    >
      Reserved · {formatRemaining(remaining)}
    </span>
  )
}
