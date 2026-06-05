export type ViewType = 'pawn' | 'cannabis' | 'fireworks' | 'tobacco'
export type PosSyncStatus = 'not_synced' | 'synced' | 'pending' | 'error'
export type ReservationStatus = 'pending' | 'confirmed' | 'declined' | 'completed'
export type PawnRequestStatus = 'pending' | 'reviewed' | 'quoted' | 'declined' | 'completed'
export type ConditionGrade = 'new' | 'like-new' | 'good' | 'fair' | 'poor'
export type ItemStatus = 'draft' | 'active' | 'reserved' | 'sold' | 'archived' | 'deleted'
export type MerchandisingTag = 'just-arrived' | 'rare-find' | 'limited-edition' | 'staff-pick'
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
  // CRM & Retention fields (E15)
  purchaseHistory?: string[]
  inquiryHistory?: string[]
  lifetimeValue?: number
  segments?: string[]
  vipFlag?: boolean
  resellerTier?: ResellerTier
  alertMethod?: AlertMethod
  alertOptIn?: boolean
  crossViewFlag?: boolean
  phoneNumber?: string
  consentAcceptedAt?: Date | null
  consentVersion?: string | null
  createdAt?: Date
}

export interface StaffMember {
  uid: string
  email: string
  displayName: string
  role: StaffRole
  mfaEnrolled: boolean
  phoneNumber?: string
  lastLoginAt?: Date
  createdAt: Date
}

export interface DailySchedulePreference {
  start: string // HH:MM
  end: string   // HH:MM
}

export interface SchedulePreferences {
  monday?: DailySchedulePreference
  tuesday?: DailySchedulePreference
  wednesday?: DailySchedulePreference
  thursday?: DailySchedulePreference
  friday?: DailySchedulePreference
  saturday?: DailySchedulePreference
  sunday?: DailySchedulePreference
  maxHoursPerWeek?: number
}

export interface HRProfile {
  legalName?: string
  sinNumber?: string
  statusCardNumber?: string
  bankingDetails?: {
    institution: string
    transit: string
    account: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  schedulePreferences?: SchedulePreferences
  startDate?: Date
  rateOfPay?: number
  updatedAt?: Date
}

export interface StaffDocument {
  id: string
  title: string
  content: string
  type: 'sop' | 'contract'
  version: string
  isRequired: boolean
  createdBy: string
  updatedAt: Date
  createdAt: Date
}

export interface DocumentSignature {
  id: string
  documentId: string
  version: string
  ipAddress?: string
  signedAt: Date
}

export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'tiktok'
export type SocialPostStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'failed'

export interface SocialPost {
  id: string
  content: string
  mediaUrls: string[]
  platforms: SocialPlatform[]
  status: SocialPostStatus
  authorUid: string
  reviewerUid?: string
  scheduledFor?: Date
  publishedAt?: Date
  apiResponseId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Shift {
  id: string
  staffUid: string
  startTime: Date
  endTime: Date
  viewTag: ViewType | 'all'
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Reservation {
  id: string
  uid: string
  itemId: string
  status: ReservationStatus
  pickupWindow: string         // "YYYY-MM-DD HH:MM–HH:MM"
  customerName: string
  customerPhone: string
  viewTag: ViewType
  smsDeliveredAt: Date | null
  staffNotes?: string
  createdAt: Date
}

export interface StoreHoursDay {
  open: string    // HH:MM 24h
  close: string   // HH:MM 24h
  closed: boolean
}

export interface StoreHours {
  monday:    StoreHoursDay
  tuesday:   StoreHoursDay
  wednesday: StoreHoursDay
  thursday:  StoreHoursDay
  friday:    StoreHoursDay
  saturday:  StoreHoursDay
  sunday:    StoreHoursDay
  updatedBy?: string
  updatedAt?: Date
}

export interface PawnRequest {
  id: string
  uid: string | null
  name: string
  email: string
  phone?: string
  itemDescription: string
  serialNumber?: string
  images: string[]
  status: PawnRequestStatus
  staffNotes?: string
  serialBlacklistHit: boolean
  createdAt: Date
}

export interface CannabisProfile {
  thcMin?: number
  thcMax?: number
  cbdMin?: number
  cbdMax?: number
  terpenes?: string[]
  geneticLineage?: string
  effectProfile?: string[]
  brand?: string
  format?: string
  weight?: string
  lotNumber?: string
  packagedDate?: Date
  // E56 Fields
  subCategory?: string
  servings?: number
  weightPerServing?: string
  strainType?: 'sativa' | 'indica' | 'hybrid' | 'blend' | 'high-cbd' | ''
  cannabinoidUnit?: '%' | 'mg' | ''
}

export interface FireworksProfile {
  explosiveWeight?: string
  classificationClass?: string
  effectType?: string
  shots?: number
  duration?: number
  noiseLevel?: 'low' | 'medium' | 'high' | ''
}

// Firestore Timestamps are converted to Date before being assigned here
export interface Item {
  id: string
  title: string
  description: string
  category: string
  viewTag: ViewType
  viewTags?: ViewType[]
  status: ItemStatus
  price: number          // CAD cents (integer)
  condition: ConditionGrade
  images: string[]       // Firebase Storage URLs, watermarked WebP
  videoUrl?: string
  searchTokens: string[] // Prefix tokens — generated by publishItem Cloud Function
  serialNumber?: string
  serialBlacklistFlag?: boolean
  policeHold?: boolean
  holdExpiresAt?: Date
  locationId?: string
  isSeasonalItem?: boolean
  bundleIds?: string[]
  merchandisingTags?: MerchandisingTag[]
  provenanceNotes?: string
  trendingScore?: number
  viewCount?: number
  enquiryCount?: number
  staffPickNote?: string
  ebayListingId?: string
  soldAt?: Date
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
  publishedBy?: string
  quantity?: number        // Stock count. 0 = out of stock. Staff-set. Customer-visible.
  posId?: string           // Brother POS external identifier
  posSyncStatus?: PosSyncStatus
  posLastSyncAt?: Date
  cannabisProfile?: CannabisProfile
  fireworksProfile?: FireworksProfile
}

// items/{id}/internal/staff — staff-only subcollection document
export interface StaffInternalDoc {
  cost?: number  // Purchase cost in CAD cents
}

// Payload for adjustInventory callable CF
export interface AdjustInventoryPayload {
  itemId: string
  delta: number      // Signed integer: positive = add stock, negative = remove
  reason?: string
}

export interface ShopInfo {
  foundedYear: number
  ownerName?: string
  phoneNumber?: string
  updatedBy?: string
  updatedAt?: Date
}

export interface UserProfile {
  consentAcceptedAt: Date | null
  consentVersion: string | null
}

export interface ActivityFeedEntry {
  id: string
  viewTag: ViewType
  action: 'browsing'
  displayCity: string
  createdAt: Date
}

export type CampaignViewTag = ViewType | 'all'
export type PreorderStatus = 'pending' | 'confirmed' | 'ready' | 'collected' | 'cancelled'
export type DisputeStatus = 'open' | 'investigating' | 'resolved'
export type DisputeType = 'return' | 'dispute'
export type RefundMethod = 'cash' | 'etransfer' | 'store-credit'

export interface DiscountRule {
  type: 'percent' | 'fixed'
  value: number  // percent: 0–100, fixed: CAD cents
}

export interface Campaign {
  id: string
  title: string
  viewTag: CampaignViewTag
  startDate: Date
  endDate: Date
  active: boolean
  discountRule: DiscountRule
  bannerCopy: string
  countdownEnabled: boolean
  createdBy?: string
  reminderSentAt?: Date | null
  updatedAt?: Date
  createdAt: Date
}

export interface Preorder {
  id: string
  uid: string
  itemId: string
  status: PreorderStatus
  quantity: number
  customerName: string
  customerPhone: string
  viewTag: ViewType
  pickupWindow?: string
  smsDeliveredAt?: Date | null
  campaignId?: string
  staffNotes?: string
  createdAt: Date
}

export interface Dispute {
  id: string
  uid: string
  itemId: string
  type: DisputeType
  status: DisputeStatus
  description: string
  refundAmount?: number // CAD cents
  refundMethod?: RefundMethod
  staffNotes?: string
  ebayDisputeId?: string
  createdAt: Date
  resolvedAt?: Date | null
}

export type ArticleStatus = 'draft' | 'published' | 'archived'

export interface Article {
  id: string
  title: string
  slug: string
  body: string
  viewTag: ViewType | 'all'
  status: ArticleStatus
  seoMeta: {
    title: string
    description: string
  }
  publishedAt?: Date | null
  authorUid: string
  indigenousLanguageReviewed: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface Faq {
  id: string
  question: string
  answer: string
  category: 'pawn' | 'cannabis' | 'fireworks' | 'general'
  order: number
  updatedAt: Date
  createdAt: Date
}

export type LoanTicketStatus = 'active' | 'extension_requested' | 'forfeited' | 'redeemed'

export interface LoanTicket {
  id: string
  uid: string
  pawnRequestId: string
  itemDescription: string
  loanAmount: number
  interestRate: number
  periodDays: number
  dueDate: Date
  status: LoanTicketStatus
  extensionCount: number
  staffNotes?: string
  createdAt: Date
  updatedAt: Date
}
