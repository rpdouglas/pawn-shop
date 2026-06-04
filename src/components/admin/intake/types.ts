import type { ConditionGrade, MerchandisingTag, ViewType } from '../../../lib/types'

export interface FormState {
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

  // Fireworks Profile
  explosiveWeight: string
  classificationClass: string
  effectType: string
  shots: string
  duration: string
  noiseLevel: string
}

export interface FormErrors {
  title?: string
  description?: string
  category?: string
  viewTag?: string
  price?: string
  condition?: string
  images?: string
}

export const EMPTY_FORM: FormState = {
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
  explosiveWeight: '',
  classificationClass: '',
  effectType: '',
  shots: '',
  duration: '',
  noiseLevel: '',
}
