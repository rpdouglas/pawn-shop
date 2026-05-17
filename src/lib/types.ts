export type ViewType = 'pawn' | 'cannabis' | 'fireworks'
export type ConditionGrade = 'new' | 'like-new' | 'good' | 'fair' | 'poor'
export type ItemStatus = 'active' | 'reserved' | 'sold' | 'archived'
export type MoodCategory = 'relax' | 'focus' | 'social' | 'ceremony'
export type ResellerTier = 'bronze' | 'silver' | 'gold'
export type AlertMethod = 'sms' | 'email' | 'none'

export type StaffRole = 'admin' | 'manager' | 'inventory_staff' | 'marketing_staff' | 'customer'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  role: StaffRole | null
  isMfaEnrolled: boolean
  isStaff: boolean
  isAdmin: boolean
}
