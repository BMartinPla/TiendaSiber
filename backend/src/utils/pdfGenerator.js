const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')

function generateOrderPdf(order) {
  const doc = new PDFDocument({ margin: 50 })

  const logoPath = path.join(__dirname, '../../public/logo.png')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 50 })
  }

  doc.font('Helvetica-Bold').fontSize(18).text('Quince Gear SN', 115, 50)
  doc.fontSize(9).font('Helvetica').fillColor('#666').text('Remito de Pedido', 115, 70)
  doc.fillColor('#000')
  doc.moveDown(1.5)

  doc.fontSize(8).fillColor('#666').text(`Pedido #${order.id} - ${new Date(order.createdAt).toLocaleString('es-AR')}`, { align: 'center' })
  doc.fillColor('#000')
  doc.moveDown(1.5)

  doc.fontSize(10).font('Helvetica-Bold').text('Datos del Cliente')
  doc.font('Helvetica').fontSize(9)
  doc.text(`Nombre: ${order.user.name}`)
  doc.text(`Email: ${order.user.email}`)
  if (order.user.phone) doc.text(`Teléfono: ${order.user.phone}`)
  doc.text(`Condición: ${order.clientCondition === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}`)
  doc.moveDown(1.5)

  doc.font('Helvetica-Bold').fontSize(10).text('Productos')
  doc.moveDown(0.5)

  const tableTop = doc.y
  const colProduct = 50
  const colQty = 330
  const colPrice = 400
  const colSubtotal = 470

  doc.font('Helvetica-Bold').fontSize(8)
  doc.text('Producto', colProduct, tableTop)
  doc.text('Cant.', colQty, tableTop, { width: 50, align: 'center' })
  doc.text('P. Unit', colPrice, tableTop, { width: 60, align: 'right' })
  doc.text('Subtotal', colSubtotal, tableTop, { width: 60, align: 'right' })

  const lineY = doc.y + 3
  doc.moveTo(colProduct, lineY).lineTo(530, lineY).strokeColor('#ccc').stroke()
  doc.moveDown(0.8)

  doc.font('Helvetica').fontSize(8)
  order.items.forEach((item) => {
    if (doc.y > 700) {
      doc.addPage()
    }
    const rowY = doc.y
    doc.text(item.productName, colProduct, rowY, { width: 270 })
    doc.text(String(item.quantity), colQty, rowY, { width: 50, align: 'center' })
    doc.text(`$${Number(item.unitPrice).toLocaleString('es-CL')}`, colPrice, rowY, { width: 60, align: 'right' })
    doc.text(`$${Number(item.subtotal).toLocaleString('es-CL')}`, colSubtotal, rowY, { width: 60, align: 'right' })
    doc.moveDown(1.2)
  })

  const totalLineY = doc.y + 5
  doc.moveTo(colProduct, totalLineY).lineTo(530, totalLineY).strokeColor('#ccc').stroke()
  doc.moveDown(0.8)

  doc.font('Helvetica-Bold').fontSize(12)
  doc.text(`Total: $${Number(order.total).toLocaleString('es-CL')}`, 400, doc.y, { align: 'right' })
  doc.moveDown(0.5)

  doc.font('Helvetica').fontSize(8).fillColor('#666')
  doc.text(`Estado: ${order.status === 'APPROVED' ? 'Aprobado' : 'Pendiente'}`, { align: 'center' })
  doc.fillColor('#000')
  doc.moveDown(2)
  doc.fontSize(8).fillColor('#999').text('Gracias por elegirnos!', { align: 'center' })

  doc.end()
  return doc
}

module.exports = { generateOrderPdf }
