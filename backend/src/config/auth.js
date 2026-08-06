const crypto = require('crypto')

const DEFAULT_SECRET = 'fallback_secret_no_usar_en_produccion'
const PLACEHOLDER_SECRET = 'cambia_esto_por_un_secret_seguro'

function getSecret() {
  const value = process.env.JWT_SECRET
  const isProduction = process.env.NODE_ENV === 'production'

  if (!value || value === DEFAULT_SECRET || value === PLACEHOLDER_SECRET || value.length < 32) {
    if (isProduction) {
      throw new Error(
        'JWT_SECRET inválido o inseguro. Debes definir un secreto de al menos 32 caracteres en el .env de producción.'
      )
    }
    console.warn('⚠️  JWT_SECRET no configurado o débil. Generando secreto aleatorio temporal (solo desarrollo).')
    return crypto.randomBytes(48).toString('hex')
  }

  return value
}

module.exports = {
  secret: getSecret(),
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}
