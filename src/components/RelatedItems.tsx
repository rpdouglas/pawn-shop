import { useItems } from '../hooks/useItems'
import { formatPrice } from '../lib/format'
import type { Item } from '../lib/types'

interface RelatedItemsProps {
  currentItem: Item
  onSelect: (item: Item) => void
}

export default function RelatedItems({ currentItem, onSelect }: RelatedItemsProps) {
  const { items, loading } = useItems(currentItem.viewTag, { limit: 8, orderByField: 'trendingScore' })

  const related = items
    .filter((i) => i.id !== currentItem.id && i.category === currentItem.category)
    .slice(0, 4)

  if (loading || related.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="related-items">
      <h3 id="related-heading" className="related-items__heading">
        You may also like
      </h3>
      <div className="related-items__strip">
        {related.map((item) => (
          <button
            key={item.id}
            type="button"
            className="related-item-card"
            onClick={() => onSelect(item)}
            aria-label={`${item.title} — ${formatPrice(item.price)}`}
          >
            <div className="related-item-card__image-wrap">
              {item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  loading="lazy"
                  className="related-item-card__image"
                />
              ) : (
                <div className="related-item-card__no-image" aria-hidden="true" />
              )}
            </div>
            <p className="related-item-card__title">{item.title}</p>
            <p className="related-item-card__price">{formatPrice(item.price)}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
