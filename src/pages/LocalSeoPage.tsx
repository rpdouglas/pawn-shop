import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useView } from '../context/ViewContext'

const LOCATIONS: Record<string, { name: string; description: string; lat: number; lng: number }> = {
  cornwall: {
    name: 'Cornwall, ON',
    description: 'Serving Cornwall and the Seaway Valley with verified cross-border deals and authentic pawn services.',
    lat: 45.0213,
    lng: -74.7303
  },
  massena: {
    name: 'Massena, NY',
    description: 'The preferred destination for Massena residents looking for high-quality, verified pre-owned items and fair pawn values.',
    lat: 44.9281,
    lng: -74.8919
  },
  malone: {
    name: 'Malone, NY',
    description: 'Authentic deals for Malone shoppers. We provide transparent pricing and verified inventory quality.',
    lat: 44.8487,
    lng: -74.2977
  },
  akwesasne: {
    name: 'Akwesasne',
    description: 'Rooted in our community. Providing trusted pawn and retail services to the People of the Longhouse.',
    lat: 44.9917,
    lng: -74.6500
  },
  rooseveltown: {
    name: 'Rooseveltown, NY',
    description: 'Your local stop for verified items and trusted pawn services right across the bridge.',
    lat: 44.9806,
    lng: -74.7478
  },
  hogansburg: {
    name: 'Hogansburg, NY',
    description: 'Serving Hogansburg with a commitment to quality and community-focused pawn services.',
    lat: 44.9744,
    lng: -74.6644
  }
}

export default function LocalSeoPage() {
  const { location } = useParams()
  const { view } = useView()
  const locKey = location?.toLowerCase() || ''
  const loc = LOCATIONS[locKey]

  useEffect(() => {
    if (!loc) return

    // Inject JSON-LD
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': `The Pawn Shop - ${loc.name}`,
      'description': loc.description,
      'url': window.location.href,
      'telephone': '+16135550123', // Placeholder, should come from shopInfo if possible
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '123 International Rd',
        'addressLocality': 'Akwesasne',
        'addressRegion': 'ON',
        'postalCode': 'K6H 5R7',
        'addressCountry': 'CA'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': loc.lat,
        'longitude': loc.lng
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          'opens': '09:00',
          'closes': '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': 'Saturday',
          'opens': '10:00',
          'closes': '16:00'
        }
      ]
    }
    script.text = JSON.stringify(schema)
    document.head.appendChild(script)

    // Update Meta Tags
    document.title = `The Pawn Shop | Verified Deals in ${loc.name}`
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', loc.description)
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [loc])

  if (!loc) {
    return (
      <div className={`view-${view}`} style={{ padding: 'var(--space-20)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>Location Not Found</h1>
        <Link to="/" style={{ color: 'var(--color-primary)' }}>Back to Home</Link>
      </div>
    )
  }

  return (
    <div className={`view-${view}`} style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--color-text)', margin: 0 }}>
            Serving {loc.name}
          </h1>
          <p style={{ 
            color: 'var(--color-primary)', 
            fontSize: '1.2rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            marginTop: 'var(--space-4)'
          }}>
            Verified Deals & Trusted Pawn Services
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)' }}>
          <section style={{ 
            backgroundColor: 'var(--color-surface)', 
            padding: 'var(--space-8)', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)'
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              Cross-Border Confidence
            </h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Whether you're coming from {loc.name} or browsing from home, our real-time inventory sync ensures what you see is what we have. 
              Every high-value item undergoes a mandatory serial number check against national blacklists for your peace of mind.
            </p>
          </section>

          <section style={{ 
            backgroundColor: 'var(--color-surface)', 
            padding: 'var(--space-8)', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)'
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              Transparent Valuation
            </h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              We use fair market data and eBay sold comparisons to ensure our pricing and pawn quotes are competitive for the {loc.name} region. 
              No jargon, no hidden fees—just dapper deals.
            </p>
          </section>
        </div>

        <div style={{ 
          marginTop: 'var(--space-12)', 
          textAlign: 'center',
          padding: 'var(--space-12)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: 'var(--space-6)' }}>
            Ready to find your next bargain?
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <Link to="/pawn" style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'var(--color-bg)', 
              padding: 'var(--space-4) var(--space-8)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-display)',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center'
            }}>
              Browse Inventory
            </Link>
            <Link to="/pawn/sell" style={{ 
              border: '1px solid var(--color-primary)', 
              color: 'var(--color-primary)', 
              padding: 'var(--space-4) var(--space-8)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-display)',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center'
            }}>
              Get a Pawn Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
