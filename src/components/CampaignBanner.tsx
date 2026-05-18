import { useState, useEffect } from 'react'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useView } from '../context/ViewContext'
import { formatPrice } from '../lib/format'
import type { Campaign, CampaignViewTag } from '../lib/types'

function docToCampaign(doc: { id: string; data: () => Record<string, unknown> }): Campaign {
  const d = doc.data()
  return {
    id: doc.id,
    title:            String(d['title'] ?? ''),
    viewTag:          (d['viewTag'] as CampaignViewTag) ?? 'pawn',
    startDate:        (d['startDate'] as { toDate(): Date }).toDate(),
    endDate:          (d['endDate'] as { toDate(): Date }).toDate(),
    active:           Boolean(d['active']),
    discountRule:     (d['discountRule'] as Campaign['discountRule']) ?? { type: 'fixed', value: 0 },
    bannerCopy:       String(d['bannerCopy'] ?? ''),
    countdownEnabled: Boolean(d['countdownEnabled']),
    createdBy:        d['createdBy'] != null ? String(d['createdBy']) : undefined,
    updatedAt:        d['updatedAt'] != null ? (d['updatedAt'] as { toDate(): Date }).toDate() : undefined,
    createdAt:        (d['createdAt'] as { toDate(): Date }).toDate(),
  }
}

export default function CampaignBanner() {
  const { view } = useView()
  const [campaign, setCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, 'campaigns'),
      where('active', '==', true),
      limit(20),
    )
    getDocs(q)
      .then((snap) => {
        const match = snap.docs
          .map(docToCampaign)
          .find((c) => c.viewTag === view || c.viewTag === 'all')
        setCampaign(match ?? null)
      })
      .catch(() => {})
  }, [view])

  if (!campaign || !campaign.bannerCopy) return null

  const hasDiscount = campaign.discountRule.value > 0
  const discountText = campaign.discountRule.type === 'percent'
    ? `${campaign.discountRule.value}% off`
    : `${formatPrice(campaign.discountRule.value)} off`

  return (
    <section
      aria-label="Current promotion"
      style={{
        padding: 'var(--space-3) var(--space-5)',
        backgroundColor: 'var(--color-surface)',
        borderLeft: 'var(--space-1) solid var(--color-primary)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 'var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        flexWrap: 'wrap',
      }}
    >
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-body)',
        color: 'var(--color-text)',
        margin: 0,
        lineHeight: 1.4,
        flex: 1,
      }}>
        {campaign.bannerCopy}
      </p>
      {hasDiscount && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text)',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          padding: 'var(--space-1) var(--space-2)',
          backgroundColor: 'var(--color-highlight)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {discountText}
        </span>
      )}
    </section>
  )
}
