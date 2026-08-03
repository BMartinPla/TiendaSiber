const prisma = require('../config/database')
const { getPricingStrategy } = require('../strategies/pricingStrategy')
const { validationResult } = require('express-validator')
const { invalidateProductsAndCategories } = require('../middleware/cacheMiddleware')

const productInclude = { category: { select: { id: true, name: true } } }

const productListSelect = {
  id: true,
  sku: true,
  proveedor: true,
  name: true,
  precioBase: true,
  precioMayorista: true,
  precioCosto: true,
  stock: true,
  imageUrl: true,
  featuredImageUrl: true,
  featured: true,
  active: true,
  createdAt: true,
  category: { select: { id: true, name: true } },
}

async function list(req, res) {
  try {
    const where = req.user?.role === 'ADMIN' ? {} : { active: true }

    if (req.query.categoryId) {
      if (Array.isArray(req.query.categoryId)) {
        where.categoryId = { in: req.query.categoryId.map(Number) }
      } else {
        where.categoryId = Number(req.query.categoryId)
      }
    }

    if (req.query.search) {
      where.name = { contains: req.query.search, mode: 'insensitive' }
    }

    if (req.query.proveedor) {
      where.proveedor = { contains: req.query.proveedor, mode: 'insensitive' }
    }

    let orderBy = { name: 'asc' }
    if (req.query.sortBy === 'price_asc') orderBy = { precioBase: 'asc' }
    else if (req.query.sortBy === 'price_desc') orderBy = { precioBase: 'desc' }

    const products = await prisma.product.findMany({
      where,
      select: productListSelect,
      orderBy,
    })

    const strategy = getPricingStrategy(req.user?.role || 'RETAIL')

    const result = products.map((product) => {
      const pricing = strategy.getPrice(product)
      const { precioCosto, ...rest } = product
      return {
        ...rest,
        ...(req.user?.role === 'ADMIN' ? { precioCosto } : {}),
        pricing,
      }
    })

    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener productos' })
  }
}

async function getProveedores(req, res) {
  try {
    const rows = await prisma.product.findMany({
      where: { proveedor: { not: null } },
      select: { proveedor: true },
      distinct: ['proveedor'],
      orderBy: { proveedor: 'asc' },
    })
    res.json(rows.map((r) => r.proveedor))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener proveedores' })
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params
    const where = req.user?.role === 'ADMIN' ? { id: Number(id) } : { id: Number(id), active: true }

    const product = await prisma.product.findFirst({
      where,
      include: productInclude,
    })
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const strategy = getPricingStrategy(req.user?.role || 'RETAIL')
    const pricing = strategy.getPrice(product)

    res.json({ ...product, pricing })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener producto' })
  }
}

async function create(req, res) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map((e) => e.msg).join(', ') })
    }

    const { name, description, precioBase, precioMayorista, precioCosto, stock, imageUrl, featuredImageUrl, categoryId, proveedor } = req.body

    if (!name || precioBase == null || precioMayorista == null || precioCosto == null) {
      return res.status(400).json({ error: 'Nombre, precio_minorista, precio_mayorista y precio_costo son obligatorios' })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        precioBase,
        precioMayorista,
        precioCosto,
        stock: stock || 0,
        imageUrl,
        featuredImageUrl: featuredImageUrl || null,
        categoryId: categoryId || null,
        proveedor: proveedor || null,
      },
      include: productInclude,
    })

    invalidateProductsAndCategories()
    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear producto' })
  }
}

async function update(req, res) {
  try {
    const { id } = req.params
    const { name, description, precioBase, precioMayorista, precioCosto, stock, imageUrl, featuredImageUrl, categoryId, proveedor } = req.body

    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(precioBase !== undefined && { precioBase }),
        ...(precioMayorista !== undefined && { precioMayorista }),
        ...(precioCosto !== undefined && { precioCosto }),
        ...(stock !== undefined && { stock }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(featuredImageUrl !== undefined && { featuredImageUrl: featuredImageUrl || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(proveedor !== undefined && { proveedor: proveedor || null }),
      },
      include: productInclude,
    })

    invalidateProductsAndCategories()
    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
}

async function updatePrice(req, res) {
  try {
    const { id } = req.params
    const { precioBase, precioMayorista } = req.body

    if (precioBase == null && precioMayorista == null) {
      return res.status(400).json({ error: 'Debes enviar precio_minorista y/o precio_mayorista' })
    }

    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(precioBase !== undefined && { precioBase }),
        ...(precioMayorista !== undefined && { precioMayorista }),
      },
    })

    invalidateProductsAndCategories()
    res.json({ message: 'Precio actualizado', product: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar precio' })
  }
}

async function bulkUpdatePrices(req, res) {
  try {
    const { productIds, percentage } = req.body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Debes enviar un array productIds no vacío' })
    }

    if (percentage == null || isNaN(percentage)) {
      return res.status(400).json({ error: 'Debes enviar un percentage válido' })
    }

    const multiplier = 1 + percentage / 100

    const result = await prisma.product.updateMany({
      where: { id: { in: productIds.map(Number) } },
      data: {
        precioBase: { multiply: multiplier },
        precioMayorista: { multiply: multiplier },
      },
    })

    const updatedProducts = await prisma.product.findMany({
      where: { id: { in: productIds.map(Number) } },
    })

    invalidateProductsAndCategories()
    res.json({
      message: `Precios actualizados: ${percentage >= 0 ? '+' : ''}${percentage}%`,
      affectedCount: result.count,
      products: updatedProducts,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar precios masivamente' })
  }
}

async function softDelete(req, res) {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { active: false },
    })

    invalidateProductsAndCategories()
    res.json({ message: 'Producto suspendido (borrado lógico)', product: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al suspender producto' })
  }
}

async function restore(req, res) {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { active: true },
    })

    invalidateProductsAndCategories()
    res.json({ message: 'Producto restaurado', product: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al restaurar producto' })
  }
}

async function hardDelete(req, res) {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    await prisma.product.delete({ where: { id: Number(id) } })

    invalidateProductsAndCategories()
    res.json({ message: 'Producto eliminado permanentemente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
}

async function toggleFeatured(req, res) {
  try {
    const { id } = req.params
    const product = await prisma.product.findUnique({ where: { id: Number(id) } })
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' })

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { featured: !product.featured },
      include: productInclude,
    })

    invalidateProductsAndCategories()
    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al destacar producto' })
  }
}

async function getFeatured(req, res) {
  try {
    const products = await prisma.product.findMany({
      where: { active: true, featured: true, stock: { gt: 0 } },
      select: productListSelect,
    })

    const strategy = getPricingStrategy(req.user?.role || 'RETAIL')

    const result = products.map((product) => {
      const pricing = strategy.getPrice(product)
      return { ...product, pricing }
    })

    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener productos destacados' })
  }
}

async function bulkSuspend(req, res) {
  try {
    const { productIds } = req.body
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Debes enviar un array productIds no vacío' })
    }

    const result = await prisma.product.updateMany({
      where: { id: { in: productIds.map(Number) } },
      data: { active: false },
    })

    invalidateProductsAndCategories()
    res.json({ message: `${result.count} producto(s) suspendido(s)`, count: result.count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al suspender productos masivamente' })
  }
}

async function bulkRestore(req, res) {
  try {
    const { productIds } = req.body
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Debes enviar un array productIds no vacío' })
    }

    const result = await prisma.product.updateMany({
      where: { id: { in: productIds.map(Number) } },
      data: { active: true },
    })

    invalidateProductsAndCategories()
    res.json({ message: `${result.count} producto(s) restaurado(s)`, count: result.count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al restaurar productos masivamente' })
  }
}

async function bulkDelete(req, res) {
  try {
    const { productIds } = req.body
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Debes enviar un array productIds no vacío' })
    }

    const result = await prisma.product.deleteMany({
      where: { id: { in: productIds.map(Number) } },
    })

    invalidateProductsAndCategories()
    res.json({ message: `${result.count} producto(s) eliminado(s) permanentemente`, count: result.count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar productos masivamente' })
  }
}

module.exports = {
  list,
  getProveedores,
  getById,
  create,
  update,
  updatePrice,
  bulkUpdatePrices,
  softDelete,
  restore,
  hardDelete,
  bulkSuspend,
  bulkRestore,
  bulkDelete,
  toggleFeatured,
  getFeatured,
}
