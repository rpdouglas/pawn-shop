import { initializeApp } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2'

initializeApp()

setGlobalOptions({
  maxInstances: 10,
  concurrency: 80,
  minInstances: 0,
  enforceAppCheck: false
})

export * from './auth'
export * from './crm'
export * from './ageGate'
export * from './storeHours'
export * from './serialBlacklist'
export * from './purgeExpiredData'
export * from './activity'
export * from './backup'
export * from './loanTickets'
export * from './pawnAgreement'
export * from './pawnRequests'
export * from './pawnIntake'
export * from './reservations'
export * from './preorders'
export * from './campaigns'
export * from './disputes'
export * from './articles'
export * from './faqs'
export * from './scheduling'
export * from './notifications'
export * from './social'
