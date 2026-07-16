const { Router } = require('express')
const authenticate = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const orderController = require('../controllers/orderController')

const router = Router()

router.post('/manual', authenticate, authorize('ADMIN'), orderController.createManual)
router.post('/from-cart', authenticate, orderController.createFromCart)
router.get('/', authenticate, authorize('ADMIN'), orderController.list)
router.get('/mine', authenticate, orderController.listMyOrders)
router.get('/:id', authenticate, authorize('ADMIN'), orderController.getById)
router.patch('/:id/approve', authenticate, authorize('ADMIN'), orderController.approve)
router.patch('/:id/cancel', authenticate, orderController.cancelMyOrder)
router.delete('/:id', authenticate, authorize('ADMIN'), orderController.remove)
router.get('/:id/pdf', authenticate, authorize('ADMIN'), orderController.downloadPdf)

module.exports = router
