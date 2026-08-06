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
    console.error(error)
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}

async function updateRole(req, res) {
  try {
    const { id } = req.params
    const { role } = req.body

    if (Number(id) === req.user.id) {
      return res.status(403).json({ error: 'No puedes cambiar tu propio rol' })
    }

    if (!['ADMIN', 'RETAIL', 'WHOLESALE'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser ADMIN, RETAIL o WHOLESALE' })
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } })
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN', active: true } })
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'No puedes cambiar el rol del último administrador activo' })
      }
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, name: true, email: true, role: true, phone: true, active: true },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar rol' })
  }
}

async function bulkUpdateRole(req, res) {
  try {
    const { userIds, role } = req.body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Debes enviar un array userIds no vacío' })
    }

    const filteredIds = userIds.map(Number).filter((id) => id !== req.user.id)

    if (filteredIds.length === 0) {
      return res.status(400).json({ error: 'No puedes cambiar tu propio rol' })
    }

    if (!['ADMIN', 'RETAIL', 'WHOLESALE'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser ADMIN, RETAIL o WHOLESALE' })
    }

    const result = await prisma.user.updateMany({
      where: { id: { in: filteredIds } },
      data: { role },
    })

    res.json({ message: `${result.count} usuario(s) actualizado(s) a ${role}`, count: result.count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar roles masivamente' })
  }
}

async function suspend(req, res) {
  try {
    const { id } = req.params

    if (Number(id) === req.user.id) {
      return res.status(403).json({ error: 'No puedes suspender tu propia cuenta' })
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } })
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN', active: true } })
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'No puedes suspender el último administrador activo' })
      }
    }

    if (!user.active) {
      return res.status(400).json({ error: 'El usuario ya está suspendido' })
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { active: false },
      select: { id: true, name: true, email: true, role: true, active: true },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al suspender usuario' })
  }
}

async function activate(req, res) {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({ where: { id: Number(id) } })
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (user.active) {
      return res.status(400).json({ error: 'El usuario ya está activo' })
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { active: true },
      select: { id: true, name: true, email: true, role: true, active: true },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al activar usuario' })
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params

    if (Number(id) === req.user.id) {
      return res.status(403).json({ error: 'No puedes eliminar tu propia cuenta' })
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } })
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN', active: true } })
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'No se puede eliminar el último administrador activo' })
      }
    }

    await prisma.user.delete({ where: { id: Number(id) } })
    res.json({ message: 'Usuario eliminado permanentemente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
}

module.exports = { list, updateRole, bulkUpdateRole, suspend, activate, remove }
