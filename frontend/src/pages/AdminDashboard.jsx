import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Save, Trash2, RefreshCw, Package, ShieldOff, Upload, ChevronDown, ChevronRight, User, UserPlus, ShoppingBag, ShoppingCart, Loader2, LayoutDashboard, LogOut, Moon, Sun, Settings, Star, FileSpreadsheet } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDarkMode } from '../contexts/DarkModeContext'
import ImageCropper from '../components/ImageCropper'
import {
  getProducts,
  getProduct,
  bulkUploadProducts,
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
  createManualOrder,
  uploadImage,
  toggleFeatured,
  adminCreateUser,
} from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function AdminDashboard() {
  const { user: currentUser, logout } = useAuth()
  const { dark, toggleDark } = useDarkMode()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [bulkPercentage, setBulkPercentage] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)

  const [categories, setCategories] = useState([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [catForm, setCatForm] = useState({ name: '' })
  const [expandedCat, setExpandedCat] = useState(null)
  const [catProducts, setCatProducts] = useState([])
  const [catProductsLoading, setCatProductsLoading] = useState(false)

  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '', description: '', precioBase: '', precioMayorista: '', precioCosto: '', stock: '', imageUrl: '', featuredImageUrl: '', categoryId: '',
  })

  const [form, setForm] = useState({
    name: '', description: '', precioBase: '', precioMayorista: '', precioCosto: '', stock: '', imageUrl: '', featuredImageUrl: '', categoryId: '',
  })

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [selectAllUsers, setSelectAllUsers] = useState(false)
  const [bulkUserRole, setBulkUserRole] = useState('RETAIL')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [createUserForm, setCreateUserForm] = useState({ name: '', email: '', password: '', phone: '', role: 'RETAIL' })
  const [createUserSubmitting, setCreateUserSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState(null)
  const [cropTarget, setCropTarget] = useState(null)
  const [activeSection, setActiveSection] = useState('dashboard')

  useEffect(() => {
    loadProducts()
    loadCategories()
    loadUsers()
    loadOrders()
  }, [])

  useEffect(() => {
    if (selectAll) {
      setSelectedIds(products.map((p) => p.id))
    } else {
      setSelectedIds([])
    }
  }, [selectAll, products])

  useEffect(() => {
    if (selectAllUsers) {
      setSelectedUserIds(users.filter((u) => u.active && u.id !== currentUser?.id).map((u) => u.id))
    } else {
      setSelectedUserIds([])
    }
  }, [selectAllUsers, users, currentUser])

  useEffect(() => {
    if (editProduct || cropImageUrl) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [editProduct, cropImageUrl])

  async function loadCategories() {
    try { setCategories(await getCategories()) } catch { showMsg('Error al cargar categorías', true) }
  }

  async function loadProducts() {
    setLoading(true)
    try { setProducts(await getProducts()) } catch { showMsg('Error al cargar productos', true) }
    finally { setLoading(false) }
  }

  async function handleBulkUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBulkUploading(true)
    setBulkResult(null)
    try {
      const res = await bulkUploadProducts(file)
      setBulkResult(res)
      showMsg(res.message, res.errors?.length > 0)
      loadProducts()
      loadCategories()
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al cargar productos desde el archivo', true)
    } finally {
      setBulkUploading(false)
      e.target.value = ''
    }
  }

  async function loadUsers(search = '') {
    setUsersLoading(true)
    try { setUsers(await getUsers(search)) } catch { showMsg('Error al cargar usuarios', true) }
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

  async function handleCreateUser(e) {
    e.preventDefault()
    setCreateUserSubmitting(true)
    try {
      await adminCreateUser(createUserForm)
      showMsg('Usuario creado exitosamente')
      setShowCreateUser(false)
      setCreateUserForm({ name: '', email: '', password: '', phone: '', role: 'RETAIL' })
      loadUsers(userSearch)
    } catch (err) {
      showMsg(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error al crear usuario', true)
    } finally {
      setCreateUserSubmitting(false)
    }
  }

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
  const [showManualOrder, setShowManualOrder] = useState(false)
  const [manualOrderUser, setManualOrderUser] = useState('')
  const [manualOrderCondition, setManualOrderCondition] = useState('RETAIL')
  const [manualOrderItems, setManualOrderItems] = useState([{ productId: '', quantity: 1, search: '' }])
  const [manualOrderSearchProduct, setManualOrderSearchProduct] = useState('')
  const [manualOrderSearchUser, setManualOrderSearchUser] = useState('')
  const [manualOrderUserOpen, setManualOrderUserOpen] = useState(false)
  const [manualOrderProductOpen, setManualOrderProductOpen] = useState(null)
  const [manualOrderSubmitting, setManualOrderSubmitting] = useState(false)

  async function loadOrders(search = '', status = '') {
    setOrdersLoading(true)
    try { setOrders(await getOrders(search, status)) } catch (err) { showMsg(err.response?.data?.error || 'Error al cargar pedidos', true) }
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

  async function handleCreateManualOrder() {
    if (!manualOrderUser || manualOrderItems.every((i) => !i.productId)) return
    setManualOrderSubmitting(true)
    try {
      await createManualOrder({
        userId: Number(manualOrderUser),
        condition: manualOrderCondition,
        items: manualOrderItems.filter((i) => i.productId).map((i) => ({ productId: Number(i.productId), quantity: i.quantity })),
      })
      showMsg('Pedido creado exitosamente')
      setShowManualOrder(false)
      setManualOrderUser('')
      setManualOrderCondition('RETAIL')
      setManualOrderItems([{ productId: '', quantity: 1, search: '' }])
      loadOrders(orderSearch, orderStatusFilter)
    } catch (err) {
      showMsg(err.response?.data?.error || 'Error al crear pedido', true)
    } finally {
      setManualOrderSubmitting(false)
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
      const file = new File([blob], 'cropped.png', { type: 'image/png' })
      const data = await uploadImage(file)
      if (cropTarget === 'create') setForm((prev) => ({ ...prev, imageUrl: data.url }))
      else if (cropTarget === 'create-featured') setForm((prev) => ({ ...prev, featuredImageUrl: data.url }))
      else if (cropTarget === 'edit-featured') setEditForm((prev) => ({ ...prev, featuredImageUrl: data.url }))
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
      await createCategory({ name: catForm.name })
      setShowCategoryForm(false)
      setCatForm({ name: '' })
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
        precioCosto: parseFloat(form.precioCosto),
        stock: parseInt(form.stock) || 0,
        imageUrl: form.imageUrl || undefined,
        featuredImageUrl: form.featuredImageUrl || undefined,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      })
      setShowCreate(false)
      setForm({ name: '', description: '', precioBase: '', precioMayorista: '', precioCosto: '', stock: '', imageUrl: '', featuredImageUrl: '', categoryId: '' })
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

  async function handleToggleFeatured(product) {
    try {
      const updated = await toggleFeatured(product.id)
      showMsg(updated.featured ? `"${product.name}" destacado` : `"${product.name}" ya no está destacado`)
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setCatProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      await loadProducts()
      if (expandedCat) await loadCatProducts(expandedCat)
    } catch { showMsg('Error al destacar producto', true) }
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

  async function openEdit(product) {
    try {
      product = await getProduct(product.id)
    } catch { /* usa los datos del listado */ }
    setEditProduct(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
      precioBase: product.precioBase ? String(product.precioBase) : '',
      precioMayorista: product.precioMayorista ? String(product.precioMayorista) : '',
      precioCosto: product.precioCosto ? String(product.precioCosto) : '',
      stock: product.stock ? String(product.stock) : '',
      imageUrl: product.imageUrl || '',
      featuredImageUrl: product.featuredImageUrl || '',
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
        precioCosto: parseFloat(editForm.precioCosto),
        stock: parseInt(editForm.stock) || 0,
        imageUrl: editForm.imageUrl || undefined,
        featuredImageUrl: editForm.featuredImageUrl || undefined,
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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'productos', label: 'Productos', icon: Package },
    { key: 'usuarios', label: 'Usuarios', icon: User },
    { key: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  ]

  const approvedOrders = orders.filter((o) => o.status === 'APPROVED')
  const salesByMonth = {}
  approvedOrders.forEach((order) => {
    const d = new Date(order.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!salesByMonth[key]) {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      salesByMonth[key] = { month: monthNames[d.getMonth()], revenue: 0, orders: 0 }
    }
    salesByMonth[key].revenue += order.total
    salesByMonth[key].orders += 1
  })
  const chartData = Object.values(salesByMonth).sort((a, b) => a.month.localeCompare(b.month, 'es', { numeric: true }))

  const statsCards = [
    { label: 'Productos totales', value: products.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Pedidos totales', value: orders.length, icon: ShoppingBag, color: 'bg-amber-500' },
    { label: 'Usuarios', value: users.length, icon: User, color: 'bg-purple-500' },
    { label: 'Categorías', value: categories.length, icon: Settings, color: 'bg-red-500' },
  ]

  if (loading && products.length === 0) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Panel de administración</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.key
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver a tienda
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* HEADER */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                {activeSection === 'dashboard' ? 'Dashboard' : activeSection}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleDark} className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/" className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Volver a tienda">
                <ShoppingCart className="w-5 h-5" />
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Mobile Nav Tabs */}
          <div className="flex lg:hidden border-t border-gray-100 dark:border-gray-800">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                    activeSection === item.key
                      ? 'text-gray-900 dark:text-white border-t-2 border-gray-900 dark:border-white -mt-px'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">

          {/* Toast notifications */}
      {(error || success) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-5 py-3 rounded-xl shadow-2xl">{error}</div>
          )}
          {success && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm px-5 py-3 rounded-xl shadow-2xl">{success}</div>
          )}
        </div>
      )}

      {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6 animate-slideUp">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((card, i) => {
                  const Icon = card.icon
                  return (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-gray-700 p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl ${card.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Ventas ({approvedOrders.length} pedidos aprobados)</h3>
                {chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">Sin ventas aún</div>
                ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(value, name) => {
                          if (name === 'revenue') return [`$${Number(value).toLocaleString('es-CL')}`, 'Ingresos']
                          if (name === 'orders') return [value, 'Pedidos']
                          return [value, name]
                        }}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="revenue" />
                      <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} name="orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                )}
              </div>


            </div>
          )}

          {/* PRODUCTOS */}
          {activeSection === 'productos' && (
            <div className="space-y-6 animate-slideUp">

              {/* Card: Crear Producto + Tabla */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Todos los Productos</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-100 dark:border-blue-800">
                        <FileSpreadsheet className="w-4 h-4" />
                        {bulkUploading ? 'Cargando...' : 'Carga Masiva'}
                        <input type="file" accept=".xlsx,.xls,.csv" className="hidden" disabled={bulkUploading}
                          onChange={handleBulkUpload} />
                      </label>
                      <button onClick={() => setShowCreate(!showCreate)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm ${showCreate ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700'}`}>
                        {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showCreate ? 'Cancelar' : 'Nuevo Producto'}
                      </button>
                    </div>
                  </div>

                  {/* Bulk upload result */}
                  {bulkResult && (
                    <div className={`mb-4 rounded-xl border p-4 text-sm ${bulkResult.errors?.length > 0 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'}`}>
                      <p className="font-semibold mb-1">{bulkResult.message}</p>
                      <p className="text-xs">
                        Creados: {bulkResult.created} · Actualizados: {bulkResult.updated} · Errores: {bulkResult.errors?.length || 0}
                      </p>
                      {bulkResult.errors?.length > 0 && (
                        <div className="mt-2 max-h-28 overflow-y-auto space-y-0.5">
                          {bulkResult.errors.map((err, i) => (
                            <p key={i} className="text-xs">Fila {err.row || '?'}: {err.reason}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Create form */}
                  {showCreate && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 sm:p-6 mb-6 border border-gray-100 dark:border-gray-700">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Nuevo Producto</h4>
                      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <input placeholder="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div className="sm:col-span-2">
                          <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div>
                          <input type="number" step="0.01" placeholder="Precio Costo *" value={form.precioCosto} onChange={(e) => setForm({ ...form, precioCosto: e.target.value })} required
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div>
                          <input type="number" step="0.01" placeholder="Precio Mayorista *" value={form.precioMayorista} onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })} required
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div>
                          <input type="number" step="0.01" placeholder="Precio Minorista *" value={form.precioBase} onChange={(e) => setForm({ ...form, precioBase: e.target.value })} required
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div>
                          <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
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
                              className="flex-1 min-w-0 sm:min-w-[200px] px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                          </div>
                          {form.imageUrl && (
                            <img src={form.imageUrl} alt="Vista previa" className="mt-2 h-20 w-20 object-cover rounded-lg border dark:border-gray-600" />
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Imagen destacada (opcional)</label>
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                              <Upload size={16} />
                              {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                              <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                                onChange={(e) => handleImageUpload(e, 'create-featured')} />
                            </label>
                            <span className="text-xs text-gray-400">o</span>
                            <input placeholder="URL imagen destacada" value={form.featuredImageUrl} onChange={(e) => setForm((prev) => ({ ...prev, featuredImageUrl: e.target.value }))}
                              className="flex-1 min-w-0 sm:min-w-[200px] px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                          </div>
                          {form.featuredImageUrl && (
                            <img src={form.featuredImageUrl} alt="Vista previa destacada" className="mt-2 h-20 w-20 object-cover rounded-lg border dark:border-gray-600" />
                          )}
                        </div>
                        <div>
                          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <option value="">Sin categoría</option>
                            {categories.filter((c) => c.active).map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <button type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors">
                            <Package className="w-4 h-4" /> Crear Producto
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Bulk selection toolbar */}
                  {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedIds.length} seleccionado(s)</span>
                      <button onClick={() => { handleBulkAction('suspend') }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors">Suspender</button>
                      <button onClick={() => { handleBulkAction('restore') }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">Restaurar</button>
                      <button onClick={() => { handleBulkAction('delete') }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Eliminar</button>
                    </div>
                  )}

                  {/* Product table */}
                  <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                          <th className="text-left px-4 py-3 w-10">
                            <input type="checkbox" checked={selectAll} onChange={() => setSelectAll(!selectAll)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Producto</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Precios</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Stock</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Dest.</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Estado</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr><td colSpan={7} className="text-center px-4 py-12">
                            <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                              <Package className="w-10 h-10 mb-2 text-gray-300 dark:text-gray-600" />
                              <p className="text-sm font-medium">No hay productos</p>
                              <p className="text-xs mt-0.5">Creá tu primer producto arriba</p>
                            </div>
                          </td></tr>
                        ) : (
                          products.map((p) => (
                            <tr key={p.id} className={`border-t border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${p.active ? '' : 'opacity-50'}`}>
                              <td className="px-4 py-3">
                                <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {p.imageUrl && (
                                    <img src={p.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{p.name}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">#{p.id}{p.category?.name ? ` · ${p.category.name}` : ''}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="inline-flex flex-col items-center gap-0.5">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">Costo ${p.precioCosto.toLocaleString('es-CL')}</span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">May. ${p.precioMayorista.toLocaleString('es-CL')}</span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">Minorista ${p.precioBase.toLocaleString('es-CL')}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-200">{p.stock}</td>
                              <td className="px-4 py-3 text-center">
                                {p.featured ? <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" /> : <span className="text-gray-300 dark:text-gray-600">-</span>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                  {p.active ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex gap-1">
                                  <button onClick={() => openEdit(p)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Editar</button>
                                  <button onClick={() => handleToggleFeatured(p)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${p.featured ? 'bg-amber-400 hover:bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300'}`}>
                                    <Star className={`w-3.5 h-3.5 ${p.featured ? 'fill-white' : ''}`} />
                                  </button>
                                  <button onClick={() => handleToggleSuspend(p)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-white ${p.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'} transition-colors`}>
                                    {p.active ? 'Susp' : 'Act'}
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

              {/* Card: Categorías */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Categorías</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <input placeholder="Nombre *" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                          className="w-full sm:w-40 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                      <button onClick={handleCatCreate}
                        className="shrink-0 px-4 py-2 bg-gray-900 dark:bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors">+ Categoría</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {categories.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-gray-400 dark:text-gray-500">
                        <Settings className="w-10 h-10 mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm font-medium">Sin categorías</p>
                        <p className="text-xs mt-0.5">Creá una categoría para organizar productos</p>
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <div key={cat.id}>
                          <div
                            className={`flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 flex-wrap ${cat.active ? '' : 'opacity-50'}`}
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
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium text-white ${cat.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'} transition-colors`}>
                                {cat.active ? 'Suspender' : 'Restaurar'}
                              </button>
                              <button onClick={() => handleCatDelete(cat)} disabled={!cat.active}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                Eliminar
                              </button>
                            </div>
                          </div>
                          {expandedCat === cat.id && (
                            <div className="ml-0 sm:ml-8 mt-2 border border-gray-100 dark:border-gray-700 rounded-xl overflow-x-auto">
                              {catProductsLoading ? (
                                <div className="p-4 text-sm text-gray-400 dark:text-gray-500">Cargando...</div>
                              ) : catProducts.length === 0 ? (
                                <div className="p-4 text-sm text-gray-400 dark:text-gray-500">Sin productos</div>
                              ) : (
                                <table className="min-w-full text-xs">
                                  <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                                      <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Producto</th>
                                      <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">P. Base</th>
                                      <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">P. May.</th>
                                      <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Stock</th>
                                      <th className="text-center px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Dest</th>
                                      <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Estado</th>
                                      <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Acción</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {catProducts.map((p) => (
                                      <tr key={p.id} className={`border-t border-gray-50 dark:border-gray-700 ${p.active ? '' : 'opacity-50'}`}>
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{p.name}</td>
                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">${p.precioBase.toLocaleString('es-CL')}</td>
                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">${p.precioMayorista.toLocaleString('es-CL')}</td>
                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{p.stock}</td>
                                        <td className="px-4 py-2 text-center">
                                          {p.featured ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" /> : <span className="text-gray-300 dark:text-gray-600">-</span>}
                                        </td>
                                        <td className="px-4 py-2">
                                          <span className={`text-xs font-medium ${p.active ? 'text-blue-600' : 'text-red-500'}`}>
                                            {p.active ? 'Activo' : 'Suspendido'}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2">
                                          <div className="flex gap-1 flex-wrap">
                                            <button onClick={() => openEdit(p)}
                                              className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Editar</button>
                                            <button onClick={() => handleToggleFeatured(p)}
                                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${p.featured ? 'bg-amber-400 hover:bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300'}`}>
                                              <Star className={`w-3 h-3 ${p.featured ? 'fill-white' : ''}`} />
                                            </button>
                                            <button onClick={() => handleToggleSuspend(p)}
                                              className={`px-2 py-1 rounded-lg text-xs font-medium text-white ${p.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'} transition-colors`}>
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
              </div>

              {/* Card: Acciones Masivas */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actualización Masiva de Precios</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Selecciona productos en la tabla, ingresa un % y aplica el cambio.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="number" placeholder="Ej: 10 para +10%, -15 para -15%"
                      value={bulkPercentage} onChange={(e) => setBulkPercentage(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    <button onClick={handleBulkUpdate} disabled={selectedIds.length === 0}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      Aplicar a {selectedIds.length}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* USUARIOS */}
          {activeSection === 'usuarios' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-gray-700 overflow-hidden animate-slideUp">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <input type="text" placeholder="Buscar por nombre o email..." value={userSearch}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className="w-full sm:max-w-xs px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  {selectedUserIds.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedUserIds.length} seleccionado(s)</span>
                      <select value={bulkUserRole} onChange={(e) => setBulkUserRole(e.target.value)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="RETAIL">Minorista</option>
                        <option value="WHOLESALE">Mayorista</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button onClick={() => handleBulkRoleChange(bulkUserRole)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors">Cambiar Rol</button>
                    </div>
                  )}
                  <button onClick={() => setShowCreateUser(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0 ml-auto">
                    <Plus className="w-4 h-4" /> Crear Usuario
                  </button>
                </div>
                {usersLoading ? (
                  <div className="space-y-3 py-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full animate-shimmer" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 animate-shimmer rounded w-32" />
                          <div className="h-3 animate-shimmer rounded w-48" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-gray-400 dark:text-gray-500">
                    <User className="w-10 h-10 mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium">Sin usuarios</p>
                    <p className="text-xs mt-0.5">No se encontraron usuarios</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                          <th className="text-left px-4 py-3">
                            <input type="checkbox" checked={selectAllUsers} onChange={() => setSelectAllUsers(!selectAllUsers)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-30" />
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}{isSelf && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(tú)</span>}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                                u.role === 'WHOLESALE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
                              }`}>
                                {u.role === 'ADMIN' ? 'Admin' : u.role === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
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
                                  className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
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
                                <div className="flex gap-1 flex-wrap">
                                  {u.active ? (
                                    <button onClick={() => handleUserSuspend(u.id)}
                                      className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors">Suspender</button>
                                  ) : (
                                    <button onClick={() => handleUserActivate(u.id)}
                                      className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors">Activar</button>
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
            </div>
          )}

          {/* PEDIDOS */}
          {activeSection === 'pedidos' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-gray-700 overflow-hidden animate-slideUp">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <input type="text" placeholder="Buscar por nombre o email..." value={orderSearch}
                    onChange={(e) => { setOrderSearch(e.target.value); loadOrders(e.target.value, orderStatusFilter) }}
                    className="w-full sm:max-w-xs px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                  <select value={orderStatusFilter}
                    onChange={(e) => { setOrderStatusFilter(e.target.value); loadOrders(orderSearch, e.target.value) }}
                    className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="">Todos</option>
                    <option value="PENDING">Pendientes</option>
                    <option value="APPROVED">Aprobados</option>
                  </select>
                  <button onClick={() => setShowManualOrder(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0">
                    <Plus className="w-4 h-4" /> Pedido Manual
                  </button>
                </div>
                {ordersLoading ? (
                  <div className="space-y-3 py-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden animate-pulse-soft">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                          <div className="h-4 animate-shimmer rounded w-48" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-gray-400 dark:text-gray-500">
                    <ShoppingBag className="w-10 h-10 mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium">Sin pedidos</p>
                    <p className="text-xs mt-0.5">Los pedidos aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                        <div
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => toggleExpandOrder(order.id)}
                        >
                          <div className="flex items-center gap-3 flex-wrap">
                            {expandedOrder === order.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">#{order.id}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{order.user?.name}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'APPROVED' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            }`}>
                              {order.status === 'APPROVED' ? 'Aprobado' : 'Pendiente'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.clientCondition === 'WHOLESALE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
                            }`}>
                              {order.clientCondition === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">${Number(order.total).toLocaleString('es-CL')}</span>
                            {order.status === 'PENDING' && (
                              <button onClick={() => handleApproveOrder(order.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors">Aprobar</button>
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
                          <div className="border-t border-gray-100 dark:border-gray-700 p-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
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
                                    <td className="py-2 text-gray-700 dark:text-gray-300 max-w-[120px] sm:max-w-[200px] truncate">{item.productName}</td>
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
            </div>
          )}
        </main>
      </div>

      {cropImageUrl && (
        <ImageCropper imageUrl={cropImageUrl} onCrop={handleCropConfirm} onCancel={() => setCropImageUrl(null)}
          aspect={cropTarget?.includes('featured') ? 21 / 9 : 1} />
      )}

      {editProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 sm:backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Editar: {editProduct.name}</h2>
              <button onClick={closeEdit} className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}
              {success && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm px-4 py-3 rounded-xl">{success}</div>
              )}
              <input placeholder="Nombre *" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <textarea placeholder="Descripción" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Precio Minorista *" value={editForm.precioBase} onChange={(e) => setEditForm({ ...editForm, precioBase: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <input type="number" step="0.01" placeholder="Precio Mayorista *" value={editForm.precioMayorista} onChange={(e) => setEditForm({ ...editForm, precioMayorista: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <input type="number" step="0.01" placeholder="Precio Costo *" value={editForm.precioCosto} onChange={(e) => setEditForm({ ...editForm, precioCosto: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <input type="number" placeholder="Stock" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
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
                    className="flex-1 min-w-0 sm:min-w-[200px] px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                {editForm.imageUrl && (
                  <img src={editForm.imageUrl} alt="Vista previa" className="mt-2 h-20 w-20 object-cover rounded-lg border dark:border-gray-600" />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Imagen destacada (opcional)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <Upload size={16} />
                    {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
                      onChange={(e) => handleImageUpload(e, 'edit-featured')} />
                  </label>
                  <span className="text-xs text-gray-400">o</span>
                  <input placeholder="URL imagen destacada" value={editForm.featuredImageUrl} onChange={(e) => setEditForm((prev) => ({ ...prev, featuredImageUrl: e.target.value }))}
                    className="flex-1 min-w-0 sm:min-w-[200px] px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                {editForm.featuredImageUrl && (
                  <img src={editForm.featuredImageUrl} alt="Vista previa destacada" className="mt-2 h-20 w-20 object-cover rounded-lg border dark:border-gray-600" />
                )}
              </div>
              <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Sin categoría</option>
                {categories.filter((c) => c.active).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors">
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
                <button type="button" onClick={closeEdit}
                  className="sm:flex-none px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManualOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 sm:backdrop-blur-sm flex items-center justify-center p-4">
          <div className="animate-scaleIn bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Crear Pedido Manual</h2>
              <button onClick={() => setShowManualOrder(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Usuario *</label>
              <div className="relative">
                <input type="text" placeholder="Buscar usuario por nombre o email..." autoComplete="off"
                  value={manualOrderUser ? (users.find((u) => u.id === manualOrderUser)?.name || '') : manualOrderSearchUser}
                  onChange={(e) => { setManualOrderSearchUser(e.target.value); if (!e.target.value) setManualOrderUser(''); setManualOrderUserOpen(true) }}
                  onFocus={() => { if (manualOrderUser) { setManualOrderUser(''); setManualOrderSearchUser('') }; setManualOrderUserOpen(true) }}
                  onBlur={() => setTimeout(() => setManualOrderUserOpen(false), 200)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                {manualOrderUser && (
                  <button onClick={() => { setManualOrderUser(''); setManualOrderSearchUser('') }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-4 h-4" />
                  </button>
                )}
                {manualOrderUserOpen && (
                  <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto" onMouseDown={(e) => e.preventDefault()}>
                    {users.filter((u) => u.active && (!manualOrderSearchUser || u.name.toLowerCase().includes(manualOrderSearchUser.toLowerCase()) || u.email.toLowerCase().includes(manualOrderSearchUser.toLowerCase()))).length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">Sin resultados</div>
                    ) : (
                      users.filter((u) => u.active && (!manualOrderSearchUser || u.name.toLowerCase().includes(manualOrderSearchUser.toLowerCase()) || u.email.toLowerCase().includes(manualOrderSearchUser.toLowerCase()))).map((u) => (
                        <button key={u.id} type="button" onClick={() => { setManualOrderUser(u.id); setManualOrderSearchUser(''); setManualOrderUserOpen(false) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          {u.name} <span className="text-gray-400 dark:text-gray-500">{u.email}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Condition */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Condición de precio *</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setManualOrderCondition('RETAIL')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${manualOrderCondition === 'RETAIL' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  Minorista
                </button>
                <button type="button" onClick={() => setManualOrderCondition('WHOLESALE')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${manualOrderCondition === 'WHOLESALE' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  Mayorista
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Productos *</label>
              <div className="space-y-3">
                {manualOrderItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex-1 relative">
                      <input type="text" placeholder="Buscar producto..." autoComplete="off"
                        value={item.productId ? (products.find((p) => p.id === item.productId)?.name || '') : item.search}
                        onChange={(e) => {
                          const newItems = [...manualOrderItems]
                          newItems[idx] = { ...newItems[idx], search: e.target.value, productId: '' }
                          setManualOrderItems(newItems)
                          setManualOrderProductOpen(idx)
                        }}
                        onFocus={() => {
                          if (item.productId) {
                            const newItems = [...manualOrderItems]
                            newItems[idx] = { ...newItems[idx], productId: '', search: '' }
                            setManualOrderItems(newItems)
                          }
                          setManualOrderProductOpen(idx)
                        }}
                        onBlur={() => setTimeout(() => setManualOrderProductOpen(null), 200)}
                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                      {item.productId && (
                        <button onClick={() => {
                          const newItems = [...manualOrderItems]
                          newItems[idx] = { ...newItems[idx], productId: '', search: '' }
                          setManualOrderItems(newItems)
                        }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {manualOrderProductOpen === idx && (() => {
                        const selectedIds = new Set(manualOrderItems.map((i) => i.productId).filter(Boolean))
                        selectedIds.delete(item.productId) // allow current selection
                        const available = products.filter((p) => p.active && (!item.search || p.name.toLowerCase().includes(item.search.toLowerCase())) && !selectedIds.has(p.id))
                        return (
                        <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto" onMouseDown={(e) => e.preventDefault()}>
                          {available.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">Sin resultados</div>
                          ) : (
                            available.map((p) => (
                              <button key={p.id} type="button" onClick={() => {
                                const newItems = [...manualOrderItems]
                                newItems[idx] = { ...newItems[idx], productId: p.id, search: '' }
                                setManualOrderItems(newItems)
                                setManualOrderProductOpen(null)
                              }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between">
                                <span>{p.name}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  ${(manualOrderCondition === 'WHOLESALE' ? p.precioMayorista : p.precioBase).toLocaleString('es-CL')} · stock: {p.stock}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                        )
                      })()}
                    </div>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => {
                      const newItems = [...manualOrderItems]
                      newItems[idx] = { ...newItems[idx], quantity: Math.max(1, parseInt(e.target.value) || 1) }
                      setManualOrderItems(newItems)
                    }} required
                      className="w-20 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center" />
                    {manualOrderItems.length > 1 && (
                      <button onClick={() => setManualOrderItems(manualOrderItems.filter((_, i) => i !== idx))}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setManualOrderItems([...manualOrderItems, { productId: '', quantity: 1, search: '' }])}
                className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
                <Plus className="w-4 h-4" /> Agregar producto
              </button>
            </div>

            {/* Total preview */}
            {manualOrderItems.some((i) => i.productId) && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total estimado: </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${manualOrderItems.reduce((sum, item) => {
                    const p = products.find((x) => x.id === item.productId)
                    if (!p || !item.productId) return sum
                    const price = manualOrderCondition === 'WHOLESALE' ? (p.precioMayorista || 0) : (p.precioBase || 0)
                    return sum + price * item.quantity
                  }, 0).toLocaleString('es-CL')}
                </span>
                <span className="text-gray-400 dark:text-gray-500"> ({manualOrderCondition === 'WHOLESALE' ? 'Mayorista' : 'Minorista'})</span>
              </div>
            )}

            <button onClick={handleCreateManualOrder} disabled={!manualOrderUser || manualOrderItems.every((i) => !i.productId) || manualOrderSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {manualOrderSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {manualOrderSubmitting ? 'Creando...' : 'Crear Pedido'}
            </button>
          </div>
        </div>
      )}

      {showCreateUser && (
        <div className="fixed inset-0 z-50 bg-black/40 sm:backdrop-blur-sm flex items-center justify-center p-4">
          <div className="animate-scaleIn bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Crear Usuario</h2>
              <button onClick={() => setShowCreateUser(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <input placeholder="Nombre *" value={createUserForm.name} onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <input type="email" placeholder="Email *" value={createUserForm.email} onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <input type="password" placeholder="Contraseña * (mín. 6 caracteres)" value={createUserForm.password} onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })} required minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <input placeholder="Teléfono (opcional)" value={createUserForm.phone} onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <select value={createUserForm.role} onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="RETAIL">Minorista</option>
                <option value="WHOLESALE">Mayorista</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button type="submit" disabled={createUserSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {createUserSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {createUserSubmitting ? 'Creando...' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
