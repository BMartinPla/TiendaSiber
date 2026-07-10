const { getPricingStrategy } = require('../strategies/pricingStrategy')

const STORE_NAME = 'Tienda Siber'
const STORE_PHONE = '56912345678'

function formatCartMessage(cartItems, user) {
  const strategy = getPricingStrategy(user.role)
  const roleLabel = { RETAIL: 'Minorista', WHOLESALE: 'Mayorista', ADMIN: 'Admin' }[user.role] || 'Cliente'

  const lines = []
  lines.push(`🛍️ *${STORE_NAME}*`)
  lines.push(`👤 *Cliente:* ${user.name}`)
  lines.push(`📧 ${user.email}`)
  lines.push(`🏷️ *Tipo:* ${roleLabel}`)
  lines.push('')
  lines.push('━'.repeat(30))
  lines.push('')

  let totalGeneral = 0

  cartItems.forEach((item, index) => {
    const pricing = strategy.getPrice(item.product, item.quantity)
    const subtotal = pricing.total || 0
    totalGeneral += subtotal

    lines.push(`*${index + 1}. ${item.product.name}*`)
    lines.push(`   📦 Cantidad: ${item.quantity}`)
    lines.push(`   💰 Precio unit: $${(pricing.unitPrice || 0).toLocaleString('es-CL')}`)
    lines.push(`   💵 Subtotal: $${subtotal.toLocaleString('es-CL')}`)
    lines.push('')
  })

  lines.push('━'.repeat(30))
  const discountLabel = user.role === 'WHOLESALE' ? ' (Precio Mayorista)' : ''
  lines.push(`💲 *TOTAL${discountLabel}:* $${totalGeneral.toLocaleString('es-CL')}`)
  lines.push('')
  lines.push('✅ *¡Gracias por tu compra!*')
  lines.push('📱 Te contactaremos a la brevedad para coordinar el despacho.')

  return lines.join('\n')
}

function generateWhatsAppUrl(cartItems, user, phone = STORE_PHONE) {
  const message = formatCartMessage(cartItems, user)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

module.exports = { formatCartMessage, generateWhatsAppUrl, STORE_PHONE }
