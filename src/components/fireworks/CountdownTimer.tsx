import { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  targetDate: Date
  label?: string
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  return (
    <div
      aria-label={label ?? 'Countdown timer'}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      {label && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}>
          {label}
        </p>
      )}

      {isExpired
        ? (
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-subheading)',
            color: 'var(--color-primary)',
            margin: 0,
          }}>
            Event ended
          </p>
        )
        : (
          <div
            aria-live="polite"
            aria-atomic="true"
            style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}
          >
            {[
              { value: timeLeft.days,    unit: 'd' },
              { value: timeLeft.hours,   unit: 'h' },
              { value: timeLeft.minutes, unit: 'm' },
              { value: timeLeft.seconds, unit: 's' },
            ].map(({ value, unit }, i) => (
              <span key={unit} style={{ display: 'flex', alignItems: 'baseline' }}>
                {i > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-heading)',
                    color: 'var(--color-primary)',
                    marginRight: 'var(--space-1)',
                    lineHeight: 1,
                  }}>
                    :
                  </span>
                )}
                <span
                  key={value}
                  className="countdown-digit"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-display)',
                    fontWeight: 400,
                    color: 'var(--color-text)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    minWidth: '2ch',
                    textAlign: 'center',
                  }}
                >
                  {pad(value)}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {unit}
                </span>
              </span>
            ))}
          </div>
        )
      }
    </div>
  )
}
