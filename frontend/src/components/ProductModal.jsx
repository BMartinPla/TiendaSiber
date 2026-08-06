import { X, ShoppingCart, Check, Package } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'

export default function ProductModal({ product, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
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
      <div className="fixed inset-0 z-50 bg-slate-950/55 sm:backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="animate-scaleIn relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-glow border border-gray-100 dark:border-blue-500/15 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 z-10 icon-btn bg-white/90 dark:bg-gray-900/80 shadow-sm">
            <X className="w-5 h-5" />
          </button>

          <div className="relative h-64 bg-gradient-to-br from-gray-50 via-blue-50/50 to-accent-50 dark:from-gray-800 dark:via-blue-950/40 dark:to-gray-700 flex items-center justify-center shrink-0">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-6" />
            ) : (
              <Package className="w-24 h-24 text-gray-300 dark:text-gray-600" />
            )}
            {product.category && (
              <span className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-blue-500/15">
                {product.category.name}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{product.name}</h2>
              {product.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{product.description}</p>
              )}
            </div>

            <div className="mt-auto pt-6 space-y-3">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
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
                        Minorista: ${basePrice.toLocaleString('es-CL')}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-display text-2xl font-bold text-gray-900 dark:text-white tracking-tight">${displayPrice.toLocaleString('es-CL')}</span>
                      {isWholesale && basePrice > wholesalePrice && (
                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through">${basePrice.toLocaleString('es-CL')}</span>
                      )}
                    </>
                  )}
                </div>

                {!isAdmin && isWholesale && savings > 0 && (
                  <span className="inline-block bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Ahorras ${savings.toLocaleString('es-CL')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-medium ${(product.stock ?? 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {(product.stock ?? 0) > 0 ? `En stock (${product.stock})` : 'Agotado'}
                </span>
              </div>

              {!isAdmin && (
                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    product.stock <= 0
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : added
                      ? 'bg-accent-600 text-white'
                      : 'btn-accent py-3 shadow-accent-500/25'
                  }`}
                >
                  {product.stock <= 0 ? (
                    'Agotado'
                  ) : added ? (
                    <span className="inline-flex items-center gap-2 animate-popIn"><Check className="w-4 h-4" /> Agregado</span>
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