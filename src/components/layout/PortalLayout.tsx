import React from 'react'

interface PortalLayoutProps {
  title: string
  subtitle: string
  logoSrc?: string
  children: React.ReactNode
}

export default function PortalLayout({ title, subtitle, logoSrc, children }: PortalLayoutProps) {
  return (
    <div className="portal-container">
      <header className="portal-hero">
        {logoSrc && (
          <div className="portal-logo-wrap">
            <img src={logoSrc} alt="Logo" className="portal-logo" />
          </div>
        )}
        <h1 className="portal-title">{title}</h1>
        <p className="portal-subtitle">{subtitle}</p>
      </header>

      <nav className="portal-list">
        {children}
      </nav>
    </div>
  )
}
