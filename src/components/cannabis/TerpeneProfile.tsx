// NOTE (E128/E129): the `var(--x, #hex)` fallbacks in this file are load-bearing —
// there is no .view-cannabis CSS override for --color-primary/--color-border-subtle,
// so removing the fallbacks would silently turn this chart gold instead of purple
// when Cannabis is reactivated (E123). Left as-is pending E129 (per-view token gap).

const STANDARD_TERPENES = ['Myrcene', 'Limonene', 'Caryophyllene', 'Linalool', 'Pinene']

export default function TerpeneProfile({ terpenes = [] }: { terpenes?: string[] }) {
  const size = 200
  const center = size / 2
  const radius = size / 2 - 30
  const angleStep = (Math.PI * 2) / STANDARD_TERPENES.length

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2
    const distance = radius * value
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    }
  }

  const values = STANDARD_TERPENES.map(t => 
    terpenes.some(pt => pt.toLowerCase() === t.toLowerCase()) ? 1 : 0.3
  )

  const points = values.map((val, i) => {
    const pt = getPoint(i, val)
    return `${pt.x},${pt.y}`
  }).join(' ')

  const bgPoints = STANDARD_TERPENES.map((_, i) => {
    const pt = getPoint(i, 1)
    return `${pt.x},${pt.y}`
  }).join(' ')

  return (
    <div className="terpene-profile" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background polygon */}
        <polygon 
          points={bgPoints} 
          fill="none" 
          stroke="var(--color-border-subtle, #333)" 
          strokeWidth="1" 
        />
        
        {/* Axes lines */}
        {STANDARD_TERPENES.map((_, i) => {
          const end = getPoint(i, 1)
          return (
            <line 
              key={i} 
              x1={center} 
              y1={center} 
              x2={end.x} 
              y2={end.y} 
              stroke="var(--color-border-subtle, #333)" 
              strokeWidth="1" 
            />
          )
        })}

        {/* Data polygon */}
        <polygon 
          points={points} 
          fill="var(--color-primary, #7B4FA0)" 
          fillOpacity="0.4"
          stroke="var(--color-primary, #7B4FA0)" 
          strokeWidth="2" 
        />

        {/* Labels */}
        {STANDARD_TERPENES.map((t, i) => {
          const labelDist = 1.25
          const angle = i * angleStep - Math.PI / 2
          const lx = center + Math.cos(angle) * (radius * labelDist)
          const ly = center + Math.sin(angle) * (radius * labelDist)
          
          return (
            <text 
              key={t}
              x={lx} 
              y={ly} 
              fill="var(--color-text-muted, #aaa)" 
              fontSize="10"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {t}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
