import { initializeApp } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2'

initializeApp()

setGlobalOptions({
  maxInstances: 10,
  concurrency: 80,
  minInstances: 0,
  enforceAppCheck: false
})

export * from './inventory'
export * from './ai'
export * from './merchandising'
export * from './ebay'
export * from './pos'
