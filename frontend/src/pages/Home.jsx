import React, { useState, useEffect } from 'react'
import { getProducts, getCategories } from '../services/api'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import Cart from '../components/Cart'
import Navbar from '../components/Navbar'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods)
        setCategories(cats)
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])

  function loadProducts(params = '') {
    setLoading(true)
    getProducts(params)
      .then(setProducts)
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar productos'))
      .finally(() => setLoading(false))
  }

  function buildParams(category, searchTerm, sort) {
    const params = new URLSearchParams()
    if (category) params.set('categoryId', category)
    if (searchTerm) params.set('search', searchTerm)
    if (sort) params.set('sortBy', sort)
    return params.toString() ? `?${params.toString()}` : ''
  }

  function handleCategoryChange(categoryId) {
    setSelectedCategory(categoryId)
    loadProducts(buildParams(categoryId, search, sortBy))
  }

  function handleSearch(value) {
    setSearch(value)
    loadProducts(buildParams(selectedCategory, value, sortBy))
  }

  function handleSortChange(value) {
    setSortBy(value)
    loadProducts(buildParams(selectedCategory, search, value))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onCartClick={() => setCartOpen(true)} search={search} onSearch={handleSearch} />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Nuestros Productos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Encuentra lo que buscas al mejor precio</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500 dark:text-gray-400 font-medium hidden sm:block">Filtrar:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Por defecto</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-80 animate-pulse border border-gray-100 dark:border-gray-700">
                <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <p className="text-lg font-medium">Sin productos</p>
            <p className="text-sm mt-1">No hay productos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onView={() => setSelectedProduct(product)} />
            ))}
          </div>
        )}
      </main>

      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
