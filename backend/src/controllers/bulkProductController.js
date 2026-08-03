const XLSX = require('xlsx')
const multer = require('multer')
const prisma = require('../config/database')
const { invalidateProductsAndCategories } = require('../middleware/cacheMiddleware')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(xlsx|xls|csv)$/i.test(file.originalname)
    cb(ok ? null : new Error('Solo se permiten archivos .xlsx, .xls o .csv'), ok)
  },
})

function normalizeHeader(h) {
  return String(h)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function pick(row, candidates) {
  for (const key of Object.keys(row)) {
    const nk = normalizeHeader(key)
    if (candidates.includes(nk)) {
      return row[key]
    }
  }
  return null
}

function parseText(v) {
  if (v == null) return ''
  return String(v).trim()
}

function parsePrice(v) {
  if (v == null || v === '') return null
  if (typeof v === 'number') return v
  let s = String(v).trim().replace(/[$€\s]/g, '')
  if (!s) return null
  const lastDot = s.lastIndexOf('.')
  const lastComma = s.lastIndexOf(',')
  if (lastComma > -1 || lastDot > -1) {
    const idx = Math.max(lastDot, lastComma)
    const digitsAfter = s.length - idx - 1
    if (digitsAfter === 3) {
      s = s.replace(/[.,]/g, '')
    } else {
      const digits = s.slice(idx + 1)
      const integerPart = s.slice(0, idx).replace(/[.,]/g, '')
      s = `${integerPart}.${digits}`
    }
  }
  const n = Number(s)
  return isNaN(n) ? null : n
}

async function bulkUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes enviar un archivo .xlsx, .xls o .csv' })
    }

    const wb = XLSX.read(req.file.buffer, { type: 'buffer' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true })

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'El archivo está vacío o no tiene filas de datos' })
    }

    const existing = await prisma.product.findMany({ select: { id: true, name: true, sku: true } })
    const byName = new Map()
    const bySku = new Map()
    for (const p of existing) {
      byName.set(normalizeHeader(p.name), p.id)
      if (p.sku) bySku.set(normalizeHeader(p.sku), p.id)
    }

    const created = []
    const updated = []
    const errors = []
    const seenName = new Set()
    const seenSku = new Set()

    rows.forEach((row, i) => {
      const rowNum = i + 2
      try {
        const name = parseText(pick(row, ['nombre', 'name', 'producto', 'product']))
        const sku = parseText(pick(row, ['sku', 'codigo', 'code', 'id', 'ref'])) || null
        const precioBase = parsePrice(pick(row, ['precio base', 'preciobase', 'precio_base', 'precio minorista', 'preciominorista', 'precio_minorista', 'precio']))
        const precioMayorista = parsePrice(pick(row, ['precio mayorista', 'preciomayorista', 'precio_mayorista', 'precio mayor']))
        const precioCosto = parsePrice(pick(row, ['precio costo', 'preciocosto', 'precio_costo', 'costo', 'cost']))

        if (!name) throw new Error('falta el nombre')
        if (precioBase == null || precioMayorista == null || precioCosto == null) {
          throw new Error('faltan los precios (base, mayorista y costo)')
        }

        const normName = normalizeHeader(name)
        if (seenName.has(normName)) {
          errors.push({ row: rowNum, reason: 'nombre duplicado dentro del archivo' })
          return
        }
        seenName.add(normName)

        if (sku) {
          const normSku = normalizeHeader(sku)
          if (seenSku.has(normSku)) {
            errors.push({ row: rowNum, reason: 'sku duplicado dentro del archivo' })
            return
          }
          seenSku.add(normSku)
        }

        const existingId = byName.get(normName) || (sku && bySku.get(normalizeHeader(sku)))
        if (existingId) {
          updated.push({ id: existingId, name, sku, precioBase, precioMayorista, precioCosto })
        } else {
          created.push({ name, sku, precioBase, precioMayorista, precioCosto, stock: 0, active: true })
        }
      } catch (err) {
        errors.push({ row: rowNum, reason: err.message })
      }
    })

    let createdCount = 0
    let updatedCount = 0

    if (created.length > 0) {
      try {
        const result = await prisma.product.createMany({ data: created })
        createdCount = result.count
      } catch (e) {
        if (e.code === 'P2002') {
          for (const c of created) {
            try {
              await prisma.product.create({ data: c })
              createdCount++
            } catch (err2) {
              errors.push({ row: 0, reason: err2.code === 'P2002' ? `"${c.name}" ya existe o su sku está duplicado` : err2.message })
            }
          }
        } else {
          throw e
        }
      }
    }

    if (updated.length > 0) {
      for (const u of updated) {
        await prisma.product.update({
          where: { id: u.id },
          data: {
            name: u.name,
            ...(u.sku ? { sku: u.sku } : {}),
            precioBase: u.precioBase,
            precioMayorista: u.precioMayorista,
            precioCosto: u.precioCosto,
          },
        })
        updatedCount++
      }
    }

    invalidateProductsAndCategories()

    res.json({
      message: `Carga completada: ${createdCount} creado(s), ${updatedCount} actualizado(s), ${errors.length} con error(es)`,
      created: createdCount,
      updated: updatedCount,
      errors,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message || 'Error al procesar la carga masiva' })
  }
}

module.exports = { upload, bulkUpload }
