const { Router } = require('express')
const { body } = require('express-validator')
const { register, login, profile, updateProfile } = require('../controllers/authController')
const authenticate = require('../middleware/authMiddleware')

const router = Router()

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
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

module.exports = router
