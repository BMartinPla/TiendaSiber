module.exports = {
  secret: process.env.JWT_SECRET || 'fallback_secret_no_usar_en_produccion',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}
