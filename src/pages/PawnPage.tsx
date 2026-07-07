import { useEffect } from 'react'
import PawnHero from '../components/pawn/PawnHero'
import RecentlySoldStrip from '../components/pawn/RecentlySoldStrip'
import ActivityFeed from '../components/pawn/ActivityFeed'
import CampaignBanner from '../components/CampaignBanner'
import ArticleSection from '../components/ArticleSection'
import YearsInBusinessBadge from '../components/pawn/YearsInBusinessBadge'
import { Analytics } from '../lib/analytics'
import ShopMenu from '../components/pawn/ShopMenu'

export default function PawnPage() {
  useEffect(() => {
    Analytics.pageView({ view: 'pawn', page_path: '/pawn' })
  }, [])

  return (
    <div>
      <PawnHero />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>

        {/* Recently sold strip — real sold data only (Dale persona) */}
        <RecentlySoldStrip />

        {/* Privacy-safe live activity feed (Sandra persona) */}
        <ActivityFeed />

        {/* Campaign banner — any active pawn promotion */}
        <CampaignBanner />

        {/* Brother POS shop embed — liquidation + fireworks inventory */}
        <ShopMenu />
    

        {/* Narrative & Stories — E19 Akwesasne identity foundation */}
        <ArticleSection viewTag="pawn" title="Akwesasne Narrative" />

        {/* Trust strip — years in business (Makoonsii + Dale) */}
        <section
          aria-label="Store trust signals"
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 'var(--space-16)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <YearsInBusinessBadge />
        </section>
      </div>
    </div>
  )
}