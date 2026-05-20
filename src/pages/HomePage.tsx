import { useView } from '../context/ViewContext'
import PortalLayout from '../components/layout/PortalLayout'
import PortalCard from '../components/layout/PortalCard'

export default function HomePage() {
  const { view } = useView()

  return (
    <div className={`view-${view}`} style={{ backgroundColor: 'var(--color-bg)' }}>
      <PortalLayout
        title="The Pawn Shop"
        subtitle="Cornwall Island · Akwesasne"
        logoSrc="/branding/logo.webp"
      >
        <PortalCard
          to="/pawn"
          icon={<span className="ti ti-scale" />}
          title="Pawn & Resale"
          description="Verified deals, transparent valuation, and community trust."
        />
        <PortalCard
          to="/cannabis"
          icon={<span className="ti ti-leaf" />}
          title="Cannabis"
          description="Premium wellness selections for the discerning connoisseur."
        />
        <PortalCard
          to="/fireworks"
          icon={<span className="ti ti-star" />}
          title="Fireworks"
          description="Celebrate the season with high-energy displays and bundles."
        />
        <PortalCard
          to="/tobacco"
          icon={<span className="ti ti-flame" />}
          title="Tobacco"
          description="Quality cigars, cigarettes, and smoking accessories."
        />
      </PortalLayout>
    </div>
  )
}
