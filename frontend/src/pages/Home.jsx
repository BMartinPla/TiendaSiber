import React, { useState, useEffect } from 'react'
import { getProducts, getCategories } from '../services/api'
import ProductCard from '../components/ProductCard'
import Cart from '../components/Cart'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCart, setShowCart] = useState(false)
  const { isAdmin } = useAuth()

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods)
        setCategories(cats)
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])

  function handleCategoryChange(categoryId) {
    setSelectedCategory(categoryId)
    setLoading(true)
    const params = categoryId ? `?categoryId=${categoryId}` : ''
    getProducts(params)
      .then(setProducts)
      .catch((err) => setError(err.response?.data?.error || 'Error al filtrar'))
      .finally(() => setLoading(false))
  }

  if (loading) {
    return <div style={styles.loading}>Cargando productos...</div>
  }

  if (error) {
    return <div style={styles.error}>{error}</div>
  }

  return (
    <div>
      <div style={styles.topBar}>
        <h2 style={styles.title}>🛍️ Nuestros Productos</h2>
        <button onClick={() => setShowCart(!showCart)} style={styles.cartToggle}>
          {showCart ? '📋 Ver productos' : '🛒 Ver carrito'}
        </button>
      </div>

      {isAdmin && (
        <div style={styles.adminBanner}>
          🔧 Vista Admin - Todos los precios visibles
        </div>
      )}

      <div style={styles.filterBar}>
        <label style={styles.filterLabel}>Filtrar por categoría:</label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {showCart ? (
        <Cart />
      ) : (
        <>
          {products.length === 0 ? (
            <p style={styles.empty}>No hay productos disponibles</p>
          ) : (
            <div style={styles.grid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    margin: 0,
    color: '#1a1a2e',
  },
  cartToggle: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  adminBanner: {
    background: '#fff3e0',
    color: '#e65100',
    padding: '8px 16px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: '0.85rem',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: '0.9rem',
    color: '#555',
    fontWeight: 500,
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: '0.9rem',
    background: '#fff',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20,
  },
  loading: {
    textAlign: 'center',
    padding: 40,
    color: '#888',
    fontSize: '1.1rem',
  },
  error: {
    textAlign: 'center',
    padding: 40,
    color: '#e94560',
    fontSize: '1.1rem',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    padding: 40,
  },
}
