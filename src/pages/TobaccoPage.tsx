import { useEffect } from 'react'
import PortalLayout from '../components/layout/PortalLayout'
import PortalCard from '../components/layout/PortalCard'
import ArticleSection from '../components/ArticleSection'
import CampaignBanner from '../components/CampaignBanner'
import { Analytics } from '../lib/analytics'

export default function TobaccoPage() {
  useEffect(() => {
    Analytics.pageView({ view: 'tobacco', page_path: '/tobacco' })
  }, [])

  return (
    <div className="view-tobacco" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <PortalLayout
        title="Tobacco & Fine Smoking"
        subtitle="Premium Selection · Cornwall Island"
        logoSrc="/branding/logo.webp"
      >
        <CampaignBanner />

        <PortalCard
          to="/tobacco/cigars"
          icon={<span className="ti ti-cigar" />}
          title="Premium Cigars"
          description="Hand-rolled selections from the world's finest regions."
        />
        <PortalCard
          to="/tobacco/cigarettes"
          icon={<span className="ti ti-package" />}
          title="Cigarettes"
          description="Full range of domestic and premium brands."
        />
        <PortalCard
          to="/tobacco/accessories"
          icon={<span className="ti ti-lighter" />}
          title="Accessories"
          description="Lighters, cutters, humidors, and smoking essentials."
        />

        <ArticleSection viewTag="tobacco" title="The Ritual of Smoke" />
      </PortalLayout>
    </div>
  )
}
