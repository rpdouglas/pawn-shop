export default function HomeHero() {
  return (
    <section className="home-hero" aria-label="The Pawn Shop — Cornwall Island, Akwesasne">
      <div className="home-hero-content">
        <img
          src="/branding/logo.webp"
          alt="The Pawn Shop"
          className="home-hero-logo"
          width="220"
          height="220"
        />
        <h1 className="home-hero-title">The Pawn Shop</h1>
        <p className="home-hero-tagline">Dapper. Debonair. Distinctly Akwesasne.</p>
        <p className="home-hero-location">Cornwall Island · Akwesasne</p>
      </div>
    </section>
  )
}
