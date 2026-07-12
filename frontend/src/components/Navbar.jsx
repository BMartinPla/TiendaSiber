import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, LogOut, User, Moon, Sun, LayoutDashboard, ShoppingBag, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useDarkMode } from '../contexts/DarkModeContext'

export default function Navbar({ onCartClick, search, onSearch, categories, selectedCategory, onCategoryChange }) {
  const { logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const { dark, toggleDark } = useDarkMode()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = React.useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main header row */}
      <div className="bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-1.5 text-white/80 hover:text-white">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="Logo" className="h-7 sm:h-8 w-auto brightness-0 invert" />
              <span className="text-base sm:text-lg font-bold text-white hidden sm:block">Quince Gear SN</span>
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-xl mx-2 sm:mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm border-none rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={toggleDark} className="p-1.5 sm:p-2 text-white/70 hover:text-white transition-colors" title={dark ? 'Modo claro' : 'Modo oscuro'}>
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <Link to="/profile" className="p-1.5 sm:p-2 text-white/70 hover:text-white transition-colors" title="Perfil">
                <User className="w-5 h-5" />
              </Link>

              {!isAdmin && (
                <Link to="/mis-pedidos" className="hidden sm:block p-1.5 sm:p-2 text-white/70 hover:text-white transition-colors" title="Mis Pedidos">
                  <ShoppingBag className="w-5 h-5" />
                </Link>
              )}

              {isAdmin ? (
                <Link to="/admin" className="p-1.5 sm:p-2 text-white/70 hover:text-white transition-colors" title="Panel Admin">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
              ) : (
                <button onClick={onCartClick} className="relative p-1.5 sm:p-2 text-white/70 hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </button>
              )}

              <button onClick={handleLogout} className="p-1.5 sm:p-2 text-white/50 hover:text-white/80 transition-colors" title="Cerrar sesión">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories nav bar */}
      {categories && categories.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button
                onClick={() => onCategoryChange('')}
                className={`shrink-0 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`shrink-0 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
