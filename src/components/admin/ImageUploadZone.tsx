import { useRef, useState, useEffect, useCallback } from 'react'
import { ref, uploadBytesResumable } from 'firebase/storage'
import { httpsCallable } from 'firebase/functions'
import imageCompression from 'browser-image-compression'
import { storage, functions } from '../../lib/firebase'

const processUploadedImageFn = httpsCallable<
  { filePath: string, extractData?: boolean, viewTag?: string },
  { success: boolean }
>(functions, 'processUploadedImage')

interface UploadEntry {
  fileName: string
  progress: number
  optimisticUrl?: string   // blob:// URL shown immediately on selection
  hasBlob: boolean         // true when compressed blob is held for retry; never read during render from ref
  retryCount: number
  processing?: boolean     // true after upload completes, waiting for CF → Firestore
  error?: string
}

interface ImageUploadZoneProps {
  itemId: string | null
  onRequireItemId?: () => Promise<string | null>
  onProcessingChange?: (isProcessing: boolean) => void
  images: string[]  // watermarked URLs — written to Firestore by processImageUpload CF
  extractData?: boolean
  viewTag?: string
}

type UploadFn = (key: string, blob: Blob, fileName: string, attempt: number, resolvedItemId: string) => void

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 20 * 1024 * 1024  // 20 MB
const MAX_RETRIES = 3
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
}

export default function ImageUploadZone({ itemId, onRequireItemId, onProcessingChange, images, extractData, viewTag }: ImageUploadZoneProps) {
  const [uploads, setUploads] = useState<Map<string, UploadEntry>>(new Map())
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 767px)').matches)
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  // Blobs kept for manual retry; keyed by upload key. Never read during render — use UploadEntry.hasBlob instead.
  const blobsRef = useRef<Map<string, Blob>>(new Map())
  // Ref to latest doUpload so the retry setTimeout can call it without a circular useCallback dependency
  const doUploadRef = useRef<UploadFn | null>(null)
  // Mirror of uploads state for unmount cleanup
  const uploadsRef = useRef<Map<string, UploadEntry>>(new Map())
  const prevImagesLengthRef = useRef(images.length)

  useEffect(() => { uploadsRef.current = uploads }, [uploads])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Revoke all blob URLs on unmount to free memory
  useEffect(() => {
    return () => {
      uploadsRef.current.forEach(entry => {
        if (entry.optimisticUrl) URL.revokeObjectURL(entry.optimisticUrl)
      })
    }
  }, [])

  // When CF writes a new processed URL (images[] grows), clear the oldest processing entry
  useEffect(() => {
    const delta = images.length - prevImagesLengthRef.current
    prevImagesLengthRef.current = images.length
    if (delta <= 0) return

    setUploads(prev => {
      const next = new Map(prev)
      let cleared = 0
      for (const [k, v] of next.entries()) {
        if (v.processing && cleared < delta) {
          if (v.optimisticUrl) URL.revokeObjectURL(v.optimisticUrl)
          blobsRef.current.delete(k)
          next.delete(k)
          cleared++
        }
      }
      return next
    })
  }, [images.length])

  useEffect(() => {
    if (onProcessingChange) {
      const isProcessing = Array.from(uploads.values()).some(u => !u.error)
      onProcessingChange(isProcessing)
    }
  }, [uploads, onProcessingChange])

  const doUpload = useCallback<UploadFn>((key, blob, fileName, attempt, resolvedItemId) => {
    const storageRef = ref(storage, `items/${resolvedItemId}/uploads/${key}`)
    const task = uploadBytesResumable(storageRef, blob)

    task.on(
      'state_changed',
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100
        setUploads(prev => {
          const entry = prev.get(key)
          if (!entry) return prev
          return new Map(prev).set(key, { ...entry, progress: pct })
        })
      },
      () => {
        if (attempt < MAX_RETRIES - 1) {
          // Auto-retry with exponential backoff: 500 ms, 1 s, 2 s
          // Use ref to avoid circular useCallback dependency on doUpload itself
          setTimeout(() => doUploadRef.current?.(key, blob, fileName, attempt + 1, resolvedItemId), 500 * Math.pow(2, attempt))
        } else {
          // All retries exhausted — keep optimistic URL and blob for manual retry
          setUploads(prev => {
            const entry = prev.get(key)
            return new Map(prev).set(key, {
              fileName,
              progress: 0,
              optimisticUrl: entry?.optimisticUrl,
              hasBlob: true,
              retryCount: attempt + 1,
              error: 'Save failed — tap to retry.',
            })
          })
        }
      },
      async () => {
        // Upload complete — transition to processing state until CF writes to Firestore
        setUploads(prev => {
          const entry = prev.get(key)
          if (!entry) return prev
          return new Map(prev).set(key, { ...entry, progress: 100, processing: true, error: undefined })
        })

        try {
          console.log(`[AI Intake] Calling processUploadedImage for ${storageRef.fullPath}...`)
          const res = await processUploadedImageFn({ filePath: storageRef.fullPath, extractData, viewTag })
          console.log(`[AI Intake] processUploadedImage completed successfully.`)
          
          const responseData = res.data as { aiFailed?: boolean; aiError?: string };
          if (responseData?.aiFailed) {
            window.alert(`AI Extraction Unavailable: ${responseData.aiError}\n\nThe photo has been saved successfully. Please enter the details manually.`)
          }
        } catch (err) {
          console.error(`[AI Intake] processUploadedImage failed:`, err)
          setUploads(prev => {
            const entry = prev.get(key)
            if (!entry) return prev
            
            let errorMessage = 'Processing failed — tap to retry.'
            if (err instanceof Error) {
              errorMessage = err.message
              if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
                errorMessage = 'AI API Quota Exceeded. The photo is saved, but auto-fill is disabled until the limit resets.'
              }
            }

            return new Map(prev).set(key, { 
              ...entry, 
              processing: false, 
              error: errorMessage
            })
          })
        }
      }
    )
  }, [extractData, viewTag])

  // Keep ref in sync so the retry setTimeout always calls the latest closure
  useEffect(() => { doUploadRef.current = doUpload }, [doUpload])

  const uploadFile = useCallback(async (file: File) => {
    let resolvedItemId = itemId
    if (!resolvedItemId && onRequireItemId) {
      resolvedItemId = await onRequireItemId()
    }
    if (!resolvedItemId) {
      // Failed to get an item ID; cannot upload
      return
    }

    const key = `${Date.now()}-${file.name}`

    if (!ACCEPTED_MIME.includes(file.type)) {
      setUploads(prev => new Map(prev).set(key, {
        fileName: file.name, progress: 0, hasBlob: false, retryCount: 0,
        error: 'Invalid type — use JPG, PNG, or WebP.',
      }))
      return
    }
    if (file.size > MAX_BYTES) {
      setUploads(prev => new Map(prev).set(key, {
        fileName: file.name, progress: 0, hasBlob: false, retryCount: 0,
        error: 'File too large — max 20 MB.',
      }))
      return
    }

    let blob: Blob = file
    try {
      blob = await imageCompression(file, COMPRESSION_OPTIONS)
    } catch {
      // Compression failed — proceed with original file
    }

    const optimisticUrl = URL.createObjectURL(blob)
    blobsRef.current.set(key, blob)

    setUploads(prev => new Map(prev).set(key, {
      fileName: file.name, progress: 0, optimisticUrl, hasBlob: true, retryCount: 0,
    }))

    doUpload(key, blob, file.name, 0, resolvedItemId)
  }, [itemId, onRequireItemId, doUpload])

  const retryUpload = useCallback((key: string, fileName: string) => {
    if (!itemId) return // Shouldn't happen on retry
    const blob = blobsRef.current.get(key)
    if (!blob) return
    setUploads(prev => {
      const entry = prev.get(key)
      if (!entry) return prev
      return new Map(prev).set(key, { ...entry, progress: 0, error: undefined, retryCount: 0 })
    })
    doUpload(key, blob, fileName, 0, itemId)
  }, [itemId, doUpload])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(uploadFile)
  }, [uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const pendingUploads = Array.from(uploads.entries())

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
          {pendingUploads.map(([key, u]) => (
            <li key={key} className="upload-progress-item">
              {u.optimisticUrl ? (
                <div className="upload-optimistic-preview">
                  <img
                    src={u.optimisticUrl}
                    alt={u.fileName}
                    className="uploaded-image-thumb"
                  />
                  {u.processing && (
                    <span className="upload-processing-label">Saving photo…</span>
                  )}
                </div>
              ) : (
                <span className="upload-filename">{u.fileName}</span>
              )}

              {u.error ? (
                <div className="upload-error-row">
                  <span className="input-error">{u.error}</span>
                  {u.hasBlob && (
                    <button
                      type="button"
                      className="upload-retry-btn"
                      onClick={() => retryUpload(key, u.fileName)}
                    >
                      Retry
                    </button>
                  )}
                </div>
              ) : !u.processing ? (
                <div
                  className="upload-progress-bar"
                  role="progressbar"
                  aria-valuenow={Math.round(u.progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="upload-progress-fill" style={{ width: `${u.progress}%` }} />
                </div>
              ) : null}
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
