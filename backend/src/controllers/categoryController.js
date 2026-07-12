const prisma = require('../config/database')
const { validationResult } = require('express-validator')

async function list(req, res) {
  try {
    const where = req.user?.role === 'ADMIN' ? {} : { active: true }
    const categories = await prisma.category.findMany({
      where,
      include: { _count: { select: { products: { where: { active: true } } } } },
      orderBy: { name: 'asc' },
    })
    res.json(categories)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener categorías' })
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { products: true } } },
    })
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json(category)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener categoría' })
  }
}

async function create(req, res) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map((e) => e.msg).join(', ') })
    }

    const { name, description } = req.body
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' })
    const category = await prisma.category.create({ data: { name, description } })
    res.status(201).json(category)
  } catch (error) {
    console.error(error)
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' })
    res.status(500).json({ error: 'Error al crear categoría' })
  }
}

async function update(req, res) {
  try {
    const { id } = req.params
    const { name, description } = req.body
    const category = await prisma.category.findUnique({ where: { id: Number(id) } })
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    })
    res.json(updated)
  } catch (error) {
    console.error(error)
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' })
    res.status(500).json({ error: 'Error al actualizar categoría' })
  }
}

async function softDelete(req, res) {
  try {
    const { id } = req.params
    const category = await prisma.category.findUnique({ where: { id: Number(id) } })
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
    const updated = await prisma.category.update({ where: { id: Number(id) }, data: { active: false } })
    res.json({ message: 'Categoría suspendida', category: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al suspender categoría' })
  }
}

async function restore(req, res) {
  try {
    const { id } = req.params
    const category = await prisma.category.findUnique({ where: { id: Number(id) } })
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
    const updated = await prisma.category.update({ where: { id: Number(id) }, data: { active: true } })
    res.json({ message: 'Categoría restaurada', category: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al restaurar categoría' })
  }
}

async function hardDelete(req, res) {
  try {
    const { id } = req.params
    const category = await prisma.category.findUnique({ where: { id: Number(id) } })
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' })
    const productCount = await prisma.product.count({ where: { categoryId: Number(id) } })
    if (productCount > 0) {
      return res.status(409).json({
        error: `No se puede eliminar: ${productCount} producto(s) usan esta categoría. Reasígnalos primero.`,
      })
    }
    await prisma.category.delete({ where: { id: Number(id) } })
    res.json({ message: 'Categoría eliminada permanentemente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar categoría' })
  }
}

module.exports = { list, getById, create, update, softDelete, restore, hardDelete }
