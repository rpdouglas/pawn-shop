import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ref, uploadBytesResumable } from 'firebase/storage'
import { httpsCallable } from 'firebase/functions'
import { useNavigate, useParams } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import { db, functions, storage } from '../../lib/firebase'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import ConditionSelector from '../../components/admin/ConditionSelector'
import Badge from '../../components/ui/Badge'
import { formatPrice } from '../../lib/format'
import type { ConditionGrade, ViewType } from '../../lib/types'

// ── Cloud Function callables ────────────────────────────────────────────────

const createDraftItemFn = httpsCallable<
  { title: string; category: string; viewTag: string },
  { success: boolean; itemId: string }
>(functions, 'createDraftItem')

const publishItemFn = httpsCallable<
  { itemId: string },
  { success: boolean }
>(functions, 'publishItem')

const processUploadedImageFn = httpsCallable<
  { filePath: string, extractData?: boolean, viewTag?: string },
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


// ── Types ───────────────────────────────────────────────────────────────────

type Step = 'capture' | 'details' | 'review' | 'published'

interface FormState {
  title: string
  viewTag: ViewType | ''
  category: string
  description: string
  priceInput: string
  condition: ConditionGrade | ''
  costInput: string      // Purchase cost — optional, staff-only, writes to internal/staff subcollection
  quantityInput: string  // Initial stock count — defaults to 1

  // Cannabis Profile (E56 fields)
  brand?: string
  format?: string
  subCategory?: string
  servings?: string
  weightPerServing?: string
  strainType?: string
  cannabinoidUnit?: string
}

interface UploadEntry {
  fileName: string
  progress: number
  error?: string
  processing?: boolean  // Storage upload done; waiting for processImageUpload CF to write to Firestore
}

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 20 * 1024 * 1024

const FUN_STATUSES = [
  "Analyzing image...",
  "Researching regular price...",
  "Checking the bargain bin...",
  "Guesstimating value...",
  "Consulting the archives..."
]

const EMPTY_FORM: FormState = {
  title: '',
  viewTag: '',
  category: '',
  description: '',
  priceInput: '',
  condition: '',
  costInput: '',
  quantityInput: '1',
  subCategory: '',
  servings: '',
  weightPerServing: '',
  strainType: '',
  cannabinoidUnit: '%',
  brand: '',
  format: '',
}

function parseQuantity(input: string): number {
  const q = parseInt(input.trim(), 10)
  return isNaN(q) || q < 1 ? 1 : q
}

function parsePriceCents(input: string): number {
  return Math.round(parseFloat(input) * 100)
}

// ── Shared layout token ─────────────────────────────────────────────────────

const PAGE: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: 'var(--space-6)',
  paddingBottom: 'var(--space-24)',
}

const FIELD: React.CSSProperties = {
  marginBottom: 'var(--space-6)',
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-2)',
}

const INPUT: React.CSSProperties = {
  width: '100%',
  minHeight: '48px',
  padding: '0 var(--space-4)',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  boxSizing: 'border-box' as const,
}

const BTN_PRIMARY: React.CSSProperties = {
  width: '100%',
  minHeight: '56px',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-on-primary)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  cursor: 'pointer',
}

const BTN_SECONDARY: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  cursor: 'pointer',
  minHeight: '44px',
  padding: 'var(--space-2)',
  textDecoration: 'underline',
}

const ERROR_TEXT: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-error)',
  marginTop: 'var(--space-2)',
}

// ── Component ───────────────────────────────────────────────────────────────

export default function MobileIntakePage() {
  const navigate = useNavigate()
  const { id: initialItemId } = useParams()
  const [step, setStep] = useState<Step>('capture')
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [itemId, setItemId] = useState<string | null>(initialItemId || null)
  const [images, setImages] = useState<string[]>([])
  const [marketPricing, setMarketPricing] = useState<{
    avgRegularPriceCents?: number;
    avgSalePriceCents?: number;
    avgRefurbPriceCents?: number;
  } | null>(null)
  const [uploads, setUploads] = useState<Map<string, UploadEntry>>(new Map())
  const [isCreating, setIsCreating] = useState(false)
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [publishError, setPublishError] = useState('')
  const [funStatusIndex, setFunStatusIndex] = useState(0)
  const [photoOpsLoading, setPhotoOpsLoading] = useState(false)
  const [photoOpsError, setPhotoOpsError] = useState('')
  // AI toggle — session-scoped: ON by default, persisted for batch workflows
  // Reads the same key as the desktop IntakeForm for cross-form consistency
  const [aiEnabled, setAiEnabled] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('aiIntakeEnabled')
    return stored === null ? true : stored === 'true'
  })
  const aiEnabledRef = useRef(aiEnabled)

  const handleAiToggle = (enabled: boolean) => {
    setAiEnabled(enabled)
    aiEnabledRef.current = enabled
    sessionStorage.setItem('aiIntakeEnabled', String(enabled))
  }

  // Refs — itemId is needed inside callbacks without stale closure issues
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const itemIdRef = useRef<string | null>(null)
  const isCreatingRef = useRef(false)
  const prevImageCountRef = useRef(0)

  const set = (field: keyof FormState) => (value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => { itemIdRef.current = itemId }, [itemId])

  useEffect(() => {
    if (initialItemId) {
      const fetchItem = async () => {
        try {
          const snap = await getDoc(doc(db, 'items', initialItemId))
          if (snap.exists()) {
            const data = snap.data()
            const costSnap = await getDoc(doc(db, 'items', initialItemId, 'internal', 'staff'))
            const costData = costSnap.exists() ? costSnap.data() : null

            setForm(prev => ({
              ...prev,
              title: data.title || '',
              description: data.description || '',
              category: data.category || '',
              viewTag: (data.viewTag as ViewType) || '',
              priceInput: data.price ? (data.price / 100).toFixed(2) : '',
              condition: data.condition || '',
              quantityInput: data.quantity !== undefined ? data.quantity.toString() : '1',
              costInput: costData?.cost ? (costData.cost / 100).toFixed(2) : '',
              brand: data.cannabisProfile?.brand || '',
              format: data.cannabisProfile?.format || '',
              subCategory: data.cannabisProfile?.subCategory || '',
              servings: data.cannabisProfile?.servings ? data.cannabisProfile.servings.toString() : '',
              weightPerServing: data.cannabisProfile?.weightPerServing || '',
              strainType: data.cannabisProfile?.strainType || '',
              cannabinoidUnit: data.cannabisProfile?.cannabinoidUnit || '%',
            }))
            
            // Advance step if we have minimal data
            if (data.title && data.viewTag) {
              setStep('details')
            }
          }
        } catch (err) {
          console.error("Failed to load item:", err)
        }
      }
      fetchItem()
    }
  }, [initialItemId])

  // Real-time listener for CF-processed images once draft exists
  useEffect(() => {
    if (!itemId) return
    const unsubscribe = onSnapshot(doc(db, 'items', itemId), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      const newImages = (data['images'] as string[] | undefined) ?? []
      setImages(newImages)
      
      const newlyProcessedCount = newImages.length - prevImageCountRef.current
      if (newlyProcessedCount > 0) {
        prevImageCountRef.current = newImages.length
        setUploads(prev => {
          const next = new Map(prev)
          let toRemove = newlyProcessedCount
          for (const [k, entry] of prev) {
            if (entry.processing && toRemove > 0) {
              next.delete(k)
              toRemove--
            }
          }
          return next
        })
      }
    })
    return unsubscribe
  }, [itemId])

  // Cycle fun messages while waiting
  useEffect(() => {
    const hasProcessing = Array.from(uploads.values()).some(u => u.processing)
    if (!hasProcessing) {
      setFunStatusIndex(0)
      return
    }
    const interval = setInterval(() => {
      setFunStatusIndex(prev => (prev + 1) % FUN_STATUSES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [uploads])

  // Real-time listener for AI extraction data
  useEffect(() => {
    if (!itemId) return
    console.log(`[AI Intake] Starting real-time listener for item: ${itemId}`)
    const unsubscribe = onSnapshot(doc(db, 'items', itemId, 'internal', 'ai'), (snap) => {
      if (!snap.exists()) {
        console.log(`[AI Intake] 'internal/ai' document does not exist yet for item ${itemId}.`)
        return
      }
      const data = snap.data()
      console.log(`[AI Intake] Received update from 'internal/ai':`, data)
      if (data.intakeExtraction && data.intakeExtraction.suggestedFields) {
        console.log(`[AI Intake] Hydrating form with AI suggested fields:`, data.intakeExtraction.suggestedFields)
        const fields = data.intakeExtraction.suggestedFields
        setForm(prev => ({
          ...prev,
          title: prev.title === 'AI Draft Intake' || !prev.title ? fields.title || prev.title : prev.title,
          category: prev.category === 'general' || !prev.category ? fields.category || prev.category : prev.category,
          description: !prev.description ? fields.description || prev.description : prev.description,
          condition: !prev.condition ? fields.condition || prev.condition : prev.condition,
          brand: !prev.brand && fields.brand ? fields.brand : prev.brand,
          format: !prev.format && fields.format ? fields.format : prev.format
        }))
        // Automatically advance if we were waiting on capture
        setStep(prevStep => prevStep === 'capture' ? 'details' : prevStep)
      }
      if (data.intakeExtraction && data.intakeExtraction.marketPricing) {
        console.log(`[AI Intake] Hydrating market pricing:`, data.intakeExtraction.marketPricing)
        setMarketPricing(data.intakeExtraction.marketPricing)
      }
    })
    return unsubscribe
  }, [itemId])

  // ── Upload logic ──────────────────────────────────────────────────────────

  const uploadFile = useCallback(async (file: File) => {
    const id = itemIdRef.current
    if (!id) return

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
      fileToUpload = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })
    } catch (error) {
      console.error('Image compression failed:', error)
    }

    const storagePath = `items/${id}/uploads/${key}`
    const storageRef = ref(storage, storagePath)
    const task = uploadBytesResumable(storageRef, fileToUpload)

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
        // Storage upload done — instantly trigger processing
        setUploads(prev => new Map(prev).set(key, { fileName: file.name, progress: 100, processing: true }))
        
        try {
          console.log(`[AI Intake] Calling processUploadedImage for ${storagePath}...`)
          const res = await processUploadedImageFn({ filePath: storagePath, extractData: aiEnabledRef.current, viewTag: form.viewTag })
          console.log(`[AI Intake] processUploadedImage completed successfully.`)
          
          const responseData = res.data as { aiFailed?: boolean; aiError?: string };
          if (responseData?.aiFailed) {
            window.alert(`AI Extraction Unavailable: ${responseData.aiError}\n\nThe photo has been saved successfully. Please enter the details manually.`)
          }
          
          setUploads(prev => {
            const updated = new Map(prev)
            const entry = updated.get(key)
            if (entry) updated.set(key, { ...entry, processing: false })
            return updated
          })
        } catch (err) {
          console.error(`[AI Intake] processUploadedImage failed:`, err)
          setUploads(prev => {
            const updated = new Map(prev)
            const entry = updated.get(key)
            if (entry) {
              let errorMessage = 'Processing failed'
              if (err instanceof Error) {
                errorMessage = err.message
                if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
                  errorMessage = 'AI API Quota Exceeded. The photo is saved, but auto-fill is disabled.'
                }
              }
              updated.set(key, { ...entry, processing: false, error: errorMessage })
            }
            return updated
          })
        }
      }
    )
  }, [form.viewTag])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(uploadFile)
  }, [uploadFile])

  // ── Draft creation ────────────────────────────────────────────────────────

  const ensureItemCreated = async (): Promise<boolean> => {
    if (itemIdRef.current) return true
    if (isCreatingRef.current) return false

    const errs: Record<string, string> = {}
    if (!form.viewTag) errs.viewTag = 'Select a view first'
    if (Object.keys(errs).length > 0) { setErrors(errs); return false }
    setErrors({})

    isCreatingRef.current = true
    setIsCreating(true)
    try {
      const result = await createDraftItemFn({
        title: form.title.trim() || 'AI Draft Intake',
        category: 'general',
        viewTag: form.viewTag as string,
      })
      itemIdRef.current = result.data.itemId
      setItemId(result.data.itemId)
      return true
    } catch (err) {
      setErrors({ create: err instanceof Error ? err.message : 'Could not start item. Try again.' })
      return false
    } finally {
      isCreatingRef.current = false
      setIsCreating(false)
    }
  }

  const openCamera = async () => {
    if (await ensureItemCreated()) cameraRef.current?.click()
  }

  const openGallery = async () => {
    if (await ensureItemCreated()) galleryRef.current?.click()
  }

  // ── Photo management ──────────────────────────────────────────────────────

  const handleMobileDeleteImage = useCallback(async (url: string) => {
    const id = itemIdRef.current
    if (!id || photoOpsLoading) return
    setPhotoOpsLoading(true)
    setPhotoOpsError('')
    try {
      await removeItemImageFn({ itemId: id, imageUrl: url })
    } catch {
      setPhotoOpsError('Could not remove photo — please try again.')
    } finally {
      setPhotoOpsLoading(false)
    }
  }, [photoOpsLoading])

  const handleMobileSetCover = useCallback(async (url: string) => {
    const id = itemIdRef.current
    if (!id || photoOpsLoading) return
    setPhotoOpsLoading(true)
    setPhotoOpsError('')
    try {
      const newOrder = [url, ...images.filter(u => u !== url)]
      await reorderItemImagesFn({ itemId: id, images: newOrder })
    } catch {
      setPhotoOpsError('Could not update cover photo — please try again.')
    } finally {
      setPhotoOpsLoading(false)
    }
  }, [images, photoOpsLoading])

  // ── Step navigation ───────────────────────────────────────────────────────

  const advanceToDetails = () => {
    const errs: Record<string, string> = {}
    if (!form.viewTag) errs.viewTag = 'Select a view first'
    const hasActiveUpload = Array.from(uploads.values()).some(u => !u.error && !u.processing)
    const hasProcessing = Array.from(uploads.values()).some(u => u.processing)
    if (images.length === 0) {
      errs.photo = hasActiveUpload
        ? 'Photo is still uploading — please wait'
        : hasProcessing
          ? 'Photo is still processing — please wait a moment'
          : 'At least one photo is required'
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep('details')
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
        updatedAt: serverTimestamp(),
      }

      if (form.viewTag === 'cannabis') {
        const profile: Record<string, unknown> = {
          subCategory: form.subCategory?.trim() || undefined,
          servings: form.servings ? parseInt(form.servings, 10) : undefined,
          weightPerServing: form.weightPerServing?.trim() || undefined,
          strainType: form.strainType || undefined,
          cannabinoidUnit: form.cannabinoidUnit || undefined,
        }
        Object.keys(profile).forEach(k => profile[k] === undefined && delete profile[k])
        if (Object.keys(profile).length > 0) {
          updateData.cannabisProfile = profile
        }
      }

      await updateDoc(doc(db, 'items', itemId), updateData)
      const costCents = parsePriceCents(form.costInput)
      if (form.costInput.trim() && !isNaN(costCents) && costCents > 0) {
        await setDoc(doc(db, 'items', itemId, 'internal', 'staff'), { cost: costCents }, { merge: true })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setStep('review')
    },
    onError: (err: Error) => {
      setErrors({ save: err.message || 'Save failed. Try again.' })
    }
  })

  const advanceToReview = async () => {
    const errs: Record<string, string> = {}
    if (!form.title.trim() || form.title === 'AI Draft Intake') errs.title = 'Item Name is required'
    if (!form.category.trim()) errs.category = 'Category is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    const cents = parsePriceCents(form.priceInput)
    if (isNaN(cents) || cents <= 0) errs.price = 'Valid price required (e.g. 49.99)'
    if (!form.condition) errs.condition = 'Condition is required'
    if (form.quantityInput.trim() && (isNaN(parseInt(form.quantityInput, 10)) || parseInt(form.quantityInput, 10) < 1)) {
      errs.quantity = 'Stock must be a whole number of at least 1'
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    if (!itemId) return

    saveMutation.mutate()
  }

  const publishMutation = useMutation({
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
        updatedAt: serverTimestamp(),
      }

      if (form.viewTag === 'cannabis') {
        const profile: Record<string, unknown> = {
          subCategory: form.subCategory?.trim() || undefined,
          servings: form.servings ? parseInt(form.servings, 10) : undefined,
          weightPerServing: form.weightPerServing?.trim() || undefined,
          strainType: form.strainType || undefined,
          cannabinoidUnit: form.cannabinoidUnit || undefined,
        }
        Object.keys(profile).forEach(k => profile[k] === undefined && delete profile[k])
        if (Object.keys(profile).length > 0) {
          updateData.cannabisProfile = profile
        }
      }

      await updateDoc(doc(db, 'items', itemId), updateData)
      const costCents = parsePriceCents(form.costInput)
      if (form.costInput.trim() && !isNaN(costCents) && costCents > 0) {
        await setDoc(doc(db, 'items', itemId, 'internal', 'staff'), { cost: costCents }, { merge: true })
      }
      await publishItemFn({ itemId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setStep('published')
    },
    onError: (err: Error) => {
      setPublishError(err.message || 'Publish failed. Try again.')
    }
  })

  const publish = async () => {
    if (!itemId) return
    setPublishError('')
    publishMutation.mutate()
  }

  const reset = () => {
    setForm(EMPTY_FORM)
    setItemId(null)
    itemIdRef.current = null
    prevImageCountRef.current = 0
    setImages([])
    setUploads(new Map())
    setErrors({})
    setPublishError('')
    setStep('capture')
  }

  const pendingUploads = Array.from(uploads.values())

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute staffOnly>

      {/* ── Hidden file inputs — always mounted ── */}
      <input
        ref={cameraRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        capture="environment"
        className="sr-only"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />

      {/* ── Step: capture ── */}
      {step === 'capture' && (
        <div style={PAGE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', color: 'var(--color-text)', margin: 0 }}>
              {initialItemId ? 'Edit Item' : 'New Item'}
            </h1>
            <button
              onClick={() => navigate('/admin/inventory')}
              aria-label="Cancel and return to inventory"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-subheading)',
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2)',
              }}
            >
              ✕
            </button>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Step 1 of 3 — {aiEnabled ? 'Upload Photo to start AI Extraction' : 'Upload Photo'}
          </p>

          {/* View */}
          <div style={FIELD}>
            <label htmlFor="mi-view" style={LABEL}>View</label>
            <select
              id="mi-view"
              value={form.viewTag}
              onChange={e => set('viewTag')(e.target.value as ViewType | '')}
              style={{ ...INPUT, appearance: 'none' }}
              aria-invalid={errors.viewTag ? 'true' : undefined}
              aria-describedby={errors.viewTag ? 'mi-view-error' : undefined}
            >
              <option value="">Select view…</option>
              <option value="pawn">Pawn</option>
              <option value="cannabis">Cannabis</option>
              <option value="fireworks">Fireworks</option>
            </select>
            {errors.viewTag && <span id="mi-view-error" style={ERROR_TEXT} role="alert">{errors.viewTag}</span>}
          </div>

          {/* AI Auto-fill Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: aiEnabled ? 'var(--color-bg-subtle)' : 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            opacity: images.length > 0 ? 0.6 : 1,
            transition: 'opacity var(--motion-speed-fast) var(--motion-easing), background-color var(--motion-speed-fast) var(--motion-easing)',
          }}>
            <button
              id="mi-ai-toggle"
              type="button"
              role="switch"
              aria-checked={aiEnabled}
              aria-label="Use AI to auto-fill form fields and pricing from photo"
              disabled={images.length > 0}
              onClick={() => handleAiToggle(!aiEnabled)}
              style={{
                position: 'relative',
                width: '44px',
                height: 'var(--space-6)',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: aiEnabled ? 'var(--color-primary)' : 'var(--color-border)',
                cursor: images.length > 0 ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                transition: 'background-color var(--motion-speed-fast) var(--motion-easing)',
                padding: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '3px',
                left: aiEnabled ? '23px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-on-primary)',
                transition: 'left var(--motion-speed-fast) var(--motion-easing)',
                display: 'block',
              }} />
            </button>
            <div>
              <label
                htmlFor="mi-ai-toggle"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-small)',
                  color: aiEnabled ? 'var(--color-text)' : 'var(--color-text-muted)',
                  cursor: images.length > 0 ? 'not-allowed' : 'pointer',
                  fontWeight: aiEnabled ? 500 : 400,
                }}
              >
                {aiEnabled ? '✨ Auto-fill with AI' : 'Manual entry'}
              </label>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}>
                {aiEnabled
                  ? 'AI will auto-fill title, description & pricing from your photo'
                  : 'Photo will be saved — fill in details manually'
                }
              </span>
              {images.length > 0 && (
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic',
                  marginTop: 'var(--space-1)',
                }}>
                  Locked after first photo
                </span>
              )}
            </div>
          </div>

          {/* Photo guidance */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Clear, well-lit photo — item front-facing, dark background.
          </p>

          {errors.photo && <span style={{ ...ERROR_TEXT, display: 'block', marginBottom: 'var(--space-4)' }} role="alert">{errors.photo}</span>}
          {errors.create && <span style={{ ...ERROR_TEXT, display: 'block', marginBottom: 'var(--space-4)' }} role="alert">{errors.create}</span>}

          {/* Camera CTA */}
          <button
            type="button"
            onClick={openCamera}
            disabled={isCreating}
            style={{ ...BTN_PRIMARY, marginBottom: 'var(--space-2)', opacity: isCreating ? 0.6 : 1 }}
          >
            {isCreating ? 'Starting…' : '📷 Take Photo'}
          </button>
          <button
            type="button"
            onClick={openGallery}
            disabled={isCreating}
            style={{ ...BTN_SECONDARY, width: '100%', marginBottom: 'var(--space-6)' }}
          >
            Choose from Library
          </button>

          {/* Upload progress */}
          {pendingUploads.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-4)' }} aria-label="Upload progress">
              {pendingUploads.map(u => (
                <li key={u.fileName} style={{ marginBottom: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{u.fileName}</span>
                  {u.error
                    ? <span style={ERROR_TEXT}>{u.error}</span>
                    : u.processing
                      ? aiEnabled
                        ? <span style={{ ...LABEL, display: 'block', marginTop: 'var(--space-1)', color: 'var(--color-primary)', fontWeight: 500 }}>✨ {FUN_STATUSES[funStatusIndex]}</span>
                        : <span style={{ ...LABEL, display: 'block', marginTop: 'var(--space-1)', color: 'var(--color-text-muted)' }}>Saving photo…</span>
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

          {/* Photo thumbnails */}
          {images.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <ul
                style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}
                aria-label={`${images.length} photo${images.length !== 1 ? 's' : ''} captured`}
              >
                {images.map((url, i) => (
                  <li key={url} style={{ position: 'relative', opacity: photoOpsLoading ? 0.5 : 1, transition: `opacity var(--motion-speed-fast) var(--motion-easing)` }}>
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
                      }}>Cover</span>
                    )}
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', display: 'block' }}
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'center', marginTop: 'var(--space-1)' }}>
                      {i > 0 && (
                        <button
                          type="button"
                          aria-label={`Set photo ${i + 1} as cover`}
                          title="Set as cover"
                          disabled={photoOpsLoading}
                          onClick={() => handleMobileSetCover(url)}
                          style={{
                            minWidth: 'var(--space-12)',
                            minHeight: 'var(--space-12)',
                            background: 'none',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-primary)',
                            fontSize: 'var(--text-small)',
                            lineHeight: 1,
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
                        onClick={() => handleMobileDeleteImage(url)}
                        style={{
                          minWidth: 'var(--space-12)',
                          minHeight: 'var(--space-12)',
                          background: 'none',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--text-body)',
                          lineHeight: 1,
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
              {photoOpsError && (
                <p role="alert" style={{ ...ERROR_TEXT, marginTop: 'var(--space-2)' }}>{photoOpsError}</p>
              )}
            </div>
          )}

          {/* Next */}
          <button
            type="button"
            onClick={advanceToDetails}
            style={{
              ...BTN_PRIMARY,
              opacity: (images.length === 0 || !form.viewTag) ? 0.4 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Step: details ── */}
      {step === 'details' && (
        <div style={PAGE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <button
              onClick={() => setStep('capture')}
              aria-label="Back to photo step"
              style={{ ...BTN_SECONDARY, textDecoration: 'none', padding: 'var(--space-2) 0' }}
            >
              ← Back
            </button>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Step 2 of 3 — Details
            </p>
          </div>

          {/* Title */}
          <div style={FIELD}>
            <label htmlFor="mi-title" style={LABEL}>Item Name</label>
            <input
              id="mi-title"
              type="text"
              value={form.title === 'AI Draft Intake' ? '' : form.title}
              onChange={e => set('title')(e.target.value)}
              placeholder="e.g. Seiko 5 Automatic"
              autoFocus
              style={INPUT}
              aria-invalid={errors.title ? 'true' : undefined}
              aria-describedby={errors.title ? 'mi-title-error' : undefined}
            />
            {errors.title && <span id="mi-title-error" style={ERROR_TEXT} role="alert">{errors.title}</span>}
          </div>

          {/* Category */}
          <div style={FIELD}>
            <label htmlFor="mi-category" style={LABEL}>Category</label>
            <input
              id="mi-category"
              type="text"
              value={form.category}
              onChange={e => set('category')(e.target.value)}
              placeholder="e.g. Watches"
              style={INPUT}
              aria-invalid={errors.category ? 'true' : undefined}
              aria-describedby={errors.category ? 'mi-category-error' : undefined}
            />
            {errors.category && <span id="mi-category-error" style={ERROR_TEXT} role="alert">{errors.category}</span>}
          </div>

          {/* Description */}
          <div style={FIELD}>
            <label htmlFor="mi-description" style={LABEL}>Description</label>
            <textarea
              id="mi-description"
              value={form.description}
              onChange={e => set('description')(e.target.value)}
              placeholder="Describe the item — condition details, notable features, any included accessories."
              rows={4}
              style={{ ...INPUT, padding: 'var(--space-3) var(--space-4)', resize: 'vertical' }}
              aria-invalid={errors.description ? 'true' : undefined}
              aria-describedby={errors.description ? 'mi-description-error' : undefined}
            />
            {errors.description && <span id="mi-description-error" style={ERROR_TEXT} role="alert">{errors.description}</span>}
          </div>

          {/* AI Pricing Insight */}
          {marketPricing && (
            <div style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-primary)',
                margin: '0 0 var(--space-3) 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ✨ AI Market Pricing
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Regular</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-small)', color: 'var(--color-text)' }}>
                    ${((marketPricing.avgRegularPriceCents || 0) / 100).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Sale</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-small)', color: 'var(--color-text)' }}>
                    ${((marketPricing.avgSalePriceCents || 0) / 100).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Open-Box</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-small)', color: 'var(--color-text)' }}>
                    ${((marketPricing.avgRefurbPriceCents || 0) / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price */}
          <div style={FIELD}>
            <label htmlFor="mi-price" style={LABEL}>Sale Price (CAD $)</label>
            <input
              id="mi-price"
              type="text"
              inputMode="decimal"
              value={form.priceInput}
              onChange={e => set('priceInput')(e.target.value)}
              placeholder="49.99"
              style={INPUT}
              aria-invalid={errors.price ? 'true' : undefined}
              aria-describedby={errors.price ? 'mi-price-error' : undefined}
            />
            {errors.price && <span id="mi-price-error" style={ERROR_TEXT} role="alert">{errors.price}</span>}
          </div>

          {/* Cost — staff-only, written to internal/staff subcollection */}
          <div style={FIELD}>
            <label htmlFor="mi-cost" style={LABEL}>Cost Price (CAD $, optional)</label>
            <input
              id="mi-cost"
              type="text"
              inputMode="decimal"
              value={form.costInput}
              onChange={e => set('costInput')(e.target.value)}
              placeholder="e.g. 25.00"
              style={INPUT}
            />
          </div>

          {/* Initial Stock */}
          <div style={FIELD}>
            <label htmlFor="mi-quantity" style={LABEL}>Initial Stock</label>
            <input
              id="mi-quantity"
              type="text"
              inputMode="numeric"
              value={form.quantityInput}
              onChange={e => set('quantityInput')(e.target.value)}
              placeholder="1"
              style={INPUT}
              aria-invalid={errors.quantity ? 'true' : undefined}
              aria-describedby={errors.quantity ? 'mi-quantity-error' : undefined}
            />
            {errors.quantity && <span id="mi-quantity-error" style={ERROR_TEXT} role="alert">{errors.quantity}</span>}
          </div>

          {/* Condition */}
          <div style={FIELD}>
            <ConditionSelector
              value={form.condition}
              onChange={val => set('condition')(val)}
              error={errors.condition}
            />
          </div>

          {errors.save && <p style={ERROR_TEXT} role="alert">{errors.save}</p>}

          <button
            type="button"
            onClick={advanceToReview}
            disabled={saveMutation.isPending}
            style={{ ...BTN_PRIMARY, opacity: saveMutation.isPending ? 0.6 : 1 }}
          >
            {saveMutation.isPending ? 'Saving…' : 'Next →'}
          </button>
        </div>
      )}

      {/* ── Step: review ── */}
      {step === 'review' && (
        <div style={PAGE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <button
              onClick={() => setStep('details')}
              aria-label="Back to details step"
              style={{ ...BTN_SECONDARY, textDecoration: 'none', padding: 'var(--space-2) 0' }}
            >
              ← Back
            </button>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Step 3 of 3 — Review
            </p>
          </div>

          {/* Primary photo */}
          {images[0] && (
            <img
              src={images[0]}
              alt={form.title}
              style={{
                width: '100%',
                maxHeight: '280px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-6)',
                display: 'block',
              }}
            />
          )}

          {/* Summary */}
          <dl style={{ margin: '0 0 var(--space-8)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-2) var(--space-4)' }}>
            {([
              ['Item', form.title, 'none'],
              ['View', form.viewTag, 'capitalize'],
              ['Category', form.category, 'none'],
              ['Description', form.description, 'none'],
              ['Sale Price', formatPrice(parsePriceCents(form.priceInput)), 'none'],
              ['Cost Price', form.costInput.trim() ? formatPrice(parsePriceCents(form.costInput)) : '—', 'none'],
              ['Initial Stock', String(parseQuantity(form.quantityInput)), 'none'],
              ['Condition', form.condition, 'capitalize'],
              ['Photos', String(images.length), 'none'],
            ] as const).map(([label, value, transform]) => (
              <Fragment key={label}>
                <dt style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>{label}</dt>
                <dd style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text)', margin: 0, textTransform: transform }}>
                  {value}
                </dd>
              </Fragment>
            ))}
          </dl>

          {/* Status badge preview */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Badge variant="draft" label="draft" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
              — will become Active on publish
            </span>
          </div>

          {publishError && (
            <p style={{ ...ERROR_TEXT, marginBottom: 'var(--space-4)' }} role="alert">{publishError}</p>
          )}

          <button
            type="button"
            onClick={publish}
            disabled={publishMutation.isPending}
            style={{ ...BTN_PRIMARY, opacity: publishMutation.isPending ? 0.6 : 1 }}
          >
            {publishMutation.isPending ? 'Publishing…' : 'Publish Item'}
          </button>
        </div>
      )}

      {/* ── Step: published ── */}
      {step === 'published' && (
        <div style={{ ...PAGE, textAlign: 'center', paddingTop: 'var(--space-24)' }}>
          <p style={{ fontSize: 'var(--text-display)', marginBottom: 'var(--space-4)', lineHeight: 1 }} aria-hidden="true">✓</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
            Item Published
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
            {form.title} is now live.
          </p>
          <button type="button" onClick={reset} style={BTN_PRIMARY}>
            Add Another Item
          </button>
        </div>
      )}

    </ProtectedRoute>
  )
}
