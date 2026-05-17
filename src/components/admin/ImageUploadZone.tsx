import { useRef, useState, useCallback } from 'react'
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
  const inputRef = useRef<HTMLInputElement>(null)

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
        // CF processImageUpload takes over; remove the progress entry
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
      <div
        className={`upload-dropzone${isDragging ? ' upload-dropzone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Add photos — tap or drop files here"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME.join(',')}
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span className="upload-icon" aria-hidden="true">↑</span>
        <span className="upload-dropzone-label">Add photos</span>
        <span className="upload-dropzone-hint">JPG · PNG · WebP · max 20 MB each</span>
        <span className="upload-dropzone-note">Watermark is applied automatically</span>
      </div>

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
