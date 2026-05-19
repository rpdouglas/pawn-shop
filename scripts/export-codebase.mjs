import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const OUTPUT_FILE = path.join(ROOT_DIR, 'codebase-export.txt')

// Directories to completely skip during traversal to save time
const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.firebase',
  'emulator-data',
  '.vitepress/dist',
  '.vitepress/cache',
  'functions/lib',
  'functions/node_modules'
])

// File extensions to include in the export (ignore binaries, images, etc.)
const ALLOWED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.md', '.txt', '.html', '.css',
  '.yml', '.yaml', '.rules'
])

// Specific files to explicitly ignore (e.g., secrets)
const IGNORE_FILES = new Set([
  'package-lock.json',
  '.env',
  '.env.local'
])

function isAllowedFile(filename) {
  if (IGNORE_FILES.has(filename)) return false
  const ext = path.extname(filename).toLowerCase()
  return ext === '' || ALLOWED_EXTENSIONS.has(ext)
}

function processDirectory(dir, stream) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(ROOT_DIR, fullPath)

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        processDirectory(fullPath, stream)
      }
    } else if (entry.isFile() && isAllowedFile(entry.name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8')
        // Wrap content in XML tags for LLM context parsing
        stream.write(`<file path="${relativePath}">\n`)
        stream.write(content)
        stream.write(`\n</file>\n\n`)
      } catch (err) {
        console.error(`Failed to read file ${relativePath}:`, err)
      }
    }
  }
}

function runExport() {
  console.log(`Starting codebase export to ${OUTPUT_FILE}...`)
  
  const stream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' })
  stream.write(`<!-- Codebase Export generated on ${new Date().toISOString()} -->\n\n`)
  
  processDirectory(ROOT_DIR, stream)
  
  stream.end()
  
  stream.on('finish', () => {
    console.log(`Export complete. You can now use ${OUTPUT_FILE} for LLM ingestion.`)
  })
}

runExport()
