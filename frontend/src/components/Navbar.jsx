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

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main header row */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md dark:shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <img src="/logo.png" alt="Logo" className="h-7 sm:h-8 w-auto transition-transform duration-300 group-hover:scale-105" />
              <span className="font-display text-base sm:text-lg font-bold text-gray-900 dark:text-white hidden sm:block">Quince <span className="text-red-500">Gear</span> SN</span>
            </Link>

            {/* Search bar */}
            <div className="flex-1 min-w-0 max-w-[100px] sm:max-w-xl mx-1 sm:mx-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={toggleDark} className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors" title={dark ? 'Modo claro' : 'Modo oscuro'}>
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {!user ? (
                <>
                  <button onClick={onCartClick} className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </button>
                  <Link to="/login" className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-sm hover:shadow-md shadow-accent-500/25 transition-all duration-200">
                    Ingresar
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={() => setProfileOpen(true)} className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors" title="Perfil">
                    <User className="w-5 h-5" />
                  </button>

                  {!isAdmin && (
                    <button onClick={() => setOrdersOpen(true)} className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors" title="Mis Pedidos">
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  )}

                  {isAdmin ? (
                    <Link to="/admin" className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors" title="Panel Admin">
                      <LayoutDashboard className="w-5 h-5" />
                    </Link>
                  ) : (
                    <button onClick={onCartClick} className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                      {itemCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </button>
                  )}

                  <button onClick={handleLogout} className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Cerrar sesión">
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

      {/* Categories nav bar - in normal flow, pushes page content */}
      {categories && categories.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm animate-catDrop">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {catOverflow && (
              <button onClick={() => { catRef.current?.scrollBy({ left: -200, behavior: 'smooth' }) }}
                className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 p-0.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <div ref={catRef} className={`flex items-center gap-1 overflow-x-auto py-2 scroll-smooth scrollbar-none ${catOverflow ? 'sm:mx-10' : 'justify-center'} ${catDir === 'right' ? 'animate-catRight' : catDir === 'left' ? 'animate-catLeft' : ''}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`shrink-0 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-md shadow-accent-500/30 scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-accent-50 dark:hover:bg-gray-800 hover:text-accent-600 dark:hover:text-accent-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {catOverflow && (
              <button onClick={() => { catRef.current?.scrollBy({ left: 200, behavior: 'smooth' }) }}
                className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 p-0.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
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
