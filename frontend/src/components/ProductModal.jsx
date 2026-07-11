import { X, ShoppingCart, Check, Package } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function ProductModal({ product, onClose }) {
  const { add } = useCart()
  const { isWholesale, isAdmin } = useAuth()
  const [added, setAdded] = useState(false)

  const basePrice = product.precioBase || 0
  const wholesalePrice = product.precioMayorista || 0
  const costoPrice = product.precioCosto
  const displayPrice = isAdmin ? basePrice : (isWholesale ? wholesalePrice : basePrice)
  const savings = basePrice - wholesalePrice

  function handleAdd() {
    if (product.stock <= 0) return
    add(product.id, 1, product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors bg-white/80 dark:bg-gray-900/80">
            <X className="w-5 h-5" />
          </button>

          <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center shrink-0">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-6" />
            ) : (
              <Package className="w-24 h-24 text-gray-300 dark:text-gray-600" />
            )}
            {product.category && (
              <span className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full shadow-sm">
                {product.category.name}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
              {product.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{product.description}</p>
              )}
            </div>

            <div className="mt-auto pt-6 space-y-3">
              <div className="space-y-1">
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
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">${displayPrice.toLocaleString('es-CL')}</span>
                      {isWholesale && basePrice > wholesalePrice && (
                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through">${basePrice.toLocaleString('es-CL')}</span>
                      )}
                    </>
                  )}
                </div>

                {!isAdmin && isWholesale && savings > 0 && (
                  <span className="inline-block bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Ahorras ${savings.toLocaleString('es-CL')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`text-sm ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {product.stock > 0 ? `📦 ${product.stock} disponibles` : '❌ Agotado'}
                </span>
              </div>

              {!isAdmin && (
                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    product.stock <= 0
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                  }`}
                >
                  {product.stock <= 0 ? (
                    'Agotado'
                  ) : added ? (
                    <><Check className="w-4 h-4" /> Agregado</>
                  ) : (
                    <><ShoppingCart className="w-4 h-4" /> Agregar al carrito</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}