import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

function currentRole() {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored)?.role || 'GUEST' : 'GUEST'
  } catch {
    return 'GUEST'
  }
}

function cacheKey(url) {
  return `${url}|${currentRole()}`
}

function cachedGet(url, ttl = CACHE_TTL) {
  const key = cacheKey(url)
  const entry = cache.get(key)
  if (entry && Date.now() - entry.ts < ttl) {
    return Promise.resolve(entry.data)
  }
  return api.get(url).then((res) => {
    cache.set(key, { ts: Date.now(), data: res.data })
    return res.data
  })
}

function invalidateCache(prefix) {
  for (const key of [...cache.keys()]) {
    if (!prefix || key.startsWith(prefix)) cache.delete(key)
  }
}

function invalidateProducts() {
  invalidateProducts()
  invalidateCache('/categories')
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function login(email, password) {
  return api.post('/auth/login', { email, password }).then((res) => res.data)
}

export function register(data) {
  return api.post('/auth/register', data).then((res) => res.data)
}

export function adminCreateUser(data) {
  return api.post('/auth/admin-create', data).then((res) => res.data)
}

export function getProfile() {
  return api.get('/auth/profile').then((res) => res.data)
}

export function getProducts(query = '') {
  return cachedGet(`/products${query}`)
}

export function getProduct(id) {
  return cachedGet(`/products/${id}`)
}

export function createProduct(data) {
  return api.post('/products', data).then((res) => { invalidateProducts(); return res.data })
}

export function updateProduct(id, data) {
  return api.put(`/products/${id}`, data).then((res) => { invalidateProducts(); return res.data })
}

export function updateProductPrice(id, data) {
  return api.patch(`/products/${id}/price`, data).then((res) => { invalidateProducts(); return res.data })
}

export function bulkUpdatePrices(productIds, percentage) {
  return api.post('/products/bulk-update-prices', { productIds, percentage }).then((res) => { invalidateProducts(); return res.data })
}

export function bulkSuspendProducts(productIds) {
  return api.post('/products/bulk-suspend', { productIds }).then((res) => { invalidateProducts(); return res.data })
}

export function bulkRestoreProducts(productIds) {
  return api.post('/products/bulk-restore', { productIds }).then((res) => { invalidateProducts(); return res.data })
}

export function bulkDeleteProducts(productIds) {
  return api.post('/products/bulk-delete', { productIds }).then((res) => { invalidateProducts(); return res.data })
}

export function suspendProduct(id) {
  return api.patch(`/products/${id}/suspend`).then((res) => { invalidateProducts(); return res.data })
}

export function restoreProduct(id) {
  return api.patch(`/products/${id}/restore`).then((res) => { invalidateProducts(); return res.data })
}

export function deleteProduct(id) {
  return api.delete(`/products/${id}`).then((res) => { invalidateProducts(); return res.data })
}

export function toggleFeatured(id) {
  return api.patch(`/products/${id}/featured`).then((res) => { invalidateProducts(); return res.data })
}

export function getFeaturedProducts() {
  return cachedGet('/products/featured')
}

export function bulkUploadProducts(file) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/products/bulk-upload', formData).then((res) => { invalidateProducts(); return res.data })
}

export function getCart() {
  return api.get('/cart').then((res) => res.data)
}

export function addToCart(productId, quantity = 1) {
  return api.post('/cart/add', { productId, quantity }).then((res) => res.data)
}

export function updateCartItem(id, quantity) {
  return api.put(`/cart/${id}`, { quantity }).then((res) => res.data)
}

export function removeCartItem(id) {
  return api.delete(`/cart/${id}`).then((res) => res.data)
}

export function clearCart() {
  return api.delete('/cart').then((res) => res.data)
}

export function getCartSummary() {
  return api.get('/cart/summary').then((res) => res.data)
}

export function getWhatsAppLink() {
  return api.get('/cart/whatsapp-link').then((res) => res.data)
}

export function getCategories() {
  return cachedGet('/categories')
}

export function getCategory(id) {
  return cachedGet(`/categories/${id}`)
}

export function createCategory(data) {
  return api.post('/categories', data).then((res) => { invalidateCache('/categories'); return res.data })
}

export function updateCategory(id, data) {
  return api.put(`/categories/${id}`, data).then((res) => { invalidateCache('/categories'); return res.data })
}

export function suspendCategory(id) {
  return api.patch(`/categories/${id}/suspend`).then((res) => { invalidateCache('/categories'); return res.data })
}

export function restoreCategory(id) {
  return api.patch(`/categories/${id}/restore`).then((res) => { invalidateCache('/categories'); return res.data })
}

export function deleteCategory(id) {
  return api.delete(`/categories/${id}`).then((res) => { invalidateCache('/categories'); return res.data })
}

export function getUsers(search = '') {
  return api.get(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`).then((res) => res.data)
}

export function updateUserRole(id, role) {
  return api.patch(`/users/${id}/role`, { role }).then((res) => res.data)
}

export function bulkUpdateUserRole(userIds, role) {
  return api.patch('/users/bulk-role', { userIds, role }).then((res) => res.data)
}

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/upload', formData).then((res) => res.data)
}

export function suspendUser(id) {
  return api.patch(`/users/${id}/suspend`).then((res) => res.data)
}

export function activateUser(id) {
  return api.patch(`/users/${id}/activate`).then((res) => res.data)
}

export function deleteUser(id) {
  return api.delete(`/users/${id}`).then((res) => res.data)
}

export function updateProfile(data) {
  return api.patch('/auth/profile', data).then((res) => res.data)
}

export function createOrderFromCart() {
  return api.post('/orders/from-cart').then((res) => res.data)
}

export function createManualOrder(data) {
  return api.post('/orders/manual', data).then((res) => res.data)
}

export function getOrders(search = '', status = '') {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  const qs = params.toString()
  return api.get(`/orders${qs ? `?${qs}` : ''}`).then((res) => res.data)
}

export function getMyOrders() {
  return api.get('/orders/mine').then((res) => res.data)
}

export function getOrder(id) {
  return api.get(`/orders/${id}`).then((res) => res.data)
}

export function approveOrder(id) {
  return api.patch(`/orders/${id}/approve`).then((res) => res.data)
}

export function cancelMyOrder(id) {
  return api.patch(`/orders/${id}/cancel`).then((res) => res.data)
}

export function deleteOrder(id) {
  return api.delete(`/orders/${id}`).then((res) => res.data)
}

export async function downloadOrderPdf(id) {
  const res = await api.get(`/orders/${id}/pdf`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  const disposition = res.headers?.['content-disposition']
  const match = disposition && disposition.match(/filename=([^;]+)/)
  a.download = match ? match[1] : `remito-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default api
