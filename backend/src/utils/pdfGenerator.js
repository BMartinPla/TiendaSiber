const PDFDocument = require('pdfkit')

function generateOrderPdf(order) {
  const doc = new PDFDocument({ margin: 50 })

  doc.font('Helvetica-Bold').fontSize(20).text('Quince Gear SN', { align: 'center' })
  doc.fontSize(10).font('Helvetica').text('Remito de Pedido', { align: 'center' })
  doc.moveDown(0.5)
  doc.fontSize(8).fillColor('#666').text(`Pedido #${order.id} - ${new Date(order.createdAt).toLocaleString('es-AR')}`, { align: 'center' })
  doc.fillColor('#000')
  doc.moveDown(1)

  doc.fontSize(10).font('Helvetica-Bold').text('Datos del Cliente')
  doc.font('Helvetica').fontSize(9)
  doc.text(`Nombre: ${order.user.name}`)
  doc.text(`Email: ${order.user.email}`)
  if (order.user.phone) doc.text(`Teléfono: ${order.user.phone}`)
  doc.text(`Condición: ${order.clientCondition === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}`)
  doc.moveDown(1)

  doc.font('Helvetica-Bold').fontSize(10).text('Productos')
  doc.moveDown(0.3)

  const tableTop = doc.y
  const colX = [50, 280, 360, 430, 500]
  const headers = ['Producto', 'Cantidad', 'P. Unit', 'Subtotal']

  doc.font('Helvetica-Bold').fontSize(8)
  doc.text('Producto', colX[0], tableTop)
  doc.text('Cantidad', colX[1], tableTop, { width: 70, align: 'center' })
  doc.text('P. Unit', colX[2], tableTop, { width: 70, align: 'right' })
  doc.text('Subtotal', colX[3], tableTop, { width: 70, align: 'right' })

  doc.moveDown(0.3)
  const lineY = doc.y
  doc.moveTo(colX[0], lineY).lineTo(520, lineY).strokeColor('#ccc').stroke()
  doc.moveDown(0.5)

  doc.font('Helvetica').fontSize(8)
  order.items.forEach((item) => {
    const y = doc.y
    if (y > 700) {
      doc.addPage()
      doc.y = 50
    }
    doc.text(item.productName, colX[0], doc.y, { width: 220 })
    doc.text(String(item.quantity), colX[1], doc.y - 12, { width: 70, align: 'center' })
    doc.text(`$${item.unitPrice.toLocaleString('es-CL')}`, colX[2], doc.y - 12, { width: 70, align: 'right' })
    doc.text(`$${item.subtotal.toLocaleString('es-CL')}`, colX[3], doc.y - 12, { width: 70, align: 'right' })
    doc.moveDown(0.8)
  })

  const totalY = doc.y + 5
  doc.moveTo(colX[0], totalY).lineTo(520, totalY).strokeColor('#ccc').stroke()
  doc.moveDown(0.5)

  doc.font('Helvetica-Bold').fontSize(11)
  doc.text(`Total: $${order.total.toLocaleString('es-CL')}`, 430, doc.y, { align: 'right' })
  doc.moveDown(0.3)

  doc.font('Helvetica').fontSize(8).fillColor('#666')
  doc.text(`Estado: ${order.status === 'APPROVED' ? 'Aprobado' : 'Pendiente'}`, { align: 'center' })
  doc.fillColor('#000')
  doc.moveDown(2)
  doc.fontSize(8).fillColor('#999').text('Gracias por elegirnos!', { align: 'center' })

  doc.end()
  return doc
}

module.exports = { generateOrderPdf }
