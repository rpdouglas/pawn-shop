import type { ItemStatus, ConditionGrade, ViewType } from '../../../lib/types'

interface SelectOption<T extends string> {
  value: T
  label: string
}

export const STATUS_OPTIONS: SelectOption<ItemStatus>[] = [
  { value: 'draft',    label: 'Draft' },
  { value: 'active',   label: 'Active' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold',     label: 'Sold' },
  { value: 'archived', label: 'Archived' },
]

export const CONDITION_OPTIONS: SelectOption<ConditionGrade>[] = [
  { value: 'new',       label: 'New' },
  { value: 'like-new',  label: 'Like New' },
  { value: 'good',      label: 'Good' },
  { value: 'fair',      label: 'Fair' },
  { value: 'poor',      label: 'Poor' },
]

export const VIEW_TAG_OPTIONS: SelectOption<ViewType>[] = [
  { value: 'pawn',      label: 'Pawn' },
  { value: 'cannabis',  label: 'Cannabis' },
  { value: 'fireworks', label: 'Fireworks' },
  { value: 'tobacco',   label: 'Tobacco' },
]
