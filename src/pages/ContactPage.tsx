import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'

const sendContactEmailFn = httpsCallable(functions, 'sendContactEmail')

export default function ContactPage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await sendContactEmailFn({ name: name.trim(), email: email.trim(), message: message.trim() })
      setSubmitted(true)
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Something went wrong — please try again or call us.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="contact-page">
      <div className="contact-inner">
        <h1 className="contact-heading">Get in Touch</h1>
        <p className="contact-intro">
          Visit us in person, give us a call, or send a message below. We're here to help.
        </p>

        <div className="contact-layout">
          <section className="contact-map-section" aria-label="Store location">
            <h2 className="contact-section-heading">Find Us</h2>
            <address className="contact-address">
              <strong>The Pawn Shop</strong><br />
              1-155 International Drive<br />
              Akwesasne, Ontario<br />
              Canada
            </address>
            <div className="contact-map-wrapper">
              <iframe
                title="The Pawn Shop location on Google Maps"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: 'var(--radius-md)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2836.0!2d-74.75!3d45.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDAwJzAwLjAiTiA3NMKwNDUnMDAuMCJX!5e0!3m2!1sen!2sca!4v1"
                aria-hidden="false"
              />
            </div>
          </section>

          <section className="contact-form-section" aria-label="Send a message">
            <h2 className="contact-section-heading">Send a Message</h2>

            {submitted ? (
              <div className="contact-success">
                <p className="contact-success-check" aria-hidden="true">✓</p>
                <h3 className="contact-success-heading">Message sent</h3>
                <p className="contact-success-body">
                  We'll be in touch shortly. Thank you for reaching out.
                </p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="input-wrapper">
                  <label className="input-label" htmlFor="contact-name">Your name</label>
                  <input
                    id="contact-name"
                    className="input-field"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    required
                    disabled={submitting}
                    maxLength={100}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label" htmlFor="contact-email">Email address</label>
                  <input
                    id="contact-email"
                    className="input-field"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={submitting}
                    maxLength={200}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label" htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    className="input-field intake-textarea"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    required
                    disabled={submitting}
                    rows={5}
                    maxLength={2000}
                  />
                </div>

                {error && <p className="input-error" role="alert">{error}</p>}

                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
