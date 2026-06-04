import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const functions = getFunctions(app)

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFunctionsEmulator(functions, 'localhost', 5001)
}

// Always enable debug token in local development so it prints to the console
if (import.meta.env.DEV) {
  Object.assign(self, { FIREBASE_APPCHECK_DEBUG_TOKEN: true })
}

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'dummy_site_key_for_dev'),
  isTokenAutoRefreshEnabled: true
})
