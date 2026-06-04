import fft from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import { afterAll } from 'vitest'

// Set emulator environment variables so admin SDK routes correctly
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'

// Initialize the firebase-functions-test environment
export const testEnv = fft({
  projectId: 'the-addicts-agenda',
})

// Initialize admin app if not already
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'the-addicts-agenda'
  })
}

// Optionally, clean up after all tests
afterAll(() => {
  testEnv.cleanup()
})
