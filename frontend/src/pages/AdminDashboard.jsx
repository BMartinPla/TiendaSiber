import React, { useState, useEffect } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  updateProductPrice,
  bulkUpdatePrices,
  suspendProduct,
  restoreProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  suspendCategory,
  restoreCategory,
  deleteCategory,
} from '../services/api'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [bulkPercentage, setBulkPercentage] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const [categories, setCategories] = useState([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [catForm, setCatForm] = useState({ name: '', description: '' })

  const [form, setForm] = useState({
    name: '',
    description: '',
    precioBase: '',
    precioMayorista: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
  })

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch {
      // ignore
    }
  }

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  function showMsg(msg, isError = false) {
    if (isError) {
      setError(msg)
      setSuccess('')
    } else {
      setSuccess(msg)
      setError('')
    }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  async function handleCatCreate(e) {
    e.preventDefault()
    try {
      await createCategory({ name: catForm.name, description: catForm.description || undefined })
      setShowCategoryForm(false)
      setCatForm({ name: '', description: '' })
      showMsg('Categoría creada')
      await loadCategories()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al crear categoría', true)
    }
  }

  async function handleCatToggleSuspend(cat) {
    try {
      if (cat.active) {
        await suspendCategory(cat.id)
        showMsg(`"${cat.name}" suspendida`)
      } else {
        await restoreCategory(cat.id)
        showMsg(`"${cat.name}" restaurada`)
      }
      await loadCategories()
    } catch (err) {
      showMsg('Error al cambiar estado', true)
    }
  }

  async function handleCatDelete(cat) {
    if (!window.confirm(`¿Eliminar PERMANENTEMENTE "${cat.name}"?`)) return
    try {
      await deleteCategory(cat.id)
      showMsg(`"${cat.name}" eliminada`)
      await loadCategories()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al eliminar', true)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createProduct({
        name: form.name,
        description: form.description || undefined,
        precioBase: parseFloat(form.precioBase),
        precioMayorista: parseFloat(form.precioMayorista),
        stock: parseInt(form.stock) || 0,
        imageUrl: form.imageUrl || undefined,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      })
      setShowCreate(false)
      setForm({ name: '', description: '', precioBase: '', precioMayorista: '', stock: '', imageUrl: '', categoryId: '' })
      showMsg('Producto creado exitosamente')
      await loadProducts()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al crear producto', true)
    }
  }

  async function handleToggleSuspend(product) {
    try {
      if (product.active) {
        await suspendProduct(product.id)
        showMsg(`"${product.name}" suspendido`)
      } else {
        await restoreProduct(product.id)
        showMsg(`"${product.name}" restaurado`)
      }
      await loadProducts()
    } catch (err) {
      showMsg('Error al cambiar estado', true)
    }
  }

  async function handleHardDelete(product) {
    if (!window.confirm(`¿Eliminar PERMANENTEMENTE "${product.name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteProduct(product.id)
      showMsg(`"${product.name}" eliminado permanentemente`)
      await loadProducts()
    } catch (err) {
      showMsg('Error al eliminar producto', true)
    }
  }

  async function handleBulkUpdate() {
    const pct = parseFloat(bulkPercentage)
    if (isNaN(pct)) {
      showMsg('Ingresa un porcentaje válido', true)
      return
    }
    if (selectedIds.length === 0) {
      showMsg('Selecciona al menos un producto', true)
      return
    }
    try {
      const res = await bulkUpdatePrices(selectedIds, pct)
      showMsg(`Precios actualizados: ${res.affectedCount} productos afectados (${pct >= 0 ? '+' : ''}${pct}%)`)
      setBulkPercentage('')
      setSelectedIds([])
      await loadProducts()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error en actualización masiva', true)
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  if (loading) return <div style={styles.loading}>Cargando panel de administración...</div>

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>⚙️ Panel de Administración</h2>
        <button onClick={() => setShowCreate(!showCreate)} style={styles.createBtn}>
          {showCreate ? '✕ Cancelar' : '➕ Nuevo Producto'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.bulkCard}>
        <div style={styles.catHeader}>
          <h3>📂 Categorías</h3>
          <button onClick={() => setShowCategoryForm(!showCategoryForm)} style={styles.smallBtn}>
            {showCategoryForm ? '✕ Cancelar' : '➕ Nueva'}
          </button>
        </div>

        {showCategoryForm && (
          <form onSubmit={handleCatCreate} style={styles.catForm}>
            <input style={styles.input} placeholder="Nombre *" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required />
            <input style={styles.input} placeholder="Descripción" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
            <button type="submit" style={{ ...styles.submitBtn, padding: '8px 16px', fontSize: '0.85rem' }}>Crear</button>
          </form>
        )}

        <div style={styles.catList}>
          {categories.length === 0 ? (
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Sin categorías</span>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} style={{ ...styles.catItem, opacity: cat.active ? 1 : 0.5 }}>
                <div>
                  <strong>{cat.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 8 }}>
                    ({cat._count?.products || 0} prod.)
                  </span>
                  {!cat.active && <span style={{ color: '#c62828', fontSize: '0.75rem', marginLeft: 6 }}>Suspendida</span>}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleCatToggleSuspend(cat)} style={{ ...styles.miniBtn, background: cat.active ? '#ff9800' : '#4caf50' }}>
                    {cat.active ? 'Suspender' : 'Restaurar'}
                  </button>
                  <button onClick={() => handleCatDelete(cat)} style={{ ...styles.miniBtn, background: '#e94560' }} disabled={!cat.active}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <div style={styles.formCard}>
          <h3>Nuevo Producto</h3>
          <form onSubmit={handleCreate} style={styles.form}>
            <input style={styles.input} placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <textarea style={styles.textarea} placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <input style={styles.input} type="number" step="0.01" placeholder="Precio Base *" value={form.precioBase} onChange={(e) => setForm({ ...form, precioBase: e.target.value })} required />
            <input style={styles.input} type="number" step="0.01" placeholder="Precio Mayorista *" value={form.precioMayorista} onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })} required />
            <input style={styles.input} type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <input style={styles.input} placeholder="URL de imagen" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            <select style={styles.input} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Sin categoría</option>
              {categories.filter((c) => c.active).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" style={styles.submitBtn}>Crear Producto</button>
          </form>
        </div>
      )}

      <div style={styles.bulkCard}>
        <h3>📊 Actualización Masiva de Precios</h3>
        <p style={styles.hint}>Selecciona productos abajo, ingresa un porcentaje y aplica el cambio.</p>
        <div style={styles.bulkRow}>
          <input
            style={styles.bulkInput}
            type="number"
            placeholder="Ej: 10 para +10%, -15 para -15%"
            value={bulkPercentage}
            onChange={(e) => setBulkPercentage(e.target.value)}
          />
          <button onClick={handleBulkUpdate} style={styles.bulkBtn} disabled={selectedIds.length === 0}>
            Aplicar a {selectedIds.length} producto(s)
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Sel.</th>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>P. Base</th>
              <th style={styles.th}>P. Mayorista</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={8} style={styles.emptyRow}>No hay productos</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} style={{ ...styles.tr, opacity: p.active ? 1 : 0.5 }}>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td style={styles.td}>{p.id}</td>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>${p.precioBase.toLocaleString('es-CL')}</td>
                  <td style={styles.td}>${p.precioMayorista.toLocaleString('es-CL')}</td>
                  <td style={styles.td}>{p.stock}</td>
                  <td style={styles.td}>
                    <span style={{ color: p.active ? '#2e7d32' : '#c62828' }}>
                      {p.active ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleToggleSuspend(p)}
                        style={{ ...styles.actionBtn, background: p.active ? '#ff9800' : '#4caf50' }}
                      >
                        {p.active ? 'Suspender' : 'Restaurar'}
                      </button>
                      <button
                        onClick={() => handleHardDelete(p)}
                        style={{ ...styles.actionBtn, background: '#e94560' }}
                        disabled={p.active}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    margin: 0,
    color: '#1a1a2e',
  },
  createBtn: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  error: {
    background: '#ffe0e0',
    color: '#d32f2f',
    padding: '12px',
    borderRadius: 8,
    marginBottom: 16,
  },
  success: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '12px',
    borderRadius: 8,
    marginBottom: 16,
  },
  formCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: '0.9rem',
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '12px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '1rem',
  },
  bulkCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  hint: {
    fontSize: '0.85rem',
    color: '#888',
    margin: '4px 0 12px',
  },
  bulkRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  bulkInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: '0.9rem',
  },
  bulkBtn: {
    padding: '10px 20px',
    background: '#1565c0',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  tableContainer: {
    overflowX: 'auto',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    textAlign: 'left',
    padding: '12px 10px',
    background: '#f5f5f5',
    borderBottom: '2px solid #ddd',
    fontWeight: 600,
    color: '#555',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '10px',
  },
  emptyRow: {
    textAlign: 'center',
    padding: 30,
    color: '#888',
  },
  actionBtn: {
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
  },
  catHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  catForm: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  catList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  catItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    background: '#f9f9f9',
    borderRadius: 6,
    fontSize: '0.85rem',
  },
  smallBtn: {
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  miniBtn: {
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.7rem',
  },
  loading: {
    textAlign: 'center',
    padding: 40,
    color: '#888',
    fontSize: '1.1rem',
  },
}
