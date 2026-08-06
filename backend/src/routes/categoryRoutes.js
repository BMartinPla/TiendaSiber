const { Router } = require('express')
const { body } = require('express-validator')
const authenticate = require('../middleware/authMiddleware')
const { optionalAuth } = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const validateId = require('../middleware/validateId')
const { cacheMiddleware } = require('../middleware/cacheMiddleware')
const categoryController = require('../controllers/categoryController')

const router = Router()

router.get('/', optionalAuth, cacheMiddleware(), categoryController.list)
router.get('/:id', optionalAuth, cacheMiddleware(), validateId, categoryController.getById)

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [body('name').notEmpty().withMessage('El nombre es obligatorio')],
  categoryController.create
)

router.put('/:id', authenticate, authorize('ADMIN'), validateId, categoryController.update)
router.patch('/:id/suspend', authenticate, authorize('ADMIN'), validateId, categoryController.softDelete)
router.patch('/:id/restore', authenticate, authorize('ADMIN'), validateId, categoryController.restore)
router.delete('/:id', authenticate, authorize('ADMIN'), validateId, categoryController.hardDelete)

module.exports = router
