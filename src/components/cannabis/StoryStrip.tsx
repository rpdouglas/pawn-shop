
export default function StoryStrip() {
  return (
    <div
      style={{
        borderTop: '1px solid var(--color-border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        margin: '0 auto',
      }}
    >
      <StoryBlock
        label="Why Here"
        title="The Border Is Our Advantage"
        content="Akwesasne straddles the US–Canada line. We carry American brands no Canadian LP can source — and price them for Canadian wallets."
        isLast={false}
      />
      <StoryBlock
        label="Pricing"
        title="No Exchange Rate Shock"
        content="Everything is priced in Canadian dollars and benchmarked to compete with your local dispensary — not the American market."
        isLast={false}
      />
      <StoryBlock
        label="Stock"
        title="What's Here, Won't Last"
        content="Inventory changes fast. Limited runs, single imports, and rare finds. If something catches your eye, come in. In-store only, no holds."
        isLast={true}
      />
    </div>
  )
}

function StoryBlock({ label, title, content, isLast }: { label: string; title: string; content: string; isLast: boolean }) {
  return (
    <div
      style={{
        padding: '2rem 2.5rem',
        borderRight: isLast ? 'none' : '1px solid var(--color-border)',
        borderBottom: isLast ? 'none' : undefined, // Handled roughly by CSS grid wrap in standard
      }}
      className="story-block"
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '0.6rem',
        }}
      >
        <div style={{ width: '1rem', height: '1px', background: 'var(--color-primary)' }} />
        {label}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: 300,
          color: 'var(--color-text-muted)',
          lineHeight: 1.75,
        }}
      >
        {content}
      </p>
      <style>
        {`
          @media (max-width: 720px) {
            .story-block {
              border-right: none !important;
              border-bottom: 1px solid var(--color-border);
            }
            .story-block:last-child {
              border-bottom: none;
            }
          }
        `}
      </style>
    </div>
  )
}
