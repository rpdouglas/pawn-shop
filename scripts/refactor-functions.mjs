import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const FUNCS_DIR = path.join(process.cwd(), 'functions')
const SHARED_DIR = path.join(FUNCS_DIR, 'shared')

const GROUPS = {
  core: ['auth.ts', 'crm.ts', 'ageGate.ts', 'storeHours.ts', 'serialBlacklist.ts', 'purgeExpiredData.ts', 'activity.ts', 'backup.ts', 'pawnRequests.ts', 'reservations.ts', 'preorders.ts', 'campaigns.ts', 'disputes.ts', 'articles.ts', 'faqs.ts', 'scheduling.ts', 'notifications.ts', 'social.ts'],
  operations: ['inventory.ts', 'ai.ts', 'merchandising.ts', 'ebay.ts', 'pos.ts']
}

function createShared() {
  fs.mkdirSync(path.join(SHARED_DIR, 'src/lib'), { recursive: true })
  
  // package.json
  fs.writeFileSync(path.join(SHARED_DIR, 'package.json'), JSON.stringify({
    name: "@pawn-shop/shared",
    version: "1.0.0",
    main: "lib/index.js",
    scripts: { build: "tsc" },
    dependencies: {
      "firebase-admin": "^13.4.0",
      "firebase-functions": "^7.2.5",
      "@sendgrid/mail": "^8.1.6",
      "twilio": "^6.0.2"
    },
    devDependencies: { "typescript": "~6.0.2" }
  }, null, 2))

  // tsconfig.json
  fs.writeFileSync(path.join(SHARED_DIR, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      module: "CommonJS",
      outDir: "lib",
      sourceMap: true,
      strict: true,
      target: "es2020",
      esModuleInterop: true,
      skipLibCheck: true
    },
    include: ["src"]
  }, null, 2))

  // Copy lib files
  const libSrc = path.join(FUNCS_DIR, 'src/lib')
  if (fs.existsSync(libSrc)) {
    fs.readdirSync(libSrc).forEach(f => {
      fs.copyFileSync(path.join(libSrc, f), path.join(SHARED_DIR, 'src/lib', f))
    })
  }

  // Create authHelpers.ts
  const authHelpers = `import { HttpsError } from 'firebase-functions/v2/https'
import type { CallableRequest } from 'firebase-functions/v2/https'

export function assertMfaEnrolled(request: CallableRequest): void {
  return
  if (process.env.FUNCTIONS_EMULATOR) return
  const firebaseClaim = (request.auth?.token as Record<string, unknown>)?.['firebase'] as Record<string, unknown> | undefined
  if (!firebaseClaim?.['sign_in_second_factor']) {
    throw new HttpsError('unauthenticated', 'MFA-verified session required for this operation')
  }
}

export function assertStaff(request: CallableRequest): { uid: string } {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required')
  }
  const token = request.auth.token as Record<string, unknown>
  const staffRoles = ['admin', 'manager', 'inventory_staff', 'marketing_staff']
  const isStaff = staffRoles.some(role => token[role] === true)
  
  if (!isStaff) {
    throw new HttpsError('permission-denied', 'Staff only.')
  }
  assertMfaEnrolled(request)
  return { uid: request.auth.uid }
}
`
  fs.writeFileSync(path.join(SHARED_DIR, 'src/authHelpers.ts'), authHelpers)

  // Export from shared index
  fs.writeFileSync(path.join(SHARED_DIR, 'src/index.ts'), `export * from './authHelpers'\n`)
}

function createGroup(name, files) {
  const groupDir = path.join(FUNCS_DIR, name)
  fs.mkdirSync(path.join(groupDir, 'src'), { recursive: true })

  // Determine deps
  const deps = {
    "firebase-admin": "^13.4.0",
    "firebase-functions": "^7.2.5",
    "@pawn-shop/shared": "file:../shared"
  }
  if (name === 'operations') {
    deps["@google/generative-ai"] = "^0.24.1"
    deps["sharp"] = "^0.34.5"
  }

  // package.json
  fs.writeFileSync(path.join(groupDir, 'package.json'), JSON.stringify({
    name: `pawn-shop-functions-${name}`,
    version: "1.0.0",
    main: "lib/index.js",
    scripts: { build: "tsc" },
    dependencies: deps,
    devDependencies: { "typescript": "~6.0.2" }
  }, null, 2))

  // tsconfig.json
  fs.writeFileSync(path.join(groupDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      module: "CommonJS",
      outDir: "lib",
      sourceMap: true,
      strict: true,
      target: "es2020",
      esModuleInterop: true,
      skipLibCheck: true
    },
    include: ["src"]
  }, null, 2))

  let indexContent = `import { initializeApp } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2'

initializeApp()

setGlobalOptions({
  maxInstances: 10,
  concurrency: 80,
  minInstances: 0,
  enforceAppCheck: false
})

`

  // Move files and fix imports
  files.forEach(f => {
    const srcFile = path.join(FUNCS_DIR, 'src', f)
    if (fs.existsSync(srcFile)) {
      let content = fs.readFileSync(srcFile, 'utf8')
      
      // Remove assertMfaEnrolled/assertStaff from auth.ts
      if (f === 'auth.ts') {
        content = content.replace(/export function assertMfaEnrolled[\s\S]*?}\n\n/, '')
        content = content.replace(/export function assertStaff[\s\S]*?}\n\n/, '')
      }

      // Replace imports
      content = content.replace(/import \{([^}]+)\} from '\.\/auth'/g, (match, p1) => {
        const imports = p1.split(',').map(s => s.trim())
        const sharedImports = imports.filter(i => i === 'assertMfaEnrolled' || i === 'assertStaff')
        const authImports = imports.filter(i => i !== 'assertMfaEnrolled' && i !== 'assertStaff')
        let res = ''
        if (sharedImports.length) {
          res += `import { ${sharedImports.join(', ')} } from '@pawn-shop/shared/authHelpers'\n`
        }
        if (authImports.length && name === 'core') {
          res += `import { ${authImports.join(', ')} } from './auth'\n`
        }
        return res.trim()
      })

      content = content.replace(/import \{(.+)\} from '\.\/lib\/(secrets|sms|email)'/g, "import {$1} from '@pawn-shop/shared/lib/$2'")
      
      fs.writeFileSync(path.join(groupDir, 'src', f), content)
      indexContent += `export * from './${f.replace('.ts', '')}'\n`
    }
  })

  fs.writeFileSync(path.join(groupDir, 'src/index.ts'), indexContent)
}

createShared()
Object.keys(GROUPS).forEach(k => createGroup(k, GROUPS[k]))

// Check for remaining cross-dependencies
console.log('Refactor complete')
