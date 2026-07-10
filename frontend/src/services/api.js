import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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

export function getProfile() {
  return api.get('/auth/profile').then((res) => res.data)
}

export function getProducts(query = '') {
  return api.get(`/products${query}`).then((res) => res.data)
}

export function getProduct(id) {
  return api.get(`/products/${id}`).then((res) => res.data)
}

export function createProduct(data) {
  return api.post('/products', data).then((res) => res.data)
}

export function updateProduct(id, data) {
  return api.put(`/products/${id}`, data).then((res) => res.data)
}

export function updateProductPrice(id, data) {
  return api.patch(`/products/${id}/price`, data).then((res) => res.data)
}

export function bulkUpdatePrices(productIds, percentage) {
  return api.post('/products/bulk-update-prices', { productIds, percentage }).then((res) => res.data)
}

export function suspendProduct(id) {
  return api.patch(`/products/${id}/suspend`).then((res) => res.data)
}

export function restoreProduct(id) {
  return api.patch(`/products/${id}/restore`).then((res) => res.data)
}

export function deleteProduct(id) {
  return api.delete(`/products/${id}`).then((res) => res.data)
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
  return api.get('/categories').then((res) => res.data)
}

export function getCategory(id) {
  return api.get(`/categories/${id}`).then((res) => res.data)
}

export function createCategory(data) {
  return api.post('/categories', data).then((res) => res.data)
}

export function updateCategory(id, data) {
  return api.put(`/categories/${id}`, data).then((res) => res.data)
}

export function suspendCategory(id) {
  return api.patch(`/categories/${id}/suspend`).then((res) => res.data)
}

export function restoreCategory(id) {
  return api.patch(`/categories/${id}/restore`).then((res) => res.data)
}

export function deleteCategory(id) {
  return api.delete(`/categories/${id}`).then((res) => res.data)
}

export default api
