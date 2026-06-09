import { useStoreConfig } from '../lib/useStoreConfig'
import type { HeroMedia, HeroMediaType } from '../lib/types'

type HeroView = 'pawn' | 'cannabis' | 'fireworks'

function isHeroMediaType(value: unknown): value is HeroMediaType {
  return value === 'youtube' || value === 'carousel' || value === 'none'
}

function parseHeroMedia(raw: unknown): HeroMedia | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (!isHeroMediaType(obj.mediaType)) return null

  const media: HeroMedia = { mediaType: obj.mediaType }

  if (typeof obj.youtubeId === 'string' && obj.youtubeId) {
    media.youtubeId = obj.youtubeId
  }

  if (Array.isArray(obj.carouselImages)) {
    media.carouselImages = obj.carouselImages
      .filter((img): img is Record<string, unknown> => img !== null && typeof img === 'object')
      .filter(img => typeof img.url === 'string' && typeof img.alt === 'string')
      .map(img => ({ url: img.url as string, alt: img.alt as string }))
  }

  return media
}

export function useHeroMedia(view: HeroView): HeroMedia | null {
  const { data } = useStoreConfig('shopInfo')
  if (!data) return null

  const heroData = (data as Record<string, unknown>).heroData
  if (!heroData || typeof heroData !== 'object') return null

  const viewData = (heroData as Record<string, unknown>)[view]
  return parseHeroMedia(viewData)
}
