const { Router } = require('express')
const { body } = require('express-validator')
const authenticate = require('../middleware/authMiddleware')
const { optionalAuth } = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const productController = require('../controllers/productController')

const router = Router()

router.get('/featured', optionalAuth, productController.getFeatured)
router.get('/', authenticate, productController.list)
router.get('/:id', authenticate, productController.getById)

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('precioBase').isFloat({ min: 0 }).withMessage('precio_minorista debe ser un número positivo'),
    body('precioMayorista').isFloat({ min: 0 }).withMessage('precio_mayorista debe ser un número positivo'),
    body('precioCosto').isFloat({ min: 0 }).withMessage('precio_costo debe ser un número positivo'),
  ],
  productController.create
)

router.put('/:id', authenticate, authorize('ADMIN'), productController.update)
router.patch('/:id/price', authenticate, authorize('ADMIN'), productController.updatePrice)
router.post('/bulk-update-prices', authenticate, authorize('ADMIN'), productController.bulkUpdatePrices)
router.post('/bulk-suspend', authenticate, authorize('ADMIN'), productController.bulkSuspend)
router.post('/bulk-restore', authenticate, authorize('ADMIN'), productController.bulkRestore)
router.post('/bulk-delete', authenticate, authorize('ADMIN'), productController.bulkDelete)
router.patch('/:id/suspend', authenticate, authorize('ADMIN'), productController.softDelete)
router.patch('/:id/restore', authenticate, authorize('ADMIN'), productController.restore)
router.patch('/:id/featured', authenticate, authorize('ADMIN'), productController.toggleFeatured)
router.delete('/:id', authenticate, authorize('ADMIN'), productController.hardDelete)

module.exports = router
