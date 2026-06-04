import { initializeApp } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2'

initializeApp()

setGlobalOptions({
  maxInstances: 10,
  concurrency: 80,
  minInstances: 0,
  enforceAppCheck: false, // Drops all traffic without valid attestation
})

export * from './auth'
export * from './inventory'
export * from './ageGate'
export * from './ebay'
export * from './pawnRequests'
export * from './reservations'
export * from './storeHours'
export * from './serialBlacklist'
export * from './purgeExpiredData'
export * from './merchandising'
export * from './scheduling'
export * from './activity'
export * from './campaigns'
export * from './preorders'
export * from './crm'
export * from './disputes'
export * from './ai'
export * from './articles'
export * from './faqs'
export * from './notifications'
export * from './pos'
export * from './backup'
export * from './social'
