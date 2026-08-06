import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Loader2, ArrowRight } from 'lucide-react'
import { login } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      loginUser(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
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
            Quince <span className="text-red-400">Gear</span> SN
          </h1>
          <p className="mt-4 text-blue-100/80 leading-relaxed">
            Accedé al catálogo, armá pedidos y gestioná tu cuenta en un flujo pensado para mayoristas y minoristas.
          </p>
          <div className="mt-10 flex items-center gap-2 text-sm text-sky-200/90">
            <span className="w-8 h-px bg-sky-300/50" />
            Pedidos por WhatsApp en minutos
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-slideUp">
          <div className="text-center lg:text-left mb-8">
            <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto lg:hidden" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-3 lg:mt-0 tracking-tight">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Iniciá sesión para continuar comprando
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="input-field bg-gray-50/80 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field bg-gray-50/80 dark:bg-gray-700"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-accent w-full py-3 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loading ? 'Entrando...' : 'Entrar'}
                {!loading && <ArrowRight className="w-4 h-4 opacity-70" />}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="text-accent-600 dark:text-accent-400 hover:text-accent-700 font-semibold">
                Registrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
