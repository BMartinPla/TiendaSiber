import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RETAIL', phone: '' })
  const [error, setError] = useState('')
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await register(form)
      loginUser(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error al registrarse')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📝 Crear Cuenta</h1>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} name="name" placeholder="Nombre completo" value={form.name} onChange={handleChange} required />
          <input style={styles.input} name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input style={styles.input} name="password" type="password" placeholder="Contraseña (mín. 6 caracteres)" value={form.password} onChange={handleChange} required minLength={6} />
          <input style={styles.input} name="phone" placeholder="Teléfono (opcional)" value={form.phone} onChange={handleChange} />
          <select style={styles.input} name="role" value={form.role} onChange={handleChange}>
            <option value="RETAIL">Minorista</option>
            <option value="WHOLESALE">Mayorista</option>
          </select>
          <button style={styles.button} type="submit">Crear Cuenta</button>
        </form>
        <p style={styles.footer}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
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
}
