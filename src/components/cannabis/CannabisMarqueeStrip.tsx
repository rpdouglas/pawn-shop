import '../../index.css'

export default function CannabisMarqueeStrip() {
  const items = [
    '🇺🇸 American Import',
    '🍁 Canadian Prices',
    '🔍 Hard to Find',
    'Distinctly Akwesasne',
    'Cross-Border Finds',
    'Dapper · Debonair',
    'Limited Stock',
    'In-Store Only',
  ]
  const stripItems = [...items, ...items]

  return (
    <div
      style={{
        background: 'var(--color-primary)',
        padding: '0.55rem 0',
        overflow: 'hidden',
      }}
    >
      <div
        className="marquee-inner"
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'marquee 30s linear infinite',
        }}
      >
        {stripItems.map((text, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-surface)',
              padding: '0 2rem',
              flexShrink: 0,
            }}
          >
            {text}
            <span
              style={{
                margin: '0 0.6rem',
                opacity: 0.4,
              }}
            >
              ◆
            </span>
          </span>
        ))}
      </div>
      <style>
        {`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  )
}
