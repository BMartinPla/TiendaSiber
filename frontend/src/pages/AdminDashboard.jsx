import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, X, Save, Trash2, RefreshCw, Package } from 'lucide-react'
import {
  getProducts,
  createProduct,
  updateProduct,
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
    try { setCategories(await getCategories()) } catch {}
  }

  async function loadProducts() {
    setLoading(true)
    try { setProducts(await getProducts()) } catch { setError('Error al cargar productos') }
    finally { setLoading(false) }
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
      if (cat.active) { await suspendCategory(cat.id); showMsg(`"${cat.name}" suspendida`) }
      else { await restoreCategory(cat.id); showMsg(`"${cat.name}" restaurada`) }
      await loadCategories()
      if (expandedCat === cat.id) await loadCatProducts(cat.id)
    } catch { showMsg('Error al cambiar estado', true) }
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
    try { setCatProducts(await getProducts(`?categoryId=${categoryId}`)) }
    catch { setCatProducts([]) }
    finally { setCatProductsLoading(false) }
  }

  function toggleExpandCat(catId) {
    if (expandedCat === catId) { setExpandedCat(null); setCatProducts([]) }
    else { setExpandedCat(catId); loadCatProducts(catId) }
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
      if (product.active) { await suspendProduct(product.id); showMsg(`"${product.name}" suspendido`) }
      else { await restoreProduct(product.id); showMsg(`"${product.name}" restaurado`) }
      await loadProducts()
      if (expandedCat) await loadCatProducts(expandedCat)
    } catch { showMsg('Error al cambiar estado', true) }
  }

  async function handleHardDelete(product) {
    if (!window.confirm(`¿Eliminar PERMANENTEMENTE "${product.name}"?`)) return
    try {
      await deleteProduct(product.id)
      showMsg(`"${product.name}" eliminado`)
      await loadProducts()
      if (expandedCat) await loadCatProducts(expandedCat)
    } catch { showMsg('Error al eliminar producto', true) }
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

  function closeEdit() { setEditProduct(null) }

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
    } catch { showMsg('Error al actualizar', true) }
  }

  async function handleBulkUpdate() {
    const pct = parseFloat(bulkPercentage)
    if (isNaN(pct)) { showMsg('Ingresa un porcentaje válido', true); return }
    if (selectedIds.length === 0) { showMsg('Selecciona al menos un producto', true); return }
    try {
      const res = await bulkUpdatePrices(selectedIds, pct)
      showMsg(`${res.affectedCount} productos afectados (${pct >= 0 ? '+' : ''}${pct}%)`)
      setBulkPercentage(''); setSelectedIds([]); setSelectAll(false)
      await loadProducts()
      if (expandedCat) await loadCatProducts(expandedCat)
    } catch { showMsg('Error en actualización masiva', true) }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
    setSelectAll(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Cargando panel...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-xs text-gray-500 mt-0.5">Gestiona productos, categorías y precios</p>
              </div>
            </div>
            <button onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              {showCreate ? 'Cancelar' : 'Nuevo Producto'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm px-4 py-3 rounded-xl">{success}</div>
        )}

        {showCreate && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Nuevo Producto</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              </div>
              <div className="sm:col-span-2">
                <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              </div>
              <div>
                <input type="number" step="0.01" placeholder="Precio Base *" value={form.precioBase} onChange={(e) => setForm({ ...form, precioBase: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              </div>
              <div>
                <input type="number" step="0.01" placeholder="Precio Mayorista *" value={form.precioMayorista} onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              </div>
              <div>
                <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              </div>
              <div>
                <input placeholder="URL de imagen" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              </div>
              <div>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50">
                  <option value="">Sin categoría</option>
                  {categories.filter((c) => c.active).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors">
                  <Package className="w-4 h-4" /> Crear Producto
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Categorías</h2>
            <button onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              {showCategoryForm ? 'Cancelar' : 'Nueva'}
            </button>
          </div>

          {showCategoryForm && (
            <form onSubmit={handleCatCreate} className="flex gap-3 mb-4">
              <input placeholder="Nombre *" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              <input placeholder="Descripción" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              <button type="submit"
                className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">Crear</button>
            </form>
          )}

          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">Sin categorías</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id}>
                  <div
                    className={`flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm cursor-pointer transition-colors hover:bg-gray-100 ${cat.active ? 'opacity-100' : 'opacity-50'}`}
                    onClick={() => cat.active && toggleExpandCat(cat.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{expandedCat === cat.id ? '🔽' : '▶️'}</span>
                      <span className="font-semibold text-gray-900">{cat.name}</span>
                      <span className="text-xs text-gray-400">({cat._count?.products || 0})</span>
                      {!cat.active && <span className="text-xs text-red-500 font-medium">Suspendida</span>}
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleCatToggleSuspend(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium text-white ${cat.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} transition-colors`}>
                        {cat.active ? 'Suspender' : 'Restaurar'}
                      </button>
                      <button onClick={() => handleCatDelete(cat)} disabled={!cat.active}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {expandedCat === cat.id && (
                    <div className="ml-6 mt-2 bg-white border border-gray-100 rounded-xl overflow-hidden">
                      {catProductsLoading ? (
                        <div className="p-4 text-sm text-gray-400">Cargando...</div>
                      ) : catProducts.length === 0 ? (
                        <div className="p-4 text-sm text-gray-400">Sin productos</div>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left px-4 py-2 font-semibold text-gray-500">Producto</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-500">P. Base</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-500">P. May.</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-500">Stock</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-500">Estado</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-500">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catProducts.map((p) => (
                              <tr key={p.id} className={`border-t border-gray-50 ${p.active ? 'opacity-100' : 'opacity-50'}`}>
                                <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                                <td className="px-4 py-2 text-gray-600">${p.precioBase.toLocaleString('es-CL')}</td>
                                <td className="px-4 py-2 text-gray-600">${p.precioMayorista.toLocaleString('es-CL')}</td>
                                <td className="px-4 py-2 text-gray-600">{p.stock}</td>
                                <td className="px-4 py-2">
                                  <span className={`text-xs font-medium ${p.active ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {p.active ? 'Activo' : 'Suspendido'}
                                  </span>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex gap-1">
                                    <button onClick={() => openEdit(p)}
                                      className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Editar</button>
                                    <button onClick={() => handleToggleSuspend(p)}
                                      className={`px-2 py-1 rounded-lg text-xs font-medium text-white ${p.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} transition-colors`}>
                                      {p.active ? 'Suspender' : 'Restaurar'}
                                    </button>
                                    <button onClick={() => handleHardDelete(p)}
                                      className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
                                      <Trash2 className="w-3 h-3" />
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Actualización Masiva de Precios</h2>
          <p className="text-xs text-gray-400 mb-4">Selecciona productos abajo, ingresa un % y aplica el cambio.</p>
          <div className="flex gap-3">
            <input type="number" placeholder="Ej: 10 para +10%, -15 para -15%"
              value={bulkPercentage} onChange={(e) => setBulkPercentage(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
            <button onClick={handleBulkUpdate} disabled={selectedIds.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <RefreshCw className="w-4 h-4" />
              Aplicar a {selectedIds.length}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3">
                    <input type="checkbox" checked={selectAll} onChange={() => setSelectAll(!selectAll)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">P. Base</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">P. May.</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={8} className="text-center px-4 py-10 text-gray-400">No hay productos</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className={`border-t border-gray-50 hover:bg-gray-50/50 transition-colors ${p.active ? 'opacity-100' : 'opacity-50'}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-gray-700">${p.precioBase.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-gray-700">${p.precioMayorista.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-gray-700">{p.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {p.active ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(p)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Editar</button>
                          <button onClick={() => handleToggleSuspend(p)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-white ${p.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} transition-colors`}>
                            {p.active ? 'Suspender' : 'Restaurar'}
                          </button>
                          <button onClick={() => handleHardDelete(p)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {editProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeEdit}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Editar: {editProduct.name}</h2>
              <button onClick={closeEdit} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              <input placeholder="Nombre *" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              <textarea placeholder="Descripción" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Precio Base *" value={editForm.precioBase} onChange={(e) => setEditForm({ ...editForm, precioBase: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
                <input type="number" step="0.01" placeholder="Precio Mayorista *" value={editForm.precioMayorista} onChange={(e) => setEditForm({ ...editForm, precioMayorista: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Stock" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
                <input placeholder="URL de imagen" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50" />
              </div>
              <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50">
                <option value="">Sin categoría</option>
                {categories.filter((c) => c.active).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors">
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
                <button type="button" onClick={closeEdit}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
