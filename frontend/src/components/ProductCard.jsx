import React, { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const { isWholesale } = useAuth()
  const [added, setAdded] = useState(false)

  const unitPrice = product.pricing?.unitPrice || product.precioBase
  const wholesalePrice = product.pricing?.wholesaleUnitPrice || product.precioMayorista
  const label = product.pricing?.label || ''

  function handleAdd() {
    if (product.stock <= 0) return
    add(product.id, 1, product)
    setAdded(true)
    setTimeout(() => setAdded(false), 800)
  }

  return (
    <div style={styles.card}>
      <div style={styles.imagePlaceholder}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} style={styles.image} />
          : <span style={styles.imageIcon}>📦</span>
        }
      </div>
      <div style={styles.info}>
        <h3 style={styles.name}>{product.name}</h3>
        {product.category && (
          <span style={styles.categoryBadge}>{product.category.name}</span>
        )}
        {product.description && <p style={styles.desc}>{product.description}</p>}

        <div style={styles.priceRow}>
          <span style={styles.price}>${unitPrice.toLocaleString('es-CL')}</span>
          {label && <span style={styles.label}>{label}</span>}
        </div>

        {isWholesale && wholesalePrice && wholesalePrice !== unitPrice && (
          <div style={styles.wholesaleRow}>
            <span style={styles.wholesaleLabel}>Precio Mayorista:</span>
            <span style={styles.wholesalePrice}>${wholesalePrice.toLocaleString('es-CL')}</span>
          </div>
        )}

        <div style={styles.stockRow}>
          <span style={product.stock > 0 ? styles.inStock : styles.outOfStock}>
            {product.stock > 0 ? `📦 ${product.stock} disponibles` : '❌ Agotado'}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          style={{
            ...styles.addBtn,
            ...(product.stock <= 0 ? styles.disabledBtn : {}),
            ...(added ? styles.addedBtn : {}),
          }}
        >
          {product.stock <= 0 ? 'Agotado' : added ? '✅ Agregado' : '🛒 Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },
  imagePlaceholder: {
    height: 180,
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageIcon: {
    opacity: 0.5,
  },
  info: {
    padding: 16,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    margin: '0 0 6px',
    fontSize: '1.05rem',
    color: '#1a1a2e',
  },
  categoryBadge: {
    display: 'inline-block',
    background: '#e8eaf6',
    color: '#283593',
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: 4,
    marginBottom: 6,
  },
  desc: {
    margin: '0 0 10px',
    fontSize: '0.85rem',
    color: '#777',
    lineHeight: 1.4,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  label: {
    fontSize: '0.75rem',
    background: '#e3f2fd',
    color: '#1565c0',
    padding: '2px 8px',
    borderRadius: 4,
  },
  wholesaleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    fontSize: '0.85rem',
  },
  wholesaleLabel: {
    color: '#2e7d32',
  },
  wholesalePrice: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  stockRow: {
    marginBottom: 12,
    fontSize: '0.8rem',
    flex: 1,
  },
  inStock: { color: '#2e7d32' },
  outOfStock: { color: '#c62828' },
  addBtn: {
    width: '100%',
    padding: '10px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  disabledBtn: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  addedBtn: {
    background: '#2e7d32',
  },
}
