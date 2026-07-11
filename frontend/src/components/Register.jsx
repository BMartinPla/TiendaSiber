import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { register } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register({ ...form, role: 'RETAIL' })
      loginUser(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-36 h-36 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">Crear Cuenta</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Regístrate para empezar a comprar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          {error && (
            <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre completo</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Juan Pérez" required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="usuario@quincegearsn.com" required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Solo se permiten correos @quincegearsn.com</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mín. 6 caracteres" required minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Teléfono (opcional)</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+569 1234 5678"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Todos los registros se crean como Minorista por defecto.</p>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
