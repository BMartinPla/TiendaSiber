import React, { useState } from 'react'
import { ShoppingCart, Check, Package } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function ProductCard({ product, onView }) {
  const { add } = useCart()
  const { isWholesale, isAdmin } = useAuth()
  const [added, setAdded] = useState(false)

  const basePrice = product.precioBase || 0
  const wholesalePrice = product.precioMayorista || 0
  const costoPrice = product.precioCosto
  const displayPrice = isAdmin ? basePrice : (isWholesale ? wholesalePrice : basePrice)
  const savings = basePrice - wholesalePrice

  function handleAdd(e) {
    e.stopPropagation()
    if (product.stock <= 0) return
    add(product.id, 1, product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <div onClick={onView} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col cursor-pointer">
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600" />
        )}
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full shadow-sm">
            {product.category.name}
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            Últimos {product.stock}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="mt-auto space-y-1">
          <div className="flex items-baseline gap-2">
            {isAdmin ? (
              <>
                {costoPrice != null && (
                  <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-medium">
                    Costo: ${costoPrice.toLocaleString('es-CL')}
                  </span>
                )}
                <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-medium">
                  May: ${wholesalePrice.toLocaleString('es-CL')}
                </span>
                <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-medium">
                  Base: ${basePrice.toLocaleString('es-CL')}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${displayPrice.toLocaleString('es-CL')}
                </span>
                {isWholesale && basePrice > wholesalePrice && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                    ${basePrice.toLocaleString('es-CL')}
                  </span>
                )}
              </>
            )}
          </div>

          {!isAdmin && isWholesale && savings > 0 && (
            <span className="inline-block bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              Ahorras ${savings.toLocaleString('es-CL')}
            </span>
          )}

          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-xs ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {product.stock > 0 ? `📦 ${product.stock} disponibles` : '❌ Agotado'}
            </span>
          </div>
        </div>

        {!isAdmin && (
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              product.stock <= 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
            }`}
          >
            {product.stock <= 0 ? (
              'Agotado'
            ) : added ? (
              <>
                <Check className="w-4 h-4" /> Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Agregar al carrito
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
