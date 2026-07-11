const prisma = require('../config/database')
const { getPricingStrategy } = require('../strategies/pricingStrategy')
const { generateWhatsAppUrl, STORE_PHONE } = require('../utils/whatsappFormatter')
const { generateOrderPdf } = require('../utils/pdfGenerator')

async function createFromCart(req, res) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    })

    if (items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' })
    }

    const strategy = getPricingStrategy(req.user.role)
    let total = 0
    const orderItems = items.map((item) => {
      const pricing = strategy.getPrice(item.product)
      const unitPrice = pricing.unitPrice
      const subtotal = unitPrice * item.quantity
      total += subtotal
      return {
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      }
    })

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        clientCondition: req.user.role,
        items: { create: orderItems },
      },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    const cartItems = items.map((item) => ({
      quantity: item.quantity,
      product: item.product,
    }))
    const whatsappUrl = generateWhatsAppUrl(cartItems, req.user)

    res.status(201).json({ order, whatsappUrl, phone: STORE_PHONE })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear pedido' })
  }
}

async function list(req, res) {
  try {
    const { search, status } = req.query
    const where = {}

    if (status === 'APPROVED' || status === 'PENDING') {
      where.status = status
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener pedidos' })
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, phone: true } },
        items: true,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener pedido' })
  }
}

async function approve(req, res) {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({ where: { id: Number(id) } })
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    if (order.status === 'APPROVED') {
      return res.status(400).json({ error: 'El pedido ya está aprobado' })
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: 'APPROVED' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        items: true,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al aprobar pedido' })
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({ where: { id: Number(id) } })
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    await prisma.order.delete({ where: { id: Number(id) } })
    res.json({ message: 'Pedido eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar pedido' })
  }
}

async function downloadPdf(req, res) {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, phone: true } },
        items: true,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=remito-${order.id}.pdf`)

    const doc = generateOrderPdf(order)
    doc.pipe(res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al generar PDF' })
  }
}

module.exports = { createFromCart, list, getById, approve, remove, downloadPdf }
