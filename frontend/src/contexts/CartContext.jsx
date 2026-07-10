import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart as clearCartApi } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pendingOps, setPendingOps] = useState(0)

  const syncing = pendingOps > 0

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([])
      setTotal(0)
      return
    }
    setLoading(true)
    try {
      const data = await getCart()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch {
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  function trackOp(promise) {
    setPendingOps((prev) => prev + 1)
    return promise.finally(() => setPendingOps((prev) => prev - 1))
  }

  function reconcileAdd(serverItem, productId, product) {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.product.id === productId)
      if (idx !== -1) {
        const updated = [...prev]
        updated[idx] = {
          id: serverItem.id,
          quantity: Math.max(serverItem.quantity, prev[idx].quantity),
          product: {
            ...(product || prev[idx].product),
            pricing: prev[idx].product.pricing || {},
          },
        }
        return updated
      }
      return [...prev, {
        id: serverItem.id,
        quantity: serverItem.quantity,
        product: {
          ...product,
          pricing: product?.pricing || {},
        },
      }]
    })
  }

  function add(productId, quantity = 1, product = null) {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.product.id === productId)
      if (idx !== -1) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity }
        return updated
      }
      if (product) {
        return [...prev, {
          id: `temp-${Date.now()}`,
          quantity,
          product: { ...product, pricing: product.pricing || {} },
        }]
      }
      return prev
    })
    trackOp(
      addToCart(productId, quantity).then((serverItem) => {
        reconcileAdd(serverItem, productId, product)
      }).catch(fetchCart)
    )
  }

  function update(id, quantity) {
    trackOp(
      updateCartItem(id, quantity).then(() => {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        )
      }).catch(fetchCart)
    )
  }

  function remove(id) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    trackOp(
      removeCartItem(id).catch(fetchCart)
    )
  }

  function clear() {
    setItems([])
    setTotal(0)
    trackOp(clearCartApi().catch(() => {}))
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, total, loading, syncing, itemCount, add, update, remove, clear, refresh: fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider')
  return context
}
