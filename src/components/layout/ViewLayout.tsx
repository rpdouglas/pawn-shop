import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useView } from '../../context/ViewContext'
import GlobalHeader from './GlobalHeader'
import { VIEW_META_THEME_COLORS } from '../../lib/theme-colors'

const VIEW_META: Record<string, { title: string; description: string }> = {
  pawn: {
    title:       'The Pawn Shop — Pawn & Resale · Cornwall Island, Akwesasne',
    description: 'Browse verified pawn and resale inventory at The Pawn Shop, Cornwall Island, Akwesasne. Electronics, jewellery, tools, and more — new arrivals daily.',
  },
  cannabis: {
    title:       'Wellness Collection — The Pawn Shop · Cornwall Island, Akwesasne',
    description: 'Curated adult wellness products, age-verified 19+. The Pawn Shop, Cornwall Island, Akwesasne.',
  },
  fireworks: {
    title:       'Fireworks & Celebrations — The Pawn Shop · Cornwall Island, Akwesasne',
    description: 'Seasonal fireworks and celebration bundles, age-verified 18+. Reserve for pick-up at The Pawn Shop, Cornwall Island, Akwesasne.',
  },
}

const BASE_URL = 'https://nats-rack.web.app'

interface ViewLayoutProps {
  children: ReactNode
}

export default function ViewLayout({ children }: ViewLayoutProps) {
  const { view } = useView()

  useEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColor) {
      themeColor.content = view in VIEW_META_THEME_COLORS
        ? VIEW_META_THEME_COLORS[view as 'pawn' | 'cannabis' | 'fireworks']
        : VIEW_META_THEME_COLORS.pawn
    }

    const viewMeta = VIEW_META[view]
    if (!viewMeta) return

    document.title = viewMeta.title

    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!desc) {
      desc = document.createElement('meta')
      desc.name = 'description'
      document.head.appendChild(desc)
    }
    desc.content = viewMeta.description

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = `${BASE_URL}/${view}`
  }, [view])

  return (
    <div className={`view-${view} min-h-screen`}>
      <GlobalHeader />
      <div className="view-layout-main">
        {children}
      </div>
    </div>
  )
}
