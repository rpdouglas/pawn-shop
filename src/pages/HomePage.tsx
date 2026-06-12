import { useView } from '../context/ViewContext'
import HomeHero from '../components/home/HomeHero'
import PortalCard from '../components/layout/PortalCard'

export default function HomePage() {
  const { view } = useView()

  return (
    <div className={`view-${view}`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <HomeHero />
      <nav className="home-grid" aria-label="Shop verticals">
        <PortalCard
          to="/pawn"
          icon={<span className="ti ti-scale" />}
          title="Pawn & Resale"
          description="Verified deals, transparent valuation, and community trust."
          variant="grid"
        />
        <PortalCard
          to="/cannabis"
          icon={<span className="ti ti-leaf" />}
          title="Cannabis"
          description="Premium wellness selections for the discerning connoisseur."
          variant="grid"
        />
        <PortalCard
          to="/fireworks"
          icon={<span className="ti ti-star" />}
          title="Fireworks"
          description="Celebrate the season with high-energy displays and bundles."
          variant="grid"
        />
        <PortalCard
          to="/tobacco"
          icon={<span className="ti ti-flame" />}
          title="Tobacco"
          description="Quality cigars, cigarettes, and smoking accessories."
          variant="grid"
        />
      </nav>
    </div>
  )
}
