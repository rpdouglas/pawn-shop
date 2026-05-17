import { useState, useRef, useCallback } from 'react'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { httpsCallable } from 'firebase/functions'
import { storage, functions } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Input from '../ui/Input'

// Makoonsii: form completable one-handed in portrait mode, plain-language labels,
// 48px touch targets throughout, ≤2 taps from Pawn homepage.

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 20 * 1024 * 1024
const MAX_PHOTOS = 5

interface SubmitResponse {
  success: boolean
  requestId: string
}

interface UploadEntry {
  fileName: string
  progress: number
  error?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function PawnEnquiryForm() {
  const { user } = useAuth()

  // Stable temp ID for the Storage path — generated once per form session
  const [tempId] = useState(() => crypto.randomUUID())

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    itemDescription?: string
  }>({})

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploads, setUploads] = useState<Map<string, UploadEntry>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter(
      f => ACCEPTED_MIME.includes(f.type) && f.size <= MAX_BYTES
    )
    setSelectedFiles(prev => [...prev, ...valid].slice(0, MAX_PHOTOS))
  }, [])

  const removeFile = useCallback((fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName))
    setUploads(prev => {
      const next = new Map(prev)
      next.delete(fileName)
      return next
    })
  }, [])

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!name.trim()) next.name = 'Please enter your name'
    if (!email.trim()) next.email = 'Please enter your email address'
    else if (!isValidEmail(email)) next.email = 'Please enter a valid email address'
    if (!itemDescription.trim()) next.itemDescription = 'Please describe the item'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const uploadPhotos = async (): Promise<string[]> => {
    return Promise.all(
      selectedFiles.map(file => new Promise<string>((resolve, reject) => {
        const key = `${Date.now()}-${file.name}`
        const path = `pawn-requests/pending-${tempId}/images/${key}`
        const fileRef = storageRef(storage, path)
        const task = uploadBytesResumable(fileRef, file)

        setUploads(prev => new Map(prev).set(file.name, { fileName: file.name, progress: 0 }))

        task.on(
          'state_changed',
          snap => {
            const pct = (snap.bytesTransferred / snap.totalBytes) * 100
            setUploads(prev => new Map(prev).set(file.name, { fileName: file.name, progress: pct }))
          },
          err => {
            setUploads(prev => new Map(prev).set(file.name, {
              fileName: file.name, progress: 0, error: 'Upload failed — try again.',
            }))
            reject(err)
          },
          async () => {
            try {
              const url = await getDownloadURL(fileRef)
              setUploads(prev => new Map(prev).set(file.name, {
                fileName: file.name, progress: 100,
              }))
              resolve(url)
            } catch (e) {
              reject(e)
            }
          }
        )
      }))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      let imageUrls: string[] = []
      if (user && selectedFiles.length > 0) {
        imageUrls = await uploadPhotos()
      }

      const submit = httpsCallable<{
        name: string
        email: string
        phone: string
        itemDescription: string
        serialNumber: string
        imageUrls: string[]
      }, SubmitResponse>(functions, 'submitPawnRequest')

      await submit({ name, email, phone, itemDescription, serialNumber, imageUrls })
      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong — please try again or call us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="pawn-form-success" role="status" aria-live="polite">
        <div className="pawn-form-success-check" aria-hidden="true">✓</div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-heading)',
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-4)',
        }}>
          Enquiry received.
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginBottom: 'var(--space-8)',
        }}>
          We'll be in touch within 24 hours. Thank you for choosing The Pawn Shop.
        </p>
        <a href="/pawn" className="btn btn-secondary btn-md">Back to the shop</a>
      </div>
    )
  }

  const uploadList = Array.from(uploads.values())
  const isUploading = uploadList.some(u => u.progress > 0 && u.progress < 100 && !u.error)

  return (
    <form className="pawn-enquiry-form" onSubmit={handleSubmit} noValidate>

      {/* Section 1 — Contact info */}
      <fieldset className="pawn-form-section">
        <legend className="pawn-form-legend">Your contact information</legend>

        <div className="pawn-form-field">
          <Input
            id="pawn-name"
            label="Your name"
            value={name}
            onChange={setName}
            placeholder="Full name"
            autoComplete="name"
            disabled={submitting}
            error={errors.name}
          />
        </div>

        <div className="pawn-form-row">
          <Input
            id="pawn-email"
            label="Email address"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={submitting}
            error={errors.email}
          />
          <Input
            id="pawn-phone"
            label="Phone (optional)"
            value={phone}
            onChange={setPhone}
            type="tel"
            placeholder="(613) 555-0100"
            autoComplete="tel"
            disabled={submitting}
          />
        </div>
      </fieldset>

      {/* Section 2 — About the item */}
      <fieldset className="pawn-form-section">
        <legend className="pawn-form-legend">About the item</legend>

        <div className="pawn-form-field">
          <div className="input-wrapper">
            <label className="input-label" htmlFor="pawn-description">
              What are you bringing in?
            </label>
            <textarea
              id="pawn-description"
              className="input-field intake-textarea"
              value={itemDescription}
              onChange={e => setItemDescription(e.target.value)}
              placeholder="Describe your item — brand, model, age, and condition. The more detail, the faster we can quote you."
              rows={5}
              disabled={submitting}
              aria-invalid={errors.itemDescription ? 'true' : undefined}
              aria-describedby={errors.itemDescription ? 'pawn-description-error' : undefined}
            />
            {errors.itemDescription && (
              <span id="pawn-description-error" className="input-error" role="alert">
                {errors.itemDescription}
              </span>
            )}
          </div>
        </div>

        <div className="pawn-form-field">
          <Input
            id="pawn-serial"
            label="Serial or model number (if known)"
            value={serialNumber}
            onChange={setSerialNumber}
            placeholder="e.g. SN-1234567 or Model XZ-800"
            disabled={submitting}
          />
        </div>
      </fieldset>

      {/* Section 3 — Photos (signed-in only — storage rule requires auth) */}
      {user ? (
        <fieldset className="pawn-form-section">
          <legend className="pawn-form-legend">Photos (optional)</legend>
          <p className="pawn-form-hint">
            Clear photos help us quote faster. Up to {MAX_PHOTOS} photos · JPG, PNG, or WebP · max 20 MB each.
          </p>

          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting || selectedFiles.length >= MAX_PHOTOS}
          >
            Add photos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME.join(',')}
            multiple
            className="sr-only"
            tabIndex={-1}
            onChange={e => handleFileSelect(e.target.files)}
          />

          {selectedFiles.length > 0 && (
            <ul className="pawn-photo-list" aria-label="Selected photos">
              {selectedFiles.map(file => {
                const up = uploads.get(file.name)
                return (
                  <li key={file.name} className="pawn-photo-item">
                    <span className="pawn-photo-name">{file.name}</span>
                    {up?.error && <span className="input-error">{up.error}</span>}
                    {up && up.progress > 0 && !up.error && (
                      <div
                        className="pawn-upload-progress"
                        role="progressbar"
                        aria-valuenow={Math.round(up.progress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Uploading ${file.name}`}
                      >
                        <div className="pawn-upload-bar" style={{ width: `${up.progress}%` }} />
                      </div>
                    )}
                    {!submitting && !isUploading && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeFile(file.name)}
                        aria-label={`Remove ${file.name}`}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </fieldset>
      ) : (
        <div className="pawn-signin-prompt">
          <a href="/login" className="btn btn-ghost btn-md">Sign in to add photos</a>
          <span className="pawn-form-hint">Photos help us quote you faster — we're happy to quote from your description too.</span>
        </div>
      )}

      {submitError && (
        <p className="input-error pawn-submit-error" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-lg pawn-submit-btn"
        disabled={submitting || isUploading}
        aria-busy={submitting}
      >
        {submitting ? 'Sending…' : 'Send my enquiry'}
      </button>
    </form>
  )
}
