import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { formatPrice } from '../../lib/format'
import type { Item } from '../../lib/types'

function docToSoldItem(doc: { id: string; data: () => Record<string, unknown> }): Item {
  const d = doc.data()
  return {
    id: doc.id,
    title:       String(d['title'] ?? ''),
    description: String(d['description'] ?? ''),
    category:    String(d['category'] ?? ''),
    viewTag:     (d['viewTag'] as Item['viewTag']) ?? 'pawn',
    status:      'sold',
    price:       Number(d['price'] ?? 0),
    condition:   (d['condition'] as Item['condition']) ?? 'good',
    images:      (d['images'] as string[]) ?? [],
    searchTokens: [],
    soldAt:      d['soldAt'] != null ? (d['soldAt'] as { toDate(): Date }).toDate() : undefined,
  }
}

export default function RecentlySoldStrip() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    const q = query(
      collection(db, 'items'),
      where('status', '==', 'sold'),
      orderBy('soldAt', 'desc'),
      limit(8),
    )
    getDocs(q).then((snap) => {
      const results = snap.docs
        .map(docToSoldItem)
        .filter((item) => item.policeHold !== true)
        .slice(0, 5)
      setItems(results)
    }).catch(() => { /* non-critical — strip simply stays hidden */ })
  }, [])

  if (items.length === 0) return null

  return (
    <section aria-labelledby="recently-sold-heading" style={{ marginBottom: 'var(--space-12)' }}>
      <h2
        id="recently-sold-heading"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-heading)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-2)',
        }}
      >
        Recently Sold
      </h2>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        color: 'var(--color-text-muted)',
        marginBottom: 'var(--space-6)',
        fontStyle: 'italic',
      }}>
        Real items, real sales — this is what's been moving.
      </p>

      <div
        role="list"
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-2)',
          scrollbarWidth: 'thin',
        }}
      >
        {items.map((item) => (
          <article
            key={item.id}
            role="listitem"
            style={{
              flex: '0 0 160px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              opacity: 0.85,
            }}
          >
            {item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                loading="lazy"
                style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '110px',
                backgroundColor: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No image</span>
              </div>
            )}

            <div style={{ padding: 'var(--space-3)' }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-text)',
                margin: '0 0 var(--space-1)',
                lineHeight: 1.3,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {item.title}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                margin: '0 0 var(--space-2)',
                fontWeight: 600,
              }}>
                {formatPrice(item.price)}
              </p>
              <span style={{
                display: 'inline-block',
                padding: 'var(--space-1) var(--space-2)',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Sold
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
