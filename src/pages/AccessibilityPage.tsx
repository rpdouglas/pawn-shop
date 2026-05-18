export default function AccessibilityPage() {
  return (
    <main className="accessibility-page">
      <div className="accessibility-inner">
        <h1 className="accessibility-heading">Accessibility</h1>

        <section className="accessibility-section">
          <h2 className="accessibility-subheading">Our Commitment</h2>
          <p className="accessibility-body">
            The Pawn Shop is committed to making our website accessible to everyone, including
            people with disabilities. We aim to meet the Web Content Accessibility Guidelines
            (WCAG) 2.1 Level AA standard across all three of our views — Pawn, Cannabis Wellness,
            and Fireworks.
          </p>
        </section>

        <section className="accessibility-section">
          <h2 className="accessibility-subheading">What We Have Done</h2>
          <ul className="accessibility-list">
            <li>All interactive elements are keyboard-navigable with visible focus indicators.</li>
            <li>Touch targets meet a minimum of 48 pixels for comfortable use on mobile devices.</li>
            <li>Text meets WCAG AA colour contrast requirements at all body sizes.</li>
            <li>Form inputs have visible labels and descriptive error messages.</li>
            <li>Images include descriptive alternative text where applicable.</li>
            <li>Age gates and reservation forms include accessible status announcements.</li>
            <li>Modals trap focus correctly and are dismissible by keyboard.</li>
          </ul>
        </section>

        <section className="accessibility-section">
          <h2 className="accessibility-subheading">Known Limitations</h2>
          <p className="accessibility-body">
            We are actively working to address the following known limitations:
          </p>
          <ul className="accessibility-list">
            <li>
              The Google Maps embed on our Contact page may not be fully navigable by screen
              reader. We include our address in plain text on that page as an alternative.
            </li>
            <li>
              Full VoiceOver and TalkBack testing across all views is ongoing. If you encounter
              a screen reader issue, please contact us and we will prioritise a fix.
            </li>
          </ul>
        </section>

        <section className="accessibility-section">
          <h2 className="accessibility-subheading">Get Help or Report an Issue</h2>
          <p className="accessibility-body">
            If you experience difficulty using any part of our website, or if you need content
            in an alternative format, please reach out to us directly:
          </p>
          <ul className="accessibility-list">
            <li>
              <strong>Visit us:</strong> Cornwall Island, Akwesasne, Ontario
            </li>
            <li>
              <strong>Contact form:</strong>{' '}
              <a href="/contact" className="accessibility-link">thepawnshop.ca/contact</a>
            </li>
          </ul>
          <p className="accessibility-body">
            We respond to accessibility requests within two business days.
          </p>
        </section>

        <section className="accessibility-section">
          <h2 className="accessibility-subheading">Technical Standards</h2>
          <p className="accessibility-body">
            This website is built with React 18 and uses semantic HTML elements, ARIA attributes
            where required, and CSS custom properties for consistent, accessible styling. We
            test using axe-core browser tooling during development.
          </p>
        </section>

        <p className="accessibility-updated">
          Last reviewed: May 2026
        </p>
      </div>
    </main>
  )
}
