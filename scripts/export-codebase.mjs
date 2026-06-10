import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const OUTPUT_FILE = path.join(ROOT_DIR, 'codebase-export.txt')

// Opt-in strategy: Only process these specific paths
const TARGETS = [
  'src',
  'functions/core',
  'functions/lib',
  'functions/operations',
  'functions/shared',
  'functions/tests',
  'functions/package.json',
  'functions/tsconfig.json',
  'user-guide',
  'docs/firestore-schema.md',
  'docs/DECISIONS.md',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'eslint.config.js',
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json',
  'storage.rules',
  'index.html'
]

// Directories to skip when traversing allowed TARGETS
const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  '.vitepress' // Skips .vitepress/dist and .vitepress/cache
])

// Specific files to explicitly ignore
const IGNORE_FILES = new Set([
  'package-lock.json',
  '.env',
  '.env.local',
  'codebase-export.txt' // Prevent infinite recursive inclusion!
])

const ALLOWED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.md', '.html', '.css', '.rules'
])

function isAllowedFile(filename) {
  if (IGNORE_FILES.has(filename)) return false
  const ext = path.extname(filename).toLowerCase()
  return ext === '' || ALLOWED_EXTENSIONS.has(ext)
}

function processPath(targetPath, stream) {
  const fullPath = path.join(ROOT_DIR, targetPath)
  if (!fs.existsSync(fullPath)) return

  const stat = fs.statSync(fullPath)

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(fullPath, { withFileTypes: true })
    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue
      
      const childPath = path.join(targetPath, entry.name)
      processPath(childPath, stream)
    }
  } else if (stat.isFile() && isAllowedFile(path.basename(fullPath))) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8')
      stream.write(`<file path="${targetPath}">\n`)
      stream.write(content)
      stream.write(`\n</file>\n\n`)
    } catch (err) {
      console.error(`Failed to read file ${targetPath}:`, err)
    }
  }
}

function runExport() {
  console.log(`Starting codebase export to ${OUTPUT_FILE}...`)
  
  const stream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' })
  stream.write(`<!-- Codebase Export generated on ${new Date().toISOString()} -->\n\n`)
  
  for (const target of TARGETS) {
    processPath(target, stream)
  }
  
  stream.end()
  
  stream.on('finish', () => {
    console.log(`Export complete. You can now use codebase-export.txt for LLM ingestion.`)
  })
}

runExport()
