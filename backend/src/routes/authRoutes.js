const { Router } = require('express')
const { body } = require('express-validator')
const { register, login, profile, updateProfile, adminCreateUser } = require('../controllers/authController')
const authenticate = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')

const router = Router()

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido').custom((value) => {
      if (!value.endsWith('@quincegearsn.com')) {
        throw new Error('Solo se permiten correos @quincegearsn.com')
      }
      return true
    }),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').optional().isIn(['RETAIL', 'WHOLESALE']).withMessage('Rol inválido'),
  ],
  register
)

router.post(
  '/login',
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
