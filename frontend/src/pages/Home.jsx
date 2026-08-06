import React, { useState, useEffect, useRef } from 'react'
import { getProducts, getProduct, getCategories, getFeaturedProducts } from '../services/api'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import Cart from '../components/Cart'
import Navbar from '../components/Navbar'
import { ChevronLeft, ChevronRight, Star, Package, ArrowRight, MessageCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { isWholesale } = useAuth()
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
  const catalogRef = useRef(null)

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

  function scrollToCatalog() {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar
        onCartClick={() => setCartOpen(true)}
        search={search}
        onSearch={setSearch}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />

      <main className="pb-16 animate-fadeIn">
        {/* Brand hero */}
        <section className="relative overflow-hidden border-b border-gray-200/60 dark:border-blue-500/15">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/90 to-accent-100/80 dark:from-[#07101f] dark:via-[#0c1a38] dark:to-[#1e3a8a]/50" />
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent-200/60 dark:bg-accent-500/25 blur-3xl animate-hero-float" />
          <div className="absolute -bottom-28 -left-20 w-96 h-96 rounded-full bg-sky-200/50 dark:bg-blue-600/20 blur-3xl animate-hero-float-delayed" />
          <div className="absolute inset-0 opacity-[0.35] dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(37 99 235 / 0.12) 1px, transparent 0)', backgroundSize: '28px 28px' }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <span className="section-eyebrow mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 dark:bg-accent-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                Catálogo mayorista y minorista
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-gray-900 dark:text-white mt-4">
                Quince <span className="text-red-500">Gear</span> SN
              </h1>
              <p className="mt-5 text-base sm:text-lg text-gray-500 dark:text-blue-100/70 max-w-xl leading-relaxed">
                Tecnología, accesorios y gadgets con precios pensados para revender o regalar.
                Elegí, armá tu pedido y cerralo por WhatsApp en minutos.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={scrollToCatalog} className="btn-accent px-5 py-3 text-sm">
                  Ver catálogo
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setCartOpen(true)} className="btn-outline px-5 py-3 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Pedir por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Banner Carousel */}
        {visibleFeatured.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 mb-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <span className="section-eyebrow">
                  <Sparkles className="w-3.5 h-3.5" />
                  Destacados
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1.5">
                  Lo que más se mueve
                </h2>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden surface-panel shadow-soft dark:shadow-2xl group/carousel">
              {(() => {
                const product = visibleFeatured[currentSlide]
                if (!product) return null
                return (
                  <div key={product.id} onClick={() => openProduct(product)} className="cursor-pointer relative">
                    <div className="aspect-[2/1] sm:aspect-[21/9] bg-gradient-to-br from-gray-50 to-blue-50/40 dark:from-gray-900/40 dark:to-blue-950/30">
                      {product.featuredImageUrl || product.imageUrl ? (
                        <img
                          src={product.featuredImageUrl || product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-contain transition-transform duration-700 group-hover/carousel:scale-[1.02]"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-gray-600">
                          <Star className="w-12 h-12 text-accent-300 fill-accent-300" />
                          <span className="text-lg font-semibold text-gray-400">{product.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-5 sm:p-7">
                      <p className="text-xs font-medium uppercase tracking-wider text-blue-200/80">{product.category?.name}</p>
                      <p className="text-lg sm:text-2xl font-display font-bold text-white mt-1">{product.name}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl sm:text-2xl font-bold text-sky-300">
                          ${(product.pricing?.unitPrice || product.precioBase || 0).toLocaleString('es-CL')}
                        </span>
                        {isWholesale && (product.precioBase || 0) > (product.pricing?.unitPrice || 0) && (
                          <span className="text-sm sm:text-base text-white/45 line-through">
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
                  <button
                    onClick={(e) => { e.stopPropagation(); goSlide(-1) }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-lg backdrop-blur-sm transition-all hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goSlide(1) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 shadow-lg backdrop-blur-sm transition-all hover:scale-105"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {visibleFeatured.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); restartTimer() }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-7 bg-sky-300' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div ref={catalogRef} id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
            <div>
              <span className="section-eyebrow">Catálogo</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1.5">Productos</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-full sm:w-auto sm:min-w-[180px] py-2.5 bg-white/90 dark:bg-gray-800"
            >
              <option value="">Ordenar por</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
            </select>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="surface-panel overflow-hidden">
                  <div className="aspect-square m-2 rounded-2xl animate-shimmer" />
                  <div className="px-3 pb-4 space-y-2">
                    <div className="h-3 animate-shimmer rounded w-3/4" />
                    <div className="h-5 animate-shimmer rounded w-1/3" />
                    <div className="h-8 animate-shimmer rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="surface-panel flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <div className="w-16 h-16 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-accent-400" />
              </div>
              <p className="text-lg font-display font-semibold text-gray-700 dark:text-gray-200">Sin productos</p>
              <p className="text-sm mt-1">No hay productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              {[...products].sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0)).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} onView={() => openProduct(product)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200/70 dark:border-blue-500/10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-bold text-gray-900 dark:text-white">
              Quince <span className="text-red-500">Gear</span> SN
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tecnología lista para revender.</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">© {new Date().getFullYear()} Quince Gear SN</p>
        </div>
      </footer>

      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  )
}
