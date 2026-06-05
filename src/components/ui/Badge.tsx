import type { ConditionGrade, ItemStatus, DisputeStatus, DisputeType, LoanTicketStatus } from '../../lib/types'

type BadgeVariant =
  | ItemStatus
  | `condition-${ConditionGrade}`
  | DisputeStatus
  | DisputeType
  | LoanTicketStatus
  | 'tag'
  | 'error'

interface BadgeProps {
  variant: BadgeVariant
  label?: string
  children?: React.ReactNode
}

export default function Badge({ variant, label, children }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {children || label}
    </span>
  )
}
