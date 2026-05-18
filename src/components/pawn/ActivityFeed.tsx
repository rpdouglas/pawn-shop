import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { ActivityFeedEntry, ViewType } from '../../lib/types'

const VIEW_LABELS: Record<ViewType, string> = {
  pawn:      'Pawn Shop',
  cannabis:  'Cannabis Wellness',
  fireworks: 'Fireworks',
}

function entryFromDoc(doc: { id: string; data: () => Record<string, unknown> }): ActivityFeedEntry {
  const d = doc.data()
  return {
    id:          doc.id,
    viewTag:     (d['viewTag'] as ViewType) ?? 'pawn',
    action:      'browsing',
    displayCity: String(d['displayCity'] ?? 'Cornwall Island'),
    createdAt:   d['createdAt'] != null ? (d['createdAt'] as Timestamp).toDate() : new Date(),
  }
}

export default function ActivityFeed() {
  const [entries, setEntries] = useState<ActivityFeedEntry[]>([])

  useEffect(() => {
    const q = query(
      collection(db, 'activityFeed'),
      orderBy('createdAt', 'desc'),
      limit(10),
    )
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map(entryFromDoc))
    }, () => { /* snapshot errors are non-fatal — feed stays hidden */ })
    return unsub
  }, [])

  if (entries.length === 0) return null

  return (
    <aside aria-label="Live activity" style={{ marginBottom: 'var(--space-12)' }}>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Live Activity
      </h2>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
        aria-live="polite"
        aria-relevant="additions"
      >
        {entries.map((entry) => (
          <li
            key={entry.id}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-sm)',
              animation: 'fade-up var(--motion-speed-standard) var(--motion-easing) both',
            }}
          >
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Someone in {entry.displayCity}
            </span>
            {' '}is browsing{' '}
            <span style={{ fontStyle: 'italic' }}>
              {VIEW_LABELS[entry.viewTag]}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
