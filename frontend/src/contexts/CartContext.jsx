import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart as clearCartApi } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

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

  async function add(productId, quantity = 1) {
    await addToCart(productId, quantity)
    await fetchCart()
  }

  async function update(id, quantity) {
    await updateCartItem(id, quantity)
    await fetchCart()
  }

  async function remove(id) {
    await removeCartItem(id)
    await fetchCart()
  }

  async function clear() {
    await clearCartApi()
    setItems([])
    setTotal(0)
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, total, loading, itemCount, add, update, remove, clear, refresh: fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider')
  return context
}
