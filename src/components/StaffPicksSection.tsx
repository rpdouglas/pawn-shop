import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { docToItem } from '../hooks/useItems'
import { formatPrice } from '../lib/format'
import type { Item } from '../lib/types'

function useStaffPicks(): { items: Item[]; loading: boolean } {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'items'),
      where('viewTag', '==', 'pawn'),
      where('status', '==', 'active'),
      where('policeHold', '==', false),
      where('merchandisingTags', 'array-contains', 'staff-pick'),
    )

    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map(docToItem))
        setLoading(false)
      },
      () => setLoading(false),
    )
  }, [])

  return { items, loading }
}

interface StaffPicksCardProps {
  item: Item
  onSelect: (item: Item) => void
}

function StaffPicksCard({ item, onSelect }: StaffPicksCardProps) {
  return (
    <article className="staff-picks-card">
      <button
        type="button"
        className="staff-picks-card__image-btn"
        onClick={() => onSelect(item)}
        aria-label={`View ${item.title}`}
      >
        <div className="staff-picks-card__image-wrap">
          {item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.title}
              loading="lazy"
              className="staff-picks-card__image"
            />
          ) : (
            <div className="staff-picks-card__no-image" aria-hidden="true" />
          )}
          <span className="staff-picks-card__badge" aria-hidden="true">★ Staff Pick</span>
        </div>
      </button>

      <div className="staff-picks-card__body">
        <h3 className="staff-picks-card__title">{item.title}</h3>
        <p className="staff-picks-card__price">{formatPrice(item.price)}</p>
        {item.staffPickNote && (
          <blockquote className="staff-picks-card__note">
            <p>{item.staffPickNote}</p>
          </blockquote>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onSelect(item)}
        >
          Quick view
        </button>
      </div>
    </article>
  )
}

interface StaffPicksSectionProps {
  onItemSelect: (item: Item) => void
}

export default function StaffPicksSection({ onItemSelect }: StaffPicksSectionProps) {
  const { items, loading } = useStaffPicks()

  if (loading || items.length === 0) return null

  return (
    <section aria-labelledby="staff-picks-heading" className="staff-picks-section">
      <h2 id="staff-picks-heading" className="staff-picks-section__heading">
        Staff Picks
      </h2>
      <p className="staff-picks-section__sub">
        Handpicked by our team — objects worth your attention.
      </p>
      <div className="staff-picks-grid">
        {items.map((item) => (
          <StaffPicksCard key={item.id} item={item} onSelect={onItemSelect} />
        ))}
      </div>
    </section>
  )
}
