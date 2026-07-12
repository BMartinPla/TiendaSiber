import React, { useState } from 'react'
import { X, User, Mail, Phone, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile } from '../services/api'

export default function ProfileModal({ onClose }) {
  const { user, loginUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', error: false })

  const roleLabels = { ADMIN: 'Admin', WHOLESALE: 'Mayorista', RETAIL: 'Minorista' }
  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    WHOLESALE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    RETAIL: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
  }
  const roleIconColors = {
    ADMIN: 'text-purple-600 dark:text-purple-400',
    WHOLESALE: 'text-blue-600 dark:text-blue-400',
    RETAIL: 'text-gray-600 dark:text-gray-400',
  }
  const roleBgIcon = {
    ADMIN: 'bg-purple-100 dark:bg-purple-900/30',
    WHOLESALE: 'bg-blue-100 dark:bg-blue-900/30',
    RETAIL: 'bg-gray-100 dark:bg-gray-700/30',
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) {
      setMessage({ text: 'El nombre no puede estar vacío', error: true })
      return
    }
    setSaving(true)
    try {
      const res = await updateProfile({ name: name.trim(), phone: phone.trim() || null })
      loginUser(res.user, localStorage.getItem('token'))
      setMessage({ text: 'Perfil actualizado exitosamente', error: false })
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Error al actualizar perfil', error: true })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage({ text: '', error: false }), 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-xl ${roleBgIcon[user?.role] || roleBgIcon.RETAIL}`}>
            <User className={`w-5 h-5 ${roleIconColors[user?.role] || roleIconColors.RETAIL}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mi Perfil</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administra tus datos personales</p>
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

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed">
              <Mail className="w-4 h-4 shrink-0" />
              <span>{user?.email}</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">El email no se puede modificar</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 1234-5678"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Rol</label>
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${roleColors[user?.role] || roleColors.RETAIL}`}>
              <User className="w-3.5 h-3.5" />
              {roleLabels[user?.role] || user?.role}
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}