import type { MerchandisingTag } from '../lib/types'

const BADGE_CONFIG: Record<MerchandisingTag, { label: string; className: string }> = {
  'staff-pick':      { label: '★ Staff Pick',      className: 'merch-badge merch-badge--staff-pick' },
  'just-arrived':    { label: 'Just Arrived',       className: 'merch-badge merch-badge--just-arrived' },
  'rare-find':       { label: 'Rare Find',          className: 'merch-badge merch-badge--rare-find' },
  'limited-edition': { label: 'Limited Edition',    className: 'merch-badge merch-badge--limited-edition' },
  'price-dropped':   { label: '↓ Price Dropped',    className: 'merch-badge merch-badge--price-dropped' },
}

interface MerchandisingBadgeProps {
  tag: MerchandisingTag
}

export default function MerchandisingBadge({ tag }: MerchandisingBadgeProps) {
  const config = BADGE_CONFIG[tag]
  if (!config) return null
  return <span className={config.className}>{config.label}</span>
}
