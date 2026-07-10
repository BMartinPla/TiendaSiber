import React from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { openWhatsApp } from '../services/whatsapp'

export default function Cart() {
  const { items, total, loading, update, remove, clear } = useCart()
  const { user } = useAuth()

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
        {items.map((item) => (
          <div key={item.id} style={styles.item}>
            <div style={styles.itemInfo}>
              <strong>{item.product.name}</strong>
              <span style={styles.itemPrice}>
                ${(item.product.pricing?.unitPrice || item.product.precioBase).toLocaleString('es-CL')} c/u
              </span>
            </div>

            <div style={styles.quantityControl}>
              <button
                onClick={() => update(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                style={styles.qtyBtn}
              >
                −
              </button>
              <span style={styles.qty}>{item.quantity}</span>
              <button
                onClick={() => update(item.id, item.quantity + 1)}
                style={styles.qtyBtn}
              >
                +
              </button>
            </div>

            <div style={styles.itemTotal}>
              ${(
                (item.product.pricing?.unitPrice || item.product.precioBase) * item.quantity
              ).toLocaleString('es-CL')}
            </div>

            <button onClick={() => remove(item.id)} style={styles.removeBtn}>✕</button>
          </div>
        ))}
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
  container: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    padding: 20,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #eee',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#1a1a2e',
  },
  clearBtn: {
    background: 'transparent',
    border: '1px solid #e94560',
    color: '#e94560',
    padding: '6px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  itemPrice: {
    fontSize: '0.8rem',
    color: '#888',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontWeight: 'bold',
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'right',
    color: '#1a1a2e',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#e94560',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: 4,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: '2px solid #eee',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  whatsappBtn: {
    width: '100%',
    padding: '14px',
    background: '#25d366',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '1.05rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
  emptyCart: {
    textAlign: 'center',
    color: '#888',
    padding: 40,
  },
}
