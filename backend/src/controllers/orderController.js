const prisma = require('../config/database')
const { getPricingStrategy } = require('../strategies/pricingStrategy')
const { generateWhatsAppUrl, STORE_PHONE } = require('../utils/whatsappFormatter')
const { generateOrderPdf } = require('../utils/pdfGenerator')

async function createFromCart(req, res) {
  try {
    const existingPending = await prisma.order.findFirst({
      where: { userId: req.user.id, status: 'PENDING' },
    })

    if (existingPending) {
      return res.status(400).json({ error: 'Ya tienes un pedido pendiente. Cancélalo antes de crear uno nuevo.' })
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    })

    if (items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' })
    }

    for (const item of items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          error: `Stock insuficiente para "${item.product.name}". Disponible: ${item.product.stock}, solicitado: ${item.quantity}`,
        })
      }
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

async function listMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener tus pedidos' })
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

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: { include: { product: true } } },
    })
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    if (order.status === 'APPROVED') {
      return res.status(400).json({ error: 'El pedido ya está aprobado' })
    }

    for (const item of order.items) {
      if ((item.product.stock) < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para "${item.productName}". Disponible: ${item.product.stock}, requerido: ${item.quantity}`,
        })
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }
      return tx.order.update({
        where: { id: Number(id) },
        data: { status: 'APPROVED' },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          items: true,
        },
      })
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
    const clientName = (order.user.name || 'cliente').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'cliente'
    res.setHeader('Content-Disposition', `attachment; filename=remito-${clientName}.pdf`)

    const doc = generateOrderPdf(order)
    doc.pipe(res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al generar PDF' })
  }
}

async function cancelMyOrder(req, res) {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({ where: { id: Number(id) } })
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'No puedes cancelar un pedido de otro usuario' })
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: 'Solo puedes cancelar pedidos pendientes' })
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: 'CANCELLED' },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al cancelar pedido' })
  }
}

async function createManual(req, res) {
  try {
    const { userId, condition, items } = req.body

    if (!userId || !condition || !items || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos: userId, condition, items requeridos' })
    }

    if (!['RETAIL', 'WHOLESALE'].includes(condition)) {
      return res.status(400).json({ error: 'La condición debe ser RETAIL o WHOLESALE' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const productIds = items.map((i) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    const productMap = {}
    for (const p of products) { productMap[p.id] = p }

    for (const item of items) {
      const product = productMap[item.productId]
      if (!product) {
        return res.status(404).json({ error: `Producto ID ${item.productId} no encontrado` })
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({
          error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
        })
      }
    }

    const strategy = getPricingStrategy(condition)
    let total = 0
    const orderItems = items.map((item) => {
      const product = productMap[item.productId]
      const pricing = strategy.getPrice(product)
      const unitPrice = pricing.unitPrice
      const subtotal = unitPrice * item.quantity
      total += subtotal
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      }
    })

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        clientCondition: condition,
        items: { create: orderItems },
      },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear pedido manual' })
  }
}

module.exports = { createFromCart, createManual, list, listMyOrders, getById, approve, remove, downloadPdf, cancelMyOrder }
