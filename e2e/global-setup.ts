import { execSync } from 'child_process'

async function globalSetup() {
  console.log('Waiting for Vite and Firebase Emulators to be fully ready...')
  // Wait up to 60 seconds for both services to respond
  execSync('npx wait-on http-get://localhost:5173 http-get://127.0.0.1:4000 -t 60000', { stdio: 'inherit' })
  console.log('Test Environment Ready!')
}

export default globalSetup
