import React, { useState, useEffect, useRef } from 'react'
import { getProducts, getCategories, getFeaturedProducts } from '../services/api'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import Cart from '../components/Cart'
import Navbar from '../components/Navbar'
import { ChevronLeft, ChevronRight, Star, Package } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getFeaturedProducts()])
      .then(([prods, cats, featured]) => {
        setProducts(prods)
        setCategories(cats)
        setFeaturedProducts(featured)
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])

  function scrollCarousel(dir) {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.6
    scrollRef.current.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

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
        {featuredProducts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Destacados
              </h2>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel(-1)}
                  className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollCarousel(1)}
                  className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 sm:-mx-0 px-4 sm:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {featuredProducts.map((product) => (
                <div key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="snap-start shrink-0 w-44 sm:w-52 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.category?.name}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-0.5">{product.name}</p>
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
                      ${product.pricing?.price?.toLocaleString('es-CL') || product.precioBase?.toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              className="w-full sm:w-auto px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            {[...products].sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0)).map((product) => (
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
