const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')

function generateOrderPdf(order) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' })
  const pw = doc.page.width - 80

  let y = 40

  const logoPath = path.join(__dirname, '../../public/logo.png')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, y, { width: 55 })
  }

  doc.font('Helvetica-Bold').fontSize(22).text('QUINCE GEAR SN', 110, y + 5)
  doc.font('Helvetica').fontSize(10).fillColor('#888').text('REMITO DE PEDIDO', 110, y + 32)
  doc.fillColor('#000')

  y = 90
  doc.moveTo(40, y).lineTo(40 + pw, y).strokeColor('#ddd').stroke()

  y += 15
  doc.font('Helvetica').fontSize(9).fillColor('#555')
  doc.text(`Pedido N°: ${order.id}  |  ${new Date(order.createdAt).toLocaleString('es-AR')}`, 40, y)

  const statusLabel = order.status === 'APPROVED' ? 'APROBADO' : 'PENDIENTE'
  doc.fillColor(order.status === 'APPROVED' ? '#059669' : '#d97706')
  doc.font('Helvetica-Bold').fontSize(9).text(statusLabel, 40 + pw - 80, y, { width: 80, align: 'right' })
  doc.fillColor('#000').font('Helvetica')

  y += 25
  doc.moveTo(40, y).lineTo(40 + pw, y).strokeColor('#eee').stroke()

  y += 20
  doc.font('Helvetica-Bold').fontSize(11).text('DATOS DEL CLIENTE', 40, y)
  y += 20
  doc.font('Helvetica').fontSize(9)
  const cl = [
    `Nombre: ${order.user.name}`,
    `Email: ${order.user.email}`,
    ...(order.user.phone ? [`Teléfono: ${order.user.phone}`] : []),
    `Condición: ${order.clientCondition === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}`,
  ]
  cl.forEach((line, i) => doc.text(line, 40, y + i * 14))
  y += cl.length * 14 + 12

  doc.moveTo(40, y).lineTo(40 + pw, y).strokeColor('#eee').stroke()

  y += 18
  doc.font('Helvetica-Bold').fontSize(11).text('PRODUCTOS', 40, y)
  y += 22

  const cols = [
    { x: 40, w: 290, align: 'left', label: 'Producto' },
    { x: 330, w: 60, align: 'center', label: 'Cant.' },
    { x: 390, w: 85, align: 'right', label: 'P. Unit.' },
    { x: 475, w: 85, align: 'right', label: 'Subtotal' },
  ]
  const tableRight = cols[cols.length - 1].x + cols[cols.length - 1].w

  doc.rect(40, y - 4, tableRight - 40, 18).fill('#f3f4f6')
  doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8)
  cols.forEach((c) => doc.text(c.label, c.x + (c.align === 'right' ? 5 : 6), y, { width: c.w - 10, align: c.align }))
  doc.fillColor('#000').font('Helvetica').fontSize(8)

  y += 18

  order.items.forEach((item) => {
    if (y > 720) {
      doc.addPage()
      y = 40
    }

    doc.text(item.productName, cols[0].x + 6, y + 2, { width: cols[0].w - 12 })
    const textBottom = doc.y
    const rowH = Math.max(textBottom - y + 2, 16)

    doc.text(String(item.quantity), cols[1].x + 5, y + 2, { width: cols[1].w - 10, align: 'center' })
    doc.text(`$${Number(item.unitPrice).toLocaleString('es-CL')}`, cols[2].x + 5, y + 2, { width: cols[2].w - 10, align: 'right' })
    doc.text(`$${Number(item.subtotal).toLocaleString('es-CL')}`, cols[3].x + 5, y + 2, { width: cols[3].w - 10, align: 'right' })

    doc.moveTo(40, y + rowH).lineTo(tableRight, y + rowH).strokeColor('#f0f0f0').stroke()
    y += rowH
  })

  doc.moveTo(40, y).lineTo(tableRight, y).strokeColor('#ccc').stroke()
  y += 14

  doc.font('Helvetica-Bold').fontSize(13)
  doc.text(`TOTAL: $${Number(order.total).toLocaleString('es-CL')}`, tableRight, y, { align: 'right' })

  y += 35

  doc.moveTo(40, y).lineTo(40 + pw, y).strokeColor('#eee').stroke()
  y += 18

  doc.font('Helvetica').fontSize(8).fillColor('#aaa')
  doc.text('Gracias por elegir Quince Gear SN', 40, y, { align: 'center' })

  doc.end()
  return doc
}

module.exports = { generateOrderPdf }
