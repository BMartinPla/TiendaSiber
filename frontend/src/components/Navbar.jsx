import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, LogOut, User, Moon, Sun } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useDarkMode } from '../contexts/DarkModeContext'

export default function Navbar({ onCartClick, search, onSearch }) {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const { dark, toggleDark } = useDarkMode()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    WHOLESALE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    RETAIL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  }

  const roleLabels = {
    ADMIN: 'Admin',
    WHOLESALE: 'Mayorista',
    RETAIL: 'Minorista',
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Quince Gear SN</span>
          </Link>

          <div className="flex-1 max-w-[120px] sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={toggleDark} className="p-2 text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors" title={dark ? 'Modo claro' : 'Modo oscuro'}>
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (
              <span className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || roleColors.RETAIL}`}>
                <User className="w-3 h-3" />
                {roleLabels[user.role] || user.role}
              </span>
            )}

            <div className="hidden sm:flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium">
                  Panel
                </Link>
              )}

              <Link to="/profile" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">
                Perfil
              </Link>
              {!isAdmin && (
                <Link to="/mis-pedidos" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">
                  Pedidos
                </Link>
              )}
            </div>

            <Link to="/profile" className="sm:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="Perfil">
              <User className="w-5 h-5" />
            </Link>

            <button onClick={onCartClick} className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <button onClick={handleLogout} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
