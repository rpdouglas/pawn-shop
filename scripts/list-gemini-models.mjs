/**
 * scripts/list-gemini-models.mjs
 *
 * Developer tool: lists all Gemini models available for your API key and annotates
 * each against docs/AI_MODELS.md to identify safe production choices.
 *
 * Setup:
 *   1. Open functions/.env  (already in .gitignore)
 *   2. Add:  GEMINI_API_KEY=your_api_key_here
 *   3. Get a key at: https://aistudio.google.com/app/apikey
 *
 * Usage:  node scripts/list-gemini-models.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function parseEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const result = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const rawVal = trimmed.slice(eqIdx + 1).trim()
      result[key] = rawVal.replace(/^["']|["']$/g, '')
    }
    return result
  } catch {
    return {}
  }
}

// Annotations sourced from docs/AI_MODELS.md — update both when models change
const KNOWN_MODELS = {
  // Stable GA: safe for production Cloud Functions
  'gemini-2.5-pro':         { status: '[GA]   Stable GA',   note: 'primary (Pro) in ai.ts'      },
  'gemini-2.5-flash':       { status: '[GA]   Stable GA',   note: ''                             },
  'gemini-2.5-flash-lite':  { status: '[GA]   Stable GA',   note: ''                             },
  'gemini-3.5-flash':       { status: '[GA]   Stable GA',   note: 'flashModel in ai.ts'          },
  'gemini-3.1-flash-lite':  { status: '[GA]   Stable GA',   note: 'liteModel in ai.ts'           },
  // Preview: do NOT deploy to production
  'gemini-3.1-pro-preview':         { status: '[PREV] Preview',  note: 'do NOT deploy'              },
  'gemini-3.1-pro-preview-customtools': { status: '[PREV] Preview', note: 'do NOT deploy'           },
  'gemini-3.1-flash-lite-preview':  { status: '[PREV] Preview',  note: 'do NOT deploy'              },
  'gemini-3-pro-preview':           { status: '[PREV] Preview',  note: 'do NOT deploy'              },
  'gemini-3-flash-preview':         { status: '[PREV] Preview',  note: 'do NOT deploy'              },
  'gemini-3.5-pro':                 { status: '[PREV] Preview',  note: 'not yet in API'             },
  // Alias pointers — silently change underlying model; do NOT use in production
  'gemini-flash-latest':            { status: '[ALIAS] Alias',   note: 'silently changes — avoid'   },
  'gemini-flash-lite-latest':       { status: '[ALIAS] Alias',   note: 'silently changes — avoid'   },
  'gemini-pro-latest':              { status: '[ALIAS] Alias',   note: 'silently changes — avoid'   },
  // Deprecated / Banned
  'gemini-2.0-flash':       { status: '[DEPR] Deprecated',  note: 'shut down June 2026'          },
  'gemini-2.0-flash-001':   { status: '[DEPR] Deprecated',  note: 'shut down June 2026'          },
  'gemini-2.0-flash-lite':  { status: '[DEPR] Deprecated',  note: 'shut down June 2026'          },
  'gemini-2.0-flash-lite-001': { status: '[DEPR] Deprecated', note: 'shut down June 2026'        },
  'gemini-1.5-flash-8b':    { status: '[DEPR] Deprecated',  note: 'shut down Sep 2025'           },
  'gemini-3.1-pro':         { status: '[BAN]  BANNED',       note: 'never existed — prod 500s'   },
}

// Load key from functions/.env first, then fall back to environment variable
const envVars = parseEnvFile(join(ROOT, 'functions', '.env'))
const apiKey = envVars['GEMINI_API_KEY'] || process.env['GEMINI_API_KEY']

if (!apiKey) {
  console.log('\n  GEMINI_API_KEY not found.\n')
  console.log('  Setup:')
  console.log('    1. Open  functions/.env  (already in .gitignore)')
  console.log('    2. Add:  GEMINI_API_KEY=your_api_key_here')
  console.log('    3. Get a key at: https://aistudio.google.com/app/apikey')
  console.log('    4. Re-run: node scripts/list-gemini-models.mjs\n')
  process.exit(1)
}

console.log('\n  Querying Gemini model list...\n')

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`
let data

try {
  const res = await fetch(url)
  if (res.status === 401 || res.status === 403) {
    console.error(`  Key rejected (HTTP ${res.status}). Verify GEMINI_API_KEY is valid and has Gemini API access.\n`)
    process.exit(1)
  }
  if (!res.ok) {
    const body = await res.text()
    console.error(`  API error (HTTP ${res.status}):\n${body}\n`)
    process.exit(1)
  }
  data = await res.json()
} catch (err) {
  console.error('  Request failed:', err.message, '\n')
  process.exit(1)
}

// Only show models that support text generation (the ones we actually care about)
const models = (data.models ?? []).filter(m =>
  (m.supportedGenerationMethods ?? []).includes('generateContent')
)

if (models.length === 0) {
  console.log('  No generateContent-capable models returned. The key may have restricted access.\n')
  process.exit(0)
}

console.log(`  Key valid. ${models.length} model(s) support generateContent.\n`)

// Build display rows
const rows = models.map(m => {
  const id = (m.name ?? '').replace('models/', '')
  const known = KNOWN_MODELS[id]
  const status = known ? known.status : '[NEW]  Unknown'
  const note   = known ? known.note   : 'not in docs/AI_MODELS.md'
  const inTok  = typeof m.inputTokenLimit  === 'number' ? m.inputTokenLimit.toLocaleString()  : '—'
  const outTok = typeof m.outputTokenLimit === 'number' ? m.outputTokenLimit.toLocaleString() : '—'
  return { id, status, note, inTok, outTok }
})

// Build and print aligned table
const COLS = [
  { header: 'Model ID',             get: r => r.id     },
  { header: 'Status (AI_MODELS.md)', get: r => r.status },
  { header: 'Note',                 get: r => r.note   },
  { header: 'Max Input Tokens',     get: r => r.inTok  },
  { header: 'Max Output Tokens',    get: r => r.outTok },
]

const widths = COLS.map(col => {
  let w = col.header.length
  for (const row of rows) w = Math.max(w, col.get(row).length)
  return w
})

const sep    = widths.map(w => '-'.repeat(w + 2)).join('+')
const header = COLS.map((col, i) => ` ${col.header.padEnd(widths[i])} `).join('|')

console.log(sep)
console.log(header)
console.log(sep)
for (const row of rows) {
  console.log(COLS.map((col, i) => ` ${col.get(row).padEnd(widths[i])} `).join('|'))
}
console.log(sep)

// Status summary
const counts = { ga: 0, preview: 0, deprecated: 0, banned: 0, unknown: 0 }
for (const r of rows) {
  if (r.status.startsWith('[GA]'))   counts.ga++
  else if (r.status.startsWith('[PREV]')) counts.preview++
  else if (r.status.startsWith('[DEPR]')) counts.deprecated++
  else if (r.status.startsWith('[BAN]'))  counts.banned++
  else counts.unknown++
}

console.log(
  `\n  Stable GA: ${counts.ga}  |  Preview: ${counts.preview}  |` +
  `  Deprecated: ${counts.deprecated}  |  Banned: ${counts.banned}  |  Unknown: ${counts.unknown}\n`
)

// Flag new models not yet in the doc
const newModels = rows.filter(r => r.status.startsWith('[NEW]'))
if (newModels.length > 0) {
  console.log('  New models not yet in docs/AI_MODELS.md:')
  for (const r of newModels) console.log(`    + ${r.id}`)
  console.log('\n  -> Evaluate each and add to the appropriate table in docs/AI_MODELS.md.\n')
} else {
  console.log('  All returned models are documented in docs/AI_MODELS.md.\n')
}

// ─── In-Code Model Audit ──────────────────────────────────────────────────────

console.log('─'.repeat(60))
console.log('  In-Code Model Audit')
console.log('  Scanning functions/**/*.ts for Gemini model ID strings...\n')

function walkTs(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (entry === 'node_modules' || entry === 'lib') continue
    if (statSync(full).isDirectory()) walkTs(full, files)
    else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) files.push(full)
  }
  return files
}

const MODEL_RE = /['"`](gemini-[a-z0-9._-]+)['"`]/g

// { modelId -> [{ file, line }] }
const usages = {}
for (const file of walkTs(join(ROOT, 'functions'))) {
  const lines = readFileSync(file, 'utf8').split('\n')
  for (let i = 0; i < lines.length; i++) {
    for (const match of lines[i].matchAll(MODEL_RE)) {
      const id = match[1]
      if (!usages[id]) usages[id] = []
      usages[id].push({ file: relative(ROOT, file), line: i + 1 })
    }
  }
}

if (Object.keys(usages).length === 0) {
  console.log('  No Gemini model ID strings found in functions source.\n')
} else {
  const auditCols = [
    { header: 'Model ID in Code',       get: r => r.id     },
    { header: 'Status (AI_MODELS.md)',  get: r => r.status },
    { header: 'File:Line',              get: r => r.loc    },
  ]

  // Flatten usages into rows grouped by model (first ref per model in table, rest as continuation rows)
  const auditRows = []
  for (const [id, refs] of Object.entries(usages)) {
    const known = KNOWN_MODELS[id]
    const status = known ? known.status : '[NEW]  Unknown'
    for (let i = 0; i < refs.length; i++) {
      auditRows.push({
        id:     i === 0 ? id : '',
        status: i === 0 ? status : '',
        loc:    `${refs[i].file}:${refs[i].line}`,
      })
    }
  }

  const aWidths = auditCols.map(col => {
    let w = col.header.length
    for (const row of auditRows) w = Math.max(w, col.get(row).length)
    return w
  })

  const aSep    = aWidths.map(w => '-'.repeat(w + 2)).join('+')
  const aHeader = auditCols.map((col, i) => ` ${col.header.padEnd(aWidths[i])} `).join('|')

  console.log(aSep)
  console.log(aHeader)
  console.log(aSep)
  for (const row of auditRows) {
    console.log(auditCols.map((col, i) => ` ${col.get(row).padEnd(aWidths[i])} `).join('|'))
  }
  console.log(aSep)

  // Warnings for anything not Stable GA
  const problems = Object.entries(usages).filter(([id]) => {
    const known = KNOWN_MODELS[id]
    return !known || !known.status.startsWith('[GA]')
  })

  if (problems.length > 0) {
    console.log('\n  WARNINGS — model IDs in code that are not Stable GA:\n')
    for (const [id, refs] of problems) {
      const known = KNOWN_MODELS[id]
      const status = known ? known.status : '[NEW] Unknown'
      console.log(`  ! ${id}  ${status}`)
      for (const ref of refs) console.log(`      ${ref.file}:${ref.line}`)
    }
    console.log('\n  -> Fix before deploying. Only [GA] Stable GA models are safe for production.\n')
  } else {
    console.log('\n  All model IDs in code are Stable GA. Production fallback chain is clean.\n')
  }
}
