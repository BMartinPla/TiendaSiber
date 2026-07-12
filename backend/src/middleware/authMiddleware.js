const jwt = require('jsonwebtoken')
const { secret } = require('../config/auth')
const prisma = require('../config/database')

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, secret)

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, active: true, phone: true },
    })

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuario no encontrado o suspendido' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) return next()

    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, secret)

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, active: true, phone: true },
    })

    if (user && user.active) req.user = user
    next()
  } catch {
    next()
  }
}

module.exports = authenticate
module.exports.optionalAuth = optionalAuth
