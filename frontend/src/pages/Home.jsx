import React, { useState, useEffect, useRef } from 'react'
import { getProducts, getProduct, getCategories, getFeaturedProducts } from '../services/api'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import Cart from '../components/Cart'
import Navbar from '../components/Navbar'
import { ChevronLeft, ChevronRight, Star, Package } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, isWholesale } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [sortBy, setSortBy] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const timerRef = useRef(null)

  const visibleFeatured = selectedCategories.length > 0
    ? featuredProducts.filter((p) => selectedCategories.includes(p.category?.id))
    : featuredProducts

  useEffect(() => {
    Promise.all([getCategories(), getFeaturedProducts()])
      .then(([cats, featured]) => {
        setCategories(cats)
        setFeaturedProducts(featured)
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar datos'))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = buildParams(selectedCategories, search, sortBy)
    getProducts(params)
      .then(setProducts)
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar productos'))
      .finally(() => setLoading(false))
  }, [selectedCategories, search, sortBy])

  function restartTimer() {
    clearInterval(timerRef.current)
    if (visibleFeatured.length < 2) return
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % visibleFeatured.length)
    }, 4000)
  }

  function goSlide(dir) {
    setCurrentSlide((prev) => {
      const total = visibleFeatured.length
      return (prev + dir + total) % total
    })
    restartTimer()
  }

  useEffect(() => {
    restartTimer()
    return () => clearInterval(timerRef.current)
  }, [visibleFeatured.length])

  function loadProducts(params = '') {
    setLoading(true)
    getProducts(params)
      .then(setProducts)
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar productos'))
      .finally(() => setLoading(false))
  }

  function openProduct(product) {
    setSelectedProduct(product)
    getProduct(product.id)
      .then(setSelectedProduct)
      .catch(() => {})
  }

  function buildParams(categories, searchTerm, sort) {
    const params = new URLSearchParams()
    if (categories.length > 0) {
      categories.forEach((id) => params.append('categoryId', id))
    }
    if (searchTerm) params.set('search', searchTerm)
    if (sort) params.set('sortBy', sort)
    return params.toString() ? `?${params.toString()}` : ''
  }

  function handleCategoryChange(categoryId) {
    setCurrentSlide(0)
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    )
  }

  function handleSearch(value) {
    setSearch(value)
  }

  function handleSortChange(value) {
    setSortBy(value)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar
        onCartClick={() => setCartOpen(true)}
        search={search}
        onSearch={handleSearch}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />

      <main className="pt-6 pb-12 animate-fadeIn">
        {/* Brand hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950 text-white px-6 sm:px-10 py-10 sm:py-14">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-orange-600/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Catálogo mayorista y minorista
              </span>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Quince <span className="text-amber-400">Gear</span> SN
              </h1>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-xl">
                Tecnología, accesorios y gadgets con precios pensados para revender o regalar.
                Elegí tu categoría, armá tu pedido y envialo por WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Banner Carousel */}
        {visibleFeatured.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              {(() => {
                const product = visibleFeatured[currentSlide]
                if (!product) return null
                return (
                  <div key={product.id} onClick={() => openProduct(product)} className="cursor-pointer relative">
                    <div className="aspect-[2/1] sm:aspect-[21/9] bg-gray-100 dark:bg-gray-700/50">
                      {product.featuredImageUrl || product.imageUrl ? (
                          <img src={product.featuredImageUrl || product.imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-gray-600">
                          <Star className="w-12 h-12 text-amber-300 fill-amber-300" />
                          <span className="text-lg font-semibold text-gray-400">{product.name}</span>
                        </div>
                      )}
                    </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6">
                        <p className="text-xs text-white/70">{product.category?.name}</p>
                        <p className="text-lg sm:text-xl font-bold text-white mt-1">{product.name}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl sm:text-2xl font-bold text-yellow-400">
                            ${(product.pricing?.unitPrice || product.precioBase || 0).toLocaleString('es-CL')}
                          </span>
                          {isWholesale && (product.precioBase || 0) > (product.pricing?.unitPrice || 0) && (
                            <span className="text-sm sm:text-base text-white/50 line-through">
                              ${(product.precioBase || 0).toLocaleString('es-CL')}
                            </span>
                          )}
                        </div>
                      </div>
                  </div>
                )
              })()}

              {visibleFeatured.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); goSlide(-1) }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 shadow-lg transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); goSlide(1) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 shadow-lg transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {visibleFeatured.map((_, i) => (
                        <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); restartTimer() }}
                        className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-yellow-400' : 'w-2 bg-white/60 hover:bg-white/90'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header with sort */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Productos</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
            >
              <option value="">Ordenar</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="h-36 animate-shimmer" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 animate-shimmer rounded w-3/4" />
                    <div className="h-5 animate-shimmer rounded w-1/3" />
                    <div className="h-3 animate-shimmer rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <Package className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium">Sin productos</p>
              <p className="text-sm mt-1">No hay productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {[...products].sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0)).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} onView={() => openProduct(product)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
