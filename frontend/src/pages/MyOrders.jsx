import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, ChevronDown, ChevronRight, XCircle } from 'lucide-react'
import { getMyOrders, cancelMyOrder } from '../services/api'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await getMyOrders()
        setOrders(res)
      } catch {}
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [])

  async function handleCancel(id) {
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return
    try {
      await cancelMyOrder(id)
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'CANCELLED' } : o))
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar pedido')
    }
  }

  function statusBadge(status) {
    if (status === 'APPROVED') return 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
    if (status === 'CANCELLED') return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  }

  function statusLabel(status) {
    if (status === 'APPROVED') return 'Aprobado'
    if (status === 'CANCELLED') return 'Cancelado'
    return 'Pendiente'
  }

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-accent-600 dark:hover:text-accent-400 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="surface-panel p-6 sm:p-7 animate-slideUp">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-accent-100 dark:bg-accent-900/30 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white tracking-tight">Mis Pedidos</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Historial de tus compras</p>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">Cargando pedidos...</div>
          ) : orders.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-500 py-12 text-center">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-accent-300" />
              No tenés pedidos aún
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-100 dark:border-blue-500/15 rounded-2xl overflow-hidden">
                  <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 cursor-pointer hover:bg-accent-50/50 dark:hover:bg-accent-500/5 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      {expandedOrder === order.id ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">#{order.id}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString('es-AR')}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">${order.total.toLocaleString('es-CL')}</span>
                      {order.status === 'PENDING' && (
                        <button onClick={(e) => { e.stopPropagation(); handleCancel(order.id) }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
                          <XCircle className="w-3 h-3" /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="border-t border-gray-100 dark:border-blue-500/15">
                      <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 text-xs text-gray-500 dark:text-gray-400">
                        <p><span className="font-semibold">Fecha:</span> {new Date(order.createdAt).toLocaleString('es-AR')}</p>
                        <p><span className="font-semibold">Estado:</span> {order.status === 'APPROVED' ? 'Aprobado' : 'Pendiente de aprobación'}</p>
                      </div>
                      <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                            <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Producto</th>
                            <th className="text-center px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Cant.</th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">P. Unit</th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-t border-gray-50 dark:border-gray-700">
                              <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{item.productName}</td>
                              <td className="px-4 py-2 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                              <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">${item.unitPrice.toLocaleString('es-CL')}</td>
                              <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">${item.subtotal.toLocaleString('es-CL')}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                            <td colSpan={3} className="px-4 py-2 text-right text-sm font-bold text-gray-700 dark:text-gray-200">Total</td>
                            <td className="px-4 py-2 text-right text-sm font-bold text-gray-900 dark:text-white">${order.total.toLocaleString('es-CL')}</td>
                          </tr>
                        </tfoot>
                      </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
