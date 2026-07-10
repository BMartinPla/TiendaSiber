const { Router } = require('express')
const { body } = require('express-validator')
const authenticate = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const productController = require('../controllers/productController')

const router = Router()

router.get('/', authenticate, productController.list)
router.get('/:id', authenticate, productController.getById)

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('precioBase').isFloat({ min: 0 }).withMessage('precio_base debe ser un número positivo'),
    body('precioMayorista').isFloat({ min: 0 }).withMessage('precio_mayorista debe ser un número positivo'),
  ],
  productController.create
)

router.put('/:id', authenticate, authorize('ADMIN'), productController.update)
router.patch('/:id/price', authenticate, authorize('ADMIN'), productController.updatePrice)
router.post('/bulk-update-prices', authenticate, authorize('ADMIN'), productController.bulkUpdatePrices)
router.patch('/:id/suspend', authenticate, authorize('ADMIN'), productController.softDelete)
router.patch('/:id/restore', authenticate, authorize('ADMIN'), productController.restore)
router.delete('/:id', authenticate, authorize('ADMIN'), productController.hardDelete)

module.exports = router
