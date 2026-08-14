import { useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import type { ConditionGrade, ViewType } from '../../lib/types'
import ConditionSelector from './ConditionSelector'
import MerchandisingTagSelector from './MerchandisingTagSelector'
import ImageUploadZone from './ImageUploadZone'
import QRLabel from './QRLabel'
import EbayPushButton from './EbayPushButton'
import Button from '../ui/Button'
import Input from '../ui/Input'

import type { FormState, FormErrors } from './intake/types'
import { EMPTY_FORM } from './intake/types'
import CannabisFields from './intake/CannabisFields'
import FireworksFields from './intake/FireworksFields'

// ── Cloud Function callables ──────────────────────────────────────────────────

const createDraftItemFn = httpsCallable<
  { title: string; category: string; viewTag: string },
  { success: boolean; itemId: string }
>(functions, 'createDraftItem')

const publishItemFn = httpsCallable<
  { itemId: string },
  { success: boolean }
>(functions, 'publishItem')

// ── Types ─────────────────────────────────────────────────────────────────────

// Types imported from intake/types.ts

type Phase = 'creating' | 'editing' | 'published'

function parseQuantity(input: string): number {
  const q = parseInt(input.trim(), 10)
  return isNaN(q) || q < 1 ? 1 : q
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePriceCents(input: string): number {
  return Math.round(parseFloat(input) * 100)
}

function validateForSave(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.viewTag)         errors.viewTag  = 'View is required'
  return errors
}

function validateForPublish(form: FormState, images: string[]): FormErrors {
  const errors = validateForSave(form)
  if (!form.title.trim())       errors.title        = 'Title is required'
  if (!form.category.trim())    errors.category     = 'Category is required'
  if (!form.description.trim()) errors.description  = 'Description is required'
  if (!form.condition)          errors.condition    = 'Condition is required'
  const cents = parsePriceCents(form.priceInput)
  if (isNaN(cents) || cents <= 0) errors.price = 'Valid price is required (e.g. 49.99)'
  if (images.length === 0) errors.images = 'At least one photo is required before publishing'
  return errors
}

// ── Component ─────────────────────────────────────────────────────────────────

interface IntakeFormProps {
  initialItemId?: string
}

export default function IntakeForm({ initialItemId }: IntakeFormProps = {}) {
  const [phase, setPhase] = useState<Phase>(initialItemId ? 'editing' : 'creating')
  const [itemId, setItemId] = useState<string | null>(initialItemId || null)
  const [images, setImages] = useState<string[]>([])
  const [marketPricing, setMarketPricing] = useState<{
    avgRegularPriceCents?: number;
    avgSalePriceCents?: number;
    avgRefurbPriceCents?: number;
  } | null>(null)
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [publishError, setPublishError] = useState('')
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  // AI toggle — session-scoped preference: ON by default, persisted for batch workflows
  const [aiEnabled, setAiEnabled] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('aiIntakeEnabled')
    return stored === null ? true : stored === 'true'
  })

  const handleAiToggle = (enabled: boolean) => {
    setAiEnabled(enabled)
    sessionStorage.setItem('aiIntakeEnabled', String(enabled))
  }

  const ensureItemCreated = async (): Promise<string | null> => {
    if (itemId) return itemId
    if (isCreating) return null
    
    if (!formState.viewTag) {
      setErrors({ viewTag: 'Please select a view before uploading a photo' })
      return null
    }

    setIsCreating(true)
    setPublishError('')
    try {
      const result = await createDraftItemFn({
        title: formState.title.trim() || 'AI Draft Intake',
        category: formState.category.trim() || 'general',
        viewTag: formState.viewTag,
      })
      
      const newId = result.data.itemId
      setItemId(newId)
      setPhase('editing')
      return newId
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Could not start item for upload.')
      return null
    } finally {
      setIsCreating(false)
    }
  }

  // Real-time listener for images — CF processImageUpload writes to items/{id}.images[]
  useEffect(() => {
    if (initialItemId) {
      const fetchItem = async () => {
        try {
          const snap = await getDoc(doc(db, 'items', initialItemId))
          if (snap.exists()) {
            const data = snap.data()
            const costSnap = await getDoc(doc(db, 'items', initialItemId, 'internal', 'staff'))
            const costData = costSnap.exists() ? costSnap.data() : null

            setFormState(prev => ({
              ...prev,
              title: data.title || '',
              description: data.description || '',
              category: data.category || '',
              viewTag: (data.viewTag as ViewType) || '',
              priceInput: data.price ? (data.price / 100).toString() : '',
              condition: (data.condition as ConditionGrade) || '',
              serialNumber: data.serialNumber || '',
              provenanceNotes: data.provenanceNotes || '',
              isSeasonalItem: !!data.isSeasonalItem,
              merchandisingTags: data.merchandisingTags || [],
              costInput: costData?.cost ? (costData.cost / 100).toString() : '',
              quantityInput: data.quantity ? data.quantity.toString() : '1',

              // Cannabis Profile
              thcMin: data.cannabisProfile?.thcMin?.toString() || '',
              thcMax: data.cannabisProfile?.thcMax?.toString() || '',
              cbdMin: data.cannabisProfile?.cbdMin?.toString() || '',
              cbdMax: data.cannabisProfile?.cbdMax?.toString() || '',
              terpenes: data.cannabisProfile?.terpenes?.join(', ') || '',
              geneticLineage: data.cannabisProfile?.geneticLineage || '',
              effectProfile: data.cannabisProfile?.effectProfile?.join(', ') || '',
              brand: data.cannabisProfile?.brand || '',
              format: data.cannabisProfile?.format || '',
              weight: data.cannabisProfile?.weight || '',
              lotNumber: data.cannabisProfile?.lotNumber || '',
              packagedDate: data.cannabisProfile?.packagedDate ? new Date(data.cannabisProfile.packagedDate.seconds * 1000).toISOString().split('T')[0] : '',
              subCategory: data.cannabisProfile?.subCategory || '',
              servings: data.cannabisProfile?.servings ? data.cannabisProfile.servings.toString() : '',
              weightPerServing: data.cannabisProfile?.weightPerServing || '',
              strainType: data.cannabisProfile?.strainType || '',
              cannabinoidUnit: data.cannabisProfile?.cannabinoidUnit || '%',

              // Fireworks Profile
              explosiveWeight: data.fireworksProfile?.explosiveWeight || '',
              classificationClass: data.fireworksProfile?.classificationClass || '',
              effectType: data.fireworksProfile?.effectType || '',
              shots: data.fireworksProfile?.shots ? data.fireworksProfile.shots.toString() : '',
              duration: data.fireworksProfile?.duration ? data.fireworksProfile.duration.toString() : '',
              noiseLevel: data.fireworksProfile?.noiseLevel || '',
            }))
          }
        } catch (err) {
          console.error("Failed to load item:", err)
        }
      }
      fetchItem()
    }
  }, [initialItemId])

  useEffect(() => {
    if (!itemId) return
    const unsubscribe = onSnapshot(doc(db, 'items', itemId), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      setImages((data['images'] as string[] | undefined) ?? [])
    })
    return unsubscribe
  }, [itemId])

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
        setFormState(prev => ({
          ...prev,
          title: !prev.title || prev.title === 'AI Draft Intake' ? fields.title || prev.title : prev.title,
          category: !prev.category || prev.category === 'general' ? fields.category || prev.category : prev.category,
          description: !prev.description ? fields.description || prev.description : prev.description,
          condition: !prev.condition ? fields.condition || prev.condition : prev.condition,
          brand: !prev.brand && fields.brand ? fields.brand : prev.brand,
          format: !prev.format && fields.format ? fields.format : prev.format
        }))
      }
      if (data.intakeExtraction && data.intakeExtraction.marketPricing) {
        console.log(`[AI Intake] Hydrating market pricing:`, data.intakeExtraction.marketPricing)
        setMarketPricing(data.intakeExtraction.marketPricing)
      }
      if (data.intakeExtraction && data.intakeExtraction.cannabisProfile) {
        console.log(`[AI Intake] Hydrating cannabis profile:`, data.intakeExtraction.cannabisProfile)
        const cFields = data.intakeExtraction.cannabisProfile
        setFormState(prev => ({
          ...prev,
          thcMin: !prev.thcMin && cFields.thcMin != null ? String(cFields.thcMin) : prev.thcMin,
          thcMax: !prev.thcMax && cFields.thcMax != null ? String(cFields.thcMax) : prev.thcMax,
          cbdMin: !prev.cbdMin && cFields.cbdMin != null ? String(cFields.cbdMin) : prev.cbdMin,
          cbdMax: !prev.cbdMax && cFields.cbdMax != null ? String(cFields.cbdMax) : prev.cbdMax,
          cannabinoidUnit: !prev.cannabinoidUnit || prev.cannabinoidUnit === '%' ? cFields.cannabinoidUnit || prev.cannabinoidUnit : prev.cannabinoidUnit,
          terpenes: !prev.terpenes && cFields.terpenes?.length ? cFields.terpenes.join(', ') : prev.terpenes,
          geneticLineage: !prev.geneticLineage && cFields.geneticLineage ? cFields.geneticLineage : prev.geneticLineage,
          effectProfile: !prev.effectProfile && cFields.effectProfile?.length ? cFields.effectProfile.join(', ') : prev.effectProfile,
          brand: !prev.brand && cFields.brand ? cFields.brand : prev.brand,
          format: !prev.format && cFields.format ? cFields.format : prev.format,
          weight: !prev.weight && cFields.weight != null ? String(cFields.weight) : prev.weight,
          lotNumber: !prev.lotNumber && cFields.lotNumber ? cFields.lotNumber : prev.lotNumber,
          packagedDate: !prev.packagedDate && cFields.packagedDate ? cFields.packagedDate : prev.packagedDate,
          subCategory: !prev.subCategory && cFields.subCategory ? cFields.subCategory : prev.subCategory,
          servings: !prev.servings && cFields.servings != null ? String(cFields.servings) : prev.servings,
          weightPerServing: !prev.weightPerServing && cFields.weightPerServing != null ? String(cFields.weightPerServing) : prev.weightPerServing,
          strainType: !prev.strainType && cFields.strainType ? cFields.strainType : prev.strainType,
        }))
      }
      if (data.intakeExtraction && data.intakeExtraction.fireworksProfile) {
        console.log(`[AI Intake] Hydrating fireworks profile:`, data.intakeExtraction.fireworksProfile)
        const fFields = data.intakeExtraction.fireworksProfile
        setFormState(prev => ({
          ...prev,
          explosiveWeight: !prev.explosiveWeight && fFields.explosiveWeight ? fFields.explosiveWeight : prev.explosiveWeight,
          classificationClass: !prev.classificationClass && fFields.classificationClass ? fFields.classificationClass : prev.classificationClass,
          effectType: !prev.effectType && fFields.effectType ? fFields.effectType : prev.effectType,
          shots: !prev.shots && fFields.shots != null ? String(fFields.shots) : prev.shots,
          duration: !prev.duration && fFields.duration != null ? String(fFields.duration) : prev.duration,
          noiseLevel: !prev.noiseLevel && fFields.noiseLevel ? fFields.noiseLevel : prev.noiseLevel,
        }))
      }
    })
    return unsubscribe
  }, [itemId])

  const set = (field: keyof FormState) => (value: unknown) =>
    setFormState((prev) => ({ ...prev, [field]: value }))

  const buildUpdatePayload = () => {
    const cents = parsePriceCents(formState.priceInput)
    const payload: Record<string, unknown> = {
      title:             formState.title.trim(),
      description:       formState.description.trim(),
      category:          formState.category.trim(),
      viewTag:           formState.viewTag,
      isSeasonalItem:    formState.isSeasonalItem,
      merchandisingTags: formState.merchandisingTags,
      quantity:          parseQuantity(formState.quantityInput),
      updatedAt:         serverTimestamp(),
    }
    if (formState.condition)       payload.condition       = formState.condition
    if (formState.serialNumber)    payload.serialNumber    = formState.serialNumber.trim()
    if (formState.provenanceNotes) payload.provenanceNotes = formState.provenanceNotes.trim()
    if (!isNaN(cents) && cents > 0) payload.price          = cents

    if (formState.viewTag === 'cannabis') {
      const profile: Record<string, unknown> = {
        thcMin: formState.thcMin ? parseFloat(formState.thcMin) : undefined,
        thcMax: formState.thcMax ? parseFloat(formState.thcMax) : undefined,
        cbdMin: formState.cbdMin ? parseFloat(formState.cbdMin) : undefined,
        cbdMax: formState.cbdMax ? parseFloat(formState.cbdMax) : undefined,
        terpenes: formState.terpenes ? formState.terpenes.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        effectProfile: formState.effectProfile ? formState.effectProfile.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        geneticLineage: formState.geneticLineage.trim() || undefined,
        brand: formState.brand.trim() || undefined,
        format: formState.format.trim() || undefined,
        weight: formState.weight.trim() || undefined,
        lotNumber: formState.lotNumber.trim() || undefined,
        packagedDate: formState.packagedDate ? new Date(formState.packagedDate) : undefined,
        subCategory: formState.subCategory.trim() || undefined,
        servings: formState.servings ? parseInt(formState.servings, 10) : undefined,
        weightPerServing: formState.weightPerServing.trim() || undefined,
        strainType: formState.strainType || undefined,
        cannabinoidUnit: formState.cannabinoidUnit || undefined,
      }
      Object.keys(profile).forEach(key => 
        profile[key] === undefined && delete profile[key]
      )
      payload.cannabisProfile = profile
    }
    
    if (formState.viewTag === 'fireworks') {
      const profile: Record<string, unknown> = {
        explosiveWeight: formState.explosiveWeight.trim() || undefined,
        classificationClass: formState.classificationClass.trim() || undefined,
        effectType: formState.effectType.trim() || undefined,
        shots: formState.shots ? parseInt(formState.shots, 10) : undefined,
        duration: formState.duration ? parseInt(formState.duration, 10) : undefined,
        noiseLevel: formState.noiseLevel || undefined,
      }
      Object.keys(profile).forEach(key => 
        profile[key] === undefined && delete profile[key]
      )
      payload.fireworksProfile = profile
    }

    return payload
  }

  const writeCostIfProvided = async (itemId: string) => {
    const costCents = parsePriceCents(formState.costInput)
    if (formState.costInput.trim() && !isNaN(costCents) && costCents > 0) {
      await setDoc(doc(db, 'items', itemId, 'internal', 'staff'), { cost: costCents }, { merge: true })
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      let id = itemId
      if (!id) {
        const result = await createDraftItemFn({
          title:    formState.title.trim(),
          category: formState.category.trim(),
          viewTag:  formState.viewTag as string,
        })
        id = result.data.itemId
        setItemId(id)
        setPhase('editing')
      }
      await updateDoc(doc(db, 'items', id), buildUpdatePayload())
      await writeCostIfProvided(id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
    },
    onError: (err: Error) => {
      setPublishError(err.message || 'Save failed. Please try again.')
    }
  })

  const saveDraft = async () => {
    const errs = validateForSave(formState)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setPublishError('')
    saveMutation.mutate()
  }

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!itemId) throw new Error('No item ID')
      await updateDoc(doc(db, 'items', itemId), buildUpdatePayload())
      await writeCostIfProvided(itemId)
      await publishItemFn({ itemId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setPhase('published')
    },
    onError: (err: Error) => {
      setPublishError(err.message || 'Publish failed. Please try again.')
    }
  })

  const publish = async () => {
    if (!itemId) return
    const errs = validateForPublish(formState, images)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setPublishError('')
    publishMutation.mutate()
  }

  // ── Published success view ────────────────────────────────────────────────

  if (phase === 'published' && itemId && formState.viewTag) {
    const priceCents = parsePriceCents(formState.priceInput)
    return (
      <div className="intake-form">
        <div className="intake-success">
          <h1 className="intake-success-heading">Item Published</h1>
          <p className="intake-success-body">
            {formState.title} is now live. Scan or print the label below to tag it in store.
          </p>
          <QRLabel
            id={itemId}
            title={formState.title}
            price={priceCents}
            viewTag={formState.viewTag as ViewType}
          />
          <EbayPushButton itemId={itemId} viewTag={formState.viewTag} />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFormState(EMPTY_FORM)
              setItemId(null)
              setImages([])
              setPhase('creating')
            }}
          >
            Add Another Item
          </Button>
        </div>
      </div>
    )
  }

  // ── Intake form ───────────────────────────────────────────────────────────

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="intake-form">
      <h1 className="intake-title">{initialItemId ? 'Edit Item' : 'New Item'}</h1>

      {/* ── Photo & View (AI Trigger) ── */}
      <section className="intake-section" style={{ position: 'relative' }}>
        <h2 className="intake-section-heading">Capture & View</h2>
        
        {isAiProcessing && aiEnabled && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--color-bg-subtle)',
            opacity: 0.85,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: 'var(--text-subheading)', 
              color: 'var(--color-primary)',
              animation: 'pulse 2s infinite' 
            }}>
              ✨ AI Extracting...
            </span>
          </div>
        )}

        <div className="input-wrapper" style={{ marginBottom: 'var(--space-6)' }}>
          <label className="input-label" htmlFor="viewTag">View (Required first)</label>
          <select
            id="viewTag"
            className="input-field input-field-select"
            value={formState.viewTag}
            onChange={(e) => set('viewTag')(e.target.value as ViewType | '')}
            aria-invalid={errors.viewTag ? 'true' : undefined}
            aria-describedby={errors.viewTag ? 'viewTag-error' : undefined}
          >
            <option value="">Select view…</option>
            <option value="pawn">Pawn</option>
            <option value="cannabis">Cannabis</option>
            <option value="fireworks">Fireworks</option>
          </select>
          {errors.viewTag && (
            <span id="viewTag-error" className="input-error" role="alert">{errors.viewTag}</span>
          )}
        </div>

        {/* ── AI Auto-fill Toggle ── */}
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
            id="ai-toggle"
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
              htmlFor="ai-toggle"
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

        {errors.images && (
          <span className="input-error" role="alert" style={{ marginBottom: 'var(--space-4)', display: 'block' }}>{errors.images}</span>
        )}

        <ImageUploadZone 
          itemId={itemId} 
          onRequireItemId={ensureItemCreated}
          onProcessingChange={setIsAiProcessing}
          images={images} 
          extractData={aiEnabled && images.length === 0}
          viewTag={formState.viewTag || undefined} 
        />
      </section>

      {/* ── Basic Information ── */}
      <section className="intake-section" style={{ position: 'relative' }}>
        <h2 className="intake-section-heading">Basic Information</h2>

        {isAiProcessing && aiEnabled && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--color-bg-subtle)',
            opacity: 0.6,
            zIndex: 10,
            borderRadius: 'var(--radius-md)',
          }} />
        )}

        <Input
          id="title"
          label="Title"
          value={formState.title}
          onChange={set('title')}
          placeholder="e.g. Seiko 5 Automatic"
          error={errors.title}
        />

        <Input
          id="category"
          label="Category"
          value={formState.category}
          onChange={set('category')}
          placeholder="e.g. Watches"
          error={errors.category}
        />

        <div className="input-wrapper">
          <label className="input-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="input-field intake-textarea"
            value={formState.description}
            onChange={(e) => set('description')(e.target.value)}
            placeholder="Describe the item in plain language — condition, features, history"
            rows={4}
            aria-invalid={errors.description ? 'true' : undefined}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <span id="description-error" className="input-error" role="alert">{errors.description}</span>
          )}
        </div>
      </section>

      {/* ── Condition & Pricing ── */}
      <section className="intake-section">
        <h2 className="intake-section-heading">Condition & Pricing</h2>

        <ConditionSelector
          value={formState.condition}
          onChange={set('condition')}
          error={errors.condition}
        />

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Avg Regular Price</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-subheading)', color: 'var(--color-text)' }}>
                  ${((marketPricing.avgRegularPriceCents || 0) / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Avg Sale Price</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-subheading)', color: 'var(--color-text)' }}>
                  ${((marketPricing.avgSalePriceCents || 0) / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Avg Open-Box</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-subheading)', color: 'var(--color-text)' }}>
                  ${((marketPricing.avgRefurbPriceCents || 0) / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="intake-row intake-row-2">
          <div className="input-wrapper">
            <label className="input-label" htmlFor="price">Sale Price (CAD $)</label>
            <input
              id="price"
              type="text"
              inputMode="decimal"
              className="input-field"
              value={formState.priceInput}
              onChange={(e) => set('priceInput')(e.target.value)}
              placeholder="e.g. 49.99"
              aria-invalid={errors.price ? 'true' : undefined}
              aria-describedby={errors.price ? 'price-error' : undefined}
            />
            {errors.price && (
              <span id="price-error" className="input-error" role="alert">{errors.price}</span>
            )}
          </div>

          <Input
            id="serialNumber"
            label="Serial Number (optional)"
            value={formState.serialNumber}
            onChange={set('serialNumber')}
            placeholder="e.g. SN123456"
          />
        </div>

        <div className="intake-row intake-row-2">
          <div className="input-wrapper">
            <label className="input-label" htmlFor="costInput">Cost Price (CAD $, optional)</label>
            <input
              id="costInput"
              type="text"
              inputMode="decimal"
              className="input-field"
              value={formState.costInput}
              onChange={(e) => set('costInput')(e.target.value)}
              placeholder="e.g. 25.00"
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="quantityInput">Initial Stock</label>
            <input
              id="quantityInput"
              type="text"
              inputMode="numeric"
              className="input-field"
              value={formState.quantityInput}
              onChange={(e) => set('quantityInput')(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>
      </section>



      {/* ── Merchandising ── */}
      <section className="intake-section">
        <h2 className="intake-section-heading">Merchandising</h2>

        <MerchandisingTagSelector
          value={formState.merchandisingTags}
          onChange={set('merchandisingTags')}
        />

        <div className="input-wrapper">
          <label className="input-label" htmlFor="provenanceNotes">Provenance Notes (optional)</label>
          <textarea
            id="provenanceNotes"
            className="input-field intake-textarea"
            value={formState.provenanceNotes}
            onChange={(e) => set('provenanceNotes')(e.target.value)}
            placeholder="The object's story — where it came from, who owned it, why it matters"
            rows={3}
          />
        </div>

        <div className="intake-toggle-row">
          <input
            type="checkbox"
            id="isSeasonalItem"
            className="intake-toggle"
            checked={formState.isSeasonalItem}
            onChange={(e) => set('isSeasonalItem')(e.target.checked)}
          />
          <label className="intake-toggle-label" htmlFor="isSeasonalItem">
            Seasonal Item
          </label>
        </div>
      </section>

      {/* ── Extracted Profiles ── */}
      <CannabisFields formState={formState} set={set} />
      <FireworksFields formState={formState} set={set} />

      {/* ── Error summary ── */}
      {publishError && (
        <div className="intake-error-summary" role="alert">
          {publishError}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="intake-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={saveDraft}
          disabled={saveMutation.isPending || publishMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving…' : itemId ? 'Save Draft' : 'Start Item'}
        </Button>
        {itemId && (
          <Button
            type="button"
            onClick={publish}
            disabled={publishMutation.isPending || saveMutation.isPending}
          >
            {publishMutation.isPending ? 'Publishing…' : 'Publish Item'}
          </Button>
        )}
      </div>
    </form>
  )
}
