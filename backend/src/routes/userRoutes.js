const { Router } = require('express')
const { body } = require('express-validator')
const authenticate = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const validateId = require('../middleware/validateId')
const userController = require('../controllers/userController')

const router = Router()

router.get('/', authenticate, authorize('ADMIN'), userController.list)

router.patch(
  '/bulk-role',
  authenticate,
  authorize('ADMIN'),
  [
    body('userIds').isArray({ min: 1 }).withMessage('Debes enviar un array userIds no vacío'),
    body('role').isIn(['ADMIN', 'RETAIL', 'WHOLESALE']).withMessage('Rol inválido'),
  ],
  userController.bulkUpdateRole
)

router.patch(
  '/:id/role',
  authenticate,
  authorize('ADMIN'),
  validateId,
  [body('role').isIn(['ADMIN', 'RETAIL', 'WHOLESALE']).withMessage('Rol inválido')],
  userController.updateRole
)

router.patch('/:id/suspend', authenticate, authorize('ADMIN'), validateId, userController.suspend)
router.patch('/:id/activate', authenticate, authorize('ADMIN'), validateId, userController.activate)
router.delete('/:id', authenticate, authorize('ADMIN'), validateId, userController.remove)

module.exports = router
