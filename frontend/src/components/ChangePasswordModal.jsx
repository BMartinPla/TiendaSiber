import React, { useState, useEffect } from 'react'
import { X, KeyRound, Lock, Eye, EyeOff } from 'lucide-react'
import { changePassword } from '../services/api'

export default function ChangePasswordModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', error: false })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!currentPassword) {
      setMessage({ text: 'Ingresá tu contraseña actual', error: true })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'La nueva contraseña debe tener al menos 6 caracteres', error: true })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Las contraseñas nuevas no coinciden', error: true })
      return
    }
    setSaving(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setMessage({ text: 'Contraseña actualizada correctamente', error: false })
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Error al cambiar la contraseña', error: true })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage({ text: '', error: false }), 3000)
    }
  }

  const inputClass = "w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 sm:backdrop-blur-sm" />
      <div className="animate-scaleIn relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-glow border border-gray-100 dark:border-blue-500/15 p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 icon-btn">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-accent-100 dark:bg-accent-900/30">
            <KeyRound className="w-5 h-5 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white tracking-tight">Cambiar Contraseña</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Actualizá la clave de acceso a tu cuenta</p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-4 text-sm px-4 py-3 rounded-xl border ${
            message.error
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Contraseña actual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Tu contraseña actual"
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Nueva contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Repetí la nueva contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la nueva contraseña"
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
