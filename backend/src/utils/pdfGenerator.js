const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')

function generateOrderPdf(order) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })

  const logoPath = path.join(__dirname, '../../public/logo.png')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 55 })
  }

  doc.font('Helvetica-Bold').fontSize(20).text('QUINCE GEAR SN', 120, 45)
  doc.font('Helvetica').fontSize(9).fillColor('#888').text('Remito de Pedido', 120, 68)
  doc.fillColor('#000')

  doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#ddd').stroke()
  doc.moveDown(2.5)

  doc.fontSize(9).fillColor('#555')
  doc.text(`Pedido N°: ${order.id}`, 50, doc.y, { continued: true })
  doc.text(`   |   ${new Date(order.createdAt).toLocaleString('es-AR')}`, { align: 'left' })
  const statusText = order.status === 'APPROVED' ? 'Aprobado' : 'Pendiente'
  const statusColor = order.status === 'APPROVED' ? '#059669' : '#d97706'
  doc.fillColor(statusColor).font('Helvetica-Bold').text(`Estado: ${statusText}`, { align: 'right' })
  doc.fillColor('#000').font('Helvetica')
  doc.moveDown(1.5)

  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#eee').stroke()
  doc.moveDown(1.2)

  doc.font('Helvetica-Bold').fontSize(11).text('Datos del Cliente')
  doc.moveDown(0.3)
  doc.font('Helvetica').fontSize(9)
  doc.text(`Nombre: ${order.user.name}`, 50, doc.y)
  doc.text(`Email: ${order.user.email}`, 50, doc.y + 12)
  if (order.user.phone) {
    doc.text(`Teléfono: ${order.user.phone}`, 50, doc.y + 24)
  }
  const condY = doc.y + (order.user.phone ? 36 : 24)
  doc.text(`Condición: ${order.clientCondition === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}`, 50, condY)

  doc.moveDown(2.5)

  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#eee').stroke()
  doc.moveDown(1)

  doc.font('Helvetica-Bold').fontSize(11).text('Productos')
  doc.moveDown(0.8)

  const tLeft = 50
  const tRight = 545
  const colW = [280, 55, 80, 80]
  const colX = [tLeft]
  for (let i = 1; i < colW.length; i++) {
    colX.push(colX[i - 1] + colW[i - 1])
  }

  doc.rect(tLeft, doc.y, tRight - tLeft, 16).fill('#f3f4f6')
  doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8)
  const hY = doc.y + 4
  doc.text('Producto', colX[0] + 6, hY)
  doc.text('Cant.', colX[1] + 5, hY, { width: colW[1] - 10, align: 'center' })
  doc.text('P. Unit', colX[2] + 5, hY, { width: colW[2] - 10, align: 'right' })
  doc.text('Subtotal', colX[3] + 5, hY, { width: colW[3] - 10, align: 'right' })
  doc.fillColor('#000')

  let rowY = doc.y + 16

  doc.font('Helvetica').fontSize(8)
  order.items.forEach((item, i) => {
    if (rowY > 700) {
      doc.addPage()
      rowY = 50
    }

    doc.text(item.productName, colX[0] + 6, rowY + 2, { width: colW[0] - 12 })
    const textEnd = doc.y

    doc.text(String(item.quantity), colX[1] + 5, rowY + 2, { width: colW[1] - 10, align: 'center' })
    doc.text(`$${Number(item.unitPrice).toLocaleString('es-CL')}`, colX[2] + 5, rowY + 2, { width: colW[2] - 10, align: 'right' })
    doc.text(`$${Number(item.subtotal).toLocaleString('es-CL')}`, colX[3] + 5, rowY + 2, { width: colW[3] - 10, align: 'right' })

    const rowH = Math.max(textEnd - rowY, 14) + 2
    doc.moveTo(tLeft, rowY + rowH).lineTo(tRight, rowY + rowH).strokeColor('#eee').stroke()
    rowY += rowH
  })

  doc.moveTo(tLeft, rowY).lineTo(tRight, rowY).strokeColor('#ddd').stroke()
  rowY += 10

  doc.font('Helvetica-Bold').fontSize(12)
  doc.text(`Total: $${Number(order.total).toLocaleString('es-CL')}`, tRight - 5, rowY, { align: 'right' })
  rowY += 25

  doc.font('Helvetica').fontSize(8).fillColor('#999')
  doc.text('Gracias por elegirnos!', 50, rowY, { align: 'center' })

  doc.end()
  return doc
}

module.exports = { generateOrderPdf }
