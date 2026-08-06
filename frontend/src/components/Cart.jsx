import React, { useState, useEffect } from 'react'
import { X, Minus, Plus, Trash2, MessageCircle, CheckCircle, XCircle, ShoppingCart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { createOrderFromCart } from '../services/api'
import { generateWhatsAppUrl } from '../services/whatsapp'

export default function Cart({ open, onClose }) {
  const { items, loading, syncing, update, remove, clear } = useCart()
  const { user, isWholesale } = useAuth()
  const [localQtys, setLocalQtys] = useState({})
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    if (!open) { setLocalQtys({}); setOrderError('') }
  }, [open])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  function getQty(itemId) {
    if (localQtys[itemId] !== undefined) return localQtys[itemId]
    const item = items.find((i) => i.id === itemId)
    return item ? item.quantity : 1
  }

  const localTotal = items.reduce((sum, item) => {
    const unitPrice = item.product.pricing?.unitPrice || item.product.precioBase || 0
    return sum + unitPrice * getQty(item.id)
  }, 0)

  const totalSavings = items.reduce((sum, item) => {
    const base = item.product.precioBase || 0
    const wholesale = item.product.precioMayorista || 0
    if (base > wholesale) return sum + (base - wholesale) * getQty(item.id)
    return sum
  }, 0)

  const localCount = items.reduce((sum, item) => sum + getQty(item.id), 0)

  function handleQtyChange(itemId, value) {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1) return
    setLocalQtys((prev) => ({ ...prev, [itemId]: num }))
  }

  function handleQtyBlur(itemId) {
    const qty = getQty(itemId)
    const item = items.find((i) => i.id === itemId)
    if (item && qty !== item.quantity) {
      if (item?.product?.stock != null && qty > item.product.stock) {
        setLocalQtys((prev) => ({ ...prev, [itemId]: item.quantity }))
        return
      }
      update(itemId, qty)
    }
    setLocalQtys((prev) => {
      const copy = { ...prev }
      delete copy[itemId]
      return copy
    })
  }

  function handleStep(itemId, delta) {
    const current = getQty(itemId)
    const next = current + delta
    if (next < 1) return
    const item = items.find((i) => i.id === itemId)
    if (delta > 0 && item?.product?.stock != null && next > item.product.stock) return
    setLocalQtys((prev) => ({ ...prev, [itemId]: next }))
    update(itemId, next)
  }

  async function handleWhatsApp() {
    if (items.length === 0 || syncing) return
    try {
      if (!user) {
        window.open(
          generateWhatsAppUrl(items, { name: 'Invitado', email: 'invitado@quincegearsn.com', role: 'RETAIL' }),
          '_blank'
        )
        setOrderSuccess(true)
        setOrderError('')
        setTimeout(() => setOrderSuccess(false), 3000)
        clear()
        return
      }
      const data = await createOrderFromCart()
      window.open(data.whatsappUrl, '_blank')
      setOrderSuccess(true)
      setOrderError('')
      setTimeout(() => setOrderSuccess(false), 3000)
      clear()
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Error al crear pedido')
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 sm:backdrop-blur-sm transition-opacity" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl dark:shadow-2xl dark:shadow-black/40 transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Carrito</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{localCount} producto(s)</p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clear} className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Vaciar
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-transparent animate-spin" />
                <span>Cargando...</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-3">
              <ShoppingCart className="w-14 h-14 text-gray-300 dark:text-gray-600" />
              <div className="text-center">
                <p className="text-sm font-medium">Tu carrito está vacío</p>
                <p className="text-xs mt-1">Agregá productos para empezar</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const qty = getQty(item.id)
                const unitPrice = item.product.pricing?.unitPrice || item.product.precioBase || 0
                return (
                  <div key={item.id} className="flex items-center gap-2 sm:gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">${unitPrice.toLocaleString('es-CL')} c/u</p>
                  <p className={`text-xs ${item.product.stock > 0 ? 'text-green-500' : 'text-red-400'}`}>
                    {item.product.stock > 0 ? `En stock (${item.product.stock})` : 'Sin stock'}
                  </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStep(item.id, -1)} disabled={qty <= 1} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
                        <Minus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                        onBlur={() => handleQtyBlur(item.id)}
                        className="w-12 text-center text-sm font-semibold bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-900 dark:text-white"
                      />
                      <button onClick={() => handleStep(item.id, 1)} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">${(unitPrice * qty).toLocaleString('es-CL')}</p>
                      {isWholesale && item.product.precioBase > item.product.precioMayorista && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 line-through">${(item.product.precioBase * qty).toLocaleString('es-CL')}</p>
                      )}
                    </div>

                    <button onClick={() => remove(item.id)} className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 space-y-3 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">${localTotal.toLocaleString('es-CL')}</span>
            </div>

            {isWholesale && totalSavings > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Ahorras</span>
                <span className="text-base font-bold text-red-600 dark:text-red-400">${totalSavings.toLocaleString('es-CL')}</span>
              </div>
            )}

            <button
              onClick={handleWhatsApp}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-bold text-white bg-[#25d366] hover:bg-[#20bd5a] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 shadow-lg shadow-[#25d366]/25"
            >
              <MessageCircle className={`w-5 h-5 ${syncing ? 'animate-pulse' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Enviar pedido por WhatsApp'}
            </button>
          </div>
        )}

        {orderSuccess && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2.5 rounded-xl">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Pedido registrado. Revisa WhatsApp para enviarlo.
            </div>
          </div>
        )}

        {orderError && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl">
              <XCircle className="w-4 h-4 shrink-0" />
              {orderError}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
