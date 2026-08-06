const { Router } = require('express')
const { body } = require('express-validator')
const rateLimit = require('express-rate-limit')
const { register, login, profile, updateProfile, adminCreateUser, changePassword } = require('../controllers/authController')
const authenticate = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
})

router.post('/register', authLimiter,
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido').custom((value) => {
      if (!value.endsWith('@quincegearsn.com')) {
        throw new Error('Solo se permiten correos @quincegearsn.com')
      }
      return true
    }),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').optional().isIn(['RETAIL']).withMessage('Solo se permiten registros minoristas'),
  ],
  register
)

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  login
)

router.get('/profile', authenticate, profile)

router.patch(
  '/profile',
  authenticate,
  [body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío')],
  updateProfile
)

router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  changePassword
)

router.post(
  '/admin-create',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').optional().isIn(['RETAIL', 'WHOLESALE', 'ADMIN']).withMessage('Rol inválido'),
  ],
  adminCreateUser
)

module.exports = router
