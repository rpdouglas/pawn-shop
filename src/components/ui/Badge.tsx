import type { ConditionGrade, ItemStatus } from '../../lib/types'

type BadgeVariant =
  | ItemStatus
  | `condition-${ConditionGrade}`
  | 'tag'

interface BadgeProps {
  variant: BadgeVariant
  label: string
}

export default function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {label}
    </span>
  )
}
