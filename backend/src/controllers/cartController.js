const prisma = require('../config/database')
const { getPricingStrategy } = require('../strategies/pricingStrategy')

async function getCart(req, res) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { category: { select: { id: true, name: true } } } } },
    })

    const strategy = getPricingStrategy(req.user.role)

    const cartItems = items.map((item) => {
      const pricing = strategy.getPrice(item.product, item.quantity)
      return {
        id: item.id,
        quantity: item.quantity,
        product: {
          ...item.product,
          pricing,
        },
      }
    })

    const total = cartItems.reduce((sum, item) => sum + (item.product.pricing.total || 0), 0)

    res.json({ items: cartItems, total })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito' })
  }
}

async function addItem(req, res) {
  try {
    const { productId, quantity } = req.body

    if (!productId) {
      return res.status(400).json({ error: 'productId es obligatorio' })
    }

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } })
    if (!product || !product.active) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId: Number(productId) } },
    })

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) },
        include: { product: { include: { category: { select: { id: true, name: true } } } } },
      })
      return res.json(updated)
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId: Number(productId),
        quantity: quantity || 1,
      },
      include: { product: { include: { category: { select: { id: true, name: true } } } } },
    })

    res.status(201).json(item)
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar al carrito' })
  }
}

async function updateItemQuantity(req, res) {
  try {
    const { id } = req.params
    const { quantity } = req.body

    if (quantity == null || quantity < 1) {
      return res.status(400).json({ error: 'quantity debe ser mayor o igual a 1' })
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: Number(id), userId: req.user.id },
    })

    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado en el carrito' })
    }

    const updated = await prisma.cartItem.update({
      where: { id: Number(id) },
      data: { quantity },
      include: { product: { include: { category: { select: { id: true, name: true } } } } },
    })

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cantidad' })
  }
}

async function removeItem(req, res) {
  try {
    const { id } = req.params

    const item = await prisma.cartItem.findFirst({
      where: { id: Number(id), userId: req.user.id },
    })

    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado en el carrito' })
    }

    await prisma.cartItem.delete({ where: { id: Number(id) } })

    res.json({ message: 'Item eliminado del carrito' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar item del carrito' })
  }
}

async function clearCart(req, res) {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } })
    res.json({ message: 'Carrito vaciado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar carrito' })
  }
}

async function getCartSummary(req, res) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { category: { select: { id: true, name: true } } } } },
    })

    const strategy = getPricingStrategy(req.user.role)

    const details = items.map((item) => {
      const pricing = strategy.getPrice(item.product, item.quantity)
      return {
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: pricing.unitPrice,
        total: pricing.total,
      }
    })

    const total = details.reduce((sum, d) => sum + d.total, 0)

    res.json({ details, total, strategy: strategy.getPrice.name.replace('PricingStrategy', '') })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen del carrito' })
  }
}

module.exports = { getCart, addItem, updateItemQuantity, removeItem, clearCart, getCartSummary }
