const path = require('path')
const { spawnSync } = require('child_process')
require('dotenv').config()

const PROTECTED_HOSTS = (process.env.PROTECTED_DB_HOSTS || 'supabase.com')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

const DESTRUCTIVE = [
  ['migrate', 'dev'],
  ['migrate', 'reset'],
  ['db', 'push'],
  ['db', 'execute'],
]

const args = process.argv.slice(2)
const cmd = [args[0], args[1]].filter(Boolean)
const isDestructive = DESTRUCTIVE.some((d) => d[0] === cmd[0] && d[1] === cmd[1])

const dbUrl = process.env.DATABASE_URL || ''
let host = ''
try {
  host = new URL(dbUrl).hostname.toLowerCase()
} catch (e) {}

const isProtected = host && PROTECTED_HOSTS.some((h) => host === h || host.endsWith('.' + h))

if (isDestructive) {
  if (!host) {
    console.error('[GUARD] Acción destructiva detectada pero no se pudo leer DATABASE_URL.')
    console.error('[GUARD] Ejecute desde backend/ con el archivo .env presente.')
    process.exit(1)
  }
  if (isProtected && process.env.ALLOW_PRISMA_RESET !== '1') {
    console.error('')
    console.error('[GUARD] Acción destructiva BLOQUEADA.')
    console.error('[GUARD] Comando: prisma ' + cmd.join(' '))
    console.error('[GUARD] Base protegida: ' + host)
    console.error('[GUARD] Este comando puede borrar datos en PRODUCCIÓN.')
    console.error('[GUARD] Si está 100% seguro, fuerce con: $env:ALLOW_PRISMA_RESET="1"')
    process.exit(1)
  }
  if (isProtected) {
    console.warn('[GUARD] ALLOW_PRISMA_RESET=1 activado. Ejecutando acción destructiva sobre base protegida: ' + host)
  } else {
    console.log('[GUARD] Base no protegida (' + host + '), permitiendo acción destructiva.')
  }
}

const prismaBin = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js')
const result = spawnSync(process.execPath, [prismaBin, ...args], { stdio: 'inherit', env: process.env })
process.exit(result.status === null ? 1 : result.status)
