import type { MerchandisingTag } from '../../lib/types'

const TAG_CLASS: Record<MerchandisingTag, string> = {
  'just-arrived':    'merch-badge merch-badge--just-arrived',
  'rare-find':       'merch-badge merch-badge--rare-find',
  'limited-edition': 'merch-badge merch-badge--limited-edition',
  'staff-pick':      'merch-badge merch-badge--staff-pick',
  'price-dropped':   'merch-badge merch-badge--price-dropped',
}

const TAG_LABEL: Record<MerchandisingTag, string> = {
  'just-arrived':    'Just arrived',
  'rare-find':       'Rare find',
  'limited-edition': 'Limited edition',
  'staff-pick':      'Staff pick',
  'price-dropped':   'Price dropped',
}

interface TagBadgeProps {
  tag: MerchandisingTag
}

export default function TagBadge({ tag }: TagBadgeProps) {
  return <span className={TAG_CLASS[tag]}>{TAG_LABEL[tag]}</span>
}
