const { Router } = require('express')
const authenticate = require('../middleware/authMiddleware')
const cartController = require('../controllers/cartController')
const { generateWhatsAppUrl } = require('../utils/whatsappFormatter')

const router = Router()

router.use(authenticate)

router.get('/', cartController.getCart)
router.post('/add', cartController.addItem)
router.put('/:id', cartController.updateItemQuantity)
router.delete('/:id', cartController.removeItem)
router.delete('/', cartController.clearCart)
router.get('/summary', cartController.getCartSummary)

router.get('/whatsapp-link', async (req, res) => {
  try {
    const { getCart } = require('../controllers/cartController')
    const prisma = require('../config/database')

    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    })

    const cartItems = items.map((item) => ({
      quantity: item.quantity,
      product: item.product,
    }))

    const url = generateWhatsAppUrl(cartItems, req.user)
    res.json({ whatsappUrl: url, phone: require('../utils/whatsappFormatter').STORE_PHONE })
  } catch (error) {
    res.status(500).json({ error: 'Error al generar enlace de WhatsApp' })
  }
})

module.exports = router
