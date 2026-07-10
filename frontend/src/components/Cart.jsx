import React, { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { openWhatsApp } from '../services/whatsapp'

export default function Cart() {
  const { items, total, loading, update, remove, clear } = useCart()
  const { user } = useAuth()
  const [localQtys, setLocalQtys] = useState({})

  function getQty(itemId) {
    if (localQtys[itemId] !== undefined) return localQtys[itemId]
    const item = items.find((i) => i.id === itemId)
    return item ? item.quantity : 1
  }

  function handleQtyChange(itemId, value) {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1) return
    setLocalQtys((prev) => ({ ...prev, [itemId]: num }))
  }

  function handleQtyBlur(itemId) {
    const qty = getQty(itemId)
    const item = items.find((i) => i.id === itemId)
    if (item && qty !== item.quantity) {
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
    setLocalQtys((prev) => ({ ...prev, [itemId]: next }))
    update(itemId, next)
  }

  async function handleWhatsApp() {
    if (items.length === 0) {
      alert('El carrito está vacío')
      return
    }
    const cartData = items.map((item) => ({
      quantity: item.quantity,
      product: item.product,
    }))
    openWhatsApp(cartData, user)
  }

  if (loading) return <div style={styles.loading}>Cargando carrito...</div>

  if (items.length === 0) {
    return (
      <div style={styles.emptyCart}>
        <span style={{ fontSize: '3rem' }}>🛒</span>
        <p>Tu carrito está vacío</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🛒 Carrito de Compras</h2>
        <button onClick={clear} style={styles.clearBtn}>Vaciar carrito</button>
      </div>

      <div style={styles.items}>
        {items.map((item) => {
          const qty = getQty(item.id)
          const unitPrice = item.product.pricing?.unitPrice || item.product.precioBase
          return (
            <div key={item.id} style={styles.item}>
              <div style={styles.itemInfo}>
                <strong>{item.product.name}</strong>
                <span style={styles.itemPrice}>
                  ${unitPrice.toLocaleString('es-CL')} c/u
                </span>
              </div>

              <div style={styles.quantityControl}>
                <button onClick={() => handleStep(item.id, -1)} disabled={qty <= 1} style={styles.qtyBtn}>−</button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => handleQtyChange(item.id, e.target.value)}
                  onBlur={() => handleQtyBlur(item.id)}
                  style={styles.qtyInput}
                />
                <button onClick={() => handleStep(item.id, 1)} style={styles.qtyBtn}>+</button>
              </div>

              <div style={styles.itemTotal}>
                ${(unitPrice * qty).toLocaleString('es-CL')}
              </div>

              <button onClick={() => remove(item.id)} style={styles.removeBtn}>✕</button>
            </div>
          )
        })}
      </div>

      <div style={styles.footer}>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total</span>
          <span style={styles.totalAmount}>${total.toLocaleString('es-CL')}</span>
        </div>
        <button onClick={handleWhatsApp} style={styles.whatsappBtn}>
          💬 Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 20 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #eee',
  },
  title: { margin: 0, fontSize: '1.2rem', color: '#1a1a2e' },
  clearBtn: {
    background: 'transparent', border: '1px solid #e94560', color: '#e94560',
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem',
  },
  items: { display: 'flex', flexDirection: 'column', gap: 10 },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0', borderBottom: '1px solid #f0f0f0',
  },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  itemPrice: { fontSize: '0.8rem', color: '#888' },
  quantityControl: { display: 'flex', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: '50%', border: '1px solid #ddd',
    background: '#fff', cursor: 'pointer', fontSize: '1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyInput: {
    width: 50, textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem',
    border: '1px solid #ccc', borderRadius: 6, padding: '4px 2px',
    outline: 'none',
  },
  itemTotal: { fontWeight: 'bold', minWidth: 80, textAlign: 'right', color: '#1a1a2e' },
  removeBtn: {
    background: 'transparent', border: 'none', color: '#e94560',
    cursor: 'pointer', fontSize: '1rem', padding: 4,
  },
  footer: { marginTop: 16, paddingTop: 16, borderTop: '2px solid #eee' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  totalLabel: { fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a2e' },
  totalAmount: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a2e' },
  whatsappBtn: {
    width: '100%', padding: '14px', background: '#25d366', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer',
  },
  loading: { textAlign: 'center', color: '#888', padding: 20 },
  emptyCart: { textAlign: 'center', color: '#888', padding: 40 },
}
