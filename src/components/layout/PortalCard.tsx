import { Link } from 'react-router-dom'

interface PortalCardProps {
  to: string
  icon: React.ReactNode
  title: string
  description: string
}

export default function PortalCard({ to, icon, title, description }: PortalCardProps) {
  return (
    <Link to={to} className="portal-card">
      <div className="portal-card-icon">
        {icon}
      </div>
      <div className="portal-card-content">
        <h3 className="portal-card-title">{title}</h3>
        <p className="portal-card-desc">{description}</p>
      </div>
      <div className="portal-card-chevron">
        <span className="ti ti-chevron-right" />
      </div>
    </Link>
  )
}
