const { Router } = require('express')
const { body } = require('express-validator')
const authenticate = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const userController = require('../controllers/userController')

const router = Router()

router.get('/', authenticate, authorize('ADMIN'), userController.list)
router.patch(
  '/:id/role',
  authenticate,
  authorize('ADMIN'),
  [body('role').isIn(['ADMIN', 'RETAIL', 'WHOLESALE']).withMessage('Rol inválido')],
  userController.updateRole
)

module.exports = router
