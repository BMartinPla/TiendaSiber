const prisma = require('../config/database')

async function list(req, res) {
  try {
    const { search } = req.query
    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        active: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    })

    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}

async function updateRole(req, res) {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['ADMIN', 'RETAIL', 'WHOLESALE'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser ADMIN, RETAIL o WHOLESALE' })
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } })
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, name: true, email: true, role: true, phone: true, active: true },
    })

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar rol' })
  }
}

async function bulkUpdateRole(req, res) {
  try {
    const { userIds, role } = req.body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Debes enviar un array userIds no vacío' })
    }

    if (!['ADMIN', 'RETAIL', 'WHOLESALE'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser ADMIN, RETAIL o WHOLESALE' })
    }

    const result = await prisma.user.updateMany({
      where: { id: { in: userIds.map(Number) } },
      data: { role },
    })

    res.json({ message: `${result.count} usuario(s) actualizado(s) a ${role}`, count: result.count })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar roles masivamente' })
  }
}

module.exports = { list, updateRole, bulkUpdateRole }
