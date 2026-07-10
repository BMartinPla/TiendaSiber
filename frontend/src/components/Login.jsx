import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await login(email, password)
      loginUser(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🛍️ Iniciar Sesión</h1>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">Entrar</button>
        </form>
        <p style={styles.footer}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
        <div style={styles.hint}>
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Admin: admin@tiendasiper.com / admin123</p>
          <p>Cliente: cliente@tiendasiper.com / admin123</p>
          <p>Mayorista: mayorista@tiendasiper.com / admin123</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
  },
  card: {
    background: '#fff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#1a1a2e',
  },
  error: {
    background: '#ffe0e0',
    color: '#d32f2f',
    padding: '10px',
    borderRadius: 6,
    marginBottom: 16,
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: 12,
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: '0.9rem',
  },
  hint: {
    marginTop: 20,
    padding: '12px',
    background: '#f5f5f5',
    borderRadius: 6,
    fontSize: '0.8rem',
    color: '#666',
    lineHeight: 1.6,
  },
}
