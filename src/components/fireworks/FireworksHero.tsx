import { useState, useEffect, useRef } from 'react'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import CountdownTimer from './CountdownTimer'
import { useHeroMedia } from '../../hooks/useHeroMedia'
import { ImageCarousel } from '../ui/ImageCarousel'
import { YouTubeFacade } from '../ui/YouTubeFacade'
import { useFireworksCanvas } from '../../hooks/useFireworksCanvas'
import type { Campaign, CampaignViewTag } from '../../lib/types'

const DEFAULT_VIDEO_ID = '8rmpm3ZOn50'

function docToCampaign(doc: { id: string; data: () => Record<string, unknown> }): Campaign {
  const d = doc.data()
  return {
    id: doc.id,
    title:            String(d['title'] ?? ''),
    viewTag:          (d['viewTag'] as CampaignViewTag) ?? 'fireworks',
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

export default function FireworksHero() {
  const heroMedia = useHeroMedia('fireworks')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useFireworksCanvas(canvasRef)
  // undefined = loading, null = no active countdown campaign, Campaign = found
  const [countdownCampaign, setCountdownCampaign] = useState<Campaign | null | undefined>(undefined)

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
          .find((c) => (c.viewTag === 'fireworks' || c.viewTag === 'all') && c.countdownEnabled)
        setCountdownCampaign(match ?? null)
      })
      .catch(() => { setCountdownCampaign(null) })
  }, [])

  // Resolve video ID: Firestore explicit youtube → Firestore explicit none (suppress) → default
  const videoId: string | null = (() => {
    if (heroMedia?.mediaType === 'none') return null
    if (heroMedia?.mediaType === 'youtube' && heroMedia.youtubeId) return heroMedia.youtubeId
    return DEFAULT_VIDEO_ID
  })()

  const showCountdown = countdownCampaign != null

  return (
    <section
      aria-label="Fireworks — The Pawn Shop"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6) var(--space-16)',
        textAlign: 'center',
        borderBottom: '1px solid var(--color-border)',
        overflow: 'hidden',
        minHeight: '80vh',
      }}
    >
      {/* Fireworks canvas — absolute background, behind overlay and content */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Optional carousel background */}
      {heroMedia?.mediaType === 'carousel' && heroMedia.carouselImages && heroMedia.carouselImages.length > 0 && (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <ImageCarousel images={heroMedia.carouselImages} />
        </div>
      )}

      {/* Dark overlay for text legibility over any background */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1,
        }}
      />

      {/* Text content — headline, tagline, countdown */}
      <div
        className="cinematic-hero-content"
        style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: 'var(--space-12)',
          paddingBottom: videoId ? 'var(--space-12)' : 0,
        }}
      >
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 'var(--space-4)',
        }}>
          The Pawn Shop
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-hero)',
          color: 'var(--color-text)',
          letterSpacing: '0.04em',
          marginBottom: 'var(--space-6)',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          Fireworks
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          marginBottom: showCountdown ? 'var(--space-12)' : 0,
          maxWidth: '480px',
        }}>
          Celebrate the moment properly.
        </p>

        {showCountdown && countdownCampaign && (
          <CountdownTimer
            targetDate={countdownCampaign.endDate}
            label={countdownCampaign.title}
          />
        )}
      </div>

      {/* Video — outside the narrow content column, full editorial width */}
      {videoId && (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '900px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            aspectRatio: '16 / 9',
          }}
        >
          <YouTubeFacade
            videoId={videoId}
            title="Fireworks — The Pawn Shop, Cornwall Island, Akwesasne"
          />
        </div>
      )}
    </section>
  )
}
