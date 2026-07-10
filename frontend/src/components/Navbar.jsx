import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🛍️ Tienda Siber</Link>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Productos</Link>

        {isAdmin && (
          <Link to="/admin" style={styles.link}>⚙️ Admin</Link>
        )}

        <span style={styles.badge}>🛒 {itemCount}</span>

        <span style={styles.userInfo}>
          {user.name} ({user.role === 'ADMIN' ? 'Admin' : user.role === 'WHOLESALE' ? 'Mayorista' : 'Minorista'})
        </span>

        <button onClick={handleLogout} style={styles.logoutBtn}>Salir</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#1a1a2e',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  brand: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.3rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  badge: {
    background: '#e94560',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  userInfo: {
    color: '#aaa',
    fontSize: '0.85rem',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #e94560',
    color: '#e94560',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
}
