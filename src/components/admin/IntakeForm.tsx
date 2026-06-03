import { useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import type { ConditionGrade, MerchandisingTag, ViewType } from '../../lib/types'
import ConditionSelector from './ConditionSelector'
import MerchandisingTagSelector from './MerchandisingTagSelector'
import ImageUploadZone from './ImageUploadZone'
import QRLabel from './QRLabel'
import EbayPushButton from './EbayPushButton'
import Button from '../ui/Button'
import Input from '../ui/Input'

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

interface FormState {
  title: string
  description: string
  category: string
  viewTag: ViewType | ''
  priceInput: string
  condition: ConditionGrade | ''
  serialNumber: string
  provenanceNotes: string
  isSeasonalItem: boolean
  merchandisingTags: MerchandisingTag[]
  costInput: string      // Purchase cost — optional, staff-only, writes to internal/staff subcollection
  quantityInput: string  // Initial stock count — defaults to 1

  // Cannabis Profile
  thcMin: string
  thcMax: string
  cbdMin: string
  cbdMax: string
  terpenes: string
  geneticLineage: string
  effectProfile: string
  brand: string
  format: string
  weight: string
  lotNumber: string
  packagedDate: string
  subCategory: string
  servings: string
  weightPerServing: string
  strainType: string
  cannabinoidUnit: string
}

interface FormErrors {
  title?: string
  description?: string
  category?: string
  viewTag?: string
  price?: string
  condition?: string
  images?: string
}

type Phase = 'creating' | 'editing' | 'published'

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  category: '',
  viewTag: '',
  priceInput: '',
  condition: '',
  serialNumber: '',
  provenanceNotes: '',
  isSeasonalItem: false,
  merchandisingTags: [],
  costInput: '',
  quantityInput: '1',
  thcMin: '',
  thcMax: '',
  cbdMin: '',
  cbdMax: '',
  terpenes: '',
  geneticLineage: '',
  effectProfile: '',
  brand: '',
  format: '',
  weight: '',
  lotNumber: '',
  packagedDate: '',
  subCategory: '',
  servings: '',
  weightPerServing: '',
  strainType: '',
  cannabinoidUnit: '%',
}

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
  if (!form.title.trim())    errors.title    = 'Title is required'
  if (!form.category.trim()) errors.category = 'Category is required'
  if (!form.viewTag)         errors.viewTag  = 'View is required'
  return errors
}

function validateForPublish(form: FormState, images: string[]): FormErrors {
  const errors = validateForSave(form)
  if (!form.description.trim()) errors.description = 'Description is required'
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
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [publishError, setPublishError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

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
    const unsubscribe = onSnapshot(doc(db, 'items', itemId, 'internal', 'ai'), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      if (data.intakeExtraction && data.intakeExtraction.suggestedFields) {
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

    return payload
  }

  const writeCostIfProvided = async (itemId: string) => {
    const costCents = parsePriceCents(formState.costInput)
    if (formState.costInput.trim() && !isNaN(costCents) && costCents > 0) {
      await setDoc(doc(db, 'items', itemId, 'internal', 'staff'), { cost: costCents }, { merge: true })
    }
  }

  const saveDraft = async () => {
    const errs = validateForSave(formState)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setPublishError('')
    setIsSaving(true)

    try {
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
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Save failed. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const publish = async () => {
    if (!itemId) return
    const errs = validateForPublish(formState, images)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setPublishError('')
    setIsPublishing(true)

    try {
      await updateDoc(doc(db, 'items', itemId), buildUpdatePayload())
      await writeCostIfProvided(itemId)
      await publishItemFn({ itemId })
      setPhase('published')
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Publish failed. Please try again.')
    } finally {
      setIsPublishing(false)
    }
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

      {/* ── Basic Information ── */}
      <section className="intake-section">
        <h2 className="intake-section-heading">Basic Information</h2>

        <Input
          id="title"
          label="Title"
          value={formState.title}
          onChange={set('title')}
          placeholder="e.g. Seiko 5 Automatic"
          error={errors.title}
        />

        <div className="intake-row intake-row-2">
          <div className="input-wrapper">
            <label className="input-label" htmlFor="viewTag">View</label>
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

          <Input
            id="category"
            label="Category"
            value={formState.category}
            onChange={set('category')}
            placeholder="e.g. Watches"
            error={errors.category}
          />
        </div>

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

      {/* ── Photos ── */}
      <section className="intake-section">
        <h2 className="intake-section-heading">Photos</h2>
        {errors.images && (
          <span className="input-error" role="alert">{errors.images}</span>
        )}
        {itemId
          ? <ImageUploadZone itemId={itemId} images={images} extractData={images.length === 0} viewTag={formState.viewTag} />
          : <p className="intake-upload-locked">Save the item first to enable photo upload.</p>
        }
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

      {/* ── Cannabis Profile ── */}
      {formState.viewTag === 'cannabis' && (
        <section className="intake-section">
          <h2 className="intake-section-heading">Cannabis Profile</h2>
          
          <div className="intake-row intake-row-2">
            <Input
              id="brand"
              label="Brand/Producer"
              value={formState.brand}
              onChange={set('brand')}
              placeholder="e.g. Broken Coast"
            />
            <div className="input-wrapper">
              <label className="input-label" htmlFor="strainType">Strain Type</label>
              <select
                id="strainType"
                className="input-field"
                value={formState.strainType}
                onChange={(e) => set('strainType')(e.target.value)}
              >
                <option value="">Select Strain</option>
                <option value="sativa">Sativa</option>
                <option value="indica">Indica</option>
                <option value="hybrid">Hybrid</option>
                <option value="blend">Blend</option>
                <option value="high-cbd">High CBD</option>
              </select>
            </div>
          </div>

          <div className="intake-row intake-row-2">
            <Input
              id="geneticLineage"
              label="Genetic Lineage"
              value={formState.geneticLineage}
              onChange={set('geneticLineage')}
              placeholder="e.g. Sativa - Sour Diesel"
            />
          </div>

          <div className="intake-row">
            <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Potency Unit:</label>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text)' }}>
                  <input type="radio" name="cannabinoidUnit" value="%" checked={formState.cannabinoidUnit === '%'} onChange={(e) => set('cannabinoidUnit')(e.target.value)} />
                  % (Flower / Vapes)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text)' }}>
                  <input type="radio" name="cannabinoidUnit" value="mg" checked={formState.cannabinoidUnit === 'mg'} onChange={(e) => set('cannabinoidUnit')(e.target.value)} />
                  mg (Edibles / Oils)
                </label>
              </div>
            </div>
          </div>

          <div className="intake-row intake-row-4">
            <Input
              id="thcMin"
              label="THC Min %"
              value={formState.thcMin}
              onChange={set('thcMin')}
              placeholder="e.g. 20"
            />
            <Input
              id="thcMax"
              label="THC Max %"
              value={formState.thcMax}
              onChange={set('thcMax')}
              placeholder="e.g. 25"
            />
            <Input
              id="cbdMin"
              label="CBD Min %"
              value={formState.cbdMin}
              onChange={set('cbdMin')}
              placeholder="e.g. 0"
            />
            <Input
              id="cbdMax"
              label="CBD Max %"
              value={formState.cbdMax}
              onChange={set('cbdMax')}
              placeholder="e.g. 1"
            />
          </div>

          <div className="intake-row intake-row-2">
            <Input
              id="terpenes"
              label="Terpenes (comma separated)"
              value={formState.terpenes}
              onChange={set('terpenes')}
              placeholder="e.g. Myrcene, Limonene, Caryophyllene"
            />
            <Input
              id="effectProfile"
              label="Effects (comma separated)"
              value={formState.effectProfile}
              onChange={set('effectProfile')}
              placeholder="e.g. Relax, Sleep"
            />
          </div>

          <div className="intake-row intake-row-2">
            <Input
              id="format"
              label="Format"
              value={formState.format}
              onChange={set('format')}
              placeholder="e.g. Pre-Roll, Dried Flower, Vape"
            />
            <Input
              id="subCategory"
              label="Sub Category"
              value={formState.subCategory}
              onChange={set('subCategory')}
              placeholder="e.g. Infused, 510 Thread"
            />
          </div>

          <div className="intake-row intake-row-3">
            <Input
              id="weight"
              label="Total Weight / Size"
              value={formState.weight}
              onChange={set('weight')}
              placeholder="e.g. 3.5g, 10-pack"
            />
            <Input
              id="servings"
              label="Servings (Count)"
              type="number"
              value={formState.servings}
              onChange={set('servings')}
              placeholder="e.g. 10"
            />
            <Input
              id="weightPerServing"
              label="Weight Per Serving"
              value={formState.weightPerServing}
              onChange={set('weightPerServing')}
              placeholder="e.g. 0.5g"
            />
          </div>

          <div className="intake-row intake-row-2">
            <Input
              id="lotNumber"
              label="Lot Number"
              value={formState.lotNumber}
              onChange={set('lotNumber')}
              placeholder="e.g. LOT12345"
            />
            <Input
              id="packagedDate"
              label="Packaged Date (YYYY-MM-DD)"
              value={formState.packagedDate}
              onChange={set('packagedDate')}
              placeholder="2026-05-01"
            />
          </div>
        </section>
      )}

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
          disabled={isSaving || isPublishing}
        >
          {isSaving ? 'Saving…' : itemId ? 'Save Draft' : 'Start Item'}
        </Button>
        {itemId && (
          <Button
            type="button"
            onClick={publish}
            disabled={isPublishing || isSaving}
          >
            {isPublishing ? 'Publishing…' : 'Publish Item'}
          </Button>
        )}
      </div>
    </form>
  )
}
