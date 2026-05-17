import Card from '../ui/Card'
import { useItems } from '../../hooks/useItems'
import type { Item } from '../../lib/types'

interface FeaturedItemsProps {
  onItemSelect: (item: Item) => void
}

export default function FeaturedItems({ onItemSelect }: FeaturedItemsProps) {
  const { items, loading, error } = useItems('pawn', { limit: 4, orderByField: 'createdAt' })

  if (error) {
    return (
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
        Unable to load featured items.
      </p>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              aspectRatio: '4/3',
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 'var(--space-4)',
    }}>
      {items.map((item) => (
        <Card
          key={item.id}
          title={item.title}
          price={item.price}
          condition={item.condition}
          status={item.status}
          imageUrl={item.images[0]}
          merchandisingTags={item.merchandisingTags}
          onClick={() => onItemSelect(item)}
        />
      ))}
    </div>
  )
}
