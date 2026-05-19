// firebase-core must initialize the Firebase app before this module loads.
// All getX(app) calls return cached singletons — no double-initialization risk.
import { getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'
import { getRemoteConfig } from 'firebase/remote-config'

const app = getApp()
export const auth      = getAuth(app)
export const functions = getFunctions(app)
export const db        = getFirestore(app)
export const storage   = getStorage(app)

export const analytics = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  ? getAnalytics(app)
  : null

export const remoteConfig = getRemoteConfig(app)
remoteConfig.settings.minimumFetchIntervalMillis = import.meta.env.DEV ? 0 : 60_000
remoteConfig.defaultConfig = {
  show_staff_picks:    true,
  show_related_items:  true,
  pawn_form_enabled:   true,
}

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
