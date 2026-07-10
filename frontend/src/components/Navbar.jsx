import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, LogOut, User, Package } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function Navbar({ onCartClick, search, onSearch }) {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-700',
    WHOLESALE: 'bg-emerald-100 text-emerald-700',
    RETAIL: 'bg-blue-100 text-blue-700',
  }

  const roleLabels = {
    ADMIN: 'Admin',
    WHOLESALE: 'Mayorista',
    RETAIL: 'Minorista',
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Package className="w-7 h-7 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Tienda Siber</span>
          </Link>

          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || roleColors.RETAIL}`}>
                <User className="w-3 h-3" />
                {roleLabels[user.role] || user.role}
              </span>
            )}

            {isAdmin && (
              <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                Panel
              </Link>
            )}

            <button onClick={onCartClick} className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition-colors p-2" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
