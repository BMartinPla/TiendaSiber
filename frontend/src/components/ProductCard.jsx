import React, { useState } from 'react'
import { ShoppingCart, Check, Package } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

const staggerMs = [50, 100, 150, 200, 250, 300, 350, 400]

export default function ProductCard({ product, onView, index = 0 }) {
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
    <div onClick={onView} className="card-hover animate-fadeIn bg-white dark:bg-gray-950/20 dark:backdrop-blur-md rounded-2xl border border-gray-100 dark:border-blue-400/15 overflow-hidden flex flex-col cursor-pointer group dark:shadow-2xl" style={{ animationDelay: `${staggerMs[index % 8]}ms` }}>
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-blue-500/10 flex items-center justify-center overflow-hidden m-2 rounded-2xl">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500 rounded-2xl" />
        ) : (
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Agotado</span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Últimos {product.stock}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pb-3 flex flex-col flex-1 gap-1">
        {product.category && (
          <p className="text-[10px] text-accent-600/80 dark:text-accent-400/80 uppercase tracking-wider font-semibold">{product.category.name}</p>
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
          <p className={`text-[11px] ${product.stock > 0 ? 'text-accent-600 dark:text-accent-400' : 'text-red-500 dark:text-red-400'}`}>
            {product.stock > 0 ? `En stock (${product.stock})` : 'Sin stock'}
          </p>
        </div>

        {/* Add to cart button */}
        {!isAdmin && (
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              product.stock <= 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : added
                ? 'bg-accent-600 text-white'
                : 'text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-sm shadow-accent-500/25 active:scale-[0.97]'
            }`}
          >
            {product.stock <= 0 ? (
              'Agotado'
            ) : added ? (
              <span className="inline-flex items-center gap-1.5 animate-popIn">
                <Check className="w-3.5 h-3.5" /> Agregado
              </span>
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
