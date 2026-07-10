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
  const [selectAll, setSelectAll] = useState(false)

  const [categories, setCategories] = useState([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [catForm, setCatForm] = useState({ name: '', description: '' })
  const [expandedCat, setExpandedCat] = useState(null)
  const [catProducts, setCatProducts] = useState([])
  const [catProductsLoading, setCatProductsLoading] = useState(false)

  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '', description: '', precioBase: '', precioMayorista: '', stock: '', imageUrl: '', categoryId: '',
  })

  const [form, setForm] = useState({
    name: '', description: '', precioBase: '', precioMayorista: '', stock: '', imageUrl: '', categoryId: '',
  })

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectAll) {
      setSelectedIds(products.filter((p) => p.active).map((p) => p.id))
    } else {
      setSelectedIds([])
    }
  }, [selectAll, products])

  async function loadCategories() {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch {}
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
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
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
      if (expandedCat === cat.id) await loadCatProducts(cat.id)
    } catch (err) {
      showMsg('Error al cambiar estado', true)
    }
  }

  async function handleCatDelete(cat) {
    if (!window.confirm(`¿Eliminar PERMANENTEMENTE "${cat.name}"?`)) return
    try {
      await deleteCategory(cat.id)
      showMsg(`"${cat.name}" eliminada`)
      setExpandedCat(null)
      await loadCategories()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al eliminar', true)
    }
  }

  async function loadCatProducts(categoryId) {
    setCatProductsLoading(true)
    try {
      const data = await getProducts(`?categoryId=${categoryId}`)
      setCatProducts(data)
    } catch {
      setCatProducts([])
    } finally {
      setCatProductsLoading(false)
    }
  }

  function toggleExpandCat(catId) {
    if (expandedCat === catId) {
      setExpandedCat(null)
      setCatProducts([])
    } else {
      setExpandedCat(catId)
      loadCatProducts(catId)
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
      if (expandedCat) await loadCatProducts(expandedCat)
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
      if (expandedCat) await loadCatProducts(expandedCat)
    } catch (err) {
      showMsg('Error al cambiar estado', true)
    }
  }

  async function handleHardDelete(product) {
    if (!window.confirm(`¿Eliminar PERMANENTEMENTE "${product.name}"?`)) return
    try {
      await deleteProduct(product.id)
      showMsg(`"${product.name}" eliminado`)
      await loadProducts()
      if (expandedCat) await loadCatProducts(expandedCat)
    } catch (err) {
      showMsg('Error al eliminar producto', true)
    }
  }

  function openEdit(product) {
    setEditProduct(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
      precioBase: String(product.precioBase),
      precioMayorista: String(product.precioMayorista),
      stock: String(product.stock),
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId ? String(product.categoryId) : '',
    })
  }

  function closeEdit() {
    setEditProduct(null)
  }

  async function handleEditSave(e) {
    e.preventDefault()
    if (!editProduct) return
    try {
      await updateProduct(editProduct.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        precioBase: parseFloat(editForm.precioBase),
        precioMayorista: parseFloat(editForm.precioMayorista),
        stock: parseInt(editForm.stock) || 0,
        imageUrl: editForm.imageUrl || undefined,
        categoryId: editForm.categoryId ? parseInt(editForm.categoryId) : null,
      })
      showMsg(`"${editForm.name}" actualizado`)
      closeEdit()
      await loadProducts()
      if (expandedCat) await loadCatProducts(expandedCat)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al actualizar', true)
    }
  }

  async function handleBulkUpdate() {
    const pct = parseFloat(bulkPercentage)
    if (isNaN(pct)) { showMsg('Ingresa un porcentaje válido', true); return }
    if (selectedIds.length === 0) { showMsg('Selecciona al menos un producto', true); return }
    try {
      const res = await bulkUpdatePrices(selectedIds, pct)
      showMsg(`${res.affectedCount} productos afectados (${pct >= 0 ? '+' : ''}${pct}%)`)
      setBulkPercentage('')
      setSelectedIds([])
      setSelectAll(false)
      await loadProducts()
      if (expandedCat) await loadCatProducts(expandedCat)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error en actualización masiva', true)
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setSelectAll(false)
  }

  function toggleSelectAll() {
    setSelectAll((prev) => !prev)
  }

  function handleCatProductAction(product) {
    handleToggleSuspend(product)
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
              <div key={cat.id}>
                <div
                  style={{ ...styles.catItem, cursor: 'pointer', opacity: cat.active ? 1 : 0.5 }}
                  onClick={() => cat.active && toggleExpandCat(cat.id)}
                >
                  <div>
                    <span style={{ marginRight: 8 }}>{expandedCat === cat.id ? '🔽' : '▶️'}</span>
                    <strong>{cat.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 8 }}>
                      ({cat._count?.products || 0} prod.)
                    </span>
                    {!cat.active && <span style={{ color: '#c62828', fontSize: '0.75rem', marginLeft: 6 }}>Suspendida</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleCatToggleSuspend(cat)} style={{ ...styles.miniBtn, background: cat.active ? '#ff9800' : '#4caf50' }}>
                      {cat.active ? 'Suspender' : 'Restaurar'}
                    </button>
                    <button onClick={() => handleCatDelete(cat)} style={{ ...styles.miniBtn, background: '#e94560' }} disabled={!cat.active}>
                      Eliminar
                    </button>
                  </div>
                </div>

                {expandedCat === cat.id && (
                  <div style={styles.catProductsWrap}>
                    {catProductsLoading ? (
                      <span style={{ color: '#888', fontSize: '0.8rem', padding: 8 }}>Cargando...</span>
                    ) : catProducts.length === 0 ? (
                      <span style={{ color: '#888', fontSize: '0.8rem', padding: 8 }}>Sin productos en esta categoría</span>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#f5f5f5' }}>
                            <th style={styles.catTh}>Producto</th>
                            <th style={styles.catTh}>P. Base</th>
                            <th style={styles.catTh}>P. May.</th>
                            <th style={styles.catTh}>Stock</th>
                            <th style={styles.catTh}>Estado</th>
                            <th style={styles.catTh}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catProducts.map((p) => (
                            <tr key={p.id} style={{ opacity: p.active ? 1 : 0.5 }}>
                              <td style={styles.catTd}>{p.name}</td>
                              <td style={styles.catTd}>${p.precioBase.toLocaleString('es-CL')}</td>
                              <td style={styles.catTd}>${p.precioMayorista.toLocaleString('es-CL')}</td>
                              <td style={styles.catTd}>{p.stock}</td>
                              <td style={styles.catTd}>
                                <span style={{ color: p.active ? '#2e7d32' : '#c62828' }}>
                                  {p.active ? 'Activo' : 'Suspendido'}
                                </span>
                              </td>
                              <td style={styles.catTd}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button onClick={() => openEdit(p)} style={{ ...styles.miniBtn, background: '#1565c0' }}>Editar</button>
                                  <button onClick={() => handleToggleSuspend(p)} style={{ ...styles.miniBtn, background: p.active ? '#ff9800' : '#4caf50' }}>
                                    {p.active ? 'Suspender' : 'Restaurar'}
                                  </button>
                                  <button onClick={() => handleHardDelete(p)} style={{ ...styles.miniBtn, background: '#e94560' }} disabled={p.active}>
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

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
              <th style={styles.th}>
                <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              </th>
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
                      <button onClick={() => openEdit(p)} style={{ ...styles.actionBtn, background: '#1565c0' }}>Editar</button>
                      <button onClick={() => handleToggleSuspend(p)} style={{ ...styles.actionBtn, background: p.active ? '#ff9800' : '#4caf50' }}>
                        {p.active ? 'Suspender' : 'Restaurar'}
                      </button>
                      <button onClick={() => handleHardDelete(p)} style={{ ...styles.actionBtn, background: '#e94560' }} disabled={p.active}>
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

      {editProduct && (
        <div style={styles.modalOverlay} onClick={closeEdit}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>✏️ Editar: {editProduct.name}</h3>
              <button onClick={closeEdit} style={styles.modalClose}>✕</button>
            </div>
            <form onSubmit={handleEditSave} style={styles.form}>
              <input style={styles.input} placeholder="Nombre *" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
              <textarea style={styles.textarea} placeholder="Descripción" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} />
              <input style={styles.input} type="number" step="0.01" placeholder="Precio Base *" value={editForm.precioBase} onChange={(e) => setEditForm({ ...editForm, precioBase: e.target.value })} required />
              <input style={styles.input} type="number" step="0.01" placeholder="Precio Mayorista *" value={editForm.precioMayorista} onChange={(e) => setEditForm({ ...editForm, precioMayorista: e.target.value })} required />
              <input style={styles.input} type="number" placeholder="Stock" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
              <input style={styles.input} placeholder="URL de imagen" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
              <select style={styles.input} value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}>
                <option value="">Sin categoría</option>
                {categories.filter((c) => c.active).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={styles.submitBtn}>Guardar Cambios</button>
                <button type="button" onClick={closeEdit} style={{ ...styles.submitBtn, background: '#888' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  title: { margin: 0, color: '#1a1a2e' },
  createBtn: {
    background: '#1a1a2e', color: '#fff', border: 'none', padding: '10px 20px',
    borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem',
  },
  error: {
    background: '#ffe0e0', color: '#d32f2f', padding: '12px', borderRadius: 8, marginBottom: 16,
  },
  success: {
    background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: 8, marginBottom: 16,
  },
  formCard: {
    background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    padding: '10px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem',
  },
  textarea: {
    padding: '10px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '12px', background: '#1a1a2e', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: '1rem',
  },
  bulkCard: {
    background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  hint: { fontSize: '0.85rem', color: '#888', margin: '4px 0 12px' },
  bulkRow: { display: 'flex', gap: 10, alignItems: 'center' },
  bulkInput: {
    flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem',
  },
  bulkBtn: {
    padding: '10px 20px', background: '#1565c0', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap',
  },
  tableContainer: {
    overflowX: 'auto', background: '#fff', borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: {
    textAlign: 'left', padding: '12px 10px', background: '#f5f5f5',
    borderBottom: '2px solid #ddd', fontWeight: 600, color: '#555',
  },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px' },
  emptyRow: { textAlign: 'center', padding: 30, color: '#888' },
  actionBtn: {
    color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 4,
    cursor: 'pointer', fontSize: '0.75rem', whiteSpace: 'nowrap',
  },
  catHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  catForm: { display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-end' },
  catList: { display: 'flex', flexDirection: 'column', gap: 6 },
  catItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 10px', background: '#f9f9f9', borderRadius: 6, fontSize: '0.85rem',
  },
  catProductsWrap: {
    padding: '8px 10px 8px 28px', background: '#f0f0f0', borderRadius: 6,
    marginTop: 4, marginBottom: 4, overflowX: 'auto',
  },
  catTh: {
    textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ddd',
    fontWeight: 600, color: '#555', fontSize: '0.75rem',
  },
  catTd: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: '0.75rem' },
  smallBtn: {
    background: '#1a1a2e', color: '#fff', border: 'none', padding: '6px 14px',
    borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem',
  },
  miniBtn: {
    color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4,
    cursor: 'pointer', fontSize: '0.7rem',
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, padding: 24, width: '90%',
    maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  modalClose: {
    background: 'transparent', border: 'none', fontSize: '1.3rem',
    cursor: 'pointer', color: '#888',
  },
  loading: { textAlign: 'center', padding: 40, color: '#888', fontSize: '1.1rem' },
}
