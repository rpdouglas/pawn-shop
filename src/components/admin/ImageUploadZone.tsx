import { useRef, useState, useEffect, useCallback } from 'react'
import { ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from '../../lib/firebase'

interface UploadEntry {
  fileName: string
  progress: number
  error?: string
}

interface ImageUploadZoneProps {
  itemId: string
  images: string[]  // watermarked URLs — written to Firestore by processImageUpload CF
}

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 20 * 1024 * 1024  // 20 MB

export default function ImageUploadZone({ itemId, images }: ImageUploadZoneProps) {
  const [uploads, setUploads] = useState<Map<string, UploadEntry>>(new Map())
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 767px)').matches)
  const inputRef = useRef<HTMLInputElement>(null)       // gallery / desktop
  const cameraInputRef = useRef<HTMLInputElement>(null) // camera capture (mobile)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const uploadFile = useCallback((file: File) => {
    const key = `${Date.now()}-${file.name}`

    if (!ACCEPTED_MIME.includes(file.type)) {
      setUploads((prev) => new Map(prev).set(key, {
        fileName: file.name,
        progress: 0,
        error: 'Invalid type — use JPG, PNG, or WebP.',
      }))
      return
    }
    if (file.size > MAX_BYTES) {
      setUploads((prev) => new Map(prev).set(key, {
        fileName: file.name,
        progress: 0,
        error: 'File too large — max 20 MB.',
      }))
      return
    }

    const storagePath = `items/${itemId}/uploads/${key}`
    const storageRef = ref(storage, storagePath)
    const task = uploadBytesResumable(storageRef, file)

    setUploads((prev) => new Map(prev).set(key, { fileName: file.name, progress: 0 }))

    task.on(
      'state_changed',
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100
        setUploads((prev) => new Map(prev).set(key, { fileName: file.name, progress: pct }))
      },
      () => {
        setUploads((prev) =>
          new Map(prev).set(key, { fileName: file.name, progress: 0, error: 'Upload failed — try again.' })
        )
      },
      () => {
        setUploads((prev) => {
          const next = new Map(prev)
          next.delete(key)
          return next
        })
      }
    )
  }, [itemId])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(uploadFile)
  }, [uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const pendingUploads = Array.from(uploads.values())

  return (
    <div className="image-upload-zone">
      {/* Camera-only input — mobile primary action */}
      <input
        ref={cameraInputRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        capture="environment"
        className="sr-only"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />
      {/* Gallery / desktop file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />

      {isMobile ? (
        // ── Mobile: camera-first CTA ─────────────────────────────────────
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            style={{
              width: '100%',
              minHeight: '56px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              cursor: 'pointer',
            }}
          >
            📷 Take Photo
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              cursor: 'pointer',
              minHeight: '44px',
              padding: 'var(--space-2)',
              textDecoration: 'underline',
            }}
          >
            Choose from Library
          </button>
        </div>
      ) : (
        // ── Desktop: drag-and-drop dropzone ──────────────────────────────
        <div
          className={`upload-dropzone${isDragging ? ' upload-dropzone--active' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Add photos — click or drop files here"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        >
          <span className="upload-icon" aria-hidden="true">↑</span>
          <span className="upload-dropzone-label">Add photos</span>
          <span className="upload-dropzone-hint">JPG · PNG · WebP · max 20 MB each</span>
          <span className="upload-dropzone-note">Watermark is applied automatically</span>
        </div>
      )}

      {pendingUploads.length > 0 && (
        <ul className="upload-progress-list" aria-label="Upload progress">
          {pendingUploads.map((u) => (
            <li key={u.fileName} className="upload-progress-item">
              <span className="upload-filename">{u.fileName}</span>
              {u.error
                ? <span className="input-error">{u.error}</span>
                : (
                  <div className="upload-progress-bar" role="progressbar" aria-valuenow={Math.round(u.progress)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="upload-progress-fill" style={{ width: `${u.progress}%` }} />
                  </div>
                )
              }
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <ul className="uploaded-images-list" aria-label={`${images.length} photo${images.length !== 1 ? 's' : ''} uploaded`}>
          {images.map((url, i) => (
            <li key={url} className="uploaded-image-item">
              <img
                src={url}
                alt={`Item photo ${i + 1}`}
                className="uploaded-image-thumb"
              />
              <span className="uploaded-image-label">Photo {i + 1}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
