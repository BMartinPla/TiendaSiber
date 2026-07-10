class PricingStrategy {
  getPrice(product, quantity = 1) {
    throw new Error('Method getPrice() must be implemented')
  }
}

class RetailPricingStrategy extends PricingStrategy {
  getPrice(product, quantity = 1) {
    return {
      unitPrice: product.precioBase,
      total: product.precioBase * quantity,
      label: 'Precio Minorista',
    }
  }
}

class WholesalePricingStrategy extends PricingStrategy {
  getPrice(product, quantity = 1) {
    return {
      unitPrice: product.precioMayorista,
      total: product.precioMayorista * quantity,
      label: 'Precio Mayorista',
    }
  }
}

class AdminPricingStrategy extends PricingStrategy {
  getPrice(product, quantity = 1) {
    return {
      unitPrice: product.precioBase,
      wholesaleUnitPrice: product.precioMayorista,
      total: product.precioBase * quantity,
      totalWholesale: product.precioMayorista * quantity,
      label: 'Precio Admin (visibilidad completa)',
    }
  }
}

const strategyMap = {
  RETAIL: RetailPricingStrategy,
  WHOLESALE: WholesalePricingStrategy,
  ADMIN: AdminPricingStrategy,
}

function getPricingStrategy(role) {
  const Strategy = strategyMap[role] || RetailPricingStrategy
  return new Strategy()
}

module.exports = { getPricingStrategy, PricingStrategy }
