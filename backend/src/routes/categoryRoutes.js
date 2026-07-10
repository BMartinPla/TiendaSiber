const { Router } = require('express')
const { body } = require('express-validator')
const authenticate = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const categoryController = require('../controllers/categoryController')

const router = Router()

router.get('/', authenticate, categoryController.list)
router.get('/:id', authenticate, categoryController.getById)

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [body('name').notEmpty().withMessage('El nombre es obligatorio')],
  categoryController.create
)

router.put('/:id', authenticate, authorize('ADMIN'), categoryController.update)
router.patch('/:id/suspend', authenticate, authorize('ADMIN'), categoryController.softDelete)
router.patch('/:id/restore', authenticate, authorize('ADMIN'), categoryController.restore)
router.delete('/:id', authenticate, authorize('ADMIN'), categoryController.hardDelete)

module.exports = router
