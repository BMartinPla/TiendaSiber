const STORE_NAME = 'Quince Gear SN'
const DEFAULT_PHONE = '5493364517514'

const ROLE_LABELS = {
  RETAIL: 'Minorista',
  WHOLESALE: 'Mayorista',
  ADMIN: 'Admin',
}

function formatCurrency(amount) {
  return '$' + (amount || 0).toLocaleString('es-CL')
}

export function buildWhatsAppMessage(cartItems, user) {
  const lines = []
  lines.push(`🛍️ *${STORE_NAME}*`)
  lines.push(`👤 *Cliente:* ${user.name}`)
  lines.push(`📧 ${user.email}`)
  lines.push(`🏷️ *Tipo:* ${ROLE_LABELS[user.role] || 'Cliente'}`)
  lines.push('📱 Quiero concretar la compra de los siguientes productos:')
  lines.push('')
  lines.push('━'.repeat(30))
  lines.push('')
  lines.push('')

  let total = 0

  cartItems.forEach((item, idx) => {
    const product = item.product || item
    const unitPrice = product.pricing?.unitPrice || product.precioBase || 0
    const qty = item.quantity || 1
    const subtotal = unitPrice * qty
    total += subtotal

    lines.push(`*${idx + 1}. ${product.name}*`)
    lines.push(`   📦 Cantidad: ${qty}`)
    lines.push(`   💰 Precio unit: ${formatCurrency(unitPrice)}`)
    lines.push(`   💵 Subtotal: ${formatCurrency(subtotal)}`)
    lines.push('')
  })

  lines.push('━'.repeat(30))
  const discountNote = user.role === 'WHOLESALE' ? ' (Precio Mayorista)' : ''
  lines.push(`💲 *TOTAL${discountNote}:* ${formatCurrency(total)}`)
  lines.push('')
  lines.push('✅ *¡Gracias por elegirnos!*')
  lines.push('📱 Te contactaremos a la brevedad para coordinar el despacho.')

  return lines.join('\n')
}

export function generateWhatsAppUrl(cartItems, user, phone = DEFAULT_PHONE) {
  const message = buildWhatsAppMessage(cartItems, user)
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function openWhatsApp(cartItems, user, phone) {
  const url = generateWhatsAppUrl(cartItems, user, phone)
  window.open(url, '_blank')
}
