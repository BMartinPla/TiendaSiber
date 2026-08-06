import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Loader2, ArrowRight } from 'lucide-react'
import { register } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', username: '', password: '', phone: '' })
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
      const data = await register({
        name: form.name,
        email: form.username.trim() + '@quincegearsn.com',
        password: form.password,
        phone: form.phone,
        role: 'RETAIL',
      })
      loginUser(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-transparent">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden items-center justify-center p-12 bg-gradient-to-br from-slate-900 via-blue-950 to-accent-800 text-white">
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-accent-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.12) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-md">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mb-8 drop-shadow-lg" />
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Empezá a comprar hoy
          </h1>
          <p className="mt-4 text-blue-100/80 leading-relaxed">
            Creá tu cuenta minorista y explorá el catálogo con precios claros y pedidos por WhatsApp.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-slideUp">
          <div className="text-center lg:text-left mb-8">
            <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto lg:hidden" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-3 lg:mt-0 tracking-tight">
              Crear cuenta
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Registrate para empezar a comprar
            </p>
          </div>

          <div className="surface-panel p-6 sm:p-8">
            {error && (
              <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre completo</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Juan Pérez" required className="input-field bg-gray-50/80 dark:bg-gray-700" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="flex items-center gap-2">
                  <input name="username" value={form.username} onChange={handleChange} placeholder="tu.usuario" required className="input-field bg-gray-50/80 dark:bg-gray-700" />
                  <span className="shrink-0 text-sm text-gray-400 dark:text-gray-500">@quincegearsn.com</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Tu correo quedará como <span className="font-medium text-gray-500 dark:text-gray-400">{form.username.trim() || 'tu.usuario'}@quincegearsn.com</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mín. 6 caracteres" required minLength={6} className="input-field bg-gray-50/80 dark:bg-gray-700" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Teléfono (opcional)</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+569 1234 5678" className="input-field bg-gray-50/80 dark:bg-gray-700" />
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Los registros se crean como Minorista por defecto.</p>

              <button type="submit" disabled={loading} className="btn-accent w-full py-3">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                {!loading && <ArrowRight className="w-4 h-4 opacity-70" />}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-accent-600 dark:text-accent-400 hover:text-accent-700 font-semibold">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
