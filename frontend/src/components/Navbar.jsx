import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, LogOut, User, Moon, Sun, LayoutDashboard, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useDarkMode } from '../contexts/DarkModeContext'
import ProfileModal from './ProfileModal'
import OrdersModal from './OrdersModal'

export default function Navbar({ onCartClick, search, onSearch, categories, selectedCategories, onCategoryChange }) {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const { dark, toggleDark } = useDarkMode()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [ordersOpen, setOrdersOpen] = React.useState(false)
  const [catOverflow, setCatOverflow] = React.useState(false)
  const [catDir, setCatDir] = React.useState(null)
  const catRef = React.useRef(null)
  const catLastScroll = React.useRef(0)

  const getScrollAmount = () => Math.max(200, Math.floor((catRef.current?.clientWidth || 400) * 0.75))

  function scrollCategories(direction) {
    const el = catRef.current
    if (!el) return
    el.scrollLeft += direction * getScrollAmount()
  }

  React.useEffect(() => {
    const el = catRef.current
    if (!el) return
    const check = () => setCatOverflow(el.scrollWidth > el.clientWidth)
    const ro = new ResizeObserver(check)
    ro.observe(el)
    check()
    return () => ro.disconnect()
  }, [categories])

  React.useEffect(() => {
    const el = catRef.current
    if (!el) return
    catLastScroll.current = el.scrollLeft
    const onScroll = () => {
      const delta = el.scrollLeft - catLastScroll.current
      if (delta !== 0) {
        setCatDir(delta > 0 ? 'right' : 'left')
        catLastScroll.current = el.scrollLeft
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [categories])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const cartButton = (
    <button onClick={onCartClick} className="icon-btn relative" title="Carrito">
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm shadow-red-500/40 animate-popIn">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white/75 dark:bg-gray-900/85 border-b border-gray-200/80 dark:border-blue-500/15 shadow-soft backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
              <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                <img src="/logo.png" alt="Logo" className="h-7 sm:h-8 w-auto transition-transform duration-300 group-hover:scale-105" />
                <span className="font-display text-base sm:text-lg font-bold text-gray-900 dark:text-white hidden sm:block tracking-tight">
                  Quince <span className="text-red-500">Gear</span> SN
                </span>
              </Link>

              <div className="flex-1 min-w-0 max-w-[120px] sm:max-w-xl mx-1 sm:mx-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1">
                <button onClick={toggleDark} className="icon-btn" title={dark ? 'Modo claro' : 'Modo oscuro'}>
                  {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {!user ? (
                  <>
                    {cartButton}
                    <Link to="/login" className="btn-accent ml-1 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full">
                      Ingresar
                    </Link>
                  </>
                ) : (
                  <>
                    <button onClick={() => setProfileOpen(true)} className="icon-btn" title="Perfil">
                      <User className="w-5 h-5" />
                    </button>

                    {!isAdmin && (
                      <button onClick={() => setOrdersOpen(true)} className="icon-btn" title="Mis Pedidos">
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    )}

                    {isAdmin ? (
                      <Link to="/admin" className="icon-btn" title="Panel Admin">
                        <LayoutDashboard className="w-5 h-5" />
                      </Link>
                    ) : (
                      cartButton
                    )}

                    <button onClick={handleLogout} className="icon-btn hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" title="Cerrar sesión">
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-14 sm:h-16" />

      {categories && categories.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-900/80 border-b border-gray-200/70 dark:border-blue-500/10 shadow-sm animate-catDrop backdrop-blur-xl sticky top-14 sm:top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {catOverflow && (
              <button
                onClick={() => scrollCategories(-1)}
                className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-500 dark:text-gray-300 hover:text-accent-600 shadow-sm border border-gray-100 dark:border-blue-500/15"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <div
              ref={catRef}
              className={`category-scroll-container flex items-center gap-1.5 overflow-x-auto py-2.5 scroll-smooth scrollbar-hide ${catOverflow ? 'sm:mx-10' : 'justify-center'} ${catDir === 'right' ? 'animate-catRight' : catDir === 'left' ? 'animate-catLeft' : ''}`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`shrink-0 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-md shadow-accent-500/30 scale-[1.03]'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-accent-50 dark:hover:bg-accent-500/10 hover:text-accent-600 dark:hover:text-accent-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {catOverflow && (
              <button
                onClick={() => scrollCategories(1)}
                className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-500 dark:text-gray-300 hover:text-accent-600 shadow-sm border border-gray-100 dark:border-blue-500/15"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      {ordersOpen && <OrdersModal onClose={() => setOrdersOpen(false)} />}
    </>
  )
}
