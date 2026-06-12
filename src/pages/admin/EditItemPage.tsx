import { useState, useEffect, useRef, useCallback } from 'react'
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ref, uploadBytesResumable } from 'firebase/storage'
import { httpsCallable } from 'firebase/functions'
import { useNavigate, useParams } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import { db, functions, storage } from '../../lib/firebase'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import CannabisFields from '../../components/admin/intake/CannabisFields'
import FireworksFields from '../../components/admin/intake/FireworksFields'
import type { FormState } from '../../components/admin/intake/types'
import { EMPTY_FORM } from '../../components/admin/intake/types'
import type { ConditionGrade } from '../../lib/types'

// ── CFs ──────────────────────────────────────────────────────────────────────

const processUploadedImageFn = httpsCallable<
  { filePath: string; extractData?: boolean; viewTag?: string },
  { success: boolean }
>(functions, 'processUploadedImage')

const removeItemImageFn = httpsCallable<
  { itemId: string; imageUrl: string },
  { success: boolean }
>(functions, 'removeItemImage')

const reorderItemImagesFn = httpsCallable<
  { itemId: string; images: string[] },
  { success: boolean }
>(functions, 'reorderItemImages')

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadEntry {
  fileName: string
  progress: number
  error?: string
  processing?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePriceCents(input: string): number {
  return Math.round(parseFloat(input) * 100)
}

function parseQuantity(input: string): number {
  const q = parseInt(input.trim(), 10)
  return isNaN(q) || q < 1 ? 1 : q
}

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 20 * 1024 * 1024

// ── Styles (design tokens only — no hardcoded hex/px/spacing) ─────────────────

const PAGE: React.CSSProperties = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: 'var(--space-6)',
  paddingBottom: 'var(--space-24)',
}

const CARD: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-5)',
  marginBottom: 'var(--space-5)',
}

const CARD_HEADING: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-subheading)',
  color: 'var(--color-text)',
  margin: '0 0 var(--space-4)',
}

const FIELD: React.CSSProperties = {
  marginBottom: 'var(--space-4)',
}

const BTN_PRIMARY: React.CSSProperties = {
  minHeight: '56px',
  padding: '0 var(--space-6)',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-on-primary)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  fontWeight: 500,
  cursor: 'pointer',
}

const BTN_OUTLINE: React.CSSProperties = {
  minHeight: '48px',
  padding: '0 var(--space-4)',
  backgroundColor: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  cursor: 'pointer',
}

const ERROR_TEXT: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-error, var(--color-danger))',
  marginTop: 'var(--space-1)',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditItemPage() {
  const navigate = useNavigate()
  const { id: itemId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [images, setImages] = useState<string[]>([])
  const [uploads, setUploads] = useState<Map<string, UploadEntry>>(new Map())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [photoOpsLoading, setPhotoOpsLoading] = useState(false)
  const [photoOpsError, setPhotoOpsError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const prevImageCountRef = useRef(0)

  const set = (field: keyof FormState) => (value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // ── Load item ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!itemId) return
    let cancelled = false

    const fetchItem = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const snap = await getDoc(doc(db, 'items', itemId))
        if (cancelled) return
        if (!snap.exists()) { setLoadError('Item not found.'); return }

        const d = snap.data() as Record<string, unknown>
        const costSnap = await getDoc(doc(db, 'items', itemId, 'internal', 'staff'))
        if (cancelled) return
        const cd = costSnap.exists() ? (costSnap.data() as Record<string, unknown>) : null
        const cp = (d.cannabisProfile ?? {}) as Record<string, unknown>
        const fp = (d.fireworksProfile ?? {}) as Record<string, unknown>

        setForm(prev => ({
          ...prev,
          title: typeof d.title === 'string' ? d.title : '',
          description: typeof d.description === 'string' ? d.description : '',
          category: typeof d.category === 'string' ? d.category : '',
          viewTag: typeof d.viewTag === 'string' ? d.viewTag as FormState['viewTag'] : '',
          priceInput: typeof d.price === 'number' ? (d.price / 100).toFixed(2) : '',
          condition: typeof d.condition === 'string' ? d.condition as ConditionGrade : '',
          serialNumber: typeof d.serialNumber === 'string' ? d.serialNumber : '',
          provenanceNotes: typeof d.provenanceNotes === 'string' ? d.provenanceNotes : '',
          quantityInput: typeof d.quantity === 'number' ? String(d.quantity) : '1',
          costInput: typeof cd?.cost === 'number' ? (cd.cost / 100).toFixed(2) : '',
          // Cannabis profile
          brand: typeof cp.brand === 'string' ? cp.brand : '',
          format: typeof cp.format === 'string' ? cp.format : '',
          subCategory: typeof cp.subCategory === 'string' ? cp.subCategory : '',
          strainType: typeof cp.strainType === 'string' ? cp.strainType : '',
          cannabinoidUnit: typeof cp.cannabinoidUnit === 'string' ? cp.cannabinoidUnit : '%',
          thcMin: typeof cp.thcMin === 'number' ? String(cp.thcMin) : '',
          thcMax: typeof cp.thcMax === 'number' ? String(cp.thcMax) : '',
          cbdMin: typeof cp.cbdMin === 'number' ? String(cp.cbdMin) : '',
          cbdMax: typeof cp.cbdMax === 'number' ? String(cp.cbdMax) : '',
          terpenes: Array.isArray(cp.terpenes) ? (cp.terpenes as string[]).join(', ') : '',
          effectProfile: Array.isArray(cp.effectProfile) ? (cp.effectProfile as string[]).join(', ') : '',
          geneticLineage: typeof cp.geneticLineage === 'string' ? cp.geneticLineage : '',
          weight: typeof cp.weight === 'string' ? cp.weight : '',
          lotNumber: typeof cp.lotNumber === 'string' ? cp.lotNumber : '',
          packagedDate: typeof cp.packagedDate === 'string' ? cp.packagedDate : '',
          servings: typeof cp.servings === 'number' ? String(cp.servings) : '',
          weightPerServing: typeof cp.weightPerServing === 'string' ? cp.weightPerServing : '',
          // Fireworks profile
          explosiveWeight: typeof fp.explosiveWeight === 'string' ? fp.explosiveWeight : '',
          classificationClass: typeof fp.classificationClass === 'string' ? fp.classificationClass : '',
          effectType: typeof fp.effectType === 'string' ? fp.effectType : '',
          shots: typeof fp.shots === 'number' ? String(fp.shots) : '',
          duration: typeof fp.duration === 'number' ? String(fp.duration) : '',
          noiseLevel: typeof fp.noiseLevel === 'string' ? fp.noiseLevel : '',
        }))

        const imgArr = Array.isArray(d.images) ? (d.images as string[]) : []
        setImages(imgArr)
        prevImageCountRef.current = imgArr.length
      } catch {
        if (!cancelled) setLoadError('Failed to load item. Go back and try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchItem()
    return () => { cancelled = true }
  }, [itemId])

  // ── Real-time image sync ──────────────────────────────────────────────────

  useEffect(() => {
    if (!itemId) return
    return onSnapshot(doc(db, 'items', itemId), (snap) => {
      if (!snap.exists()) return
      const d = snap.data() as Record<string, unknown>
      const newImages = Array.isArray(d.images) ? (d.images as string[]) : []
      setImages(newImages)

      const newlyProcessed = newImages.length - prevImageCountRef.current
      if (newlyProcessed > 0) {
        prevImageCountRef.current = newImages.length
        setUploads(prev => {
          const next = new Map(prev)
          let toRemove = newlyProcessed
          for (const [k, entry] of prev) {
            if (entry.processing && toRemove > 0) { next.delete(k); toRemove-- }
          }
          return next
        })
      }
    })
  }, [itemId])

  // ── Upload ────────────────────────────────────────────────────────────────

  const uploadFile = useCallback(async (file: File) => {
    if (!itemId) return
    const key = `${Date.now()}-${file.name}`

    if (!ACCEPTED_MIME.includes(file.type)) {
      setUploads(prev => new Map(prev).set(key, { fileName: file.name, progress: 0, error: 'Invalid type — use JPG, PNG, or WebP.' }))
      return
    }
    if (file.size > MAX_BYTES) {
      setUploads(prev => new Map(prev).set(key, { fileName: file.name, progress: 0, error: 'File too large — max 20 MB.' }))
      return
    }

    setUploads(prev => new Map(prev).set(key, { fileName: file.name, progress: 0 }))

    let fileToUpload = file
    try {
      fileToUpload = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true })
    } catch { /* use original on compression failure */ }

    const storagePath = `items/${itemId}/uploads/${key}`
    const task = uploadBytesResumable(ref(storage, storagePath), fileToUpload)

    task.on(
      'state_changed',
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100
        setUploads(prev => new Map(prev).set(key, { fileName: file.name, progress: pct }))
      },
      () => {
        setUploads(prev => new Map(prev).set(key, { fileName: file.name, progress: 0, error: 'Upload failed — try again.' }))
      },
      async () => {
        setUploads(prev => new Map(prev).set(key, { fileName: file.name, progress: 100, processing: true }))
        try {
          await processUploadedImageFn({ filePath: storagePath, extractData: false })
        } catch {
          setUploads(prev => {
            const next = new Map(prev)
            const entry = next.get(key)
            if (entry) next.set(key, { ...entry, processing: false, error: 'Processing failed — try again.' })
            return next
          })
        }
      }
    )
  }, [itemId])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(uploadFile)
  }, [uploadFile])

  // ── Photo management ──────────────────────────────────────────────────────

  const handleDeletePhoto = useCallback(async (url: string) => {
    if (!itemId || photoOpsLoading) return
    setPhotoOpsLoading(true)
    setPhotoOpsError('')
    try {
      await removeItemImageFn({ itemId, imageUrl: url })
    } catch {
      setPhotoOpsError('Could not remove photo — please try again.')
    } finally {
      setPhotoOpsLoading(false)
    }
  }, [itemId, photoOpsLoading])

  const handleSetCover = useCallback(async (url: string) => {
    if (!itemId || photoOpsLoading) return
    setPhotoOpsLoading(true)
    setPhotoOpsError('')
    try {
      await reorderItemImagesFn({ itemId, images: [url, ...images.filter(u => u !== url)] })
    } catch {
      setPhotoOpsError('Could not update cover photo — please try again.')
    } finally {
      setPhotoOpsLoading(false)
    }
  }, [itemId, images, photoOpsLoading])

  // ── Validation & save ─────────────────────────────────────────────────────

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.category.trim()) errs.category = 'Category is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.viewTag) errs.viewTag = 'View is required'
    if (!form.condition) errs.condition = 'Condition is required'
    const cents = parsePriceCents(form.priceInput)
    if (isNaN(cents) || cents <= 0) errs.price = 'Valid price required (e.g. 49.99)'
    return errs
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!itemId) throw new Error('No item ID')

      const updateData: Record<string, unknown> = {
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        viewTag: form.viewTag,
        condition: form.condition,
        price: parsePriceCents(form.priceInput),
        quantity: parseQuantity(form.quantityInput),
        serialNumber: form.serialNumber.trim() || null,
        provenanceNotes: form.provenanceNotes.trim() || null,
        updatedAt: serverTimestamp(),
      }

      if (form.viewTag === 'cannabis') {
        const cp: Record<string, unknown> = {}
        if (form.brand.trim()) cp.brand = form.brand.trim()
        if (form.format.trim()) cp.format = form.format.trim()
        if (form.subCategory.trim()) cp.subCategory = form.subCategory.trim()
        if (form.strainType) cp.strainType = form.strainType
        if (form.cannabinoidUnit) cp.cannabinoidUnit = form.cannabinoidUnit
        if (form.thcMin.trim()) cp.thcMin = parseFloat(form.thcMin)
        if (form.thcMax.trim()) cp.thcMax = parseFloat(form.thcMax)
        if (form.cbdMin.trim()) cp.cbdMin = parseFloat(form.cbdMin)
        if (form.cbdMax.trim()) cp.cbdMax = parseFloat(form.cbdMax)
        if (form.terpenes.trim()) cp.terpenes = form.terpenes.split(',').map(t => t.trim()).filter(Boolean)
        if (form.effectProfile.trim()) cp.effectProfile = form.effectProfile.split(',').map(e => e.trim()).filter(Boolean)
        if (form.geneticLineage.trim()) cp.geneticLineage = form.geneticLineage.trim()
        if (form.weight.trim()) cp.weight = form.weight.trim()
        if (form.lotNumber.trim()) cp.lotNumber = form.lotNumber.trim()
        if (form.packagedDate.trim()) cp.packagedDate = form.packagedDate.trim()
        if (form.servings.trim()) cp.servings = parseInt(form.servings, 10)
        if (form.weightPerServing.trim()) cp.weightPerServing = form.weightPerServing.trim()
        if (Object.keys(cp).length > 0) updateData.cannabisProfile = cp
      }

      if (form.viewTag === 'fireworks') {
        const fp: Record<string, unknown> = {}
        if (form.explosiveWeight.trim()) fp.explosiveWeight = form.explosiveWeight.trim()
        if (form.classificationClass.trim()) fp.classificationClass = form.classificationClass.trim()
        if (form.effectType.trim()) fp.effectType = form.effectType.trim()
        if (form.noiseLevel) fp.noiseLevel = form.noiseLevel
        if (form.shots.trim()) fp.shots = parseInt(form.shots, 10)
        if (form.duration.trim()) fp.duration = parseInt(form.duration, 10)
        if (Object.keys(fp).length > 0) updateData.fireworksProfile = fp
      }

      await updateDoc(doc(db, 'items', itemId), updateData)

      const costCents = parsePriceCents(form.costInput)
      if (form.costInput.trim() && !isNaN(costCents) && costCents > 0) {
        await setDoc(doc(db, 'items', itemId, 'internal', 'staff'), { cost: costCents }, { merge: true })
      }
    },
    onSuccess: () => {
      setSaveSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setTimeout(() => setSaveSuccess(false), 3000)
    },
    onError: (err: Error) => {
      setErrors(prev => ({ ...prev, save: err.message || 'Save failed. Try again.' }))
    },
  })

  function handleSave() {
    setSaveSuccess(false)
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    saveMutation.mutate()
  }

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <ProtectedRoute staffOnly>
        <div style={PAGE}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-body)' }}>
            Loading…
          </p>
        </div>
      </ProtectedRoute>
    )
  }

  if (loadError) {
    return (
      <ProtectedRoute staffOnly>
        <div style={PAGE}>
          <p style={ERROR_TEXT}>{loadError}</p>
          <button type="button" onClick={() => navigate('/admin/inventory')} style={{ ...BTN_OUTLINE, marginTop: 'var(--space-4)' }}>
            ← Back to Inventory
          </button>
        </div>
      </ProtectedRoute>
    )
  }

  const pendingUploads = Array.from(uploads.values())

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute staffOnly>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />

      <div style={PAGE}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', color: 'var(--color-text)', margin: 0 }}>
              Edit Item
            </h1>
            {form.title && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0' }}>
                {form.title}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/inventory')}
            aria-label="Back to inventory"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-subheading)',
              cursor: 'pointer',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-2)',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Photos ── */}
        <section style={CARD} aria-label="Photos">
          <h2 style={CARD_HEADING}>Photos</h2>

          {images.length > 0 && (
            <ul
              style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-4)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}
              aria-label={`${images.length} photo${images.length !== 1 ? 's' : ''}`}
            >
              {images.map((url, i) => (
                <li key={url} style={{ position: 'relative', opacity: photoOpsLoading ? 0.5 : 1, transition: 'opacity var(--motion-speed-fast) var(--motion-easing)' }}>
                  {i === 0 && (
                    <span style={{
                      position: 'absolute',
                      top: 'var(--space-1)',
                      left: 'var(--space-1)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      padding: '0 var(--space-1)',
                      borderRadius: 'var(--radius-sm)',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}>
                      Cover
                    </span>
                  )}
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    style={{ width: '96px', height: '96px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', display: 'block' }}
                  />
                  <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'center', marginTop: 'var(--space-1)' }}>
                    {i > 0 && (
                      <button
                        type="button"
                        aria-label={`Set photo ${i + 1} as cover`}
                        title="Set as cover"
                        disabled={photoOpsLoading}
                        onClick={() => handleSetCover(url)}
                        style={{
                          minWidth: '44px',
                          minHeight: '44px',
                          background: 'none',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-primary)',
                          fontSize: 'var(--text-small)',
                          cursor: photoOpsLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                      >★</button>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove photo ${i + 1}`}
                      title="Remove photo"
                      disabled={photoOpsLoading}
                      onClick={() => handleDeletePhoto(url)}
                      style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        background: 'none',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--text-body)',
                        cursor: photoOpsLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >×</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {photoOpsError && (
            <p role="alert" style={{ ...ERROR_TEXT, marginBottom: 'var(--space-3)' }}>{photoOpsError}</p>
          )}

          {pendingUploads.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-4)' }} aria-label="Upload progress">
              {pendingUploads.map(u => (
                <li key={u.fileName} style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{u.fileName}</span>
                  {u.error
                    ? <span style={ERROR_TEXT}>{u.error}</span>
                    : u.processing
                      ? <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>Processing…</span>
                      : (
                        <div
                          role="progressbar"
                          aria-valuenow={Math.round(u.progress)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          style={{ height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px', marginTop: 'var(--space-1)' }}
                        >
                          <div style={{ width: `${u.progress}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '2px', transition: `width var(--motion-speed-fast) var(--motion-easing)` }} />
                        </div>
                      )
                  }
                </li>
              ))}
            </ul>
          )}

          <button type="button" onClick={() => fileInputRef.current?.click()} style={BTN_OUTLINE}>
            + Add Photo
          </button>
        </section>

        {/* ── Item Details ── */}
        <section style={CARD}>
          <h2 style={CARD_HEADING}>Item Details</h2>

          <div style={FIELD}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="edit-title">Title</label>
              <input
                id="edit-title"
                type="text"
                className="input-field"
                value={form.title}
                onChange={e => set('title')(e.target.value)}
                aria-invalid={errors.title ? 'true' : undefined}
                aria-describedby={errors.title ? 'edit-title-error' : undefined}
              />
              {errors.title && <span id="edit-title-error" className="input-error" role="alert">{errors.title}</span>}
            </div>
          </div>

          <div style={FIELD}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="edit-view">View</label>
              <select
                id="edit-view"
                className="input-field input-field-select"
                value={form.viewTag}
                onChange={e => set('viewTag')(e.target.value)}
                aria-invalid={errors.viewTag ? 'true' : undefined}
                aria-describedby={errors.viewTag ? 'edit-view-error' : undefined}
              >
                <option value="">Select view…</option>
                <option value="pawn">Pawn</option>
                <option value="cannabis">Cannabis</option>
                <option value="fireworks">Fireworks</option>
              </select>
              {errors.viewTag && <span id="edit-view-error" className="input-error" role="alert">{errors.viewTag}</span>}
            </div>
          </div>

          <div style={FIELD}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="edit-category">Category</label>
              <input
                id="edit-category"
                type="text"
                className="input-field"
                value={form.category}
                onChange={e => set('category')(e.target.value)}
                placeholder="e.g. Electronics, Jewellery, Watches"
                aria-invalid={errors.category ? 'true' : undefined}
                aria-describedby={errors.category ? 'edit-category-error' : undefined}
              />
              {errors.category && <span id="edit-category-error" className="input-error" role="alert">{errors.category}</span>}
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              className="input-field intake-textarea"
              rows={5}
              value={form.description}
              onChange={e => set('description')(e.target.value)}
              placeholder="Describe the item — condition details, notable features, any included accessories."
              aria-invalid={errors.description ? 'true' : undefined}
              aria-describedby={errors.description ? 'edit-description-error' : undefined}
            />
            {errors.description && <span id="edit-description-error" className="input-error" role="alert">{errors.description}</span>}
          </div>
        </section>

        {/* ── Pricing & Stock ── */}
        <section style={CARD}>
          <h2 style={CARD_HEADING}>Pricing &amp; Stock</h2>

          <div style={FIELD}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="edit-price">Sale Price (CAD $)</label>
              <input
                id="edit-price"
                type="text"
                inputMode="decimal"
                className="input-field"
                value={form.priceInput}
                onChange={e => set('priceInput')(e.target.value)}
                placeholder="49.99"
                aria-invalid={errors.price ? 'true' : undefined}
                aria-describedby={errors.price ? 'edit-price-error' : undefined}
              />
              {errors.price && <span id="edit-price-error" className="input-error" role="alert">{errors.price}</span>}
            </div>
          </div>

          <div style={FIELD}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="edit-cost">Cost Price (CAD $, optional)</label>
              <input
                id="edit-cost"
                type="text"
                inputMode="decimal"
                className="input-field"
                value={form.costInput}
                onChange={e => set('costInput')(e.target.value)}
                placeholder="e.g. 25.00"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="edit-quantity">Stock</label>
            <input
              id="edit-quantity"
              type="text"
              inputMode="numeric"
              className="input-field"
              value={form.quantityInput}
              onChange={e => set('quantityInput')(e.target.value)}
              placeholder="1"
            />
          </div>
        </section>

        {/* ── Condition & Details ── */}
        <section style={CARD}>
          <h2 style={CARD_HEADING}>Condition &amp; Details</h2>

          <div style={FIELD}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="edit-condition">Condition</label>
              <select
                id="edit-condition"
                className="input-field input-field-select"
                value={form.condition}
                onChange={e => setForm(prev => ({ ...prev, condition: e.target.value as ConditionGrade }))}
                aria-invalid={errors.condition ? 'true' : undefined}
                aria-describedby={errors.condition ? 'edit-condition-error' : undefined}
              >
                <option value="">Select condition…</option>
                <option value="new">New — never used, original packaging</option>
                <option value="like-new">Like New — minimal use, no visible wear</option>
                <option value="good">Good — normal wear, fully functional</option>
                <option value="fair">Fair — visible wear, works as expected</option>
                <option value="poor">Poor — heavy wear or minor issues</option>
              </select>
              {errors.condition && <span id="edit-condition-error" className="input-error" role="alert">{errors.condition}</span>}
            </div>
          </div>

          <div style={FIELD}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="edit-serial">Serial Number (optional)</label>
              <input
                id="edit-serial"
                type="text"
                className="input-field"
                value={form.serialNumber}
                onChange={e => set('serialNumber')(e.target.value)}
                placeholder="e.g. SN123456"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="edit-provenance">Provenance Notes (optional)</label>
            <textarea
              id="edit-provenance"
              className="input-field intake-textarea"
              rows={3}
              value={form.provenanceNotes}
              onChange={e => set('provenanceNotes')(e.target.value)}
              placeholder="Cultural context, collector significance, notable history…"
            />
          </div>
        </section>

        {/* ── Cannabis Profile ── */}
        {form.viewTag === 'cannabis' && (
          <section style={CARD}>
            <CannabisFields formState={form} set={set} />
          </section>
        )}

        {/* ── Fireworks Profile ── */}
        {form.viewTag === 'fireworks' && (
          <section style={CARD}>
            <FireworksFields formState={form} set={set} />
          </section>
        )}

        {/* ── Actions ── */}
        {errors.save && (
          <p role="alert" style={{ ...ERROR_TEXT, marginBottom: 'var(--space-4)' }}>{errors.save}</p>
        )}

        {saveSuccess && (
          <p role="status" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
            ✓ Changes saved
          </p>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            style={{ ...BTN_PRIMARY, opacity: saveMutation.isPending ? 0.6 : 1 }}
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/inventory')}
            style={BTN_OUTLINE}
          >
            ← Back to Inventory
          </button>
        </div>

      </div>
    </ProtectedRoute>
  )
}
