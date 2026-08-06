const { Router } = require('express')
const { body } = require('express-validator')
const authenticate = require('../middleware/authMiddleware')
const { optionalAuth } = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const validateId = require('../middleware/validateId')
const { cacheMiddleware } = require('../middleware/cacheMiddleware')
const productController = require('../controllers/productController')
const bulkProductController = require('../controllers/bulkProductController')

const router = Router()

router.get('/featured', optionalAuth, cacheMiddleware(), productController.getFeatured)
router.get('/proveedores', authenticate, cacheMiddleware(), productController.getProveedores)
router.get('/', optionalAuth, cacheMiddleware(), productController.list)
router.get('/export', authenticate, authorize('ADMIN'), productController.exportProducts)
router.post('/bulk-upload', authenticate, authorize('ADMIN'), bulkProductController.upload.single('file'), bulkProductController.bulkUpload)
router.get('/:id', optionalAuth, cacheMiddleware(), validateId, productController.getById)

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

router.put('/:id', authenticate, authorize('ADMIN'), validateId, productController.update)
router.patch('/:id/price', authenticate, authorize('ADMIN'), validateId, productController.updatePrice)
router.post('/bulk-update-prices', authenticate, authorize('ADMIN'), productController.bulkUpdatePrices)
router.post('/bulk-stock', authenticate, authorize('ADMIN'), productController.bulkUpdateStock)
router.post('/bulk-suspend', authenticate, authorize('ADMIN'), productController.bulkSuspend)
router.post('/bulk-restore', authenticate, authorize('ADMIN'), productController.bulkRestore)
router.post('/bulk-delete', authenticate, authorize('ADMIN'), productController.bulkDelete)
router.patch('/:id/suspend', authenticate, authorize('ADMIN'), validateId, productController.softDelete)
router.patch('/:id/restore', authenticate, authorize('ADMIN'), validateId, productController.restore)
router.patch('/:id/featured', authenticate, authorize('ADMIN'), validateId, productController.toggleFeatured)
router.delete('/:id', authenticate, authorize('ADMIN'), validateId, productController.hardDelete)

module.exports = router
