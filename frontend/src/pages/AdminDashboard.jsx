import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, X, Save, Trash2, RefreshCw, Package, ShieldOff, Upload, ChevronDown, ChevronRight, User, ShoppingBag, Check, Search, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ImageCropper from '../components/ImageCropper'
import {
  getProducts,
  createProduct,
  updateProduct,
  bulkUpdatePrices,
  bulkSuspendProducts,
  bulkRestoreProducts,
  bulkDeleteProducts,
  suspendProduct,
  restoreProduct,
  deleteProduct,
  getCategories,
  createCategory,
  suspendCategory,
  restoreCategory,
  deleteCategory,
  getUsers,
  updateUserRole,
  bulkUpdateUserRole,
  suspendUser,
  activateUser,
  deleteUser,
  getOrders,
  approveOrder,
  deleteOrder,
  downloadOrderPdf,
  uploadImage,
} from '../services/api'

export default function AdminDashboard() {
  const { user: currentUser } = useAuth()
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
    name: '', description: '', precioBase: '', precioMayorista: '', precioCosto: '', stock: '', imageUrl: '', categoryId: '',
  })

  const [form, setForm] = useState({
    name: '', description: '', precioBase: '', precioMayorista: '', precioCosto: '', stock: '', imageUrl: '', categoryId: '',
  })

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [selectAllUsers, setSelectAllUsers] = useState(false)
  const [bulkUserRole, setBulkUserRole] = useState('RETAIL')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState(null)
  const [cropTarget, setCropTarget] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)

  useEffect(() => {
    loadProducts()
    loadCategories()
    loadUsers()
    loadOrders()
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

  async function loadUsers(search = '') {
    setUsersLoading(true)
    try { setUsers(await getUsers(search)) } catch {}
    finally { setUsersLoading(false) }
  }

  function handleUserSearch(value) {
    setUserSearch(value)
    loadUsers(value)
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await updateUserRole(userId, newRole)
      showMsg('Rol actualizado exitosamente')
      loadUsers(userSearch)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al actualizar rol', true)
    }
  }

  async function handleBulkRoleChange(newRole) {
    if (selectedUserIds.length === 0) { showMsg('Selecciona al menos un usuario', true); return }
    try {
      const res = await bulkUpdateUserRole(selectedUserIds, newRole)
      showMsg(res.message)
      setSelectedUserIds([])
      setSelectAllUsers(false)
      loadUsers(userSearch)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al actualizar roles', true)
    }
  }

  function toggleUserSelect(id) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setSelectAllUsers(false)
  }

  async function handleUserSuspend(id) {
    try {
      await suspendUser(id)
      showMsg('Usuario suspendido')
      loadUsers(userSearch)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al suspender usuario', true)
    }
  }

  async function handleUserActivate(id) {
    try {
      await activateUser(id)
      showMsg('Usuario activado')
      loadUsers(userSearch)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al activar usuario', true)
    }
  }

  async function handleUserDelete(id) {
    if (!window.confirm('¿Eliminar PERMANENTEMENTE este usuario? Esta acción no se puede deshacer.')) return
    try {
      await deleteUser(id)
      showMsg('Usuario eliminado permanentemente')
      loadUsers(userSearch)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al eliminar usuario', true)
    }
  }

  useEffect(() => {
    if (selectAllUsers) {
      setSelectedUserIds(users.filter((u) => u.active && u.id !== currentUser?.id).map((u) => u.id))
    } else {
      setSelectedUserIds([])
    }
  }, [selectAllUsers, users, currentUser])

  function showMsg(msg, isError = false) {
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)

  async function loadOrders(search = '', status = '') {
    setOrdersLoading(true)
    try { setOrders(await getOrders(search, status)) } catch {}
    finally { setOrdersLoading(false) }
  }

  async function handleApproveOrder(id) {
    try {
      await approveOrder(id)
      showMsg('Pedido aprobado')
      loadOrders(orderSearch, orderStatusFilter)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al aprobar pedido', true)
    }
  }

  async function handleDeleteOrder(id) {
    if (!window.confirm('¿Eliminar este pedido?')) return
    try {
      await deleteOrder(id)
      showMsg('Pedido eliminado')
      loadOrders(orderSearch, orderStatusFilter)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al eliminar pedido', true)
    }
  }

  function toggleExpandOrder(id) {
    setExpandedOrder(expandedOrder === id ? null : id)
  }

  async function handleImageUpload(e, target) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCropImageUrl(reader.result)
      setCropTarget(target)
    }
    reader.readAsDataURL(file)
  }

  async function handleCropConfirm(blob) {
    setCropImageUrl(null)
    setUploadingImage(true)
    try {
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' })
      const data = await uploadImage(file)
      if (cropTarget === 'create') setForm((prev) => ({ ...prev, imageUrl: data.url }))
      else setEditForm((prev) => ({ ...prev, imageUrl: data.url }))
      showMsg('Imagen subida exitosamente')
    } catch (err) {
      showMsg(err.response?.data?.detail || err.response?.data?.error || 'Error al subir imagen', true)
    } finally {
      setUploadingImage(false)
    }
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
        precioCosto: form.precioCosto ? parseFloat(form.precioCosto) : undefined,
        stock: parseInt(form.stock) || 0,
        imageUrl: form.imageUrl || undefined,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      })
      setShowCreate(false)
      setForm({ name: '', description: '', precioBase: '', precioMayorista: '', precioCosto: '', stock: '', imageUrl: '', categoryId: '' })
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
      precioCosto: product.precioCosto ? String(product.precioCosto) : '',
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
        precioCosto: editForm.precioCosto ? parseFloat(editForm.precioCosto) : null,
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

  async function handleBulkAction(action) {
    if (selectedIds.length === 0) { showMsg('Selecciona al menos un producto', true); return }
    const label = { suspend: 'suspendido', restore: 'restaurado', delete: 'eliminado' }[action]
    if (action === 'delete' && !window.confirm(`¿Eliminar PERMANENTEMENTE ${selectedIds.length} producto(s)?`)) return
    try {
      const fn = action === 'suspend' ? bulkSuspendProducts : action === 'restore' ? bulkRestoreProducts : bulkDeleteProducts
      const res = await fn(selectedIds)
      showMsg(res.message)
      setSelectedIds([]); setSelectAll(false)
      await loadProducts()
      if (expandedCat) await loadCatProducts(expandedCat)
    } catch { showMsg(`Error al ${label} productos`, true) }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
    setSelectAll(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 dark:text-gray-500 text-sm">Cargando panel...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Gestiona productos, usuarios y pedidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl">{success}</div>
        )}

        {/* ===== PRODUCTOS CARD ===== */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div
            className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={() => setExpandedSection(expandedSection === 'productos' ? null : 'productos')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Productos</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{products.length} producto(s) - {categories.length} categoría(s)</p>
                </div>
              </div>
              {expandedSection === 'productos' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </div>
          </div>

          {expandedSection === 'productos' && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-6 space-y-6">
              <button onClick={() => setShowCreate(!showCreate)}
                className="flex items-center gap-2 bg-gray-900 dark:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 dark:hover:bg-emerald-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                {showCreate ? 'Cancelar' : 'Nuevo Producto'}
              </button>

              {showCreate && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Nuevo Producto</h3>
                  <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div className="sm:col-span-2">
                      <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <input type="number" step="0.01" placeholder="Precio Base *" value={form.precioBase} onChange={(e) => setForm({ ...form, precioBase: e.target.value })} required
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <input type="number" step="0.01" placeholder="Precio Mayorista *" value={form.precioMayorista} onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })} required
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <input type="number" step="0.01" placeholder="Precio Costo" value={form.precioCosto} onChange={(e) => setForm({ ...form, precioCosto: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Imagen</label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <Upload size={16} />
                          {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                          <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                            onChange={(e) => handleImageUpload(e, 'create')} />
                        </label>
                        <span className="text-xs text-gray-400">o</span>
                        <input placeholder="URL de imagen" value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                          className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                      </div>
                      {form.imageUrl && (
                        <img src={form.imageUrl} alt="Vista previa" className="mt-2 h-24 w-24 object-cover rounded-lg border dark:border-gray-600" />
                      )}
                    </div>
                    <div>
                      <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Sin categoría</option>
                        {categories.filter((c) => c.active).map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 dark:bg-emerald-600 hover:bg-gray-800 dark:hover:bg-emerald-700 transition-colors">
                        <Package className="w-4 h-4" /> Crear Producto
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Categorías</h3>
                <div className="flex gap-3 mb-3">
                  <input placeholder="Nombre *" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  <input placeholder="Descripción" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  <button onClick={handleCatCreate}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">Crear</button>
                </div>
                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">Sin categorías</p>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat.id}>
                        <div
                          className={`flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${cat.active ? 'opacity-100' : 'opacity-50'}`}
                          onClick={() => cat.active && toggleExpandCat(cat.id)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedCat === cat.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <span className="font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">({cat._count?.products || 0})</span>
                            {!cat.active && <span className="text-xs text-red-500 dark:text-red-400 font-medium">Suspendida</span>}
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
                          <div className="ml-6 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                            {catProductsLoading ? (
                              <div className="p-4 text-sm text-gray-400 dark:text-gray-500">Cargando...</div>
                            ) : catProducts.length === 0 ? (
                              <div className="p-4 text-sm text-gray-400 dark:text-gray-500">Sin productos</div>
                            ) : (
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Producto</th>
                                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">P. Base</th>
                                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">P. May.</th>
                                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Stock</th>
                                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Estado</th>
                                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Acción</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {catProducts.map((p) => (
                                    <tr key={p.id} className={`border-t border-gray-50 dark:border-gray-700 ${p.active ? 'opacity-100' : 'opacity-50'}`}>
                                      <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{p.name}</td>
                                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">${p.precioBase.toLocaleString('es-CL')}</td>
                                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">${p.precioMayorista.toLocaleString('es-CL')}</td>
                                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{p.stock}</td>
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

              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Actualización Masiva de Precios</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Selecciona productos abajo, ingresa un % y aplica el cambio.</p>
                <div className="flex gap-3">
                  <input type="number" placeholder="Ej: 10 para +10%, -15 para -15%"
                    value={bulkPercentage} onChange={(e) => setBulkPercentage(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  <button onClick={handleBulkUpdate} disabled={selectedIds.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Aplicar a {selectedIds.length}
                  </button>
                </div>
              </div>

              <div className="overflow-hidden border border-gray-100 dark:border-gray-700 rounded-xl">
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedIds.length} seleccionado(s)</span>
                    <button onClick={() => { handleBulkAction('suspend') }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors">Suspender</button>
                    <button onClick={() => { handleBulkAction('restore') }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">Restaurar</button>
                    <button onClick={() => { handleBulkAction('delete') }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Eliminar</button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left px-4 py-3">
                          <input type="checkbox" checked={selectAll} onChange={() => setSelectAll(!selectAll)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">ID</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Nombre</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">P. Base</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">P. May.</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">P. Costo</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Stock</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Estado</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr><td colSpan={9} className="text-center px-4 py-10 text-gray-400 dark:text-gray-500">No hay productos</td></tr>
                      ) : (
                        products.map((p) => (
                          <tr key={p.id} className={`border-t border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${p.active ? 'opacity-100' : 'opacity-50'}`}>
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{p.id}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">${p.precioBase.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">${p.precioMayorista.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">${p.precioCosto != null ? p.precioCosto.toLocaleString('es-CL') : '-'}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{p.stock}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
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
          )}
        </div>

        {/* ===== USUARIOS CARD ===== */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div
            className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={() => setExpandedSection(expandedSection === 'usuarios' ? null : 'usuarios')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Usuarios</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{users.length} usuario(s)</p>
                </div>
              </div>
              {expandedSection === 'usuarios' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </div>
          </div>

          {expandedSection === 'usuarios' && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <input type="text" placeholder="Buscar por nombre o email..." value={userSearch}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  className="w-full sm:max-w-xs px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                {selectedUserIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedUserIds.length} seleccionado(s)</span>
                    <select value={bulkUserRole} onChange={(e) => setBulkUserRole(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <option value="RETAIL">Minorista</option>
                      <option value="WHOLESALE">Mayorista</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button onClick={() => handleBulkRoleChange(bulkUserRole)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors">Cambiar Rol</button>
                  </div>
                )}
              </div>
              {usersLoading ? (
                <div className="text-sm text-gray-400 dark:text-gray-500 py-4">Cargando usuarios...</div>
              ) : users.length === 0 ? (
                <div className="text-sm text-gray-400 dark:text-gray-500 py-4">Sin resultados</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left px-4 py-3">
                          <input type="checkbox" checked={selectAllUsers} onChange={() => setSelectAllUsers(!selectAllUsers)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Nombre</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Email</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Rol</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Estado</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Cambiar Rol</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const isSelf = u.id === currentUser?.id
                        return (
                        <tr key={u.id} className={`border-t border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${u.active ? '' : 'opacity-50'}`}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUserSelect(u.id)} disabled={isSelf}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-30" />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}{isSelf && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(tú)</span>}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                              u.role === 'WHOLESALE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            }`}>
                              {u.role === 'ADMIN' ? 'Admin' : u.role === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                              {u.active ? 'Activo' : 'Suspendido'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isSelf ? (
                              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs">
                                <ShieldOff className="w-3.5 h-3.5" /> Sin cambios
                              </div>
                            ) : (
                              <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                <option value="RETAIL">Minorista</option>
                                <option value="WHOLESALE">Mayorista</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isSelf ? (
                              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs">
                                <ShieldOff className="w-3.5 h-3.5" /> Sin cambios
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                {u.active ? (
                                  <button onClick={() => handleUserSuspend(u.id)}
                                    className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors">Suspender</button>
                                ) : (
                                  <button onClick={() => handleUserActivate(u.id)}
                                    className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">Activar</button>
                                )}
                                <button onClick={() => handleUserDelete(u.id)}
                                  className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== PEDIDOS CARD ===== */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div
            className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={() => setExpandedSection(expandedSection === 'pedidos' ? null : 'pedidos')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pedidos</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{orders.length} pedido(s)</p>
                </div>
              </div>
              {expandedSection === 'pedidos' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </div>
          </div>

          {expandedSection === 'pedidos' && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <input type="text" placeholder="Buscar por nombre o email..." value={orderSearch}
                  onChange={(e) => { setOrderSearch(e.target.value); loadOrders(e.target.value, orderStatusFilter) }}
                  className="w-full sm:max-w-xs px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <select value={orderStatusFilter}
                  onChange={(e) => { setOrderStatusFilter(e.target.value); loadOrders(orderSearch, e.target.value) }}
                  className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="">Todos</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="APPROVED">Aprobados</option>
                </select>
              </div>

              {ordersLoading ? (
                <div className="text-sm text-gray-400 dark:text-gray-500 py-4">Cargando pedidos...</div>
              ) : orders.length === 0 ? (
                <div className="text-sm text-gray-400 dark:text-gray-500 py-4">Sin pedidos</div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                      <div
                        className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => toggleExpandOrder(order.id)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedOrder === order.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">#{order.id}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{order.user?.name}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          }`}>
                            {order.status === 'APPROVED' ? 'Aprobado' : 'Pendiente'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.clientCondition === 'WHOLESALE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          }`}>
                            {order.clientCondition === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">${Number(order.total).toLocaleString('es-CL')}</span>
                          {order.status === 'PENDING' && (
                            <button onClick={() => handleApproveOrder(order.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">Aprobar</button>
                          )}
                          <button onClick={() => downloadOrderPdf(order.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">PDF</button>
                          <button onClick={() => handleDeleteOrder(order.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {expandedOrder === order.id && (
                        <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                <th className="pb-2 font-medium">Producto</th>
                                <th className="pb-2 font-medium text-right">Precio</th>
                                <th className="pb-2 font-medium text-right">Cant.</th>
                                <th className="pb-2 font-medium text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items?.map((item) => (
                                <tr key={item.id} className="border-t border-gray-100 dark:border-gray-700">
                                  <td className="py-2 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{item.productName}</td>
                                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">${Number(item.unitPrice).toLocaleString('es-CL')}</td>
                                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                  <td className="py-2 text-right font-medium text-gray-900 dark:text-white">${Number(item.subtotal).toLocaleString('es-CL')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {cropImageUrl && (
        <ImageCropper imageUrl={cropImageUrl} onCrop={handleCropConfirm} onCancel={() => setCropImageUrl(null)} />
      )}

      {editProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeEdit}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Editar: {editProduct.name}</h2>
              <button onClick={closeEdit} className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              <input placeholder="Nombre *" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <textarea placeholder="Descripción" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Precio Base *" value={editForm.precioBase} onChange={(e) => setEditForm({ ...editForm, precioBase: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <input type="number" step="0.01" placeholder="Precio Mayorista *" value={editForm.precioMayorista} onChange={(e) => setEditForm({ ...editForm, precioMayorista: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Precio Costo" value={editForm.precioCosto} onChange={(e) => setEditForm({ ...editForm, precioCosto: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Stock" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Imagen</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <Upload size={16} />
                    {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                      onChange={(e) => handleImageUpload(e, 'edit')} />
                  </label>
                  <span className="text-xs text-gray-400">o</span>
                  <input placeholder="URL de imagen" value={editForm.imageUrl} onChange={(e) => setEditForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                {editForm.imageUrl && (
                  <img src={editForm.imageUrl} alt="Vista previa" className="mt-2 h-24 w-24 object-cover rounded-lg border dark:border-gray-600" />
                )}
              </div>
              <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
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
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
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
