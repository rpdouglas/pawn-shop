interface Testimonial {
  quote: string
  attributedFirstName: string
}

// Staff-written testimonials — update these with real community quotes before launch.
// No AI-generated text. No full names. First name only per privacy guidelines.
const TESTIMONIALS: Testimonial[] = [
  {
    quote: "I've been coming here for years. They're honest, fair, and they know what things are worth. That matters on the island.",
    attributedFirstName: 'Raymond',
  },
  {
    quote: "Picked up a beautiful guitar here that I never would have found anywhere else. Good people, good prices.",
    attributedFirstName: 'Shirley',
  },
  {
    quote: "When I needed quick cash, they treated me with respect. No judgment. Just a fair deal.",
    attributedFirstName: 'Marcus',
  },
]

export default function TestimonialsModule() {
  return (
    <section aria-labelledby="testimonials-heading" style={{ marginBottom: 'var(--space-12)' }}>
      <h2
        id="testimonials-heading"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-heading)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-6)',
        }}
      >
        From the Community
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        {TESTIMONIALS.map((t, i) => (
          <blockquote
            key={i}
            style={{
              margin: 0,
              padding: 'var(--space-5)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-primary)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              fontStyle: 'italic',
              color: 'var(--color-text)',
              lineHeight: 1.6,
              margin: '0 0 var(--space-3)',
            }}>
              "{t.quote}"
            </p>
            <cite style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-primary)',
              fontStyle: 'normal',
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}>
              — {t.attributedFirstName}
            </cite>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
