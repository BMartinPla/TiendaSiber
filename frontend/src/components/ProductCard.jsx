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
    <div onClick={onView} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/30 hover:border-gray-200 dark:hover:border-gray-600 hover:-translate-y-0.5 flex flex-col cursor-pointer group">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden rounded-lg m-1.5">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Agotado</span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Últimos {product.stock}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        {product.category && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{product.category.name}</p>
        )}

        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto space-y-1">
          {/* Admin prices */}
          {isAdmin ? (
            <div className="flex flex-wrap gap-1">
              {costoPrice != null && (
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-medium">
                  Costo: ${costoPrice.toLocaleString('es-CL')}
                </span>
              )}
              <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-medium">
                May: ${wholesalePrice.toLocaleString('es-CL')}
              </span>
              <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-medium">
                Minorista: ${basePrice.toLocaleString('es-CL')}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${displayPrice.toLocaleString('es-CL')}
                </span>
                {isWholesale && basePrice > wholesalePrice && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                    ${basePrice.toLocaleString('es-CL')}
                  </span>
                )}
              </div>
              {isWholesale && savings > 0 && (
                <span className="inline-block bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  Ahorras ${savings.toLocaleString('es-CL')}
                </span>
              )}
            </>
          )}

          {/* Stock */}
          <p className={`text-[11px] ${product.stock > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400'}`}>
            {product.stock > 0 ? `En stock (${product.stock})` : 'Sin stock'}
          </p>
        </div>

        {/* Add to cart button */}
        {!isAdmin && (
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              product.stock <= 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : added
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-[0.98]'
            }`}
          >
            {product.stock <= 0 ? (
              'Agotado'
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" /> Agregar
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
